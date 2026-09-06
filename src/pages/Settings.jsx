import React, { useState } from 'react';
import { toast } from 'react-toastify';

const defaultSettings = {
  companyName: 'DealFlow360 Enterprise',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  approvalTimeout: 48,
  lowStockThreshold: 10,
  emailNotifications: true,
  managerEscalation: true,
  inventoryWarnings: true,
  sessionTimeout: 120,
  theme: 'Light'
};

function Settings() {
  const [settings, setLocalSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dealflow360_system_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem('dealflow360_system_settings', JSON.stringify(settings));
      } catch {}
      toast.success('System configuration saved successfully!');
      setSaving(false);
    }, 300);
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
        <button onClick={handleSubmit} className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
        {[
          ['general', 'General Configuration'],
          ['thresholds', 'Thresholds & Limits'],
          ['notifications', 'Notification Policies'],
          ['security', 'Security & Access']
        ].map(([tabKey, tabLabel]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === tabKey ? 'var(--primary-light)' : 'transparent',
              color: activeTab === tabKey ? 'var(--primary)' : '#64748b',
              fontWeight: activeTab === tabKey ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tabLabel}
          </button>
        ))}
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <div className="card-header">System Settings — {activeTab.toUpperCase()}</div>
        <div className="card-body" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit}>
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>General Settings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={lbl}>Company Name</label>
                    <input value={settings.companyName || ''} onChange={e => setLocalSettings({ ...settings, companyName: e.target.value })} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>System Currency</label>
                    <select value={settings.currency || 'INR'} onChange={e => setLocalSettings({ ...settings, currency: e.target.value })} style={inp}>
                      <option value="INR">INR (₹) — Indian Rupee</option>
                      <option value="USD">USD ($) — US Dollar</option>
                      <option value="EUR">EUR (€) — Euro</option>
                      <option value="GBP">GBP (£) — British Pound</option>
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
                  <div>
                    <label style={lbl}>Default UI Theme</label>
                    <select value={settings.theme || 'Light'} onChange={e => setLocalSettings({ ...settings, theme: e.target.value })} style={inp}>
                      <option value="Light">Light Modern SaaS (Default)</option>
                      <option value="Dark">Dark Mode</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'thresholds' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Limits & Operational Thresholds</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={lbl}>Approval SLA Timeout (Hours)</label>
                    <input type="number" value={settings.approvalTimeout || 48} onChange={e => setLocalSettings({ ...settings, approvalTimeout: Number(e.target.value) })} style={inp} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Triggers escalation alert after this duration.</span>
                  </div>
                  <div>
                    <label style={lbl}>Global Low Stock Threshold (Units)</label>
                    <input type="number" value={settings.lowStockThreshold || 10} onChange={e => setLocalSettings({ ...settings, lowStockThreshold: Number(e.target.value) })} style={inp} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SKUs below this level trigger automated warnings.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Notification Dispatch Policies</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                    <input type="checkbox" checked={!!settings.emailNotifications} onChange={e => setLocalSettings({ ...settings, emailNotifications: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span><strong>Automated Email Notifications</strong> — Send emails when quotation status changes or orders ship.</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                    <input type="checkbox" checked={!!settings.managerEscalation} onChange={e => setLocalSettings({ ...settings, managerEscalation: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span><strong>Manager Escalation Alerts</strong> — Notify VP of Sales when discounts exceed max approval threshold.</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem', color: '#374151' }}>
                    <input type="checkbox" checked={!!settings.inventoryWarnings} onChange={e => setLocalSettings({ ...settings, inventoryWarnings: e.target.checked })} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span><strong>Real-time Low Inventory Warnings</strong> — Trigger dashboard alerts when warehouse stock dips.</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Security & Inactivity Policy</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={lbl}>Inactivity Session Timeout (Minutes)</label>
                    <input type="number" value={settings.sessionTimeout || 120} onChange={e => setLocalSettings({ ...settings, sessionTimeout: Number(e.target.value) })} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Enforce Multi-Factor Auth (MFA)</label>
                    <select style={inp} defaultValue="Enabled">
                      <option value="Enabled">Enabled for Admin Roles</option>
                      <option value="Optional">Optional</option>
                      <option value="Enforced">Enforced for All Roles</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
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

