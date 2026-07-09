import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { bookingsAPI, getImageUrl } from '../../api/index.js';
import { format, differenceInDays } from 'date-fns';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=80';

const STATUS_CONFIG = {
  pending: { label: 'Pending', class: 'badge-warning', icon: '⏳' },
  accepted: { label: 'Accepted', class: 'badge-success', icon: '✅' },
  rejected: { label: 'Rejected', class: 'badge-danger', icon: '❌' },
  cancelled: { label: 'Cancelled', class: 'badge-gray', icon: '🚫' },
};

export default function BookingList() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingsAPI.myBookings();
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Cancel failed');
    }
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner" /></div>;

  return (
    <div className="container section">
      <div className="page-header">
        <h2>🗓 {t('booking.my_bookings')}</h2>
        <span style={{ color: 'var(--gray-400)', fontSize: 14 }}>{bookings.length} bookings</span>
      </div>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <p>{t('booking.no_bookings')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map(b => {
            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
            const nights = differenceInDays(new Date(b.check_out), new Date(b.check_in));
            const imgUrl = b.property.images?.[0]?.image_url
              ? getImageUrl(b.property.images[0].image_url)
              : PLACEHOLDER;

            return (
              <div key={b.id} className="booking-card animate-in">
                <img src={imgUrl} alt={b.property.name} className="booking-card-img" />

                <div className="booking-card-info">
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <h3 className="booking-card-title">{b.property.name}</h3>
                    <span className={`badge ${cfg.class}`}>{cfg.icon} {cfg.label}</span>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 6 }}>
                    📍 {b.property.address}
                  </p>

                  <div className="booking-dates">
                    <span>📅 {format(new Date(b.check_in), 'MMM dd, yyyy')}</span>
                    <span>→</span>
                    <span>{format(new Date(b.check_out), 'MMM dd, yyyy')}</span>
                    <span style={{ color: 'var(--gray-400)' }}>• {nights} {t('booking.nights')}</span>
                  </div>

                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--navy)', fontWeight: 700 }}>
                      ${b.total_price?.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Booked {format(new Date(b.created_at), 'MMM dd, yyyy')}</span>

                    {b.property.owner?.phone && (
                      <a href={`tel:${b.property.owner.phone}`} className="btn btn-navy btn-sm">
                        📞 Call
                      </a>
                    )}
                    <a
                      href={`https://maps.google.com?q=${encodeURIComponent(b.property.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      🗺 Directions
                    </a>
                    {b.status === 'pending' && (
                      <button onClick={() => handleCancel(b.id)} className="btn btn-danger btn-sm">
                        🚫 {t('booking.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
