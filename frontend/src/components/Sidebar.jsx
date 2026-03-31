import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, User, PenTool, History, GraduationCap, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
  { path: '/translate', label: 'Translate PDFs', icon: <FileText size={20} /> },
  { path: '/profile', label: 'Profile', icon: <User size={20} /> },
  { path: '/exam/setup', label: 'Take Exam', icon: <PenTool size={20} /> },
  { path: '/history', label: 'Exam History', icon: <History size={20} /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  const pictureSrc = user?.profile_picture ? `${user.profile_picture}`.replace('http://127.0.0.1:8000', 'http://localhost:8000') : null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <GraduationCap size={28} color="var(--accent)" />
          </div>
          <span>ExamAI</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-small">
          <div className="user-avatar" style={{ width: '36px', height: '36px', minWidth: '36px', flexShrink: 0, overflow: 'hidden', padding: pictureSrc ? 0 : '', border: '1px solid var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '14px' }}>
            {pictureSrc ? (
              <img src={pictureSrc} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              initials
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.full_name || user?.email}</span>
            <span className="user-role" style={{ color: user?.is_staff ? '#a5b4fc' : 'var(--text-muted)' }}>
              {user?.is_staff ? 'Administrator' : 'Student'}
            </span>
          </div>
        </div>
        <button className="btn btn-secondary logout-btn" onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
