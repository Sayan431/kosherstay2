import { useState } from 'react';
import { getImageUrl } from '../api/index.js';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';

export default function ImageGallery({ images }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const imgs = images?.length ? images : [{ image_url: null }];
  const urls = imgs.map(i => i.image_url ? getImageUrl(i.image_url) : PLACEHOLDER);

  const closeLightbox = () => setLightboxIdx(null);
  const prev = () => setLightboxIdx((lightboxIdx - 1 + urls.length) % urls.length);
  const next = () => setLightboxIdx((lightboxIdx + 1) % urls.length);

  return (
    <>
      <div className="image-gallery">
        {/* Main image */}
        <div className="gallery-main" onClick={() => setLightboxIdx(0)} style={{ cursor: 'pointer' }}>
          <img className="gallery-img" src={urls[0]} alt="main" />
        </div>
        {/* Side images */}
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`gallery-more`}
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => setLightboxIdx(i)}
          >
            {urls[i] ? (
              <>
                <img className="gallery-img" src={urls[i]} alt={`img-${i}`} />
                {i === 4 && urls.length > 5 && (
                  <div className="gallery-overlay">+{urls.length - 4} more</div>
                )}
              </>
            ) : (
              <div style={{ background: 'var(--gray-100)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}>
                🖼
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <button className="lightbox-nav lightbox-nav-left" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <img
            className="lightbox-img"
            src={urls[lightboxIdx] || PLACEHOLDER}
            alt="full"
            onClick={e => e.stopPropagation()}
          />
          <button className="lightbox-nav lightbox-nav-right" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
          <div style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
            {lightboxIdx + 1} / {urls.length}
          </div>
        </div>
      )}
    </>
  );
}
