import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Key, Mail, Award, UserPlus } from 'lucide-react';

const Register = ({ onViewChange }) => {
  const { signup } = useAuth();
  
  // Local form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await signup(name, email, password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo text-gradient">
            <Award size={36} color="#6366f1" style={{ strokeWidth: 2.5 }} />
            <span>TaskSync</span>
          </div>
          <p className="auth-subtitle">Create an account to manage your projects.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="badge badge-danger" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', marginBottom: '20px', textTransform: 'none', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Full Name
              </span>
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="e.g., Alice Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Email Address
              </span>
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="e.g., alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} /> Password
              </span>
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="confirmPassword">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} /> Confirm Password
              </span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={18} /> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <button 
            type="button" 
            onClick={() => onViewChange('login')} 
            className="auth-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
