import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, User, AlignLeft, Flag } from 'lucide-react';

const TaskModal = ({ task, isOpen, onClose }) => {
  const { activeProject, createTask, updateTask } = useAuth();
  
  // Local form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [status, setStatus] = useState('To Do');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!task;
  const isAdmin = activeProject?.myRole === 'Admin';

  // Load task details if editing
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setDueDate(task.dueDate || '');
      setPriority(task.priority || 'Medium');
      setAssigneeId(task.assigneeId || '');
      setStatus(task.status || 'To Do');
    } else {
      // Clear forms for creation
      setTitle('');
      setDescription('');
      setDueDate(new Date().toISOString().split('T')[0]); // Default to today
      setPriority('Medium');
      setAssigneeId('');
      setStatus('To Do');
    }
    setError('');
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title) {
      setError('Task title is required.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }

    setSubmitting(true);
    
    const taskPayload = {
      title,
      description,
      dueDate,
      priority,
      status,
      assigneeId: assigneeId ? Number(assigneeId) : null
    };

    let result;
    if (isEditing) {
      // If member is editing, they can only change status
      const payload = isAdmin 
        ? taskPayload 
        : { status }; // Member can only modify status
      result = await updateTask(task.id, payload);
    } else {
      result = await createTask(taskPayload);
    }

    setSubmitting(false);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Task Details' : 'Create New Task'}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="badge badge-danger" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px', textTransform: 'none', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Task Title</label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g., Integrate third-party auth module"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting || (isEditing && !isAdmin)} // Disabled for Members when editing
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlignLeft size={14} /> Description</span>
            </label>
            <textarea
              id="task-desc"
              className="form-input"
              placeholder="Describe the task parameters, requirements, and deliverables..."
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting || (isEditing && !isAdmin)} // Disabled for Members when editing
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Form Row for Dates, Priorities, Status */}
          <div className="form-row">
            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-date">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Due Date</span>
              </label>
              <input
                id="task-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                disabled={submitting || (isEditing && !isAdmin)} // Disabled for Members when editing
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Flag size={14} /> Priority</span>
              </label>
              <select
                id="task-priority"
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={submitting || (isEditing && !isAdmin)} // Disabled for Members when editing
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* Assignee Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Assignee</span>
              </label>
              <select
                id="task-assignee"
                className="form-input"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={submitting || (isEditing && !isAdmin)} // Disabled for Members when editing
              >
                <option value="">Unassigned</option>
                {activeProject?.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={submitting} // Members CAN edit status of their assigned task
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary" 
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: 'auto', padding: '10px 24px' }} 
              disabled={submitting}
            >
              {submitting ? 'Processing...' : isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
