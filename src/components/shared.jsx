import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── SPINNER ────────────────────────────────────────────────────
export const Spinner = ({ size = 40 }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
    <div style={{
      width: size, height: size, border: `4px solid #e5e7eb`,
      borderTopColor: '#4f46e5', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── ALERT ──────────────────────────────────────────────────────
export const Alert = ({ type = 'error', message, onClose }) => {
  const colors = {
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
  };
  const c = colors[type] || colors.error;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 8, padding: '12px 16px', marginBottom: 16,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: c.text, fontSize: 18, lineHeight: 1, marginLeft: 8, padding: 0
        }}>×</button>
      )}
    </div>
  );
};

// ── MODAL ──────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, width = 520 }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 22,
            color: '#6b7280', lineHeight: 1
          }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

// ── CONFIRM MODAL ──────────────────────────────────────────────
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} width={400}>
    <p style={{ margin: '0 0 24px', color: '#4b5563', lineHeight: 1.6 }}>{message}</p>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </Modal>
);

// ── BUTTON ─────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', onClick, disabled, type = 'button', style = {} }) => {
  const styles = {
    primary:   { bg: '#4f46e5', hover: '#4338ca', color: '#fff' },
    secondary: { bg: '#f3f4f6', hover: '#e5e7eb', color: '#374151' },
    danger:    { bg: '#ef4444', hover: '#dc2626', color: '#fff' },
    success:   { bg: '#10b981', hover: '#059669', color: '#fff' },
    warning:   { bg: '#f59e0b', hover: '#d97706', color: '#fff' },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#d1d5db' : s.bg,
        color: disabled ? '#9ca3af' : s.color,
        border: 'none', borderRadius: 8, padding: '10px 20px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600, fontSize: 14, transition: 'background 0.15s',
        ...style
      }}
    >
      {children}
    </button>
  );
};

// ── FORM FIELD ─────────────────────────────────────────────────
export const FormField = ({ label, required, error, children }) => (
  <div style={{ marginBottom: 18 }}>
    {label && (
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14, color: '#374151' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
      </label>
    )}
    {children}
    {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{error}</p>}
  </div>
);

// ── INPUT ──────────────────────────────────────────────────────
export const Input = ({ style, ...props }) => (
  <input
    {...props}
    style={{
      width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
      border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box',
      transition: 'border-color 0.15s',
      ...style
    }}
    onFocus={e => e.target.style.borderColor = '#4f46e5'}
    onBlur={e => e.target.style.borderColor = '#d1d5db'}
  />
);

export const Select = ({ children, style, ...props }) => (
  <select
    {...props}
    style={{
      width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
      border: '1px solid #d1d5db', background: '#fff', outline: 'none',
      boxSizing: 'border-box', cursor: 'pointer', ...style
    }}
  >
    {children}
  </select>
);

export const Textarea = ({ style, ...props }) => (
  <textarea
    {...props}
    style={{
      width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
      border: '1px solid #d1d5db', outline: 'none', resize: 'vertical',
      boxSizing: 'border-box', minHeight: 80, ...style
    }}
  />
);

// ── BADGE ──────────────────────────────────────────────────────
export const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green:  { bg: '#dcfce7', text: '#166534' },
    red:    { bg: '#fee2e2', text: '#991b1b' },
    yellow: { bg: '#fef9c3', text: '#854d0e' },
    blue:   { bg: '#dbeafe', text: '#1e40af' },
    purple: { bg: '#ede9fe', text: '#5b21b6' },
    gray:   { bg: '#f3f4f6', text: '#374151' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      background: c.bg, color: c.text, borderRadius: 20, padding: '2px 10px',
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap'
    }}>
      {children}
    </span>
  );
};

// ── CARD ───────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <div style={{
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6', ...style
  }}>
    {children}
  </div>
);

// ── STAT CARD ──────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = '#4f46e5' }) => (
  <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{
      width: 56, height: 56, borderRadius: 12,
      background: `${color}18`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 24, flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{label}</div>
    </div>
  </Card>
);

// ── LAYOUT ─────────────────────────────────────────────────────
const NAV_INSTRUCTOR = [
  { to: '/instructor', label: '🏠 Dashboard', exact: true },
  { to: '/instructor/courses', label: '📚 Courses' },
  { to: '/instructor/exams', label: '📝 Exams' },
  { to: '/instructor/questions', label: '🗄️ Question Bank' },
  { to: '/instructor/results', label: '📊 Results' },
];
const NAV_STUDENT = [
  { to: '/student', label: '🏠 Dashboard', exact: true },
  { to: '/student/history', label: '📋 My Results' },
];

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = user?.role === 'instructor' ? NAV_INSTRUCTOR : NAV_STUDENT;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#1e1b4b', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#a5b4fc' }}>Examination System</div>
          <div style={{ fontSize: 13, color: '#c7d2fe', marginTop: 4 }}>
            {user?.role === 'instructor' ? '👨‍🏫 Instructor' : '👨‍🎓 Student'}: {user?.username}
          </div>
        </div>
        <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'block', padding: '12px 20px', color: isActive ? '#a5b4fc' : '#c7d2fe',
                textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(165,180,252,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid #a5b4fc' : '3px solid transparent',
                transition: 'all 0.15s'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5', borderRadius: 8, padding: '10px', cursor: 'pointer',
            fontWeight: 600, fontSize: 14
          }}>
            🚪 Logout
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
};

// ── PAGE HEADER ────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>{title}</h1>
      {subtitle && <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 15 }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 12 }}>{actions}</div>}
  </div>
);

// ── TABLE ──────────────────────────────────────────────────────
export const Table = ({ headers, rows, emptyMessage = 'No data found' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          {headers.map((h, i) => (
            <th key={i} style={{
              padding: '12px 16px', textAlign: 'left', fontWeight: 600,
              color: '#374151', whiteSpace: 'nowrap', background: '#f9fafb'
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
              {emptyMessage}
            </td>
          </tr>
        ) : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '14px 16px', color: '#374151' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
