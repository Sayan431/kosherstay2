import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { bookingsAPI, getImageUrl } from '../../api/index.js';
import { format } from 'date-fns';

import AdminSidebar from '../../components/AdminSidebar.jsx';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=80';

const STATUS_COLORS = {
  pending: 'badge-warning',
  accepted: 'badge-success',
  rejected: 'badge-danger',
  cancelled: 'badge-gray',
};

export default function AdminBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const { data } = await bookingsAPI.adminAll();
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, status);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <main className="dashboard-content">
        <div className="page-header">
          <h2>📋 {t('admin.bookings')}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'pending', 'accepted', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`btn btn-sm ${filter === s ? 'btn-navy' : 'btn-outline'}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
            <p>No bookings found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Customer</th>
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const img = b.property.images?.[0]?.image_url
                    ? getImageUrl(b.property.images[0].image_url)
                    : PLACEHOLDER;
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={img} alt="" style={{ width: 44, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{b.property.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{b.property.type}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{b.customer.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{b.customer.phone || b.customer.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>
                          {format(new Date(b.check_in), 'MMM dd')} → {format(new Date(b.check_out), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 600 }}>👥 {b.guests}</span></td>
                      <td><span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>${b.total_price?.toLocaleString()}</span></td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[b.status] || 'badge-gray'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleStatus(b.id, 'accepted')} className="btn btn-success btn-sm">
                              ✓ {t('admin.accept')}
                            </button>
                            <button onClick={() => handleStatus(b.id, 'rejected')} className="btn btn-danger btn-sm">
                              ✕ {t('admin.reject')}
                            </button>
                          </div>
                        )}
                        {b.status !== 'pending' && (
                          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
