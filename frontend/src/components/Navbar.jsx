import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Award, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand text-gradient">
        <Award size={26} color="#6366f1" style={{ strokeWidth: 2.5 }} />
        <span>TaskSync</span>
      </div>

      <div className="nav-right">
        <div className="user-badge">
          <div className="avatar">
            {getInitials(user.name)}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {user.name}
          </span>
        </div>

        <button 
          onClick={logout} 
          className="btn-secondary" 
          title="Sign Out"
        >
          <LogOut size={16} />
          <span style={{ fontSize: '0.85rem' }}>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
