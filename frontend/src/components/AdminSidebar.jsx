import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="sidebar" style={{ background: 'linear-gradient(180deg, var(--navy) 0%, var(--navy-800) 100%)' }}>
      <div className="sidebar-logo">
        <span style={{ fontSize: '1.4rem' }}>✡</span><br/>
        KosherStay<br />
        <small style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 400, letterSpacing: 1 }}>PROPERTY OWNER</small>
      </div>
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main</span>
        <Link to="/admin" className={`sidebar-link ${path === '/admin' ? 'active' : ''}`}>
          🏠 {t('admin.dashboard')}
        </Link>
        <Link to="/admin/add-property" className={`sidebar-link ${path.includes('/add-property') ? 'active' : ''}`}>
          ➕ {t('admin.add_property')}
        </Link>
        <Link to="/admin/bookings" className={`sidebar-link ${path.includes('/bookings') ? 'active' : ''}`}>
          📋 {t('admin.bookings')}
        </Link>
        
        <span className="sidebar-section-label" style={{ marginTop: 32 }}>Account</span>
        <Link to="/" className="sidebar-link">🏡 View Live Site</Link>
      </nav>
    </aside>
  );
}
