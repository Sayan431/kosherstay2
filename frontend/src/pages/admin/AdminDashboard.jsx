import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI, getImageUrl } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';

import AdminSidebar from '../../components/AdminSidebar.jsx';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.stats(), adminAPI.myProperties()])
      .then(([s, p]) => { setStats(s.data); setProperties(p.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Content */}
      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h2>{t('admin.dashboard')}</h2>
            <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>Welcome back, {user?.name}!</p>
          </div>
          <Link to="/admin/add-property" className="btn btn-primary">
            ➕ {t('admin.add_property')}
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          {[
            { icon: '🏠', label: t('admin.total_properties'), value: stats?.total_properties ?? 0 },
            { icon: '📊', label: 'Active Properties', value: stats?.active_properties ?? 0 },
            { icon: '📋', label: t('admin.total_bookings'), value: stats?.total_bookings ?? 0 },
            { icon: '⏳', label: t('admin.pending'), value: stats?.pending_bookings ?? 0 },
            { icon: '✅', label: t('admin.accepted'), value: stats?.accepted_bookings ?? 0 },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Properties */}
        <div className="page-header">
          <h3 style={{ color: 'var(--navy)' }}>{t('admin.my_properties')}</h3>
        </div>

        {properties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏡</div>
            <p>No properties yet. Add your first property!</p>
            <Link to="/admin/add-property" className="btn btn-primary" style={{ marginTop: 16 }}>
              ➕ Add Property
            </Link>
          </div>
        ) : (
          <div className="grid-2">
            {properties.map(p => {
              const img = p.images?.[0]?.image_url ? getImageUrl(p.images[0].image_url) : PLACEHOLDER;
              return (
                <div key={p.id} className="card">
                  <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                    <img src={img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', top: 10, right: 10 }}>
                      <span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {p.is_active ? '✓ Active' : '⏸ Inactive'}
                      </span>
                    </span>
                  </div>
                  <div className="card-body">
                    <h3 style={{ color: 'var(--navy)', marginBottom: 4 }}>{p.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 10 }}>📍 {p.address}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>
                        ${p.price}/night
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/calendar/${p.id}`} className="btn btn-navy btn-sm">📅</Link>
                        <Link to={`/admin/edit-property/${p.id}`} className="btn btn-outline btn-sm">✏️</Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
