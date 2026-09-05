import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  Database, 
  Save, 
  RotateCcw, 
  Download, 
  Lock, 
  Users, 
  DollarSign, 
  FileText, 
  Sliders, 
  Check, 
  AlertTriangle,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { useQuotations } from '../context/QuotationContext.jsx';

const STORAGE_GOVERNANCE_KEY = 'dealflow360_governance_rules';
const STORAGE_LOCALIZATION_KEY = 'dealflow360_localization_config';

const DEFAULT_GOVERNANCE = {
  tier1AutoDiscount: 15,
  tier2ManagerDiscount: 25,
  tier3FinanceDiscount: 40,
  minGrossMargin: 20,
  strictStageProgression: true,
  requireCustomerApproval: true,
  enableAutoRiskScoring: true
};

const DEFAULT_LOCALIZATION = {
  currency: 'INR',
  numberFormat: 'indian', // 'indian' | 'western'
  defaultGstRate: 18,
  companyName: 'DealFlow360 Technologies India Pvt Ltd',
  companyGstin: '27AABCD1234E1Z9',
  corporateAddress: 'Tower 4, Equinox Business Park, BKC Kurla, Mumbai, MH 400070',
  sessionTimeoutMinutes: 60
};

export const Settings = () => {
  const { user } = useAuth();
  const { success, info, warning } = useToast();
  const { resetToDefaultQuotations } = useQuotations();

  const [activeTab, setActiveTab] = useState('governance'); // 'governance' | 'rbac' | 'localization' | 'data'

  // Governance State
  const [governance, setGovernance] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GOVERNANCE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_GOVERNANCE;
  });

  // Localization State
  const [localization, setLocalization] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOCALIZATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_LOCALIZATION;
  });

  // Save governance
  const handleSaveGovernance = () => {
    try {
      localStorage.setItem(STORAGE_GOVERNANCE_KEY, JSON.stringify(governance));
      success('Governance Saved', 'Discount and stage transition rules updated successfully.');
    } catch (_) {
      warning('Save Failed', 'Could not persist settings to storage.');
    }
  };

  // Save localization
  const handleSaveLocalization = () => {
    try {
      localStorage.setItem(STORAGE_LOCALIZATION_KEY, JSON.stringify(localization));
      success('Localization Updated', 'Currency, tax, and company profile saved.');
    } catch (_) {
      warning('Save Failed', 'Could not persist settings to storage.');
    }
  };

  // Reset demo data
  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to reset all mock quotations, customer accounts, and demo data to default?')) {
      if (resetToDefaultQuotations) {
        resetToDefaultQuotations();
      }
      localStorage.removeItem('dealflow360_customers_v2');
      localStorage.removeItem(STORAGE_GOVERNANCE_KEY);
      localStorage.removeItem(STORAGE_LOCALIZATION_KEY);
      setGovernance(DEFAULT_GOVERNANCE);
      setLocalization(DEFAULT_LOCALIZATION);
      success('Demo Data Reset', 'All records have been restored to initial factory seed state.');
    }
  };

  // Export audit log
  const handleExportAuditLogs = () => {
    const auditData = {
      exportedAt: new Date().toISOString(),
      platform: 'DealFlow360 Enterprise',
      activeUser: user?.email || 'admin@dealflow360.demo',
      governanceRules: governance,
      localizationConfig: localization
    };
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dealflow360-audit-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    info('Audit Exported', 'System configuration and audit trail downloaded.');
  };

  return (
    <div className="settings-page-container">
      {/* Header */}
      <div className="settings-header">
        <div className="settings-title-group">
          <h1>
            <SettingsIcon size={28} color="var(--primary-500)" />
            System Settings & Governance Config
          </h1>
          <p>
            Configure discount escalation thresholds, role permissions, localization, and audit logs.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="settings-tabs-nav">
        <button 
          className={`settings-tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          <ShieldAlert size={18} />
          <span>Discount Governance & Rules</span>
        </button>

        <button 
          className={`settings-tab-btn ${activeTab === 'rbac' ? 'active' : ''}`}
          onClick={() => setActiveTab('rbac')}
        >
          <Lock size={18} />
          <span>Role & Permission Matrix (RBAC)</span>
        </button>

        <button 
          className={`settings-tab-btn ${activeTab === 'localization' ? 'active' : ''}`}
          onClick={() => setActiveTab('localization')}
        >
          <Globe size={18} />
          <span>Localization & Tax Engine</span>
        </button>

        <button 
          className={`settings-tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          <Database size={18} />
          <span>Data Management & Audit</span>
        </button>
      </div>

      {/* TAB 1: GOVERNANCE & DISCOUNT RULES */}
      {activeTab === 'governance' && (
        <div className="settings-panel-card">
          <div>
            <div className="settings-section-title">
              <ShieldAlert size={20} color="var(--primary-500)" />
              Discount Escalation & Exception Thresholds
            </div>
            <div className="settings-section-desc">
              Define maximum permissible commercial discounts before approval triggers are escalated to management or finance.
            </div>
          </div>

          <div className="escalation-rules-grid">
            {/* Tier 1 */}
            <div className="escalation-card">
              <div className="escalation-header">
                <span className="escalation-title">Tier 1: Auto-Approved Limit</span>
                <span className="escalation-value-badge" style={{ color: 'var(--color-success)' }}>
                  ≤ {governance.tier1AutoDiscount}%
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Sales reps can offer up to this discount without seeking manager authorization.
              </p>
              <input 
                type="range" 
                min="0" 
                max="25" 
                value={governance.tier1AutoDiscount}
                onChange={(e) => setGovernance({ ...governance, tier1AutoDiscount: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-success)' }}
              />
            </div>

            {/* Tier 2 */}
            <div className="escalation-card">
              <div className="escalation-header">
                <span className="escalation-title">Tier 2: Manager Review</span>
                <span className="escalation-value-badge" style={{ color: 'var(--color-warning)' }}>
                  {governance.tier1AutoDiscount}% - {governance.tier2ManagerDiscount}%
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Discounts in this bracket require explicit Sales Manager approval in the Approval Center.
              </p>
              <input 
                type="range" 
                min={governance.tier1AutoDiscount} 
                max="35" 
                value={governance.tier2ManagerDiscount}
                onChange={(e) => setGovernance({ ...governance, tier2ManagerDiscount: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-warning)' }}
              />
            </div>

            {/* Tier 3 */}
            <div className="escalation-card">
              <div className="escalation-header">
                <span className="escalation-title">Tier 3: Finance / VP Review</span>
                <span className="escalation-value-badge" style={{ color: 'var(--color-error)' }}>
                  &gt; {governance.tier2ManagerDiscount}%
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Extreme commercial discounts trigger mandatory dual review from Finance / Operations.
              </p>
              <input 
                type="range" 
                min={governance.tier2ManagerDiscount} 
                max="60" 
                value={governance.tier3FinanceDiscount}
                onChange={(e) => setGovernance({ ...governance, tier3FinanceDiscount: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-error)' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <div className="settings-section-title">Workflow Policy Enforcements</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="checkbox"
                  checked={governance.strictStageProgression}
                  onChange={(e) => setGovernance({ ...governance, strictStageProgression: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary-500)' }}
                />
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Strict Stage Progression</span>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    Blocks jumping straight from Draft to Confirmed without passing intermediate review.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input 
                  type="checkbox"
                  checked={governance.enableAutoRiskScoring}
                  onChange={(e) => setGovernance({ ...governance, enableAutoRiskScoring: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary-500)' }}
                />
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Automated Deal Health & Risk Scoring</span>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    Calculates real-time risk scores (0-100) based on discount depth, line item margin, and deal age.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary"
              onClick={handleSaveGovernance}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              <span>Save Governance Policy</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="settings-panel-card">
          <div>
            <div className="settings-section-title">
              <Lock size={20} color="var(--primary-500)" />
              Role-Based Access Control (RBAC) Matrix
            </div>
            <div className="settings-section-desc">
              Granular permission matrix configured for all five platform personas.
            </div>
          </div>

          <div className="rbac-table-container">
            <table className="rbac-table">
              <thead>
                <tr>
                  <th>Platform Capability</th>
                  <th style={{ textAlign: 'center' }}>Sales Rep</th>
                  <th style={{ textAlign: 'center' }}>Sales Manager</th>
                  <th style={{ textAlign: 'center' }}>Finance / Ops</th>
                  <th style={{ textAlign: 'center' }}>Customer Portal</th>
                  <th style={{ textAlign: 'center' }}>Administrator</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'View Dashboard & Personal KPIs', rep: 'Yes', mgr: 'Yes', fin: 'Yes', cust: 'Yes', adm: 'Yes' },
                  { feature: 'Create & Edit Quotations', rep: 'Yes', mgr: 'Yes', fin: 'Read Only', cust: 'No', adm: 'Yes' },
                  { feature: 'Authorize Discounts (≤ 25%)', rep: 'Auto (≤15%)', mgr: 'Yes', fin: 'Yes', cust: 'No', adm: 'Yes' },
                  { feature: 'High Discount Approval (> 25%)', rep: 'No', mgr: 'Escalate', fin: 'Yes', cust: 'No', adm: 'Yes' },
                  { feature: 'Kanban Sales Pipeline Movement', rep: 'Yes', mgr: 'Yes', fin: 'Read Only', cust: 'No', adm: 'Yes' },
                  { feature: 'Warehouse Routing & Fulfillment', rep: 'Read Only', mgr: 'Read Only', fin: 'Full Control', cust: 'No', adm: 'Yes' },
                  { feature: 'Generate Invoices & Process Payments', rep: 'No', mgr: 'Read Only', fin: 'Full Control', cust: 'Pay Invoices', adm: 'Yes' },
                  { feature: 'Executive RevOps Analytics & Exports', rep: 'No', mgr: 'Yes', fin: 'Yes', cust: 'No', adm: 'Yes' },
                  { feature: 'System Governance & Settings Config', rep: 'No', mgr: 'No', fin: 'No', cust: 'No', adm: 'Yes' }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.feature}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.rep === 'Yes' ? 'badge-success' : row.rep === 'No' ? 'badge-neutral' : 'badge-primary'}`}>
                        {row.rep}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.mgr === 'Yes' ? 'badge-success' : row.mgr === 'No' ? 'badge-neutral' : 'badge-primary'}`}>
                        {row.mgr}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.fin.includes('Full') || row.fin === 'Yes' ? 'badge-success' : row.fin === 'No' ? 'badge-neutral' : 'badge-primary'}`}>
                        {row.fin}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${row.cust === 'Yes' || row.cust === 'Pay Invoices' ? 'badge-primary' : 'badge-neutral'}`}>
                        {row.cust}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">Full Control</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOCALIZATION & TAX */}
      {activeTab === 'localization' && (
        <div className="settings-panel-card">
          <div>
            <div className="settings-section-title">
              <Globe size={20} color="var(--primary-500)" />
              Enterprise Localization & Indian GST Tax Engine
            </div>
            <div className="settings-section-desc">
              Manage currency formatting, GST rules, and corporate legal entity details.
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-input-group">
              <label>Default Currency System</label>
              <select 
                value={localization.currency}
                onChange={(e) => setLocalization({ ...localization, currency: e.target.value })}
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div className="settings-input-group">
              <label>Numerical Grouping Style</label>
              <select 
                value={localization.numberFormat}
                onChange={(e) => setLocalization({ ...localization, numberFormat: e.target.value })}
              >
                <option value="indian">Indian Numerical Format (₹ Lakhs & Crores)</option>
                <option value="western">International Format ($ Millions & Billions)</option>
              </select>
            </div>

            <div className="settings-input-group">
              <label>Standard GST Tax Rate</label>
              <select 
                value={localization.defaultGstRate}
                onChange={(e) => setLocalization({ ...localization, defaultGstRate: Number(e.target.value) })}
              >
                <option value={0}>0% — Exempt / Non-Taxable</option>
                <option value={5}>5% — Essential Goods</option>
                <option value={12}>12% — Standard Services</option>
                <option value={18}>18% — Standard Software / Tech (Default)</option>
                <option value={28}>28% — Luxury / High Tier Hardware</option>
              </select>
            </div>

            <div className="settings-input-group">
              <label>Corporate Legal Name</label>
              <input 
                type="text" 
                value={localization.companyName}
                onChange={(e) => setLocalization({ ...localization, companyName: e.target.value })}
              />
            </div>

            <div className="settings-input-group">
              <label>Registered Corporate GSTIN</label>
              <input 
                type="text" 
                value={localization.companyGstin}
                onChange={(e) => setLocalization({ ...localization, companyGstin: e.target.value })}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div className="settings-input-group" style={{ gridColumn: 'span 2' }}>
              <label>Corporate Head Office Address</label>
              <input 
                type="text" 
                value={localization.corporateAddress}
                onChange={(e) => setLocalization({ ...localization, corporateAddress: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary"
              onClick={handleSaveLocalization}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              <span>Save Localization Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: DATA MANAGEMENT & AUDIT */}
      {activeTab === 'data' && (
        <div className="settings-panel-card">
          <div>
            <div className="settings-section-title">
              <Database size={20} color="var(--primary-500)" />
              Data Management & Demo Sandbox Controls
            </div>
            <div className="settings-section-desc">
              Export system audits, inspection logs, or reset all demo storage to pristine state.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <Download size={18} color="var(--primary-500)" />
                Audit Trail Export
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Export a full JSON snapshot of all system configuration, active governance rules, and session state.
              </p>
              <button 
                className="btn btn-secondary"
                onClick={handleExportAuditLogs}
                style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
              >
                Export Audit Snapshot
              </button>
            </div>

            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.04)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-error)' }}>
                <RotateCcw size={18} />
                Reset Demo Sandbox State
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Clears all local storage modifications and restores default seed quotations, customers, and approval queues.
              </p>
              <button 
                className="btn btn-outline"
                onClick={handleResetDemoData}
                style={{ alignSelf: 'flex-start', color: 'var(--color-error)', borderColor: 'var(--color-error)', marginTop: 'auto' }}
              >
                Reset to Factory Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
