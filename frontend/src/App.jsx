import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProjectBoard from './components/ProjectBoard';
import TaskModal from './components/TaskModal';
import MemberModal from './components/MemberModal';
import ProjectModal from './components/ProjectModal';
import { LayoutGrid, BarChart2, Settings, Trash2, FolderOpen, FolderPlus, HelpCircle } from 'lucide-react';

// Core Application Layout Orchestrator
const AppContent = () => {
  const { 
    user, 
    loading, 
    projects, 
    activeProject, 
    selectProject, 
    deleteProject 
  } = useAuth();

  // Local navigation and panel states
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'dashboard'
  
  // Modals Visibility
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Active task selected for edit (null = create new)
  const [selectedTask, setSelectedTask] = useState(null);

  // 1. Initial Authentication Restoration State (Visual Skeleton loader)
  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>RESTORING SESSION...</p>
      </div>
    );
  }

  // 2. Unauthenticated User Layout (Login / Sign Up Panels)
  if (!user) {
    return (
      <>
        {authView === 'login' ? (
          <Login onViewChange={setAuthView} />
        ) : (
          <Register onViewChange={setAuthView} />
        )}
        <Toast />
      </>
    );
  }

  const isAdmin = activeProject?.myRole === 'Admin';

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    if (window.confirm(`⚠️ WARNING: Deleting project "${activeProject.name}" will permanently erase all tasks and project information. This action CANNOT be undone. Are you absolutely sure?`)) {
      await deleteProject(activeProject.id);
    }
  };

  const handleEditTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTaskClick = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  // 3. Authenticated Layout (Main Application Shell)
  return (
    <div className="app-layout">
      {/* Dynamic Header Navbar */}
      <Navbar />

      <main className="app-content">
        {/* Project Header Selection bar */}
        <div className="project-bar">
          <div className="project-select-container">
            <FolderOpen size={20} color="var(--primary)" />
            
            {projects.length === 0 ? (
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                No active projects found
              </span>
            ) : (
              <select
                value={activeProject?.id || ''}
                onChange={(e) => selectProject(Number(e.target.value))}
                className="project-selector"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name} ({proj.myRole})
                  </option>
                ))}
              </select>
            )}

            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="btn-secondary"
              title="Create New Project"
              style={{ padding: '8px 12px' }}
            >
              <FolderPlus size={16} />
              <span style={{ fontSize: '0.85rem' }}>New Project</span>
            </button>
          </div>

          {/* Active project context options (Member management, deletion) */}
          {activeProject && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Tab Switcher (Board vs Dashboard Stats) */}
              <div className="view-toggle">
                <button
                  onClick={() => setActiveTab('board')}
                  className={`view-btn ${activeTab === 'board' ? 'active' : ''}`}
                >
                  <LayoutGrid size={14} /> Board
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`view-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  <BarChart2 size={14} /> Dashboard
                </button>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <>
                  <button 
                    onClick={() => setIsMemberModalOpen(true)} 
                    className="btn-secondary"
                    title="Project Settings & Members"
                  >
                    <Settings size={15} /> Settings
                  </button>
                  <button 
                    onClick={handleDeleteProject} 
                    className="btn-secondary"
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    title="Delete Project"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Workspace Display Area */}
        {projects.length === 0 ? (
          <div className="empty-state" style={{ minHeight: '360px', marginTop: '20px' }}>
            <FolderOpen size={56} color="var(--text-muted)" style={{ strokeWidth: 1.5 }} />
            <h3>Get Started by Creating a Project</h3>
            <p>To start tracking, assigning, and delivering tasks, you need to create a project first.</p>
            <button 
              onClick={() => setIsProjectModalOpen(true)} 
              className="btn-primary" 
              style={{ width: 'auto', padding: '12px 28px', marginTop: '8px' }}
            >
              <FolderPlus size={18} /> Create Project
            </button>
          </div>
        ) : activeProject ? (
          <div style={{ minHeight: '400px' }}>
            {/* Project description brief */}
            {activeProject.description && (
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem', 
                marginBottom: '24px', 
                lineHeight: 1.5,
                backgroundColor: 'rgba(255,255,255,0.01)',
                padding: '12px 20px',
                borderRadius: '8px',
                borderLeft: '2px solid var(--border-color)'
              }}>
                {activeProject.description}
              </p>
            )}

            {/* Display correct pane */}
            {activeTab === 'board' ? (
              <ProjectBoard 
                onAddTaskClick={handleAddTaskClick} 
                onEditTaskClick={handleEditTaskClick} 
              />
            ) : (
              <Dashboard />
            )}
          </div>
        ) : (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading project workspace...</p>
          </div>
        )}
      </main>

      {/* Persistent global notifications */}
      <Toast />

      {/* Global Modals Systems */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        task={selectedTask} 
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }} 
      />

      <MemberModal 
        isOpen={isMemberModalOpen} 
        onClose={() => setIsMemberModalOpen(false)} 
      />

      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />
    </div>
  );
};

// Mount Context Provider at Root
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
