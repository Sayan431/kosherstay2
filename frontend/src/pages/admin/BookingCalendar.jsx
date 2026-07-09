import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { propertiesAPI } from '../../api/index.js';
import { format, isFriday, isSaturday, addDays } from 'date-fns';

import AdminSidebar from '../../components/AdminSidebar.jsx';

/**
 * Shabbat detection:
 * - Friday (after sunset ~18:00) through Saturday night (~19:00)
 * We block the entire Friday and Saturday for simplicity.
 */
function isShabbat(date) {
  return isFriday(date) || isSaturday(date);
}

export default function BookingCalendar() {
  const { propertyId } = useParams();
  const { t } = useTranslation();
  const [blockedDates, setBlockedDates] = useState([]);
  const [shabbatMode, setShabbatMode] = useState(true);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchData = useCallback(async () => {
    const [propRes, datesRes] = await Promise.all([
      propertiesAPI.get(propertyId),
      propertiesAPI.getBlockedDates(propertyId),
    ]);
    setProperty(propRes.data);
    setBlockedDates(datesRes.data.map(d => d.date));
  }, [propertyId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isBlocked = (date) => {
    const str = format(date, 'yyyy-MM-dd');
    return blockedDates.includes(str);
  };

  const handleDayClick = async (date) => {
    if (isShabbat(date) && shabbatMode) {
      setMsg({ type: 'warning', text: 'Shabbat dates are automatically blocked.' });
      return;
    }
    const str = format(date, 'yyyy-MM-dd');
    setLoading(true);
    try {
      if (isBlocked(date)) {
        await propertiesAPI.unblockDates(propertyId, { dates: [str] });
        setMsg({ type: 'success', text: `Unblocked ${str}` });
      } else {
        await propertiesAPI.blockDates(propertyId, { dates: [str], reason: 'blocked' });
        setMsg({ type: 'success', text: `Blocked ${str}` });
      }
      await fetchData();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed: ' + (err.response?.data?.detail || '') });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleShabbatAutoBlock = async () => {
    setLoading(true);
    // Auto-block next 12 weeks of Fridays & Saturdays
    const dates = [];
    let d = new Date();
    for (let i = 0; i < 84; i++) {
      if (isFriday(d) || isSaturday(d)) {
        dates.push(format(d, 'yyyy-MM-dd'));
      }
      d = addDays(d, 1);
    }
    try {
      await propertiesAPI.blockDates(propertyId, { dates, reason: 'shabbat' });
      setMsg({ type: 'success', text: `Auto-blocked ${dates.length} Shabbat dates (12 weeks)` });
      await fetchData();
    } catch {
      setMsg({ type: 'danger', text: 'Failed to auto-block' });
    } finally {
      setLoading(false);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    if (isShabbat(date) && shabbatMode) return 'tile-shabbat';
    if (isBlocked(date)) return 'tile-blocked';
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    if (isShabbat(date) && shabbatMode) return true;
    return false;
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <main className="dashboard-content">
        <div className="page-header">
          <div>
            <h2>📅 {t('admin.calendar')}</h2>
            {property && <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>{property.name}</p>}
          </div>
          <Link to="/admin" className="btn btn-outline btn-sm">← Back</Link>
        </div>

        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Calendar */}
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '8px' }}>
            <Calendar
              onClickDay={handleDayClick}
              tileClassName={tileClassName}
              tileDisabled={tileDisabled}
              minDate={new Date()}
            />
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Legend */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ color: 'var(--navy)', marginBottom: 14, fontSize: '1rem' }}>Legend</h3>
              {[
                { color: 'rgba(239,68,68,0.2)', label: '🔴 Blocked date — click to unblock' },
                { color: 'rgba(59,130,246,0.15)', label: '🔵 Shabbat (auto-blocked)' },
                { color: 'linear-gradient(135deg,var(--gold),var(--gold-dark))', label: '🟡 Selected / Today' },
                { color: 'var(--gray-100)', label: '⚪ Available — click to block' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{l.label}</span>
                </div>
              ))}
            </div>

            {/* Shabbat Controls */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ color: 'var(--navy)', marginBottom: 14, fontSize: '1rem' }}>🕍 Shabbat Settings</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <input
                  type="checkbox"
                  id="shabbat"
                  checked={shabbatMode}
                  onChange={e => setShabbatMode(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="shabbat" style={{ fontSize: 14, fontWeight: 600 }}>
                  {t('admin.shabbat_mode')}
                </label>
              </div>
              <div className="shabbat-notice" style={{ marginBottom: 12 }}>
                Fridays & Saturdays will be shown in blue and disabled for new bookings.
              </div>
              <button
                onClick={handleShabbatAutoBlock}
                className="btn btn-navy btn-block"
                disabled={loading}
              >
                🕍 Auto-Block Next 12 Weeks Shabbat
              </button>
            </div>

            {/* Stats */}
            <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ color: 'var(--navy)', marginBottom: 14, fontSize: '1rem' }}>Statistics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-600)' }}>Total blocked</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{blockedDates.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-600)' }}>Shabbat mode</span>
                  <span style={{ fontWeight: 700, color: shabbatMode ? 'var(--success)' : 'var(--gray-400)' }}>
                    {shabbatMode ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
