import React, { useState } from 'react';
import { toast } from 'react-toastify';

const defaultSettings = {
  companyName: 'DealFlow360 Enterprise',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  approvalTimeout: 48,
  lowStockThreshold: 10,
};

function Settings() {
  const [settings, setLocalSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      toast.success('System configuration saved successfully');
      setSaving(false);
    }, 400);
  };

  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure global preferences, system parameters, currencies, and alert policies.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <div className="card-header">Global Configuration Parameters</div>
        <div className="card-body" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>General Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={lbl}>Company Name</label>
                <input value={settings.companyName || ''} onChange={e => setLocalSettings({ ...settings, companyName: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={lbl}>System Currency</label>
                <select value={settings.currency || 'INR'} onChange={e => setLocalSettings({ ...settings, currency: e.target.value })} style={inp}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Timezone</label>
                <select value={settings.timezone || 'Asia/Kolkata'} onChange={e => setLocalSettings({ ...settings, timezone: e.target.value })} style={inp}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid #e5e7eb' }} />

            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Limits & Thresholds</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={lbl}>Approval Timeout (Hours)</label>
                <input type="number" value={settings.approvalTimeout || 48} onChange={e => setLocalSettings({ ...settings, approvalTimeout: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={lbl}>Global Low Stock Threshold</label>
                <input type="number" value={settings.lowStockThreshold || 10} onChange={e => setLocalSettings({ ...settings, lowStockThreshold: e.target.value })} style={inp} />
              </div>
            </div>

            <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid #e5e7eb' }} />

            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Notification Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} /> Enable Automated Email Notifications
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} /> Enable Manager Escalation Alerts
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} /> Real-time Low Inventory Warnings
              </label>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? 'Saving…' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
