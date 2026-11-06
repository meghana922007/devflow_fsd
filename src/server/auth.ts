import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const SESSION_COOKIE = 'devflow_session';
const sessionDurationSeconds = 60 * 60 * 24 * 7;

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function setSessionCookie(response: Response, userId: string): void {
  const token = jwt.sign({ sub: userId }, config.JWT_SECRET, { expiresIn: sessionDurationSeconds });
  response.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
    maxAge: sessionDurationSeconds * 1000,
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: 'lax',
    path: '/',
  });
}

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction): void {
  const token = request.cookies?.[SESSION_COOKIE];
  if (!token) {
    response.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      response.status(401).json({ error: 'Invalid session.' });
      return;
    }
    request.userId = payload.sub;
    next();
  } catch {
    response.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}
