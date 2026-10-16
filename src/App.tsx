import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectsHub } from './components/ProjectsHub/ProjectsHub';
import { DashboardOverview } from './components/DashboardOverview';
import { KanbanBoard } from './components/TaskManagement/KanbanBoard';
import { IssueList } from './components/IssueTracking/IssueList';
import { TeamSettings } from './components/ProjectTeam/TeamSettings';
import { GitHubHub } from './components/GitHubIntegration/GitHubHub';
import { TaskModal } from './components/TaskManagement/TaskModal';
import { IssueModal } from './components/IssueTracking/IssueModal';
import { NewProjectModal } from './components/ProjectsHub/NewProjectModal';
import { UserModal } from './components/ProjectTeam/UserModal';
import { DiffModal } from './components/GitHubIntegration/DiffModal';
import { NewPullRequestModal } from './components/GitHubIntegration/NewPullRequestModal';
import { WebhookSimulatorModal } from './components/GitHubIntegration/WebhookSimulatorModal';
import { RepoSettingsModal } from './components/GitHubIntegration/RepoSettingsModal';
import { AuthScreen } from './components/Auth/AuthScreen';

const MainContent: React.FC = () => {
  const { currentView, activeTab } = useApp();

  if (currentView === 'hub') {
    return (
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
        <ProjectsHub />
      </main>
    );
  }

  return (
    <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
      {activeTab === 'dashboard' && <DashboardOverview />}
      {activeTab === 'kanban' && <KanbanBoard />}
      {activeTab === 'issues' && <IssueList />}
      {activeTab === 'github' && <GitHubHub />}
      {activeTab === 'team' && <TeamSettings />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <MainContent />
      </div>
      
      {/* Global Modals */}
      <TaskModal />
      <IssueModal />
      <NewProjectModal />
      <UserModal />
      <DiffModal />
      <NewPullRequestModal />
      <WebhookSimulatorModal />
      <RepoSettingsModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
};

export default App;
