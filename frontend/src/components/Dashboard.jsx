import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, CheckCircle2, Flame, RefreshCw, BarChart3, Users } from 'lucide-react';

const Dashboard = () => {
  const { dashboardStats, activeProject } = useAuth();

  if (!dashboardStats) {
    return (
      <div className="empty-state">
        <BarChart3 size={48} color="#64748b" />
        <h3>Loading Analytics...</h3>
        <p>Fetching the latest task statistics for your project.</p>
      </div>
    );
  }

  const { totalTasks, tasksByStatus, overdueTasks, tasksPerMember } = dashboardStats;

  // Calculate percentages for the progress segmented bar
  const todo = tasksByStatus['To Do'] || 0;
  const inProgress = tasksByStatus['In Progress'] || 0;
  const done = tasksByStatus['Done'] || 0;

  const todoPercent = totalTasks > 0 ? (todo / totalTasks) * 100 : 0;
  const progressPercent = totalTasks > 0 ? (inProgress / totalTasks) * 100 : 0;
  const donePercent = totalTasks > 0 ? (done / totalTasks) * 100 : 0;

  return (
    <div style={{ animation: 'slideUp 0.4s ease-out' }}>
      {/* 1. Quick Stats Grid */}
      <div className="stats-grid">
        {/* Total Tasks */}
        <div className="stat-card">
          <div className="stat-info">
            <h4>Total Tasks</h4>
            <div className="stat-number">{totalTasks}</div>
          </div>
          <div className="stat-icon-box" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
            <Layers size={22} />
          </div>
        </div>

        {/* In Progress */}
        <div className="stat-card">
          <div className="stat-info">
            <h4>In Progress</h4>
            <div className="stat-number" style={{ color: '#f59e0b' }}>{inProgress}</div>
          </div>
          <div className="stat-icon-box" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <RefreshCw size={22} className="spin-indicator" style={{ animation: inProgress > 0 ? 'spin 12s linear infinite' : 'none' }} />
          </div>
        </div>

        {/* Completed */}
        <div className="stat-card">
          <div className="stat-info">
            <h4>Completed</h4>
            <div className="stat-number" style={{ color: '#10b981' }}>{done}</div>
          </div>
          <div className="stat-icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="stat-card" style={{ 
          border: overdueTasks > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)',
          background: overdueTasks > 0 ? 'radial-gradient(circle at 100% 0%, rgba(239, 68, 68, 0.08) 0px, var(--bg-card) 70%)' : 'var(--bg-card)'
        }}>
          <div className="stat-info">
            <h4>Overdue Tasks</h4>
            <div className="stat-number" style={{ color: overdueTasks > 0 ? '#ef4444' : '#94a3b8' }}>
              {overdueTasks}
            </div>
          </div>
          <div className="stat-icon-box" style={{ 
            backgroundColor: overdueTasks > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', 
            color: overdueTasks > 0 ? '#ef4444' : '#64748b',
            animation: overdueTasks > 0 ? 'pulse 2s infinite' : 'none'
          }}>
            <Flame size={22} />
          </div>
        </div>
      </div>

      {/* 2. Graphical Charts Section */}
      <div className="dashboard-graphs">
        {/* Status Distribution */}
        <div className="graph-card">
          <h3>Task Status Allocation</h3>
          
          {totalTasks === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', minHeight: '180px', color: 'var(--text-muted)' }}>
              <Layers size={36} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: '0.9rem' }}>No tasks created yet in this project.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '20px' }}>
              {/* Segmented Distribution Bar */}
              <div style={{ display: 'flex', height: '24px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                {todo > 0 && <div style={{ width: `${todoPercent}%`, backgroundColor: '#94a3b8', transition: 'width 0.5s' }} title={`To Do: ${todo}`} />}
                {inProgress > 0 && <div style={{ width: `${progressPercent}%`, backgroundColor: '#f59e0b', transition: 'width 0.5s' }} title={`In Progress: ${inProgress}`} />}
                {done > 0 && <div style={{ width: `${donePercent}%`, backgroundColor: '#10b981', transition: 'width 0.5s' }} title={`Done: ${done}`} />}
              </div>

              {/* Status Labels & Count Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span className="badge badge-todo" style={{ marginBottom: '8px' }}>To Do</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{todo}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{Math.round(todoPercent)}% of total</div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span className="badge badge-progress" style={{ marginBottom: '8px' }}>In Progress</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{inProgress}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{Math.round(progressPercent)}% of total</div>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <span className="badge badge-done" style={{ marginBottom: '8px' }}>Completed</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{done}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{Math.round(donePercent)}% of total</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Member Allocation */}
        <div className="graph-card">
          <h3>Task Allocation Per Member</h3>
          
          <div className="bar-chart-list" style={{ marginTop: '16px' }}>
            {tasksPerMember.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', minHeight: '180px', color: 'var(--text-muted)' }}>
                <Users size={36} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: '0.9rem' }}>No members added to this project.</p>
              </div>
            ) : (
              tasksPerMember.map((member, index) => {
                // Find relative width compared to the member with maximum tasks
                const maxTasks = Math.max(...tasksPerMember.map(m => m.taskCount), 1);
                const widthPercent = (member.taskCount / maxTasks) * 100;

                return (
                  <div key={index} className="bar-row">
                    <div className="bar-label" title={member.userName}>
                      {member.userName}
                    </div>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${widthPercent}%`,
                          background: member.userId === null 
                            ? 'linear-gradient(90deg, #475569, #64748b)' 
                            : 'linear-gradient(90deg, #6366f1, #a855f7)'
                        }}
                      />
                    </div>
                    <div className="bar-value">
                      {member.taskCount}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
