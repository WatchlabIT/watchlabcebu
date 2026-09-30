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
  const [brand, setBrand] = useState('Seiko');
  const [customBrand, setCustomBrand] = useState('');
  const [gender, setGender] = useState('Unisex');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [condition, setCondition] = useState('Brand New');
  const [description, setDescription] = useState('');
  const [imageList, setImageList] = useState([]); // Array of { id, url, file, preview }
  const [urlInput, setUrlInput] = useState('');

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const brandOptions = ['Seiko', 'Tissot', 'Omega', 'Tag Heuer', 'Other'];

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
            setGender(w.gender || 'Unisex');
            setPrice(w.price.toString());
            setStock(w.stock.toString());
            setCondition(w.condition);
            setDescription(w.description);

            const rawImgs = Array.isArray(w.images) && w.images.length > 0
              ? w.images
              : (w.image_url ? [w.image_url] : []);

            setImageList(rawImgs.map((img, idx) => ({
              id: Date.now() + idx + Math.random(),
              url: img,
              file: null,
              preview: getImageUrl(img)
            })));
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

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageList((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              url: '',
              file,
              preview: reader.result
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setImageList((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          url: urlInput.trim(),
          file: null,
          preview: getImageUrl(urlInput.trim())
        }
      ]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (idToRemove) => {
    setImageList((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const handleSetMainImage = (index) => {
    if (index === 0) return;
    setImageList((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      copy.unshift(selected);
      return copy;
    });
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

    if (imageList.length === 0) {
      setError('At least 1 watch photo is required (upload files or provide image URLs).');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('brand', finalBrand);
      formData.append('gender', gender);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('condition', condition);
      formData.append('description', description);

      const existingUrls = [];
      imageList.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file);
        } else if (img.url) {
          existingUrls.push(getImageUrl(img.url));
        } else if (img.preview && img.preview.startsWith('data:')) {
          existingUrls.push(img.preview);
        }
      });

      if (existingUrls.length > 0) {
        formData.append('images', JSON.stringify(existingUrls));
        formData.append('image_url', existingUrls[0]);
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

          {/* Brand, Gender & Condition Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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

            {/* Gender Select */}
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-select"
              >
                <option value="Unisex">Unisex</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
              </select>
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

          {/* Watch Multi-Photo Upload & Preview Section */}
          <div style={{
            border: '2px dashed var(--border-subtle)',
            borderRadius: '16px',
            padding: '28px',
            background: '#F9FAFB',
            marginBottom: '32px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={20} color="var(--maroon-primary)" />
                <label className="form-label" style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Watch Photos ({imageList.length} Selected) *
                </label>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--maroon-primary)', fontWeight: 600 }}>
                Admin can add 2 or more photos per watch
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
              {/* File Upload Zone (Multiple Files) */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Option 1: Upload Photo Files
                </div>
                <label
                  className="btn btn-maroon"
                  style={{ width: '100%', cursor: 'pointer', padding: '12px 18px', fontSize: '0.88rem' }}
                >
                  <Upload size={16} /> Choose Photo(s) from Device
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFilesChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Select 1, 2, or more photos (JPG, PNG, WebP)
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
                  Option 2: Add Photo Web Link
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    placeholder="Paste image link (https://...)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
                    className="form-input"
                    style={{ fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="btn btn-secondary"
                    style={{ padding: '0 14px', whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                  >
                    Add Photo
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Paste image URL link and click Add Photo
                </div>
              </div>
            </div>

            {/* Gallery Grid Preview */}
            {imageList.length > 0 ? (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--maroon-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                  <CheckCircle2 size={16} /> Selected Watch Gallery Photos ({imageList.length}):
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                  {imageList.map((img, idx) => (
                    <div
                      key={img.id}
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: idx === 0 ? '2px solid var(--maroon-primary)' : '1px solid var(--border-subtle)',
                        background: '#000',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    >
                      <img
                        src={img.preview}
                        alt={`Watch Photo ${idx + 1}`}
                        style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
                        }}
                      />

                      {/* Main Tag */}
                      {idx === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: 'var(--maroon-primary)',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '6px',
                          letterSpacing: '0.5px'
                        }}>
                          MAIN PHOTO
                        </div>
                      )}

                      {/* Controls Overlay */}
                      <div style={{
                        padding: '6px',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '4px'
                      }}>
                        {idx !== 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(idx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--maroon-primary)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '2px'
                            }}
                          >
                            Set Main
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cover</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No photos selected yet. Upload 2 or more photo files or paste photo links above.
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
