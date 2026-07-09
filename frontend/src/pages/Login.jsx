import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data);
      if (data.role === 'super_admin') navigate('/super-admin');
      else if (data.role === 'hotel_admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div className="auth-logo">
          <span className="star">✡</span>
          <h1>KosherStay</h1>
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginTop: 4 }}>Kosher Vacation Rentals</p>
        </div>

        <h2 style={{ marginBottom: 24, color: 'var(--navy)' }}>{t('auth.login_title')}</h2>

        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? '...' : `✡ ${t('auth.login_btn')}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--gray-600)' }}>
          {t('auth.no_account')}{' '}
          <Link to="/register" style={{ color: 'var(--navy)', fontWeight: 600 }}>
            {t('nav.register')}
          </Link>
        </p>

        <div style={{ marginTop: 20, padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--gray-400)' }}>
          <strong>Demo:</strong> Super Admin: admin@kosher.com / admin123
        </div>
      </div>
    </div>
  );
}
