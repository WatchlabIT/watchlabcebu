import React, { useState, useEffect } from 'react';
import { Sheet, RefreshCw, Upload, Download, Copy, Check, Info, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  fetchGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  syncToGoogleSheets,
  pullFromGoogleSheets,
  fetchGoogleAppsScriptCode
} from '../utils/api';

export default function GoogleSheetsSyncCard({ onSyncSuccess }) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal / Instruction state
  const [showGuide, setShowGuide] = useState(false);
  const [scriptCode, setScriptCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadConfig();
    loadScriptCode();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await fetchGoogleSheetsConfig();
      if (data && data.config) {
        setIsConfigured(Boolean(data.config.is_configured));
        setAutoSync(data.config.auto_sync ?? true);
        setLastSynced(data.config.last_synced || null);
      }
    } catch (err) {
      console.error('Failed to load Google Sheets config:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadScriptCode = async () => {
    try {
      const res = await fetchGoogleAppsScriptCode();
      if (res && res.code) setScriptCode(res.code);
    } catch (err) {
      console.error('Failed to load Apps Script code:', err);
    }
  };

  const handleToggleAutoSync = async (checked) => {
    setAutoSync(checked);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await saveGoogleSheetsConfig({ auto_sync: checked });
      setStatusMessage('Auto-sync setting updated.');
      if (res.config) {
        setIsConfigured(Boolean(res.config.is_configured));
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update auto-sync setting.');
    }
  };

  const handleSyncToSheets = async () => {
    setSyncing(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await syncToGoogleSheets();
      setStatusMessage(res.message || 'Successfully synced watch inventory to Google Sheets!');
      setLastSynced(new Date().toISOString());
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Sync failed. Ensure GOOGLE_SHEET_WEBHOOK_URL is set in Vercel Environment Variables.');
    } finally {
      setSyncing(false);
    }
  };

  const handlePullFromSheets = async () => {
    setPulling(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await pullFromGoogleSheets();
      setStatusMessage(`Import successful! Updated database with ${res.result?.importedCount || 0} items from Google Sheets.`);
      setLastSynced(new Date().toISOString());
      if (onSyncSuccess) onSyncSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Import failed. Ensure GOOGLE_SHEET_WEBHOOK_URL is set in Vercel Environment Variables.');
    } finally {
      setPulling(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading Google Sheets integration status...</div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '28px', marginBottom: '36px', borderLeft: '4px solid #10B981' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sheet size={24} color="#10B981" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Google Sheets Real-Time Sync
            </h2>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: isConfigured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isConfigured ? '#10B981' : '#EF4444',
              border: `1px solid ${isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {isConfigured ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {isConfigured ? 'Connected via Vercel ENV' : 'GOOGLE_SHEET_WEBHOOK_URL Not Set'}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
            Automatically sync watch inventory to Google Sheets securely using Vercel Environment Variables.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="btn btn-secondary"
          style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <FileCode size={16} />
          {showGuide ? 'Hide Apps Script Code' : 'Apps Script Code & Guide'}
        </button>
      </div>

      {/* Messages */}
      {statusMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          fontSize: '0.88rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} /> {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#EF4444',
          fontSize: '0.88rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      {/* Guide Section (Accordion) */}
      {showGuide && (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-glass)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} /> Google Apps Script Setup Code
          </h3>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            1. Paste this code into <strong>Google Sheets &gt; Extensions &gt; Apps Script</strong>.<br />
            2. Click <strong>Deploy &gt; New deployment &gt; Web App</strong> (Execute as: <i>Me</i>, Access: <i>Anyone</i>).<br />
            3. Copy the generated Web App URL and add it to Vercel project environment variables as <code>GOOGLE_SHEET_WEBHOOK_URL</code>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold-light)' }}>
              Google Apps Script Source Code:
            </span>
            <button
              onClick={handleCopyCode}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Script Code'}
            </button>
          </div>

          <pre style={{
            background: '#0B0F19',
            color: '#E2E8F0',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            maxHeight: '240px',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'monospace'
          }}>
            {scriptCode}
          </pre>
        </div>
      )}

      {/* Sync Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => handleToggleAutoSync(e.target.checked)}
              style={{ accentColor: 'var(--gold-primary)', width: '16px', height: '16px' }}
            />
            Auto-sync changes (Add / Edit / Delete) in real-time
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSyncToSheets}
            disabled={syncing}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {syncing ? <RefreshCw className="spin" size={14} /> : <Upload size={14} color="#10B981" />}
            {syncing ? 'Pushing Data...' : 'Export to Google Sheet'}
          </button>

          <button
            type="button"
            onClick={handlePullFromSheets}
            disabled={pulling}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {pulling ? <RefreshCw className="spin" size={14} /> : <Download size={14} color="var(--gold-primary)" />}
            {pulling ? 'Pulling Data...' : 'Import from Google Sheet'}
          </button>
        </div>
      </div>

      {lastSynced && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '12px' }}>
          Last Synced: {new Date(lastSynced).toLocaleString()}
        </div>
      )}
    </div>
  );
}
