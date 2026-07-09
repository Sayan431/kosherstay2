import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../api/index.js';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authAPI.register({ ...form, role });
      if (role === 'hotel_admin') {
        setSuccess(t('auth.pending_approval'));
        setTimeout(() => navigate('/login'), 3000);
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
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

        <h2 style={{ marginBottom: 20, color: 'var(--navy)' }}>{t('auth.register_title')}</h2>

        {/* Role Tabs */}
        <div className="auth-tabs" style={{ marginBottom: 20 }}>
          <button
            className={`auth-tab ${role === 'customer' ? 'active' : ''}`}
            onClick={() => setRole('customer')}
            type="button"
          >
            👤 {t('auth.role_customer')}
          </button>
          <button
            className={`auth-tab ${role === 'hotel_admin' ? 'active' : ''}`}
            onClick={() => setRole('hotel_admin')}
            type="button"
          >
            🏠 {t('auth.role_admin')}
          </button>
        </div>

        {role === 'hotel_admin' && (
          <div className="alert alert-info" style={{ marginBottom: 16, fontSize: 13 }}>
            ℹ️ {t('auth.pending_approval')}
          </div>
        )}

        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">{t('auth.name')}</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.phone')}</label>
            <input
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+1 000 000 0000"
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <input
              type="password"
              className="form-input"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min 6 characters"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? '...' : `✡ ${t('auth.register_btn')}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--gray-600)' }}>
          {t('auth.have_account')}{' '}
          <Link to="/login" style={{ color: 'var(--navy)', fontWeight: 600 }}>
            {t('nav.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
