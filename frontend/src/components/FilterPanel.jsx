import { useTranslation } from 'react-i18next';

export default function FilterPanel({ filters, onChange, onApply, onReset }) {
  const { t } = useTranslation();

  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label className="form-label">{t('property.pincode')}</label>
        <input
          className="form-input"
          placeholder={t('home.search_placeholder')}
          value={filters.pincode}
          onChange={e => onChange({ ...filters, pincode: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <label className="form-label">{t('property.type')}</label>
        <select
          className="form-select"
          value={filters.type}
          onChange={e => onChange({ ...filters, type: e.target.value })}
        >
          <option value="">{t('home.all_types')}</option>
          <option value="Home">🏠 Home</option>
          <option value="Apartment">🏢 Apartment</option>
          <option value="Villa">🏖️ Villa</option>
          <option value="Cabin">🌲 Cabin</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="form-label">{t('home.min_price')}</label>
        <input
          className="form-input"
          type="number"
          placeholder="$0"
          value={filters.min_price}
          onChange={e => onChange({ ...filters, min_price: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <label className="form-label">{t('home.max_price')}</label>
        <input
          className="form-input"
          type="number"
          placeholder="$9999"
          value={filters.max_price}
          onChange={e => onChange({ ...filters, max_price: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <button className="btn btn-primary" onClick={onApply}>
          🔍 {t('home.apply')}
        </button>
        <button className="btn btn-outline" onClick={onReset}>
          {t('home.reset')}
        </button>
      </div>
    </div>
  );
}
