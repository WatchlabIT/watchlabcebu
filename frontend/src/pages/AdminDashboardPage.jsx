import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Edit, Trash2, Package, CheckCircle2, AlertOctagon, DollarSign, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchWatches, fetchAdminStats, deleteWatch as apiDeleteWatch, updateWatch } from '../utils/api';
import { formatPrice, getImageUrl } from '../utils/format';
import ConfirmModal from '../components/ConfirmModal';
import ProtectedImage from '../components/ProtectedImage';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalWatches: 0,
    availableStock: 0,
    soldOutCount: 0,
    totalValue: 0
  });

  const [watches, setWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, watchesRes] = await Promise.all([
        fetchAdminStats(),
        fetchWatches()
      ]);
      if (statsRes && statsRes.stats) setStats(statsRes.stats);
      if (watchesRes && watchesRes.watches) setWatches(watchesRes.watches);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteClick = (watch) => {
    setDeleteId(watch.id);
    setDeleteName(watch.name);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiDeleteWatch(deleteId);
      setDeleteId(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete watch.');
    } finally {
      setDeleting(false);
    }
  };

  // Quick Stock Adjustment Handler (+ / - buttons)
  const [updatingStockId, setUpdatingStockId] = useState(null);

  const handleStockChange = async (watch, delta) => {
    const currentStock = Number(watch.stock || 0);
    const newStock = Math.max(0, currentStock + delta);
    if (newStock === currentStock) return;

    setUpdatingStockId(watch.id);

    // Optimistic UI update for instant feedback
    setWatches(prevWatches =>
      prevWatches.map(w => (w.id === watch.id ? { ...w, stock: newStock } : w))
    );

    // Recalculate stats optimistically
    setStats(prev => {
      const stockDelta = newStock - currentStock;
      const isNowSoldOut = newStock === 0 && currentStock > 0;
      const wasSoldOut = currentStock === 0 && newStock > 0;
      return {
        ...prev,
        availableStock: Math.max(0, prev.availableStock + stockDelta),
        soldOutCount: Math.max(0, prev.soldOutCount + (isNowSoldOut ? 1 : 0) - (wasSoldOut ? 1 : 0)),
        totalValue: Math.max(0, prev.totalValue + (Number(watch.price || 0) * stockDelta))
      };
    });

    try {
      await updateWatch(watch.id, { stock: newStock });
    } catch (err) {
      console.error('Failed to update stock:', err);
      await loadData();
      alert('Failed to update stock: ' + (err.message || 'Server error'));
    } finally {
      setUpdatingStockId(null);
    }
  };

  const filteredWatches = watches.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '36px'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gold-primary)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
              OWNER PORTAL
            </div>
            <h1 className="font-serif gradient-text" style={{ fontSize: '2.4rem', fontWeight: 700 }}>
              Admin Inventory Dashboard
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/admin/watches/add" className="btn btn-gold" style={{ padding: '12px 20px' }}>
              <Plus size={18} /> Add New Watch Listing
            </Link>
            <button onClick={loadData} className="btn btn-secondary" title="Refresh Inventory Data">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Card 1 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Watch Listings</span>
              <Package size={22} color="var(--gold-primary)" />
            </div>
            <div className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {stats.totalWatches}
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Available Stock</span>
              <CheckCircle2 size={22} color="#10B981" />
            </div>
            <div className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#10B981' }}>
              {stats.availableStock}
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sold Out Listings</span>
              <AlertOctagon size={22} color="#EF4444" />
            </div>
            <div className="font-serif" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#EF4444' }}>
              {stats.soldOutCount}
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Inventory Valuation</span>
              <DollarSign size={22} color="var(--gold-light)" />
            </div>
            <div className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--gold-light)' }}>
              {formatPrice(stats.totalValue)}
            </div>
          </div>
        </div>

        {/* Inventory List Header & Search */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Watch Collection Inventory ({filteredWatches.length})
            </h2>

            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', padding: '8px 12px 8px 38px', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Loading inventory data...
            </div>
          ) : filteredWatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No watch listings match search.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Watch</th>
                    <th style={{ padding: '12px' }}>Brand</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Stock</th>
                    <th style={{ padding: '12px' }}>Condition</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWatches.map((w) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <ProtectedImage
                            src={getImageUrl(w.image_url)}
                            alt={w.name}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', background: '#000' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.name}</div>
                            <Link to={`/watch/${w.id}`} target="_blank" style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              View Listing <ExternalLink size={10} />
                            </Link>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--gold-light)' }}>
                        {w.brand}
                      </td>

                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatPrice(w.price)}
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleStockChange(w, -1)}
                            disabled={w.stock <= 0 || updatingStockId === w.id}
                            title={w.stock > 0 ? "Mark 1 Sold (-1 Stock)" : "Out of Stock"}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: w.stock > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: w.stock > 0 ? '#EF4444' : 'var(--text-muted)',
                              border: '1px solid ' + (w.stock > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
                              cursor: w.stock > 0 ? 'pointer' : 'not-allowed',
                              opacity: w.stock > 0 ? 1 : 0.4,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Minus size={13} />
                          </button>

                          <div style={{ minWidth: '72px', textAlign: 'center' }}>
                            {w.stock > 0 ? (
                              <span className="badge badge-available" style={{ display: 'inline-block', minWidth: '65px' }}>{w.stock} Units</span>
                            ) : (
                              <span className="badge badge-sold-out" style={{ display: 'inline-block', minWidth: '65px' }}>Sold Out</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleStockChange(w, 1)}
                            disabled={updatingStockId === w.id}
                            title="Add Stock (+1)"
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#10B981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        {w.condition === 'Brand New' ? (
                          <span className="badge badge-brand-new">Brand New</span>
                        ) : (
                          <span className="badge badge-pre-owned">Pre-Owned</span>
                        )}
                      </td>

                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Link
                            to={`/admin/watches/edit/${w.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <Edit size={14} /> Edit
                          </Link>

                          <button
                            onClick={() => handleDeleteClick(w)}
                            className="btn"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#F87171',
                              border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Watch Listing?"
        message={`Are you sure you want to permanently delete "${deleteName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
