import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { config } from './config.js';
import { prisma } from './db.js';
import { createApp } from './app.js';

interface GitHubWebhookJob {
  projectId: string;
  event: string;
  deliveryId: string;
  payload: Record<string, unknown>;
}

function cookieValue(cookieHeader: string | undefined, name: string) {
  return cookieHeader
    ?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function processWebhook(job: Job<GitHubWebhookJob>, io: Server) {
  const { projectId, event, payload } = job.data;
  const sender = (payload.sender as { login?: string } | undefined)?.login ?? 'GitHub';
  const action = typeof payload.action === 'string' ? payload.action : event;

  if (event === 'push' && Array.isArray(payload.commits)) {
    const branch = typeof payload.ref === 'string' ? payload.ref.replace('refs/heads/', '') : '';
    for (const rawCommit of payload.commits) {
      if (!rawCommit || typeof rawCommit !== 'object') continue;
      const commit = rawCommit as {
        id?: string;
        message?: string;
        timestamp?: string;
        url?: string;
        author?: { name?: string; email?: string; username?: string };
      };
      if (!commit.id || !commit.message) continue;
      await prisma.commit.upsert({
        where: { projectId_sha: { projectId, sha: commit.id } },
        update: { message: commit.message, branch },
        create: {
          projectId,
          sha: commit.id,
          message: commit.message,
          authorName: commit.author?.username ?? commit.author?.name ?? sender,
          authorEmail: commit.author?.email ?? '',
          branch,
          htmlUrl: commit.url,
          committedAt: commit.timestamp ? new Date(commit.timestamp) : new Date(),
        },
      });
    }
  }

  if (event === 'pull_request' && payload.pull_request && typeof payload.pull_request === 'object') {
    const pr = payload.pull_request as {
      number?: number; title?: string; body?: string | null; html_url?: string; state?: string;
      merged_at?: string | null; created_at?: string; updated_at?: string;
      user?: { login?: string; avatar_url?: string };
      head?: { ref?: string };
      base?: { ref?: string };
    };
    if (pr.number && pr.title && pr.head?.ref && pr.base?.ref) {
      await prisma.pullRequest.upsert({
        where: { projectId_number: { projectId, number: pr.number } },
        update: {
          title: pr.title,
          description: pr.body ?? '',
          status: pr.merged_at ? 'merged' : pr.state ?? 'open',
          updatedAt: pr.updated_at ? new Date(pr.updated_at) : new Date(),
        },
        create: {
          projectId,
          number: pr.number,
          title: pr.title,
          description: pr.body ?? '',
          authorName: pr.user?.login ?? sender,
          authorAvatar: pr.user?.avatar_url ?? '',
          githubUsername: pr.user?.login ?? sender,
          sourceBranch: pr.head.ref,
          targetBranch: pr.base.ref,
          status: pr.merged_at ? 'merged' : pr.state ?? 'open',
          htmlUrl: pr.html_url,
          createdAt: pr.created_at ? new Date(pr.created_at) : new Date(),
          updatedAt: pr.updated_at ? new Date(pr.updated_at) : new Date(),
        },
      });
    }
  }

  if (event === 'workflow_run' && payload.workflow_run && typeof payload.workflow_run === 'object') {
    const run = payload.workflow_run as {
      id?: number; run_number?: number; name?: string; status?: string; conclusion?: string | null;
      head_branch?: string; head_sha?: string; html_url?: string; run_started_at?: string; updated_at?: string;
      head_commit?: { message?: string; author?: { name?: string } };
    };
    if (run.run_number && run.name) {
      await prisma.workflowRun.upsert({
        where: { projectId_runNumber: { projectId, runNumber: run.run_number } },
        update: {
          status: run.conclusion ?? run.status ?? 'queued',
          branch: run.head_branch ?? '',
          commitSha: run.head_sha ?? '',
          completedAt: run.status === 'completed' && run.updated_at ? new Date(run.updated_at) : null,
        },
        create: {
          projectId,
          runNumber: run.run_number,
          name: run.name,
          status: run.conclusion ?? run.status ?? 'queued',
          branch: run.head_branch ?? '',
          commitSha: run.head_sha ?? '',
          commitMessage: run.head_commit?.message ?? '',
          authorName: run.head_commit?.author?.name ?? sender,
          htmlUrl: run.html_url,
          startedAt: run.run_started_at ? new Date(run.run_started_at) : new Date(),
          completedAt: run.status === 'completed' && run.updated_at ? new Date(run.updated_at) : null,
          details: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonObject,
        },
      });
    }
  }

  await prisma.webhookEvent.create({
    data: {
      projectId,
      event,
      action,
      sender,
      status: 'processed',
      payload: JSON.parse(JSON.stringify(payload)) as Prisma.InputJsonObject,
    },
  });
  io.to(`project:${projectId}`).emit('github.webhook', { projectId, event, action, sender });
}

let io: Server;
const app = createApp({ io: { to: room => io.to(room) } });
const httpServer = createServer(app);
io = new Server(httpServer, {
  cors: {
    origin: config.CORS_ORIGINS,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = cookieValue(socket.handshake.headers.cookie, 'devflow_session');
  if (!token) {
    next(new Error('Authentication required.'));
    return;
  }
  try {
    const decoded = jwt.verify(decodeURIComponent(token), config.JWT_SECRET);
    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      next(new Error('Invalid session.'));
      return;
    }
    socket.data.userId = decoded.sub;
    next();
  } catch {
    next(new Error('Session expired.'));
  }
});

io.on('connection', socket => {
  const userId = socket.data.userId as string;
  void prisma.project.findMany({
    where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    select: { id: true },
  }).then(projects => {
    for (const project of projects) socket.join(`project:${project.id}`);
  }).catch(error => {
    console.error('Could not subscribe user to project updates.', error);
    socket.disconnect(true);
  });
});

const worker = new Worker<GitHubWebhookJob>(
  'github-webhooks',
  job => processWebhook(job, io),
  { connection: new Redis(config.REDIS_URL, { maxRetriesPerRequest: null }) },
);

worker.on('failed', (job, error) => {
  console.error(`GitHub webhook job ${job?.id ?? 'unknown'} failed.`, error);
});

httpServer.listen(config.PORT, () => {
  console.info(`DevFlow API listening on http://localhost:${config.PORT}`);
});

async function shutdown(signal: string) {
  console.info(`${signal} received; closing DevFlow services.`);
  await worker.close();
  await io.close();
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
