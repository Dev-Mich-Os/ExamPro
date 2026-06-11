import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert, Button, Input, Select, FormField } from '../../components/shared';

const AuthLayout = ({ children, title, subtitle }) => (
  <div style={{
    minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
  }}>
    <div style={{
      background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 440,
      boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#1e1b4b' }}>ExamPro</h1>
        <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 15 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'instructor' ? '/instructor' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Sign in to your account">
      {error && <Alert message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit}>
        <FormField label="Username" required>
          <Input
            type="text" value={form.username} placeholder="Enter username"
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />
        </FormField>
        <FormField label="Password" required>
          <Input
            type="password" value={form.password} placeholder="Enter password"
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </FormField>
        <Button type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: 14 }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>Register</Link>
      </p>
    </AuthLayout>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'instructor' ? '/instructor' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Create your account">
      {error && <Alert message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSubmit}>
        <FormField label="Username" required>
          <Input
            type="text" value={form.username} placeholder="Choose a username"
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />
        </FormField>
        <FormField label="Password" required>
          <Input
            type="password" value={form.password} placeholder="At least 6 characters"
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </FormField>
        <FormField label="Role" required>
          <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </Select>
        </FormField>
        <Button type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: 14 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>Sign In</Link>
      </p>
    </AuthLayout>
  );
};
