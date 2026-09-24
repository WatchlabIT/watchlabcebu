import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, X, SlidersHorizontal } from 'lucide-react';
import WatchCard from '../components/WatchCard';
import ScrollReveal from '../components/ScrollReveal';
import { fetchWatches, fetchBrands } from '../utils/api';

export default function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCondition = searchParams.get('condition') || 'All';
  const selectedGender = searchParams.get('gender') || 'All';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    async function loadWatches() {
      setLoading(true);
      try {
        const res = await fetchWatches({
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
  }, [searchQuery]);

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

  // Filter watches by Condition and Gender
  const filteredWatches = watches.filter(w => {
    // Condition Filter
    if (selectedCondition !== 'All') {
      const c = selectedCondition.toLowerCase();
      const watchCond = (w.condition || '').toLowerCase();
      if (c === 'brandnew' && !watchCond.includes('brand')) return false;
      if (c === 'pre-owned' && !watchCond.includes('pre')) return false;
    }

    // Gender Filter
    if (selectedGender !== 'All') {
      const g = selectedGender.toLowerCase();
      const watchGender = (w.gender || '').toLowerCase();
      const fullText = `${w.name} ${w.description} ${w.brand}`.toLowerCase();

      if (g === 'unisex') {
        if (!watchGender.includes('unisex') && !fullText.includes('unisex')) return false;
      } else if (g === 'women') {
        if (!watchGender.includes('women') && !watchGender.includes('female') && !fullText.includes('women') && !fullText.includes('lady') && !fullText.includes('ladies')) return false;
      } else if (g === 'men') {
        if (watchGender.includes('women') || fullText.includes('women') || fullText.includes('ladies')) return false;
      }
    }

    return true;
  });

  return (
    <div className="page-fade-in" style={{ padding: '24px 0 60px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <h1 className="font-serif gradient-text" style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px' }}>
            Watch Collection
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
            Browse our complete inventory of authentic timepieces, ready for inquiry.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '40px' }}>
          {/* Top Row: Search Input */}
          <div style={{ marginBottom: '20px', position: 'relative' }}>
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

          {/* Filter Methods: Condition & Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            {/* Condition Filter Group */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--maroon-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} /> Condition:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: 'All', value: 'All' },
                  { label: 'Brandnew', value: 'Brandnew' },
                  { label: 'Pre-owned', value: 'Pre-owned' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFilter('condition', item.value)}
                    className="btn"
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.85rem',
                      borderRadius: '20px',
                      background: selectedCondition === item.value ? 'var(--maroon-gradient)' : '#FFFFFF',
                      color: selectedCondition === item.value ? '#FFFFFF' : 'var(--text-primary)',
                      border: selectedCondition === item.value ? 'none' : '1px solid #D1D5DB',
                      fontWeight: selectedCondition === item.value ? 700 : 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter Group */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--maroon-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} /> Gender:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Unisex', 'Men', 'Women'].map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setFilter('gender', gender)}
                    className="btn"
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.85rem',
                      borderRadius: '20px',
                      background: selectedGender === gender ? 'var(--maroon-gradient)' : '#FFFFFF',
                      color: selectedGender === gender ? '#FFFFFF' : 'var(--text-primary)',
                      border: selectedGender === gender ? 'none' : '1px solid #D1D5DB',
                      fontWeight: selectedGender === gender ? 700 : 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {gender}
                  </button>
                ))}

                {(selectedCondition !== 'All' || selectedGender !== 'All' || searchQuery) && (
                  <button
                    onClick={clearAllFilters}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--maroon-primary)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginLeft: 'auto',
                      fontWeight: 700
                    }}
                  >
                    <X size={14} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Watch Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin" style={{ marginBottom: '12px' }} />
            <div>Loading watch catalog...</div>
          </div>
        ) : filteredWatches.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Filter size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Watches Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              No timepieces match your selected filter criteria.
            </p>
            <button onClick={clearAllFilters} className="btn btn-maroon">
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--maroon-primary)' }}>{filteredWatches.length}</strong> watch{filteredWatches.length === 1 ? '' : 'es'} in inventory
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '28px'
            }}>
              {filteredWatches.map((watch, idx) => (
                <ScrollReveal key={watch.id} animation="up" delay={(idx % 4) * 80}>
                  <WatchCard watch={watch} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
