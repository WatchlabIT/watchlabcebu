import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Edit, Trash2, Package, CheckCircle2, AlertOctagon, DollarSign, Search, ExternalLink, RefreshCw, Sparkles, Upload, X, ShieldCheck, MapPin, ShoppingBag } from 'lucide-react';
import { fetchWatches, fetchAdminStats, deleteWatch as apiDeleteWatch, updateWatch, fetchTransactions, createTransaction, updateTransaction, deleteTransaction as apiDeleteTransaction } from '../utils/api';
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

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'transactions'
  const [transactions, setTransactions] = useState([]);

  // Transaction Form Modal State
  const [showTxModal, setShowTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [txTitle, setTxTitle] = useState('');
  const [txSubtitle, setTxSubtitle] = useState('');
  const [txLocation, setTxLocation] = useState('Cebu City');
  const [txCategory, setTxCategory] = useState('Meetups');
  const [txBadge, setTxBadge] = useState('In-Person Meetup');
  const [txNote, setTxNote] = useState('');
  const [txImageUrl, setTxImageUrl] = useState('');
  const [txImageFile, setTxImageFile] = useState(null);
  const [txImagePreview, setTxImagePreview] = useState('');
  const [savingTx, setSavingTx] = useState(false);

  // Delete Transaction State
  const [deleteTxId, setDeleteTxId] = useState(null);
  const [deleteTxTitle, setDeleteTxTitle] = useState('');
  const [deletingTx, setDeletingTx] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, watchesRes, txRes] = await Promise.all([
        fetchAdminStats(),
        fetchWatches(),
        fetchTransactions()
      ]);
      if (statsRes && statsRes.stats) setStats(statsRes.stats);
      if (watchesRes && watchesRes.watches) setWatches(watchesRes.watches);
      if (txRes && txRes.transactions) setTransactions(txRes.transactions);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddTx = () => {
    setEditingTx(null);
    setTxTitle('');
    setTxSubtitle('');
    setTxLocation('Cebu City');
    setTxCategory('Meetups');
    setTxBadge('In-Person Meetup');
    setTxNote('');
    setTxImageUrl('');
    setTxImageFile(null);
    setTxImagePreview('');
    setShowTxModal(true);
  };

  const handleOpenEditTx = (tx) => {
    setEditingTx(tx);
    setTxTitle(tx.title || '');
    setTxSubtitle(tx.subtitle || '');
    setTxLocation(tx.location || 'Cebu City');
    setTxCategory(tx.category || 'Meetups');
    setTxBadge(tx.badge || 'Handover');
    setTxNote(tx.note || '');
    setTxImageUrl(tx.image_url || tx.image || '');
    setTxImagePreview(getImageUrl(tx.image_url || tx.image));
    setTxImageFile(null);
    setShowTxModal(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setSavingTx(true);
    try {
      const formData = new FormData();
      formData.append('title', txTitle);
      formData.append('subtitle', txSubtitle);
      formData.append('location', txLocation);
      formData.append('category', txCategory);
      formData.append('badge', txBadge);
      formData.append('note', txNote);

      if (txImageFile) {
        formData.append('image', txImageFile);
      } else {
        formData.append('image_url', txImageUrl);
      }

      if (editingTx) {
        await updateTransaction(editingTx.id, formData);
      } else {
        await createTransaction(formData);
      }

      setShowTxModal(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to save transaction.');
    } finally {
      setSavingTx(false);
    }
  };

  const handleDeleteTxClick = (tx) => {
    setDeleteTxId(tx.id);
    setDeleteTxTitle(tx.title);
  };

  const handleConfirmDeleteTx = async () => {
    if (!deleteTxId) return;
    setDeletingTx(true);
    try {
      await apiDeleteTransaction(deleteTxId);
      setDeleteTxId(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete transaction.');
    } finally {
      setDeletingTx(false);
    }
  };

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Watch Lab Cebu Admin
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}>
            Manage inventory listings, update stock levels, and feature client transactions.
          </p>
        </div>

        <Link
          to="/admin/watches/add"
          className="btn btn-maroon"
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <Plus size={18} /> Add New Watch
        </Link>
      </div>

      {/* Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--maroon-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Portfolio Value</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatPrice(stats.totalValue)}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981'
          }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Available Watches</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.availableStock} Units</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F87171'
          }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sold Out Listings</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.soldOutCount} Watches</div>
          </div>
        </div>
      </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('inventory')}
            className="btn"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              borderRadius: '25px',
              background: activeTab === 'inventory' ? 'var(--maroon-gradient)' : '#FFFFFF',
              color: activeTab === 'inventory' ? '#FFFFFF' : 'var(--text-primary)',
              border: activeTab === 'inventory' ? 'none' : '1px solid #D1D5DB',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Package size={18} /> Watch Collection Inventory ({watches.length})
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className="btn"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              borderRadius: '25px',
              background: activeTab === 'transactions' ? 'var(--maroon-gradient)' : '#FFFFFF',
              color: activeTab === 'transactions' ? '#FFFFFF' : 'var(--text-primary)',
              border: activeTab === 'transactions' ? 'none' : '1px solid #D1D5DB',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={18} /> Featured Transactions ({transactions.length})
          </button>
        </div>

        {/* TAB 1: WATCH INVENTORY */}
        {activeTab === 'inventory' && (
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
        )}

        {/* TAB 2: FEATURED TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Featured Client Transactions & Handover Showcase ({transactions.length})
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Manage proof of transaction photos, client notes, and handover stories. Auto-synced to Google Sheets under tab "Transactions".
                </p>
              </div>

              <button
                onClick={handleOpenAddTx}
                className="btn btn-maroon"
                style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              >
                <Plus size={16} /> Add Featured Transaction
              </button>
            </div>

            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                No featured transactions added yet. Click "+ Add Featured Transaction" to post your first handover story!
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      border: '1px solid var(--border-glass)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: '220px', background: '#000' }}>
                      <ProtectedImage
                        src={getImageUrl(tx.image_url || tx.image)}
                        alt={tx.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#FFF',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {tx.badge || tx.category}
                      </div>
                    </div>

                    <div style={{ padding: '16px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--maroon-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {tx.location} • {tx.category}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {tx.title}
                      </h3>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10B981', marginBottom: '8px' }}>
                        {tx.subtitle}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {tx.note}
                      </p>
                    </div>

                    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', gap: '8px', background: '#F9FAFB' }}>
                      <button
                        onClick={() => handleOpenEditTx(tx)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTxClick(tx)}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Watch Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Watch Listing?"
        message={`Are you sure you want to permanently delete "${deleteName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      {/* Transaction Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTxId}
        title="Delete Featured Transaction?"
        message={`Are you sure you want to remove "${deleteTxTitle}" from featured transactions? It will also be deleted from Google Sheets.`}
        onConfirm={handleConfirmDeleteTx}
        onCancel={() => setDeleteTxId(null)}
        loading={deletingTx}
      />

      {/* Transaction Add / Edit Modal */}
      {showTxModal && (
        <div
          onClick={() => setShowTxModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card"
            style={{
              maxWidth: '600px',
              width: '100%',
              borderRadius: '24px',
              overflow: 'hidden',
              padding: '32px',
              background: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingTx ? 'Edit Featured Transaction' : 'Add New Featured Transaction'}
              </h2>
              <button
                onClick={() => setShowTxModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction}>
              <div className="form-group">
                <label className="form-label">Transaction Title (e.g. Meetup in Bohol, Ref. SRPD61) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meetup in Bohol"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Note / Subtitle (e.g. 6 units Sold! Thank you Maam Mafel.) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6 units Sold! Thank you Maam Mafel."
                  value={txSubtitle}
                  onChange={(e) => setTxSubtitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Location (e.g. Bohol, Cebu City)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bohol, Philippines"
                    value={txLocation}
                    onChange={(e) => setTxLocation(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Filter</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="Meetups">Meetups</option>
                    <option value="Express Deliveries">Express Deliveries</option>
                    <option value="Out of Town">Out of Town</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Badge Label (e.g. Bohol Handover, Maxim Express, Brand New)</label>
                <input
                  type="text"
                  placeholder="e.g. In-Person Meetup"
                  value={txBadge}
                  onChange={(e) => setTxBadge(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Transaction Notes / Story</label>
                <textarea
                  rows={3}
                  placeholder="Enter details about watch models, client interaction, box/papers included..."
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div style={{ border: '1px dashed var(--border-subtle)', borderRadius: '12px', padding: '16px', background: '#F9FAFB', marginBottom: '24px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Handover Photo (Upload file or paste URL) *
                </label>
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem' }}>
                    <Upload size={16} /> Upload Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setTxImageFile(file);
                          setTxImageUrl('');
                          const reader = new FileReader();
                          reader.onloadend = () => setTxImagePreview(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <input
                    type="url"
                    placeholder="Or paste Image URL..."
                    value={txImageUrl}
                    onChange={(e) => {
                      setTxImageUrl(e.target.value);
                      if (e.target.value) {
                        setTxImageFile(null);
                        setTxImagePreview(getImageUrl(e.target.value));
                      }
                    }}
                    className="form-input"
                    style={{ flex: 1, minWidth: '200px', padding: '8px 12px' }}
                  />
                </div>

                {txImagePreview && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--maroon-primary)', fontWeight: 700, marginBottom: '6px' }}>Image Preview:</div>
                    <img src={txImagePreview} alt="Preview" style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #DDD' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowTxModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingTx} className="btn btn-maroon" style={{ padding: '10px 24px' }}>
                  {savingTx ? 'Saving...' : editingTx ? 'Update Transaction' : 'Save Featured Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
