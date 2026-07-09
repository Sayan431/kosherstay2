import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { superAdminAPI, getImageUrl } from '../../api/index.js';
import { format } from 'date-fns';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80';

// Helper to generate initials for avatar
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

// Avatar component for tables
const Avatar = ({ name, role }) => {
  const isCustomer = role === 'customer';
  const bgColor = isCustomer ? 'linear-gradient(135deg, var(--info), #2563eb)' : 'linear-gradient(135deg, var(--navy), var(--navy-700))';
  const color = isCustomer ? '#ffffff' : 'var(--gold)';
  
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: bgColor, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {getInitials(name)}
    </div>
  );
};

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
    setMsg({ type: 'success', text: 'Hotel Admin successfully approved!' });
    fetchAll();
  };

  const handleBlock = async (id) => {
    if (!confirm('Are you sure you want to block this user?')) return;
    await superAdminAPI.block(id);
    setMsg({ type: 'warning', text: 'User has been blocked.' });
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
      <aside className="sidebar" style={{ background: 'linear-gradient(180deg, var(--navy) 0%, var(--navy-800) 100%)' }}>
        <div className="sidebar-logo">
          <span style={{ fontSize: '1.4rem' }}>✡</span><br/>
          KosherStay<br />
          <small style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 400, letterSpacing: 1 }}>SUPER ADMIN</small>
        </div>
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
          
          <span className="sidebar-section-label" style={{ marginTop: 32 }}>Platform</span>
          <Link to="/" className="sidebar-link">🌐 View Live Site</Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="dashboard-content">
        <div className="page-header animate-in">
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--gold)' }}>👑</span> {t('super_admin.dashboard')}
          </h2>
          <div style={{ color: 'var(--gray-600)', fontSize: 14 }}>
            System Status: <span className="badge badge-success" style={{ marginLeft: 6 }}>● All Systems Operational</span>
          </div>
        </div>

        {msg && (
          <div className={`alert alert-${msg.type} animate-in`} style={{ marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
            {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
            <button onClick={() => setMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', opacity: 0.7 }}>✕</button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="stats-grid animate-in" style={{ marginBottom: 40, animationDelay: '0.1s' }}>
          {[
            { icon: '🏠', label: 'Total Properties', value: stats?.total_properties, bg: 'linear-gradient(135deg, var(--navy), var(--navy-700))', color: 'var(--white)' },
            { icon: '✅', label: 'Active Properties', value: stats?.active_properties },
            { icon: '📋', label: 'Total Bookings', value: stats?.total_bookings },
            { icon: '👔', label: 'Hotel Admins', value: stats?.total_hotel_admins },
            { icon: '✓', label: 'Approved Admins', value: stats?.approved_hotel_admins },
            { icon: '👥', label: 'Customers', value: stats?.total_customers },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={s.bg ? { background: s.bg, color: s.color, borderColor: 'transparent' } : {}}>
              <div className="stat-card-icon" style={s.bg ? { background: 'rgba(255,255,255,0.1)', color: 'var(--gold)' } : {}}>{s.icon}</div>
              <div className="stat-card-value" style={s.bg ? { color: 'var(--white)' } : {}}>{s.value ?? 0}</div>
              <div className="stat-card-label" style={s.bg ? { color: 'rgba(255,255,255,0.7)' } : {}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card animate-in" style={{ animationDelay: '0.2s', padding: '32px 24px', background: 'var(--white)' }}>
          
          {/* Tab: Hotel Admins */}
          {tab === 'admins' && (
            <div>
              <div className="page-header" style={{ marginBottom: 20 }}>
                <h3 style={{ color: 'var(--navy)' }}>👔 {t('super_admin.hotel_admins')}</h3>
                <span className="badge badge-gray">{admins.length} Registered</span>
              </div>
              <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid var(--gray-200)' }}>
                <table>
                  <thead>
                    <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                      <th style={{ color: 'var(--gray-600)' }}>Owner</th>
                      <th style={{ color: 'var(--gray-600)' }}>Contact Info</th>
                      <th style={{ color: 'var(--gray-600)' }}>Registered</th>
                      <th style={{ color: 'var(--gray-600)' }}>{t('super_admin.status')}</th>
                      <th style={{ color: 'var(--gray-600)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar name={a.name} role="hotel_admin" />
                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{a.name}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 14 }}>{a.email}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{a.phone || 'No phone'}</div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{format(new Date(a.created_at), 'MMM dd, yyyy')}</td>
                        <td>
                          {a.is_approved && a.is_active
                            ? <span className="badge badge-success">✅ {t('super_admin.approved')}</span>
                            : !a.is_active
                            ? <span className="badge badge-danger">🚫 {t('super_admin.blocked')}</span>
                            : <span className="badge badge-warning">⏳ {t('super_admin.pending')}</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            {(!a.is_approved || !a.is_active) && (
                              <button onClick={() => handleApprove(a.id)} className="btn btn-success btn-sm" style={{ padding: '6px 12px' }}>
                                ✓ {t('super_admin.approve')}
                              </button>
                            )}
                            {a.is_active && (
                              <button onClick={() => handleBlock(a.id)} className="btn btn-danger btn-sm" style={{ padding: '6px 12px', background: 'var(--white)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                                🚫 {t('super_admin.block')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {admins.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '60px' }}>No hotel admins registered yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Customers */}
          {tab === 'customers' && (
            <div>
              <div className="page-header" style={{ marginBottom: 20 }}>
                <h3 style={{ color: 'var(--navy)' }}>👥 {t('super_admin.customers')}</h3>
                <span className="badge badge-gray">{customers.length} Registered</span>
              </div>
              <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid var(--gray-200)' }}>
                <table>
                  <thead>
                    <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                      <th style={{ color: 'var(--gray-600)' }}>Customer</th>
                      <th style={{ color: 'var(--gray-600)' }}>Contact Info</th>
                      <th style={{ color: 'var(--gray-600)' }}>Registered</th>
                      <th style={{ color: 'var(--gray-600)', textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar name={c.name} role="customer" />
                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{c.name}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 14 }}>{c.email}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.phone || 'No phone'}</div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{format(new Date(c.created_at), 'MMM dd, yyyy')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {c.is_active ? 'Active User' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '60px' }}>No customers registered yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: All Properties */}
          {tab === 'properties' && (
            <div>
              <div className="page-header" style={{ marginBottom: 24 }}>
                <h3 style={{ color: 'var(--navy)' }}>🏠 {t('super_admin.all_properties')}</h3>
                <span className="badge badge-gold">{properties.length} Total</span>
              </div>
              
              {properties.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '60px', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏘️</div>
                  <p>No properties listed on the platform yet.</p>
                </div>
              ) : (
                <div className="grid-3">
                  {properties.map(p => {
                    const img = p.images?.[0]?.image_url ? getImageUrl(p.images[0].image_url) : PLACEHOLDER;
                    return (
                      <div key={p.id} className="property-card" style={{ position: 'relative', border: !p.is_active ? '2px solid var(--danger)' : '1px solid transparent' }}>
                        {/* Overlay for inactive properties */}
                        {!p.is_active && (
                          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                            <span className="badge badge-danger">Inactive / Hidden</span>
                          </div>
                        )}
                        
                        <div className="property-card-image" style={{ height: 180, filter: !p.is_active ? 'grayscale(80%)' : 'none' }}>
                          <img src={img} alt={p.name} loading="lazy" />
                          <span className="property-card-type">{p.type}</span>
                        </div>

                        <div className="property-card-body" style={{ padding: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <h3 className="property-card-title" style={{ fontSize: '1.05rem', margin: 0, flex: 1, paddingRight: 8 }}>{p.name}</h3>
                            <div className="property-card-price" style={{ fontSize: '1.1rem' }}>${p.price}</div>
                          </div>
                          
                          <p className="property-card-address" style={{ fontSize: 12, marginBottom: 16 }}>📍 {p.address}</p>
                          
                          <div style={{ background: 'var(--gray-50)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700, marginBottom: 4 }}>Owner</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{p.owner.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{p.owner.email}</div>
                          </div>

                          <div style={{ marginTop: 'auto' }}>
                            <button
                              onClick={() => handleToggleProperty(p.id)}
                              className={`btn btn-block ${p.is_active ? 'btn-outline' : 'btn-success'}`}
                              style={p.is_active ? { color: 'var(--danger)', borderColor: 'var(--danger)' } : {}}
                            >
                              {p.is_active ? '⏸ Suspend Property' : '▶ Reactivate Property'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

