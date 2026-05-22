import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, UserPlus, Trash2, Mail, Users } from 'lucide-react';

const MemberModal = ({ isOpen, onClose }) => {
  const { user, activeProject, addProjectMember, removeProjectMember } = useAuth();
  
  // Local form states
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setSubmitting(true);
    const result = await addProjectMember(email, role);
    setSubmitting(false);

    if (result.success) {
      setEmail('');
      setRole('Member');
    } else {
      setError(result.error);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (memberId === user.id) {
      alert('You cannot remove yourself from the project.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${memberName} from this project? Any tasks assigned to them will become unassigned.`)) {
      setSubmitting(true);
      await removeProjectMember(memberId);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--primary)" /> Project Settings & Members
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Part 1: Add Member Form */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Add Team Member
          </h3>

          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <label className="form-label" htmlFor="member-email" style={{ fontSize: '0.75rem' }}>Email Address</label>
              <input
                id="member-email"
                type="email"
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                placeholder="e.g., bob@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>

            <div style={{ flex: 1, minWidth: '120px' }}>
              <label className="form-label" htmlFor="member-role" style={{ fontSize: '0.75rem' }}>Role</label>
              <select
                id="member-role"
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={submitting}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: 'auto', padding: '9px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', height: '38px' }} 
              disabled={submitting}
            >
              <UserPlus size={14} /> Add
            </button>
          </form>
          
          {error && (
            <div className="badge badge-danger" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', marginTop: '10px', textTransform: 'none', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* Part 2: Current Members List */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Project Members ({activeProject?.members?.length || 0})
          </h3>

          <div className="member-list">
            {activeProject?.members?.map((m) => (
              <div key={m.id} className="member-item">
                <div className="member-info-box">
                  <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                    {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      {m.name} {m.id === user.id && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(You)</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`member-role-badge ${m.role === 'Admin' ? '' : 'member-role-member'}`} style={{
                    backgroundColor: m.role === 'Admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: m.role === 'Admin' ? 'var(--primary)' : 'var(--text-secondary)'
                  }}>
                    {m.role}
                  </span>

                  {m.id !== user.id && (
                    <button 
                      onClick={() => handleRemoveMember(m.id, m.name)}
                      className="remove-btn" 
                      title="Remove from project"
                      disabled={submitting}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '20px' }}>
          <button onClick={onClose} className="btn-secondary">
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberModal;
