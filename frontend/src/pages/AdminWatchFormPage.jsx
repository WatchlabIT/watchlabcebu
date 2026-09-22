import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchWatchById, createWatch, updateWatch } from '../utils/api';
import { getImageUrl } from '../utils/format';

export default function AdminWatchFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Rolex');
  const [customBrand, setCustomBrand] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [condition, setCondition] = useState('Brand New');
  const [description, setDescription] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const brandOptions = ['Rolex', 'Omega', 'Seiko', 'Tissot', 'Casio', 'Audemars Piguet', 'Patek Philippe', 'Cartier', 'Tag Heuer', 'Other'];

  useEffect(() => {
    if (isEditMode) {
      async function loadWatch() {
        try {
          const res = await fetchWatchById(id);
          if (res && res.watch) {
            const w = res.watch;
            setName(w.name);
            if (brandOptions.includes(w.brand)) {
              setBrand(w.brand);
            } else {
              setBrand('Other');
              setCustomBrand(w.brand);
            }
            setPrice(w.price.toString());
            setStock(w.stock.toString());
            setCondition(w.condition);
            setDescription(w.description);
            setImageUrlInput(w.image_url);
            setImagePreview(getImageUrl(w.image_url));
          } else {
            setError('Watch listing not found.');
          }
        } catch (err) {
          setError('Failed to fetch watch details.');
        } finally {
          setLoading(false);
        }
      }
      loadWatch();
    }
  }, [id, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrlInput('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrlInput(url);
    if (url) {
      setImageFile(null);
      setImagePreview(getImageUrl(url));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const finalBrand = brand === 'Other' ? customBrand : brand;
    if (!finalBrand) {
      setError('Please specify the watch brand.');
      setSubmitting(false);
      return;
    }

    if (!imageFile && !imageUrlInput) {
      setError('Watch image is required (upload a file or provide an image URL).');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('brand', finalBrand);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('condition', condition);
      formData.append('description', description);

      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        formData.append('image_url', imageUrlInput);
      }

      if (isEditMode) {
        await updateWatch(id, formData);
      } else {
        await createWatch(formData);
      }

      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save watch listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading watch details...
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Back Link */}
        <Link
          to="/admin/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            marginBottom: '28px'
          }}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        {/* Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1 className="font-serif gradient-text" style={{ fontSize: '2.4rem', fontWeight: 700 }}>
            {isEditMode ? 'Edit Watch Listing' : 'Add New Watch Listing'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Fill in the watch specs, stock quantity, pricing, and high-res image.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '28px'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '36px' }}>
          {/* Watch Name */}
          <div className="form-group">
            <label className="form-label">Watch Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rolex Submariner Date 41mm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Brand & Condition Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Brand Select */}
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-select"
              >
                {brandOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {brand === 'Other' && (
                <input
                  type="text"
                  required
                  placeholder="Enter brand name..."
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="form-input"
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            {/* Condition Select */}
            <div className="form-group">
              <label className="form-label">Watch Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="form-select"
              >
                <option value="Brand New">Brand New</option>
                <option value="Pre-Owned">Pre-Owned</option>
              </select>
            </div>
          </div>

          {/* Price & Stock Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Price */}
            <div className="form-group">
              <label className="form-label">Price (₱ PHP) *</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="e.g. 450000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Stock */}
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="e.g. 1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Watch Description & Papers Details *</label>
            <textarea
              required
              rows={5}
              placeholder="Enter detailed description including bezel specs, dial pattern, box/papers availability, warranty details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Watch Image Upload & Preview Section */}
          <div style={{
            border: '1px dashed var(--border-subtle)',
            borderRadius: '16px',
            padding: '24px',
            background: 'rgba(10, 11, 14, 0.5)',
            marginBottom: '32px'
          }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
              Watch Image (Upload file or paste image URL) *
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
              {/* File Upload Button */}
              <div>
                <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer', padding: '14px' }}>
                  <Upload size={18} /> Upload Local Image File
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center' }}>
                  Supported formats: JPG, PNG, WebP (Max 10MB)
                </div>
              </div>

              {/* Or URL input */}
              <div>
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={imageUrlInput}
                  onChange={handleUrlChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Live Image Preview */}
            {imagePreview && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 600, marginBottom: '8px' }}>
                  Image Preview:
                </div>
                <div style={{
                  maxWidth: '280px',
                  margin: '0 auto',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  background: '#000'
                }}>
                  <img
                    src={imagePreview}
                    alt="Watch Preview"
                    style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Link to="/admin/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-gold"
              style={{ padding: '12px 32px' }}
            >
              <Save size={18} /> {submitting ? 'Saving Watch...' : isEditMode ? 'Update Watch Listing' : 'Save Watch Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
