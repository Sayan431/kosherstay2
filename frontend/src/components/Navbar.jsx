import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/index.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLang = (lang) => {
    i18n.changeLanguage(lang);
    document.body.dir = lang === 'he' ? 'rtl' : 'ltr';
  };

  const dashboardLink = () => {
    if (!user) return null;
    if (user.role === 'super_admin') return '/super-admin';
    if (user.role === 'hotel_admin') return '/admin';
    return '/my-bookings';
  };

  const dashboardLabel = () => {
    if (user?.role === 'super_admin') return t('super_admin.dashboard');
    if (user?.role === 'hotel_admin') return t('admin.dashboard');
    return t('booking.my_bookings');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="star">✡</span>
        KosherStay
      </Link>

      <ul className="navbar-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>
            {t('nav.home')}
          </NavLink>
        </li>

        {user ? (
          <>
            <li>
              <NavLink to={dashboardLink()} className={({ isActive }) => isActive ? 'active-link' : ''}>
                {dashboardLabel()}
              </NavLink>
            </li>
            <li style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              👋 {user.name}
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                {t('nav.logout')}
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active-link' : ''}>
                {t('nav.login')}
              </NavLink>
            </li>
            <li>
              <Link to="/register" className="btn btn-primary btn-sm">
                {t('nav.register')}
              </Link>
            </li>
          </>
        )}

        <li>
          <div className="lang-switcher">
            <button
              className={`lang-btn ${i18n.language === 'en' ? 'active-lang' : ''}`}
              onClick={() => toggleLang('en')}
            >EN</button>
            <button
              className={`lang-btn ${i18n.language === 'he' ? 'active-lang' : ''}`}
              onClick={() => toggleLang('he')}
            >עב</button>
          </div>
        </li>
      </ul>
    </nav>
  );
}
