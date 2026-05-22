import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskCard from './TaskCard';
import { Plus, Search, Calendar, FolderPlus } from 'lucide-react';

const ProjectBoard = ({ onAddTaskClick, onEditTaskClick }) => {
  const { tasks, activeProject } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const isAdmin = activeProject?.myRole === 'Admin';

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  // Group by status
  const todoTasks = filteredTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress');
  const doneTasks = filteredTasks.filter(t => t.status === 'Done');

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      {/* Search and Filters Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="project-selector"
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {isAdmin && (
            <button 
              onClick={onAddTaskClick} 
              className="btn-primary" 
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Board Columns Grid */}
      {tasks.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="var(--text-muted)" />
          <h3>No tasks in this project yet</h3>
          {isAdmin ? (
            <>
              <p>Get started by creating your first team task.</p>
              <button onClick={onAddTaskClick} className="btn-primary" style={{ width: 'auto', padding: '10px 20px', marginTop: '8px' }}>
                <Plus size={18} /> Create Task
              </button>
            </>
          ) : (
            <p>Your team admin has not created any tasks yet.</p>
          )}
        </div>
      ) : (
        <div className="board-columns">
          {/* TO DO COLUMN */}
          <div className="board-column">
            <div className="column-header">
              <div className="column-title">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--todo)' }}></span>
                <span>To Do</span>
              </div>
              <span className="column-count">{todoTasks.length}</span>
            </div>
            
            <div className="task-list">
              {todoTasks.length === 0 ? (
                <div style={{ display: 'flex', height: '120px', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '10px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No tasks to do.
                </div>
              ) : (
                todoTasks.map(task => (
                  <TaskCard key={task.id} task={task} onEditClick={onEditTaskClick} />
                ))
              )}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div className="board-column">
            <div className="column-header">
              <div className="column-title">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--progress)' }}></span>
                <span>In Progress</span>
              </div>
              <span className="column-count">{inProgressTasks.length}</span>
            </div>
            
            <div className="task-list">
              {inProgressTasks.length === 0 ? (
                <div style={{ display: 'flex', height: '120px', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '10px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No tasks in progress.
                </div>
              ) : (
                inProgressTasks.map(task => (
                  <TaskCard key={task.id} task={task} onEditClick={onEditTaskClick} />
                ))
              )}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div className="board-column">
            <div className="column-header">
              <div className="column-title">
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--done)' }}></span>
                <span>Done</span>
              </div>
              <span className="column-count">{doneTasks.length}</span>
            </div>
            
            <div className="task-list">
              {doneTasks.length === 0 ? (
                <div style={{ display: 'flex', height: '120px', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '10px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No completed tasks.
                </div>
              ) : (
                doneTasks.map(task => (
                  <TaskCard key={task.id} task={task} onEditClick={onEditTaskClick} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;
