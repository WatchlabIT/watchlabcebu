import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import WatchCard from '../components/WatchCard';
import { fetchWatches, fetchBrands } from '../utils/api';

export default function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [watches, setWatches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedBrand = searchParams.get('brand') || 'All';
  const selectedCondition = searchParams.get('condition') || 'All';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetchBrands();
        setBrands(['All', ...(res.brands || [])]);
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    }
    loadBrands();
  }, []);

  useEffect(() => {
    async function loadWatches() {
      setLoading(true);
      try {
        const res = await fetchWatches({
          brand: selectedBrand,
          condition: selectedCondition,
          search: searchQuery
        });
        setWatches(res.watches || []);
      } catch (err) {
        console.error('Error fetching collection:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWatches();
  }, [selectedBrand, selectedCondition, searchQuery]);

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilter('search', val);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div style={{ padding: '60px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--red-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            HOROLOGICAL EXCELLENCE
          </div>
          <h1 className="font-serif gradient-text" style={{ fontSize: '2.8rem', fontWeight: 700, marginBottom: '16px' }}>
            Watch Collection
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
            Browse our complete inventory of authentic luxury watches. Filter by your favorite brand or condition to find your perfect timepiece.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search watch name, brand, or model..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="form-input"
                style={{ paddingLeft: '44px' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setFilter('search', '')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Condition Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Brand New', 'Pre-Owned'].map((cond) => (
                <button
                  key={cond}
                  onClick={() => setFilter('condition', cond)}
                  className="btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    background: selectedCondition === cond ? 'var(--red-gradient)' : '#FFFFFF',
                    color: selectedCondition === cond ? '#FFFFFF' : 'var(--text-secondary)',
                    border: selectedCondition === cond ? 'none' : '1px solid #D1D5DB'
                  }}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Brand Filter Pills */}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <SlidersHorizontal size={14} color="var(--red-primary)" /> Filter by Brand:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setFilter('brand', brand)}
                  className="btn"
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    borderRadius: '20px',
                    background: selectedBrand === brand ? 'rgba(220, 38, 38, 0.1)' : '#FFFFFF',
                    color: selectedBrand === brand ? 'var(--red-primary)' : 'var(--text-secondary)',
                    border: selectedBrand === brand ? '1px solid var(--red-primary)' : '1px solid #E5E7EB',
                    fontWeight: selectedBrand === brand ? 700 : 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {brand}
                </button>
              ))}

              {(selectedBrand !== 'All' || selectedCondition !== 'All' || searchQuery) && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#DC2626',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: 'auto',
                    fontWeight: 600
                  }}
                >
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Watch Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ marginBottom: '12px' }} />
            <div>Loading watch catalog...</div>
          </div>
        ) : watches.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Filter size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Watches Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              No timepieces match your selected brand or search criteria.
            </p>
            <button onClick={clearAllFilters} className="btn btn-outline-red">
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--red-primary)' }}>{watches.length}</strong> watch{watches.length === 1 ? '' : 'es'} in inventory
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '28px'
            }}>
              {watches.map((watch) => (
                <WatchCard key={watch.id} watch={watch} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
