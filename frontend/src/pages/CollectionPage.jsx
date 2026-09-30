import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, RefreshCw, X, SlidersHorizontal, LayoutGrid, List,
  ChevronDown, Check, ArrowUpDown, Tag, DollarSign, Clock, ShieldCheck, Trash2
} from 'lucide-react';
import WatchCard from '../components/WatchCard';
import ScrollReveal from '../components/ScrollReveal';
import { fetchWatches, fetchBrands } from '../utils/api';

export default function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth <= 768 ? 'list' : 'grid'));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // URL state filters
  const selectedBrand = searchParams.get('brand') || 'All';
  const selectedCondition = searchParams.get('condition') || 'All';
  const selectedGender = searchParams.get('gender') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const selectedSort = searchParams.get('sort') || 'newest';
  const selectedStock = searchParams.get('stock') || 'All';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  // Local price inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  useEffect(() => {
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [minPriceParam, maxPriceParam]);

  useEffect(() => {
    async function loadWatches() {
      setLoading(true);
      try {
        const res = await fetchWatches();
        setWatches(res.watches || []);
      } catch (err) {
        console.error('Error fetching collection:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWatches();
  }, []);

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All' && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const setMultiFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val && val !== 'All' && val !== '') {
        newParams.set(key, val);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleApplyPriceFilter = (e) => {
    if (e) e.preventDefault();
    setMultiFilters({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice
    });
  };

  const handlePricePreset = (min, max) => {
    setLocalMinPrice(min ? String(min) : '');
    setLocalMaxPrice(max ? String(max) : '');
    setMultiFilters({
      minPrice: min ? String(min) : '',
      maxPrice: max ? String(max) : ''
    });
  };

  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams({});
  };

  // Compute Brand list dynamically with watch count statistics
  const brandStats = useMemo(() => {
    const counts = {};
    watches.forEach(w => {
      if (w && w.brand) {
        counts[w.brand] = (counts[w.brand] || 0) + 1;
      }
    });

    const primaryBrands = ['Seiko', 'Tissot', 'Omega', 'Tag Heuer'];
    const otherBrands = Object.keys(counts).filter(b => !primaryBrands.some(p => p.toLowerCase() === b.toLowerCase())).sort();
    
    const allOrdered = [...primaryBrands, ...otherBrands];

    return allOrdered.map(brand => ({
      name: brand,
      count: counts[brand] || 0
    }));
  }, [watches]);

  // Main Shopee-Style Filtering & Sorting Engine
  const filteredWatches = useMemo(() => {
    let result = [...watches];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(w =>
        (w.name && w.name.toLowerCase().includes(q)) ||
        (w.brand && w.brand.toLowerCase().includes(q)) ||
        (w.description && w.description.toLowerCase().includes(q))
      );
    }

    // 2. Brand Filter
    if (selectedBrand !== 'All') {
      result = result.filter(w => w.brand && w.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // 3. Condition Filter
    if (selectedCondition !== 'All') {
      const c = selectedCondition.toLowerCase();
      result = result.filter(w => {
        const cond = (w.condition || '').toLowerCase();
        if (c === 'brandnew' || c === 'brand new') return cond.includes('brand');
        if (c === 'pre-owned' || c === 'preowned') return cond.includes('pre');
        return true;
      });
    }

    // 4. Gender Filter
    if (selectedGender !== 'All') {
      const g = selectedGender.toLowerCase();
      result = result.filter(w => {
        const watchGender = (w.gender || '').toLowerCase();
        const fullText = `${w.name} ${w.description} ${w.brand}`.toLowerCase();
        if (g === 'unisex') {
          return watchGender.includes('unisex') || fullText.includes('unisex');
        } else if (g === 'women' || g === 'female') {
          return watchGender.includes('women') || watchGender.includes('female') || fullText.includes('women') || fullText.includes('lady');
        } else if (g === 'men' || g === 'male') {
          return !watchGender.includes('women') && !fullText.includes('women') && !fullText.includes('ladies');
        }
        return true;
      });
    }

    // 5. Stock Filter
    if (selectedStock !== 'All') {
      if (selectedStock === 'instock') {
        result = result.filter(w => Number(w.stock || 0) > 0);
      } else if (selectedStock === 'soldout') {
        result = result.filter(w => Number(w.stock || 0) === 0);
      }
    }

    // 6. Price Range Filter
    if (minPriceParam) {
      const minP = Number(minPriceParam);
      if (!isNaN(minP)) {
        result = result.filter(w => Number(w.price || 0) >= minP);
      }
    }
    if (maxPriceParam) {
      const maxP = Number(maxPriceParam);
      if (!isNaN(maxP)) {
        result = result.filter(w => Number(w.price || 0) <= maxP);
      }
    }

    // 7. Sort Order (Latest Added / ID Descending is default so newest watch is always on top!)
    if (selectedSort === 'newest') {
      result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0) || new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (selectedSort === 'price_asc') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (selectedSort === 'price_desc') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (selectedSort === 'name_asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [watches, searchQuery, selectedBrand, selectedCondition, selectedGender, selectedStock, minPriceParam, maxPriceParam, selectedSort]);

  const hasActiveFilters = Boolean(
    searchQuery || selectedBrand !== 'All' || selectedCondition !== 'All' ||
    selectedGender !== 'All' || selectedStock !== 'All' || minPriceParam || maxPriceParam || selectedSort !== 'newest'
  );

  // Render Sidebar Content Function (reused for desktop & mobile drawer)
  const renderSidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sidebar Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '14px',
        borderBottom: '2px solid var(--maroon-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
          <SlidersHorizontal size={18} color="var(--maroon-primary)" />
          Filter Catalog
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#EF4444',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Trash2 size={13} /> Reset All
          </button>
        )}
      </div>

      {/* 1. Search Bar */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Search Keywords
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search watch name, brand..."
            value={searchQuery}
            onChange={(e) => setFilter('search', e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', paddingRight: searchQuery ? '32px' : '12px', fontSize: '0.84rem' }}
          />
          {searchQuery && (
            <button
              onClick={() => setFilter('search', '')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Brand Category Filter */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Watch Brand</span>
          {selectedBrand !== 'All' && (
            <span style={{ fontSize: '0.72rem', color: 'var(--maroon-primary)', cursor: 'pointer' }} onClick={() => setFilter('brand', 'All')}>Clear</span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
          <button
            type="button"
            onClick={() => setFilter('brand', 'All')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              border: selectedBrand === 'All' ? '1px solid var(--maroon-primary)' : '1px solid #E2E8F0',
              background: selectedBrand === 'All' ? 'rgba(127, 29, 29, 0.08)' : '#FFFFFF',
              color: selectedBrand === 'All' ? 'var(--maroon-primary)' : 'var(--text-primary)',
              fontWeight: selectedBrand === 'All' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span>All Brands</span>
            <span style={{ fontSize: '0.75rem', background: selectedBrand === 'All' ? 'var(--maroon-primary)' : '#E2E8F0', color: selectedBrand === 'All' ? '#FFF' : '#64748B', padding: '2px 8px', borderRadius: '10px' }}>
              {watches.length}
            </span>
          </button>
          {brandStats.map(b => {
            const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
            return (
              <button
                key={b.name}
                type="button"
                onClick={() => setFilter('brand', isSelected ? 'All' : b.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--maroon-primary)' : '1px solid #E2E8F0',
                  background: isSelected ? 'rgba(127, 29, 29, 0.08)' : '#FFFFFF',
                  color: isSelected ? 'var(--maroon-primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{b.name}</span>
                <span style={{ fontSize: '0.75rem', background: isSelected ? 'var(--maroon-primary)' : '#F1F5F9', color: isSelected ? '#FFF' : '#64748B', padding: '2px 8px', borderRadius: '10px' }}>
                  {b.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Condition Category */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Watch Condition
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'All', value: 'All' },
            { label: 'Brand New', value: 'Brandnew' },
            { label: 'Pre-Owned', value: 'Pre-owned' }
          ].map(c => {
            const isSelected = selectedCondition.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setFilter('condition', c.value)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--maroon-primary)' : '1px solid #E2E8F0',
                  background: isSelected ? 'var(--maroon-gradient)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  gridColumn: c.value === 'All' ? '1 / -1' : 'auto'
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Gender Category */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Target Audience / Gender
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {['All', 'Men', 'Women', 'Unisex'].map(g => {
            const isSelected = selectedGender.toLowerCase() === g.toLowerCase();
            return (
              <button
                key={g}
                type="button"
                onClick={() => setFilter('gender', g)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--maroon-primary)' : '1px solid #E2E8F0',
                  background: isSelected ? 'var(--maroon-gradient)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  gridColumn: g === 'All' ? '1 / -1' : 'auto'
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Price Range (PHP) */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Price Range (PHP)
        </div>
        <form onSubmit={handleApplyPriceFilter} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              placeholder="Min Price"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>-</span>
            <input
              type="number"
              placeholder="Max Price"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-secondary"
            style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            Apply Price Filter
          </button>
        </form>

        {/* Price Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
          {[
            { label: 'Under ₱50,000', min: '', max: '50000' },
            { label: '₱50,000 - ₱150,000', min: '50000', max: '150000' },
            { label: '₱150,000 - ₱500,000', min: '150000', max: '500000' },
            { label: 'Above ₱500,000', min: '500000', max: '' }
          ].map(p => {
            const isSelected = minPriceParam === p.min && maxPriceParam === p.max;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePricePreset(p.min, p.max)}
                style={{
                  background: isSelected ? 'rgba(127, 29, 29, 0.08)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  color: isSelected ? 'var(--maroon-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{p.label}</span>
                {isSelected && <Check size={12} color="var(--maroon-primary)" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Stock Availability Filter */}
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Availability Status
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { label: 'All Listings', value: 'All' },
            { label: 'In Stock Only', value: 'instock' },
            { label: 'Sold Out Only', value: 'soldout' }
          ].map(s => {
            const isSelected = selectedStock === s.value;
            return (
              <label
                key={s.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.83rem',
                  color: isSelected ? 'var(--maroon-primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
              >
                <input
                  type="radio"
                  name="stockStatus"
                  checked={isSelected}
                  onChange={() => setFilter('stock', s.value)}
                  style={{ accentColor: 'var(--maroon-primary)', cursor: 'pointer' }}
                />
                <span>{s.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-fade-in" style={{ padding: '24px 0 60px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
          <h1 className="font-serif gradient-text" style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '12px' }}>
            Watch Collection
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6' }}>
            Browse our complete inventory of authentic timepieces, ready for inquiry.
          </p>
        </div>

        {/* Active Filter Chips Bar (Top summary) */}
        {hasActiveFilters && (
          <div className="glass-card" style={{ padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--maroon-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={14} /> Active Filters:
            </span>

            {searchQuery && (
              <span className="badge" style={{ background: 'var(--maroon-gradient)', color: '#FFF', padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Query: "{searchQuery}"
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilter('search', '')} />
              </span>
            )}

            {selectedBrand !== 'All' && (
              <span className="badge" style={{ background: 'var(--maroon-gradient)', color: '#FFF', padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Brand: {selectedBrand}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilter('brand', 'All')} />
              </span>
            )}

            {selectedCondition !== 'All' && (
              <span className="badge" style={{ background: 'var(--maroon-gradient)', color: '#FFF', padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Condition: {selectedCondition}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilter('condition', 'All')} />
              </span>
            )}

            {selectedGender !== 'All' && (
              <span className="badge" style={{ background: 'var(--maroon-gradient)', color: '#FFF', padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Gender: {selectedGender}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilter('gender', 'All')} />
              </span>
            )}

            {selectedStock !== 'All' && (
              <span className="badge" style={{ background: 'var(--maroon-gradient)', color: '#FFF', padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Status: {selectedStock === 'instock' ? 'In Stock' : 'Sold Out'}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilter('stock', 'All')} />
              </span>
            )}

            {(minPriceParam || maxPriceParam) && (
              <span className="badge" style={{ background: 'var(--maroon-gradient)', color: '#FFF', padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Price: ₱{minPriceParam || '0'} - ₱{maxPriceParam || 'Max'}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setLocalMinPrice(''); setLocalMaxPrice(''); setMultiFilters({ minPrice: '', maxPrice: '' }); }} />
              </span>
            )}

            <button
              onClick={clearAllFilters}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#EF4444',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={13} /> Clear All
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle Button */}
        <div className="mobile-filter-trigger" style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-maroon"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem', justifyContent: 'center', gap: '8px' }}
          >
            <SlidersHorizontal size={18} /> Open Filter Sidebar ({filteredWatches.length} Items)
          </button>
        </div>

        {/* Main 2-Column Shopee Layout: Left Sidebar + Right Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', alignItems: 'start' }} className="shopee-collection-layout">

          {/* LEFT SIDEBAR (Desktop sticky sidebar) */}
          <aside className="desktop-filter-sidebar glass-card" style={{ padding: '20px', sticky: 'top', top: '100px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            {renderSidebarContent()}
          </aside>

          {/* RIGHT CONTENT AREA */}
          <main style={{ minWidth: 0 }}>

            {/* Toolbar: Counter, Sort Dropdown & View Mode Switcher */}
            <div className="glass-card" style={{
              padding: '14px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--maroon-primary)' }}>{filteredWatches.length}</strong> watch{filteredWatches.length === 1 ? '' : 'es'} in inventory
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                {/* Sort Dropdown Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpDown size={15} color="var(--maroon-primary)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sort By:</span>
                  <select
                    value={selectedSort}
                    onChange={(e) => setFilter('sort', e.target.value)}
                    className="form-input"
                    style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <option value="newest">Latest / Newest First (Default)</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                </div>

                {/* View Mode Toggle: Grid vs List */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '20px',
                  padding: '3px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: 'none',
                      background: viewMode === 'grid' ? 'var(--maroon-gradient)' : 'transparent',
                      color: viewMode === 'grid' ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <LayoutGrid size={15} /> Grid
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: 'none',
                      background: viewMode === 'list' ? 'var(--maroon-gradient)' : 'transparent',
                      color: viewMode === 'list' ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <List size={15} /> List
                  </button>
                </div>
              </div>
            </div>

            {/* Watch Grid / List */}
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
              <div
                className={viewMode === 'list' ? 'watch-list-container' : 'watch-grid-container'}
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'list' ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: viewMode === 'list' ? '14px' : '24px'
                }}
              >
                {filteredWatches.map((watch, idx) => (
                  <ScrollReveal key={watch.id} animation="up" delay={(idx % 4) * 60}>
                    <WatchCard watch={watch} viewMode={viewMode} />
                  </ScrollReveal>
                ))}
              </div>
            )}

          </main>

        </div>
      </div>

      {/* MOBILE SLIDE-OUT FILTER DRAWER */}
      {mobileFilterOpen && (
        <>
          <div
            onClick={() => setMobileFilterOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '85vw',
              maxWidth: '320px',
              height: '100vh',
              background: '#FFFFFF',
              zIndex: 9999,
              padding: '24px 20px',
              overflowY: 'auto',
              boxShadow: '10px 0 30px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--maroon-primary)' }}>Filters & Categories</div>
              <button onClick={() => setMobileFilterOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1 }}>
              {renderSidebarContent()}
            </div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="btn btn-maroon"
              style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '0.9rem' }}
            >
              Apply & View {filteredWatches.length} Watches
            </button>
          </div>
        </>
      )}

      {/* Responsive Styles for Shopee Layout */}
      <style>{`
        @media (max-width: 900px) {
          .shopee-collection-layout {
            grid-template-columns: 1fr !important;
          }
          .desktop-filter-sidebar {
            display: none !important;
          }
          .mobile-filter-trigger {
            display: block !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-filter-trigger {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
