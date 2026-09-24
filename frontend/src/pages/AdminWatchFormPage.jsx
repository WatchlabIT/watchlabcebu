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

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);

    const lower = val.toLowerCase();
    const brandMap = [
      { key: 'Audemars Piguet', targets: ['audemars piguet', 'audemars', 'ap'] },
      { key: 'Patek Philippe', targets: ['patek philippe', 'patek'] },
      { key: 'Tag Heuer', targets: ['tag heuer', 'tagheuer'] },
      { key: 'Rolex', targets: ['rolex'] },
      { key: 'Omega', targets: ['omega'] },
      { key: 'Seiko', targets: ['seiko'] },
      { key: 'Tissot', targets: ['tissot'] },
      { key: 'Casio', targets: ['casio', 'g-shock', 'gshock'] },
      { key: 'Cartier', targets: ['cartier'] }
    ];

    for (const item of brandMap) {
      if (item.targets.some(target => lower.includes(target))) {
        setBrand(item.key);
        break;
      }
    }
  };

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
              onChange={handleNameChange}
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
            border: '2px dashed var(--border-subtle)',
            borderRadius: '16px',
            padding: '28px',
            background: '#F9FAFB',
            marginBottom: '32px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ImageIcon size={20} color="var(--maroon-primary)" />
              <label className="form-label" style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Watch Image *
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
              {/* File Upload Zone */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Option 1: Upload Image File
                </div>
                <label
                  className="btn btn-maroon"
                  style={{ width: '100%', cursor: 'pointer', padding: '12px 18px', fontSize: '0.88rem' }}
                >
                  <Upload size={16} /> Choose File from Computer
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  JPG, PNG, WebP (Max 10MB)
                </div>
              </div>

              {/* Or URL input */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Option 2: Image Web URL
                </div>
                <input
                  type="url"
                  placeholder="Paste image link (https://...)"
                  value={imageUrlInput}
                  onChange={handleUrlChange}
                  className="form-input"
                  style={{ fontSize: '0.88rem' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Paste direct link to watch photo
                </div>
              </div>
            </div>

            {/* Live Image Preview */}
            {imagePreview ? (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--maroon-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Live Watch Photo Preview:
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImageUrlInput('');
                      setImagePreview('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Remove Image
                  </button>
                </div>

                <div style={{
                  maxWidth: '300px',
                  margin: '0 auto',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  background: '#000',
                  boxShadow: 'var(--shadow-lux)',
                  position: 'relative'
                }}>
                  <img
                    src={imagePreview}
                    alt="Watch Preview"
                    style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#FFF',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {imageFile ? `${imageFile.name.substring(0, 20)}...` : 'URL Image'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No watch image selected yet. Upload a local file or paste an image link above.
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
              className="btn btn-maroon"
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
