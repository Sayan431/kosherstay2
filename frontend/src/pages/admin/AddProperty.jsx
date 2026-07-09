import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertiesAPI, adminAPI } from '../../api/index.js';

const STEPS = ['Details', 'Services', 'Days Plan', 'Images', 'Rules'];

const TYPE_OPTIONS = ['Home', 'Apartment', 'Villa', 'Cabin'];

export default function AddProperty() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState(null);

  const [form, setForm] = useState({
    name: '', address: '', pincode: '', type: 'Home',
    price: '', description: '', open_time: '', close_time: '',
    check_in_rules: '', check_out_rules: '', hotel_rules: '',
    latitude: '', longitude: '',
  });
  const [services, setServices] = useState([{ title: '', description: '' }]);
  const [daysPlan, setDaysPlan] = useState([{ title: '', description: '' }]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const addService = () => setServices(s => [...s, { title: '', description: '' }]);
  const removeService = (i) => setServices(s => s.filter((_, idx) => idx !== i));
  const updateService = (i, field, val) => setServices(s => s.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const addPlan = () => setDaysPlan(d => [...d, { title: '', description: '' }]);
  const removePlan = (i) => setDaysPlan(d => d.filter((_, idx) => idx !== i));
  const updatePlan = (i, field, val) => setDaysPlan(d => d.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - imageFiles.length);
    setImageFiles(prev => [...prev, ...files].slice(0, 5));
    setImages(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 5));
  };

  const removeImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImages(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleStepNext = async () => {
    setError('');
    if (step === 0) {
      // Create property
      if (!form.name || !form.address || !form.pincode || !form.price) {
        setError('Please fill all required fields'); return;
      }
      setLoading(true);
      try {
        const payload = {
          ...form,
          price: parseFloat(form.price),
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
          services: services.filter(s => s.title),
          days_plans: daysPlan.filter(d => d.title),
        };
        const { data } = await propertiesAPI.create(payload);
        setCreatedId(data.id);
        setStep(1);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to create property');
      } finally {
        setLoading(false);
      }
    } else if (step === 1) {
      // Update services
      if (createdId && services.some(s => s.title)) {
        await adminAPI.updateServices(createdId, services.filter(s => s.title));
      }
      setStep(2);
    } else if (step === 2) {
      // Update days plan
      if (createdId && daysPlan.some(d => d.title)) {
        await adminAPI.updateDaysPlans(createdId, daysPlan.filter(d => d.title));
      }
      setStep(3);
    } else if (step === 3) {
      // Upload images
      if (createdId && imageFiles.length > 0) {
        setLoading(true);
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('files', f));
        try {
          await propertiesAPI.uploadImages(createdId, fd);
        } catch (err) {
          setError('Image upload failed: ' + (err.response?.data?.detail || ''));
        } finally {
          setLoading(false);
        }
      }
      setStep(4);
    } else if (step === 4) {
      // Update rules via property update
      if (createdId) {
        setLoading(true);
        try {
          await propertiesAPI.update(createdId, {
            check_in_rules: form.check_in_rules,
            check_out_rules: form.check_out_rules,
            hotel_rules: form.hotel_rules,
          });
          navigate('/admin');
        } catch (err) {
          setError('Failed to save rules');
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/admin');
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">✡ KosherStay<br /><small style={{ fontSize: 11 }}>Property Owner Panel</small></div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="sidebar-link">🏠 {t('admin.dashboard')}</Link>
          <Link to="/admin/add-property" className="sidebar-link active">➕ {t('admin.add_property')}</Link>
          <Link to="/admin/bookings" className="sidebar-link">📋 {t('admin.bookings')}</Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        <div className="page-header">
          <h2>➕ {t('admin.add_property')}</h2>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', boxShadow: 'var(--shadow-sm)' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: i === step ? 'var(--gold)' : i < step ? 'var(--success)' : 'var(--gray-400)',
                fontWeight: i === step ? 700 : 500, fontSize: 13,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === step ? 'var(--gold)' : i < step ? 'var(--success)' : 'var(--gray-200)',
                  color: i <= step ? 'white' : 'var(--gray-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {s}
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--success)' : 'var(--gray-200)', margin: '0 8px' }} />}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
          {/* Step 0: Details */}
          {step === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">{t('admin.property_name')} *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Beautiful Kosher Villa..." required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">{t('admin.address')} *</label>
                <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main Street, City, Country" required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.pincode')} *</label>
                <input className="form-input" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="10001" required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.type')} *</label>
                <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPE_OPTIONS.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.price')} ($/night) *</label>
                <input type="number" className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="150" required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', gap: 6 }}>
                  {t('admin.open_time')} <span style={{ color: 'var(--gray-400)', fontWeight: 400, textTransform: 'none' }}>/ {t('admin.close_time')}</span>
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="time" className="form-input" value={form.open_time} onChange={e => setForm(f => ({ ...f, open_time: e.target.value }))} />
                  <input type="time" className="form-input" value={form.close_time} onChange={e => setForm(f => ({ ...f, close_time: e.target.value }))} />
                </div>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">{t('admin.description')}</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your property..." />
              </div>
              <div className="form-group">
                <label className="form-label">Latitude (optional)</label>
                <input type="number" step="any" className="form-input" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="40.7128" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude (optional)</label>
                <input type="number" step="any" className="form-input" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="-74.0060" />
              </div>
            </div>
          )}

          {/* Step 1: Services */}
          {step === 1 && (
            <div>
              <p style={{ color: 'var(--gray-600)', marginBottom: 20, fontSize: 14 }}>
                Add amenities like AC, Elevator, Kosher Kitchen, Pool, etc.
              </p>
              {services.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, marginBottom: 10 }}>
                  <input className="form-input" placeholder="Title (e.g. AC)" value={s.title} onChange={e => updateService(i, 'title', e.target.value)} />
                  <input className="form-input" placeholder="Description" value={s.description} onChange={e => updateService(i, 'description', e.target.value)} />
                  <button onClick={() => removeService(i)} className="btn btn-danger btn-sm">✕</button>
                </div>
              ))}
              <button onClick={addService} className="btn btn-outline btn-sm">
                ➕ {t('admin.add_service')}
              </button>
            </div>
          )}

          {/* Step 2: Days Plan */}
          {step === 2 && (
            <div>
              <p style={{ color: 'var(--gray-600)', marginBottom: 20, fontSize: 14 }}>
                Describe packages or stay options (e.g., Weekend Plan, Weekly Plan).
              </p>
              {daysPlan.map((d, i) => (
                <div key={i} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 12, border: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input className="form-input" placeholder="Plan Title (e.g. Weekend Package)" value={d.title} onChange={e => updatePlan(i, 'title', e.target.value)} />
                    <button onClick={() => removePlan(i)} className="btn btn-danger btn-sm">✕</button>
                  </div>
                  <textarea className="form-textarea" style={{ minHeight: 70 }} placeholder="Plan description..." value={d.description} onChange={e => updatePlan(i, 'description', e.target.value)} />
                </div>
              ))}
              <button onClick={addPlan} className="btn btn-outline btn-sm">
                ➕ {t('admin.add_plan')}
              </button>
            </div>
          )}

          {/* Step 3: Images */}
          {step === 3 && (
            <div>
              <p style={{ color: 'var(--gray-600)', marginBottom: 20, fontSize: 14 }}>
                Upload up to 5 property images. The first image is the cover.
              </p>
              <div
                className="upload-zone"
                onClick={() => document.getElementById('img-upload').click()}
              >
                <div className="upload-zone-icon">📷</div>
                <p style={{ color: 'var(--gray-600)', marginBottom: 6 }}>{t('admin.upload_images')}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>Click to upload or drag & drop • JPG, PNG, WebP</p>
                <input
                  id="img-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>
              {images.length > 0 && (
                <div className="image-preview-grid" style={{ marginTop: 16 }}>
                  {images.map((url, i) => (
                    <div key={i} className="image-preview">
                      <img src={url} alt={`preview-${i}`} />
                      <button className="image-preview-remove" onClick={() => removeImage(i)}>✕</button>
                      {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, background: 'var(--gold)', color: 'var(--navy)', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 100 }}>COVER</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Rules */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{t('admin.check_in_rules')}</label>
                <textarea className="form-textarea" value={form.check_in_rules} onChange={e => setForm(f => ({ ...f, check_in_rules: e.target.value }))} placeholder="Check-in after 3 PM, ID required..." />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.check_out_rules')}</label>
                <textarea className="form-textarea" value={form.check_out_rules} onChange={e => setForm(f => ({ ...f, check_out_rules: e.target.value }))} placeholder="Check-out by 11 AM..." />
              </div>
              <div className="form-group">
                <label className="form-label">{t('admin.hotel_rules')}</label>
                <textarea className="form-textarea" value={form.hotel_rules} onChange={e => setForm(f => ({ ...f, hotel_rules: e.target.value }))} placeholder="No smoking. Strictly Kosher. Shabbat observed..." />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'space-between' }}>
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn btn-outline"
              disabled={step === 0}
            >
              ← Previous
            </button>
            <button onClick={handleStepNext} className="btn btn-primary" disabled={loading}>
              {loading ? '...' : step === STEPS.length - 1 ? `✓ ${t('admin.save')}` : 'Next →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
