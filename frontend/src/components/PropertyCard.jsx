import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../api/index.js';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';

const TYPE_ICONS = { Home: '🏠', Apartment: '🏢', Villa: '🏖️', Cabin: '🌲' };

export default function PropertyCard({ property }) {
  const { t } = useTranslation();
  const firstImage = property.images?.[0]?.image_url;
  const imgSrc = firstImage ? getImageUrl(firstImage) : PLACEHOLDER;

  return (
    <div className="property-card animate-in">
      <div className="property-card-image">
        <img src={imgSrc} alt={property.name} loading="lazy" />
        <span className="property-card-type">
          {TYPE_ICONS[property.type] || '🏘️'} {property.type}
        </span>
        <span className="property-card-kosher">✡ Kosher</span>
      </div>

      <div className="property-card-body">
        <h3 className="property-card-title">{property.name}</h3>
        <p className="property-card-address">
          📍 {property.address}
          {property.pincode && <span style={{ color: 'var(--gray-400)' }}>  •  {property.pincode}</span>}
        </p>

        {property.description && (
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {property.description}
          </p>
        )}

        <div className="property-card-footer">
          <div>
            <div className="property-card-price">
              ${property.price.toLocaleString()}
              <span> {t('home.per_night')}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
              📍 {property.pincode}
            </div>
          </div>

          <Link to={`/property/${property.id}`} className="btn btn-primary btn-sm">
            {t('home.view_details')}
          </Link>
        </div>
      </div>
    </div>
  );
}
