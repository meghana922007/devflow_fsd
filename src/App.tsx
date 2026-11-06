import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectsHub } from './components/ProjectsHub/ProjectsHub';
import { DashboardOverview } from './components/DashboardOverview';
import { AIAssistantCard } from './components/AIAssistantCard';
import { KanbanBoard } from './components/TaskManagement/KanbanBoard';
import { IssueList } from './components/IssueTracking/IssueList';
import { TeamSettings } from './components/ProjectTeam/TeamSettings';
import { GitHubHub } from './components/GitHubIntegration/GitHubHub';
import { TaskModal } from './components/TaskManagement/TaskModal';
import { IssueModal } from './components/IssueTracking/IssueModal';
import { NewProjectModal } from './components/ProjectsHub/NewProjectModal';
import { DiffModal } from './components/GitHubIntegration/DiffModal';
import { NewPullRequestModal } from './components/GitHubIntegration/NewPullRequestModal';
import { WebhookSimulatorModal } from './components/GitHubIntegration/WebhookSimulatorModal';
import { RepoSettingsModal } from './components/GitHubIntegration/RepoSettingsModal';
import { CICDHub } from './components/CICDMonitoring/CICDHub';
import { BuildLogModal } from './components/CICDMonitoring/BuildLogModal';
import { DispatchWorkflowModal } from './components/CICDMonitoring/DispatchWorkflowModal';
import { AuthScreen } from './components/Auth/AuthScreen';

const MainContent: React.FC = () => {
  const { currentView, activeTab } = useApp();

  if (currentView === 'hub') {
    return (
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-main)' }}>
        {activeTab === 'ai' && <div style={{ padding: 24 }}><AIAssistantCard /></div>}
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
      {activeTab === 'cicd' && <CICDHub />}
      {activeTab === 'team' && <TeamSettings />}
      {activeTab === 'ai' && <div style={{ padding: 24 }}><AIAssistantCard /></div>}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { isAuthenticated, activeProject, apiError, clearApiError } = useApp();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {apiError && (
        <div role="alert" style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 200,
          maxWidth: 420,
          padding: '12px 16px',
          border: '1px solid #fecaca',
          borderRadius: 8,
          background: '#fff1f2',
          color: '#991b1b',
          boxShadow: '0 4px 16px rgba(15,23,42,0.12)',
        }}>
          <span>{apiError}</span>
          <button type="button" onClick={clearApiError} aria-label="Dismiss error" style={{ marginLeft: 12 }}>×</button>
        </div>
      )}
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <MainContent />
      </div>
      
      {/* Global Modals */}
      <TaskModal />
      <IssueModal />
      <NewProjectModal />
      <DiffModal />
      <NewPullRequestModal />
      <WebhookSimulatorModal />
      <RepoSettingsModal key={activeProject.id} />
      <BuildLogModal />
      <DispatchWorkflowModal />
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
