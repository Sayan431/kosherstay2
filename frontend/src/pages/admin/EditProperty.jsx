import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertiesAPI } from '../../api/index.js';
import AdminSidebar from '../../components/AdminSidebar.jsx';

const TYPE_OPTIONS = ['Home', 'Apartment', 'Villa', 'Cabin'];
const MAX_IMAGES = 5;

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

        {/* ── Property Details Form ── */}
        <form onSubmit={handleSave} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 28, boxShadow: 'var(--shadow-sm)', marginBottom: 24 }}>
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
                {TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

        {/* ── Image Management Panel ── */}
        <ImageManager propertyId={id} />
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ImageManager — self-contained panel to view, delete, and upload images.
───────────────────────────────────────────────────────────────────────────── */
function ImageManager({ propertyId }) {
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [imgMsg, setImgMsg] = useState(null);
  const fileInputRef = useRef(null);

  const fetchImages = () => {
    setLoadingImages(true);
    propertiesAPI.get(propertyId)
      .then(r => setImages(r.data.images || []))
      .finally(() => setLoadingImages(false));
  };

  useEffect(() => { fetchImages(); }, [propertyId]);

  // Generate / revoke preview object URLs whenever selected files change
  useEffect(() => {
    const urls = newFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [newFiles]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const available = MAX_IMAGES - images.length;
    if (selected.length > available) {
      setImgMsg({ type: 'danger', text: `You can only add ${available} more image(s). Max is ${MAX_IMAGES}.` });
      e.target.value = '';
      return;
    }
    setImgMsg(null);
    setNewFiles(selected);
  };

  const removePreview = (index) => {
    const updated = newFiles.filter((_, i) => i !== index);
    setNewFiles(updated);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!newFiles.length) return;
    setUploading(true);
    setImgMsg(null);
    try {
      const fd = new FormData();
      newFiles.forEach(f => fd.append('files', f));
      await propertiesAPI.uploadImages(propertyId, fd);
      setNewFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImgMsg({ type: 'success', text: `${newFiles.length} image(s) uploaded successfully!` });
      fetchImages(); // refresh from server
    } catch (err) {
      setImgMsg({ type: 'danger', text: err.response?.data?.detail || 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Remove this image? This cannot be undone.')) return;
    setDeletingId(imageId);
    setImgMsg(null);
    try {
      await propertiesAPI.deleteImage(propertyId, imageId);
      setImages(imgs => imgs.filter(i => i.id !== imageId));
      setImgMsg({ type: 'success', text: 'Image removed successfully.' });
    } catch (err) {
      setImgMsg({ type: 'danger', text: err.response?.data?.detail || 'Failed to delete image.' });
    } finally {
      setDeletingId(null);
    }
  };

  const canUploadMore = images.length < MAX_IMAGES;
  const slotsLeft = MAX_IMAGES - images.length;

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      padding: 28,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ color: 'var(--navy)', margin: 0, fontSize: '1.1rem' }}>🖼️ Property Images</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--gray-500)' }}>
            First image will be shown as the cover photo.
          </p>
        </div>
        <span style={{
          fontSize: 13,
          background: images.length >= MAX_IMAGES ? '#ef4444' : 'var(--navy)',
          color: '#fff',
          borderRadius: 20,
          padding: '4px 14px',
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}>
          {images.length} / {MAX_IMAGES}
        </span>
      </div>

      {imgMsg && (
        <div className={`alert alert-${imgMsg.type}`} style={{ marginBottom: 16 }}>
          {imgMsg.text}
        </div>
      )}

      {/* ── Current Images Gallery ── */}
      {loadingImages ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-400)' }}>
          <div className="spinner" style={{ margin: '0 auto 8px' }} />
          Loading images…
        </div>
      ) : images.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '36px 20px',
          border: '2px dashed var(--gray-200)',
          borderRadius: 12, marginBottom: 24, color: 'var(--gray-400)',
        }}>
          <div style={{ fontSize: '2.8rem', marginBottom: 8 }}>📷</div>
          <p style={{ margin: 0, fontWeight: 500 }}>No images uploaded yet.</p>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>Add up to {MAX_IMAGES} images below.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}>
          {images.map((img, idx) => (
            <div
              key={img.id}
              style={{
                position: 'relative',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: idx === 0
                  ? '0 0 0 3px var(--navy), 0 4px 12px rgba(0,0,0,0.15)'
                  : '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Cover badge */}
              {idx === 0 && (
                <span style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 100%)',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  padding: '16px 8px 6px', textAlign: 'center',
                  letterSpacing: '0.08em',
                }}>
                  ★ COVER
                </span>
              )}

              <img
                src={img.image_url}
                alt={`Property image ${idx + 1}`}
                style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
              />

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                disabled={deletingId === img.id}
                title="Delete image"
                style={{
                  position: 'absolute', top: 7, right: 7, zIndex: 3,
                  background: deletingId === img.id ? 'rgba(0,0,0,0.45)' : 'rgba(239,68,68,0.92)',
                  color: '#fff', border: 'none', borderRadius: '50%',
                  width: 30, height: 30, cursor: deletingId === img.id ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  transition: 'background 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { if (deletingId !== img.id) e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {deletingId === img.id ? '…' : '✕'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload New Images ── */}
      {canUploadMore ? (
        <div style={{
          border: '2px dashed var(--gray-200)',
          borderRadius: 12,
          padding: '20px 22px',
          background: 'var(--gray-50, #f9fafb)',
        }}>
          <label className="form-label" style={{ marginBottom: 10, display: 'block', fontWeight: 600 }}>
            📤 Upload New Images
            <span style={{ fontWeight: 400, color: 'var(--gray-500)', marginLeft: 6 }}>
              (up to {slotsLeft} more slot{slotsLeft !== 1 ? 's' : ''})
            </span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="form-input"
            style={{ marginBottom: 14, cursor: 'pointer' }}
          />

          {/* New file previews */}
          {previews.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={src}
                    alt={`New image ${i + 1}`}
                    style={{
                      width: 90, height: 72,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '2px solid var(--navy)',
                      display: 'block',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    title="Remove"
                    style={{
                      position: 'absolute', top: -7, right: -7,
                      background: '#ef4444', color: '#fff', border: 'none',
                      borderRadius: '50%', width: 20, height: 20,
                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  >✕</button>
                  <span style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.5)', color: '#fff',
                    fontSize: 9, textAlign: 'center', borderRadius: '0 0 6px 6px',
                    padding: '2px 0',
                  }}>NEW</span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading || newFiles.length === 0}
            style={{ minWidth: 140 }}
          >
            {uploading
              ? '⏳ Uploading…'
              : newFiles.length > 0
                ? `⬆️ Upload ${newFiles.length} Image${newFiles.length !== 1 ? 's' : ''}`
                : '⬆️ Upload'}
          </button>
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '16px 20px',
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, color: '#b91c1c', fontSize: 14, fontWeight: 500,
        }}>
          ⚠️ You've reached the maximum of {MAX_IMAGES} images.
          Delete an existing image to upload a new one.
        </div>
      )}
    </div>
  );
}
