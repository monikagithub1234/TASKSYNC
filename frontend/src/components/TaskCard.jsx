import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, ArrowRight, ArrowLeft, Check, Trash2, Edit } from 'lucide-react';

const TaskCard = ({ task, onEditClick }) => {
  const { user, activeProject, updateTask, deleteTask } = useAuth();

  const isOverdue = () => {
    if (task.status === 'Done') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today;
  };

  // Determine permissions
  const isAdmin = activeProject?.myRole === 'Admin';
  const isAssignee = task.assigneeId === user?.id;
  const canUpdateStatus = isAdmin || (activeProject?.myRole === 'Member' && isAssignee);
  
  // Format assignee initials
  const getAssigneeInitials = () => {
    if (!task.assignee) return '';
    return task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleStatusShift = async (newStatus, e) => {
    e.stopPropagation(); // Avoid triggering card click edit modal
    await updateTask(task.id, { status: newStatus });
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Avoid triggering card click
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      await deleteTask(task.id);
    }
  };

  return (
    <div 
      className={`task-card priority-${task.priority}`} 
      onClick={() => (isAdmin || isAssignee) && onEditClick(task)}
      style={{ cursor: (isAdmin || isAssignee) ? 'pointer' : 'default' }}
    >
      <div className="task-header">
        <span className={`badge ${task.priority === 'High' ? 'badge-danger' : task.priority === 'Medium' ? 'badge-progress' : 'badge-todo'}`}>
          {task.priority} Priority
        </span>
        
        {isAdmin && (
          <button 
            onClick={handleDelete}
            className="remove-btn"
            title="Delete Task"
            style={{ padding: 4 }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <h4 className="task-title">{task.title}</h4>
      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-footer">
        <div className={`task-date ${isOverdue() ? 'overdue' : ''}`}>
          <Calendar size={12} />
          <span>{task.dueDate}</span>
          {isOverdue() && <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>(Overdue)</span>}
        </div>

        <div className="task-assignee">
          {task.assignee ? (
            <div 
              className="assignee-avatar" 
              title={`Assigned to: ${task.assignee.name} (${task.assignee.email})`}
              style={{
                background: isAssignee 
                  ? 'linear-gradient(135deg, #6366f1, #a855f7)' 
                  : '#334155'
              }}
            >
              {getAssigneeInitials()}
            </div>
          ) : (
            <span className="unassigned-badge">Unassigned</span>
          )}
        </div>
      </div>

      {/* Quick Status transition controls (authorized only) */}
      {canUpdateStatus && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '8px', 
          marginTop: '12px', 
          paddingTop: '10px', 
          borderTop: '1px dashed rgba(255,255,255,0.05)' 
        }}>
          {task.status === 'To Do' && (
            <button 
              onClick={(e) => handleStatusShift('In Progress', e)} 
              className="badge badge-progress"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Start <ArrowRight size={10} />
            </button>
          )}

          {task.status === 'In Progress' && (
            <>
              <button 
                onClick={(e) => handleStatusShift('To Do', e)} 
                className="badge badge-todo"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={10} /> Defer
              </button>
              <button 
                onClick={(e) => handleStatusShift('Done', e)} 
                className="badge badge-done"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Complete <Check size={10} />
              </button>
            </>
          )}

          {task.status === 'Done' && (
            <button 
              onClick={(e) => handleStatusShift('In Progress', e)} 
              className="badge badge-progress"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ArrowLeft size={10} /> Reopen
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
