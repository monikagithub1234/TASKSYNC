import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, FolderPlus } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose }) => {
  const { createProject } = useAuth();
  
  // Local form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Project name is required.');
      return;
    }

    setSubmitting(true);
    const result = await createProject(name, description);
    setSubmitting(false);

    if (result.success) {
      setName('');
      setDescription('');
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={22} color="var(--primary)" /> Start New Project
          </h2>
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

          {/* Project Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              className="form-input"
              placeholder="e.g., Artemis Launch Pad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          {/* Project Description */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="project-desc">Description</label>
            <textarea
              id="project-desc"
              className="form-input"
              placeholder="Briefly describe this project's purpose, scope, and objectives..."
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              style={{ resize: 'vertical' }}
            />
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
              {submitting ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
