import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select } from '../components/common/UI';
import { getSettings, setSettings, getSession, addAuditLog } from '../services/storageService';

function Settings() {
  const [settings, setLocalSettings] = useState(() => getSettings());
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    setTimeout(() => {
      setSettings(settings);
      
      const session = getSession();
      addAuditLog(session, 'Updated Settings', 'Settings', 'Admin updated global system settings');
      
      toast.success('System configuration saved successfully');
      setSaving(false);
    }, 800);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <div className="card-header">Global Configuration</div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>General Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input label="Company Name" value={settings.companyName || ''} onChange={e => setLocalSettings({...settings, companyName: e.target.value})} />
              <Select label="System Currency" value={settings.currency || 'USD'} onChange={e => setLocalSettings({...settings, currency: e.target.value})} options={['USD', 'EUR', 'GBP', 'INR']} />
              <Select label="Timezone" value={settings.timezone || 'UTC'} onChange={e => setLocalSettings({...settings, timezone: e.target.value})} options={['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata']} />
            </div>

            <hr style={{ margin: 'var(--space-6) 0', border: 0, borderTop: '1px solid var(--border)' }} />

            <h3 style={{ marginBottom: 'var(--space-4)' }}>System Limits & Thresholds</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input label="Approval Timeout (Hours)" type="number" value={settings.approvalTimeout || 48} onChange={e => setLocalSettings({...settings, approvalTimeout: e.target.value})} />
              <Input label="Global Low Stock Threshold" type="number" value={settings.lowStockThreshold || 10} onChange={e => setLocalSettings({...settings, lowStockThreshold: e.target.value})} />
            </div>

            <hr style={{ margin: 'var(--space-6) 0', border: 0, borderTop: '1px solid var(--border)' }} />

            <h3 style={{ marginBottom: 'var(--space-4)' }}>Notifications Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-2)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked /> Enable Email Notifications
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked /> Enable Manager Escalation Alerts
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked /> Real-time Inventory Alerts
              </label>
            </div>

            <div style={{ marginTop: 'var(--space-8)', display: 'flex', gap: 'var(--space-4)' }}>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Configuration'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
