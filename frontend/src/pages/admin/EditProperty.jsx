import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertiesAPI } from '../../api/index.js';

import AdminSidebar from '../../components/AdminSidebar.jsx';

const TYPE_OPTIONS = ['Home', 'Apartment', 'Villa', 'Cabin'];

export default function EditProperty() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    propertiesAPI.get(id).then(r => {
      const p = r.data;
      setForm({
        name: p.name, address: p.address, pincode: p.pincode,
        type: p.type, price: p.price, description: p.description || '',
        check_in_rules: p.check_in_rules || '', check_out_rules: p.check_out_rules || '',
        hotel_rules: p.hotel_rules || '', open_time: p.open_time || '', close_time: p.close_time || '',
        latitude: p.latitude || '', longitude: p.longitude || '', is_active: p.is_active,
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await propertiesAPI.update(id, { ...form, price: parseFloat(form.price) });
      setMsg({ type: 'success', text: 'Property updated!' });
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.detail || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    try {
      await propertiesAPI.delete(id);
      navigate('/admin');
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.detail || 'Delete failed' });
    }
  };

  if (loading || !form) return <div className="spinner-wrapper"><div className="spinner" /></div>;

  return (
    <div className="dashboard-layout">
      <AdminSidebar />

      <main className="dashboard-content">
        <div className="page-header">
          <h2>✏️ {t('admin.update')}</h2>
          <button onClick={handleDelete} className="btn btn-danger">🗑 {t('admin.delete')}</button>
        </div>

        {msg && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 20 }}>{msg.text}</div>}

        <form onSubmit={handleSave} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">{t('admin.property_name')} *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">{t('admin.address')} *</label>
              <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.pincode')} *</label>
              <input className="form-input" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.type')}</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.price')} ($/night)</label>
              <input type="number" className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.open_time')}</label>
              <input type="time" className="form-input" value={form.open_time} onChange={e => setForm(f => ({ ...f, open_time: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.close_time')}</label>
              <input type="time" className="form-input" value={form.close_time} onChange={e => setForm(f => ({ ...f, close_time: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">{t('admin.description')}</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.check_in_rules')}</label>
              <textarea className="form-textarea" style={{ minHeight: 80 }} value={form.check_in_rules} onChange={e => setForm(f => ({ ...f, check_in_rules: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('admin.check_out_rules')}</label>
              <textarea className="form-textarea" style={{ minHeight: 80 }} value={form.check_out_rules} onChange={e => setForm(f => ({ ...f, check_out_rules: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">{t('admin.hotel_rules')}</label>
              <textarea className="form-textarea" value={form.hotel_rules} onChange={e => setForm(f => ({ ...f, hotel_rules: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '...' : `✓ ${t('admin.update')}`}
            </button>
            <Link to="/admin" className="btn btn-outline">Cancel</Link>
            <Link to={`/admin/calendar/${id}`} className="btn btn-navy">📅 {t('admin.calendar')}</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
