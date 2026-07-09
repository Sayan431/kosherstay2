import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { superAdminAPI, getImageUrl } from '../../api/index.js';
import { format } from 'date-fns';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=80';

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('admins');
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchAll = async () => {
    try {
      const [s, a, c, p] = await Promise.all([
        superAdminAPI.stats(),
        superAdminAPI.hotelAdmins(),
        superAdminAPI.customers(),
        superAdminAPI.allProperties(),
      ]);
      setStats(s.data);
      setAdmins(a.data);
      setCustomers(c.data);
      setProperties(p.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id) => {
    await superAdminAPI.approve(id);
    setMsg({ type: 'success', text: 'Admin approved!' });
    fetchAll();
  };

  const handleBlock = async (id) => {
    if (!confirm('Block this admin?')) return;
    await superAdminAPI.block(id);
    setMsg({ type: 'success', text: 'Admin blocked.' });
    fetchAll();
  };

  const handleToggleProperty = async (id) => {
    await superAdminAPI.toggleProperty(id);
    fetchAll();
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">✡ KosherStay<br /><small style={{ fontSize: 11 }}>Super Admin Panel</small></div>
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Management</span>
          <button onClick={() => setTab('admins')} className={`sidebar-link ${tab === 'admins' ? 'active' : ''}`}>
            👔 {t('super_admin.hotel_admins')}
          </button>
          <button onClick={() => setTab('customers')} className={`sidebar-link ${tab === 'customers' ? 'active' : ''}`}>
            👥 {t('super_admin.customers')}
          </button>
          <button onClick={() => setTab('properties')} className={`sidebar-link ${tab === 'properties' ? 'active' : ''}`}>
            🏠 {t('super_admin.all_properties')}
          </button>
          <span className="sidebar-section-label">Site</span>
          <Link to="/" className="sidebar-link">🌐 View Site</Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="dashboard-content">
        <div className="page-header">
          <h2>👑 {t('super_admin.dashboard')}</h2>
        </div>

        {msg && (
          <div className={`alert alert-${msg.type}`} style={{ marginBottom: 20 }}>
            {msg.text}
            <button onClick={() => setMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          {[
            { icon: '🏠', label: 'Total Properties', value: stats?.total_properties },
            { icon: '✅', label: 'Active Properties', value: stats?.active_properties },
            { icon: '📋', label: 'Total Bookings', value: stats?.total_bookings },
            { icon: '⏳', label: 'Pending Bookings', value: stats?.pending_bookings },
            { icon: '👔', label: 'Property Owners', value: stats?.total_hotel_admins },
            { icon: '✓', label: 'Approved Owners', value: stats?.approved_hotel_admins },
            { icon: '👥', label: 'Customers', value: stats?.total_customers },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-icon">{s.icon}</div>
              <div className="stat-card-value">{s.value ?? 0}</div>
              <div className="stat-card-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab: Hotel Admins */}
        {tab === 'admins' && (
          <>
            <div className="page-header">
              <h3 style={{ color: 'var(--navy)' }}>👔 {t('super_admin.hotel_admins')} ({admins.length})</h3>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>{t('super_admin.status')}</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td>{a.email}</td>
                      <td>{a.phone || '—'}</td>
                      <td style={{ fontSize: 13 }}>{format(new Date(a.created_at), 'MMM dd, yyyy')}</td>
                      <td>
                        {a.is_approved && a.is_active
                          ? <span className="badge badge-success">✅ {t('super_admin.approved')}</span>
                          : !a.is_active
                          ? <span className="badge badge-danger">🚫 {t('super_admin.blocked')}</span>
                          : <span className="badge badge-warning">⏳ {t('super_admin.pending')}</span>
                        }
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(!a.is_approved || !a.is_active) && (
                            <button onClick={() => handleApprove(a.id)} className="btn btn-success btn-sm">
                              ✓ {t('super_admin.approve')}
                            </button>
                          )}
                          {a.is_active && (
                            <button onClick={() => handleBlock(a.id)} className="btn btn-danger btn-sm">
                              🚫 {t('super_admin.block')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px' }}>No hotel admins registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab: Customers */}
        {tab === 'customers' && (
          <>
            <div className="page-header">
              <h3 style={{ color: 'var(--navy)' }}>👥 {t('super_admin.customers')} ({customers.length})</h3>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || '—'}</td>
                      <td style={{ fontSize: 13 }}>{format(new Date(c.created_at), 'MMM dd, yyyy')}</td>
                      <td>
                        <span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px' }}>No customers registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab: All Properties */}
        {tab === 'properties' && (
          <>
            <div className="page-header">
              <h3 style={{ color: 'var(--navy)' }}>🏠 {t('super_admin.all_properties')} ({properties.length})</h3>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>Pincode</th>
                    <th>Price/Night</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => {
                    const img = p.images?.[0]?.image_url ? getImageUrl(p.images[0].image_url) : PLACEHOLDER;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={img} alt="" style={{ width: 44, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>📍 {p.address}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{p.owner.name}</td>
                        <td><span className="badge badge-navy">{p.type}</span></td>
                        <td>{p.pincode}</td>
                        <td style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>${p.price}/night</td>
                        <td>
                          <span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleProperty(p.id)}
                            className={`btn btn-sm ${p.is_active ? 'btn-danger' : 'btn-success'}`}
                          >
                            {p.is_active ? '⏸ Deactivate' : '▶ Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {properties.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '40px' }}>No properties yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
