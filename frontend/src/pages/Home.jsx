import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { propertiesAPI } from '../api/index.js';
import PropertyCard from '../components/PropertyCard.jsx';
import FilterPanel from '../components/FilterPanel.jsx';

const INIT_FILTERS = { pincode: '', type: '', min_price: '', max_price: '' };

export default function Home() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState(INIT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');

  const fetchProperties = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (f.name) params.name = f.name;
      if (f.pincode) params.pincode = f.pincode;
      if (f.type) params.type = f.type;
      if (f.min_price) params.min_price = f.min_price;
      if (f.max_price) params.max_price = f.max_price;
      const { data } = await propertiesAPI.list(params);
      setProperties(data);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProperties(INIT_FILTERS); }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const f = { ...INIT_FILTERS, name: heroSearch };
    setFilters(f);
    fetchProperties(f);
  };

  const handleFilterChange = (f) => setFilters(f);
  const handleApplyFilters = () => fetchProperties(filters);
  const handleReset = () => { setFilters(INIT_FILTERS); setHeroSearch(''); fetchProperties(INIT_FILTERS); };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">✡ {t('common.kosher_certified')}</div>
          <h1>{t('home.hero_title')}</h1>
          <p className="hero-subtitle">{t('home.hero_subtitle')}</p>

          <form className="search-bar" onSubmit={handleHeroSearch}>
            <input
              value={heroSearch}
              onChange={e => setHeroSearch(e.target.value)}
              placeholder={t('home.search_name_placeholder', 'Search by property name...')}
            />
            <button type="submit" className="btn btn-primary">
              🔍 {t('home.search_btn')}
            </button>
          </form>
        </div>
      </section>

      {/* ── Shabbat Notice ── */}
      <div className="container" style={{ marginTop: 24 }}>
        <div className="shabbat-notice">
          🕍 {t('common.shabbat_notice')}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="container" style={{ marginTop: 20 }}>
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleReset}
        />
      </div>

      {/* ── Properties ── */}
      <section className="section">
        <div className="container">
          <div className="page-header">
            <h2>{t('home.featured')}</h2>
            <span style={{ color: 'var(--gray-400)', fontSize: 14 }}>
              {properties.length} properties found
            </span>
          </div>

          {loading ? (
            <div className="spinner-wrapper"><div className="spinner" /></div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏡</div>
              <p>{t('home.no_properties')}</p>
            </div>
          ) : (
            <div className="grid-3">
              {properties.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '32px 24px', fontSize: 13 }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8, color: 'var(--gold)' }}>✡ KosherStay</div>
        <p>Premium Kosher vacation rentals • Shabbat-ready homes worldwide</p>
        <p style={{ marginTop: 8 }}>© 2024 KosherStay. All rights reserved.</p>
      </footer>
    </div>
  );
}
