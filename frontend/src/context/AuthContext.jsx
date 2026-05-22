import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Automatically resolve API target: local server in dev, relative in production
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  // App Core States
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth HTTP Headers Generator
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || localStorage.getItem('token')}`
  });

  // Verify active session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setUser(data.user);
          setToken(storedToken);
          addToast(`Welcome back, ${data.user.name}!`, 'success');
          // Fetch initial projects
          await loadProjects(storedToken);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        // Offline or server down - keep token but don't force logout immediately to show local state
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Global log out
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setProjects([]);
    setActiveProject(null);
    setTasks([]);
    setDashboardStats(null);
    addToast('Logged out successfully.', 'info');
  };

  // Signup
  const signup = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed.');
      }
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      addToast(data.message || 'Registration successful!', 'success');
      
      await loadProjects(data.token);
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      addToast(data.message || 'Welcome!', 'success');
      
      await loadProjects(data.token);
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Fetch Projects list
  const loadProjects = async (overrideToken) => {
    try {
      const tok = overrideToken || token;
      const response = await fetch(`${API_BASE}/projects`, {
        headers: {
          'Authorization': `Bearer ${tok}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProjects(data.projects);
        // Automatically select the first project if nothing is selected
        if (data.projects.length > 0 && !activeProject) {
          await selectProject(data.projects[0].id, tok);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  // Select project and load tasks & dashboard stats
  const selectProject = async (projectId, overrideToken) => {
    const tok = overrideToken || token;
    try {
      // 1. Fetch project details (contains list of members)
      const detailRes = await fetch(`${API_BASE}/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${tok}` }
      });
      const detailData = await detailRes.json();
      
      if (!detailRes.ok) throw new Error(detailData.error);
      
      setActiveProject(detailData.project);
      
      // 2. Fetch Tasks and Dashboard Stats concurrently
      await Promise.all([
        loadTasks(projectId, tok),
        loadDashboardStats(projectId, tok)
      ]);
    } catch (err) {
      addToast(err.message || 'Failed to select project.', 'error');
    }
  };

  const loadTasks = async (projectId, tok) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/project/${projectId}`, {
        headers: { 'Authorization': `Bearer ${tok || token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const loadDashboardStats = async (projectId, tok) => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/${projectId}`, {
        headers: { 'Authorization': `Bearer ${tok || token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setDashboardStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  // Create Project
  const createProject = async (name, description) => {
    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, description })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      addToast(data.message, 'success');
      
      // Re-fetch project list
      await loadProjects();
      
      // Auto-select the newly created project
      if (data.project) {
        await selectProject(data.project.id);
      }
      
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Delete Project
  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      addToast(data.message, 'success');
      
      // Clear states if active project was deleted
      if (activeProject && activeProject.id === projectId) {
        setActiveProject(null);
        setTasks([]);
        setDashboardStats(null);
      }
      
      await loadProjects();
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Create Task (Admin only)
  const createTask = async (taskData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...taskData, projectId: activeProject.id })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      addToast(data.message, 'success');
      
      // Refresh tasks and dashboard
      await Promise.all([
        loadTasks(activeProject.id),
        loadDashboardStats(activeProject.id)
      ]);
      
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Update Task (Admin: any fields, Member: status only on assigned tasks)
  const updateTask = async (taskId, updateData) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      addToast(data.message, 'success');
      
      // Refresh tasks and dashboard
      await Promise.all([
        loadTasks(activeProject.id),
        loadDashboardStats(activeProject.id)
      ]);
      
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Delete Task (Admin only)
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      addToast(data.message, 'success');
      
      // Refresh tasks and dashboard
      await Promise.all([
        loadTasks(activeProject.id),
        loadDashboardStats(activeProject.id)
      ]);
      
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Add Member to Project (Admin only)
  const addProjectMember = async (email, role) => {
    try {
      const response = await fetch(`${API_BASE}/projects/${activeProject.id}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, role })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      addToast(data.message, 'success');
      
      // Refresh project details (members list) and dashboard stats
      await Promise.all([
        selectProject(activeProject.id),
        loadDashboardStats(activeProject.id)
      ]);
      
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  // Remove Member from Project (Admin only)
  const removeProjectMember = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/projects/${activeProject.id}/members/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      addToast(data.message, 'success');
      
      // Refresh project details, tasks, and dashboard (tasks might get unassigned)
      await Promise.all([
        selectProject(activeProject.id),
        loadTasks(activeProject.id),
        loadDashboardStats(activeProject.id)
      ]);
      
      return { success: true };
    } catch (err) {
      addToast(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      projects,
      activeProject,
      tasks,
      dashboardStats,
      toasts,
      addToast,
      removeToast,
      signup,
      login,
      logout,
      loadProjects,
      selectProject,
      createProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      addProjectMember,
      removeProjectMember
    }}>
      {children}
    </AuthContext.Provider>
  );
};
