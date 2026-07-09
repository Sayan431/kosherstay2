import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertiesAPI, bookingsAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import ImageGallery from '../components/ImageGallery.jsx';

export default function PropertyDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ check_in: '', check_out: '', guests: 1, notes: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    propertiesAPI.get(id)
      .then(r => setProperty(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = booking.check_in && booking.check_out
    ? Math.max((new Date(booking.check_out) - new Date(booking.check_in)) / 86400000, 0)
    : 0;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!booking.check_in || !booking.check_out) { setMsg({ type: 'danger', text: 'Please select check-in and check-out dates' }); return; }
    setBookingLoading(true);
    try {
      await bookingsAPI.create({ property_id: parseInt(id), ...booking });
      setMsg({ type: 'success', text: 'Booking submitted! Awaiting admin approval.' });
      setBooking({ check_in: '', check_out: '', guests: 1, notes: '' });
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.detail || 'Booking failed' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;
  if (!property) return null;

  return (
    <div className="container section">
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 20 }}>
        ← {t('common.back')}
      </button>

      {/* Gallery */}
      <ImageGallery images={property.images} />

      <div className="detail-layout" style={{ marginTop: 32 }}>
        {/* Left: Property Info */}
        <div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <span className="badge badge-navy">✡ Kosher</span>
            <span className="badge badge-gold">{property.type}</span>
            <span className="badge badge-gray">📍 {property.pincode}</span>
          </div>

          <h1 style={{ marginBottom: 8 }}>{property.name}</h1>
          <p style={{ color: 'var(--gray-600)', fontSize: 15, marginBottom: 24 }}>📍 {property.address}</p>

          {property.description && (
            <div className="info-section" style={{ paddingTop: 0, border: 'none' }}>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8 }}>{property.description}</p>
            </div>
          )}

          {/* Timing */}
          {(property.open_time || property.close_time) && (
            <div className="info-section">
              <h3>⏰ {t('property.timing')}</h3>
              <div style={{ display: 'flex', gap: 16 }}>
                {property.open_time && <span className="badge badge-success">Open: {property.open_time}</span>}
                {property.close_time && <span className="badge badge-danger">Close: {property.close_time}</span>}
              </div>
            </div>
          )}

          {/* Services */}
          {property.services?.length > 0 && (
            <div className="info-section">
              <h3>🛎️ {t('property.amenities')}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {property.services.map(s => (
                  <span key={s.id} className="service-tag">
                    ✓ {s.title}
                    {s.description && <span style={{ color: 'var(--gray-400)', fontSize: 11 }}> — {s.description}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Days Plan */}
          {property.days_plans?.length > 0 && (
            <div className="info-section">
              <h3>📅 {t('property.days_plan')}</h3>
              {property.days_plans.map(dp => (
                <div key={dp.id} style={{ background: 'var(--ivory)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 8, border: '1px solid var(--ivory-dark)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{dp.title}</div>
                  {dp.description && <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>{dp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Rules */}
          <div className="info-section">
            <h3>📋 {t('property.rules')}</h3>
            {property.check_in_rules && (
              <div className="rule-item">
                <div className="rule-icon">✅</div>
                <div><strong>{t('property.check_in_rules')}:</strong> <span style={{ color: 'var(--gray-600)', fontSize: 14 }}>{property.check_in_rules}</span></div>
              </div>
            )}
            {property.check_out_rules && (
              <div className="rule-item">
                <div className="rule-icon">🚪</div>
                <div><strong>{t('property.check_out_rules')}:</strong> <span style={{ color: 'var(--gray-600)', fontSize: 14 }}>{property.check_out_rules}</span></div>
              </div>
            )}
            {property.hotel_rules && (
              <div className="rule-item">
                <div className="rule-icon">📜</div>
                <div><strong>{t('property.hotel_rules')}:</strong> <span style={{ color: 'var(--gray-600)', fontSize: 14 }}>{property.hotel_rules}</span></div>
              </div>
            )}
          </div>

          {/* Owner */}
          <div className="info-section">
            <h3>👤 {t('property.owner')}</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className="service-tag">👤 {property.owner.name}</span>
              {property.owner.phone && (
                <a href={`tel:${property.owner.phone}`} className="btn btn-navy btn-sm">
                  📞 {t('property.call_property')}
                </a>
              )}
              <a
                href={`https://maps.google.com?q=${encodeURIComponent(property.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                🗺 {t('property.get_directions')}
              </a>
            </div>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div>
          <div className="detail-sidebar-card">
            <div className="detail-price">
              ${property.price.toLocaleString()}
              <span> / {t('home.per_night')}</span>
            </div>

            <div style={{ marginTop: 4, marginBottom: 20 }}>
              <span className="badge badge-gold">✡ Kosher Verified</span>
            </div>

            <div className="shabbat-notice" style={{ marginBottom: 20 }}>
              🕍 Shabbat dates auto-blocked
            </div>

            {msg && (
              <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">{t('booking.check_in')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={booking.check_in}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBooking(b => ({ ...b, check_in: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('booking.check_out')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={booking.check_out}
                  min={booking.check_in || new Date().toISOString().split('T')[0]}
                  onChange={e => setBooking(b => ({ ...b, check_out: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('booking.guests')}</label>
                <input
                  type="number"
                  className="form-input"
                  value={booking.guests}
                  min={1}
                  onChange={e => setBooking(b => ({ ...b, guests: parseInt(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('booking.notes')}</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={booking.notes}
                  onChange={e => setBooking(b => ({ ...b, notes: e.target.value }))}
                />
              </div>

              {nights > 0 && (
                <div style={{ background: 'var(--ivory)', borderRadius: 'var(--radius)', padding: '12px 14px', border: '1px solid var(--ivory-dark)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--gray-600)' }}>
                    <span>${property.price} × {nights} {t('booking.nights')}</span>
                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>${(property.price * nights).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={bookingLoading}>
                {bookingLoading ? '...' : `✡ ${t('booking.book')}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
