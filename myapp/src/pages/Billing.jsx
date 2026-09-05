import React, { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useBilling } from '../context/BillingContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { calculateMRR } from '../utils/billingUtils.js';
import { formatINR } from '../utils/formatters.js';
import {
  CreditCard, FileText, RefreshCw, CheckCircle, CheckCircle2,
  AlertTriangle, Clock, TrendingUp, ArrowRight, ArrowLeft, Calendar,
  DollarSign, Sparkles, Building
} from 'lucide-react';

export const Billing = () => {
  const { invoices, subscriptions, createInvoiceFromSubscription } = useBilling();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscriptionId, id } = useParams();
  const { success, error: toastError } = useToast();

  const effectiveId = subscriptionId || id || searchParams.get('subId');
  const [activeSubId, setActiveSubId] = useState(effectiveId || (subscriptions[0]?.id || 'SUB-001'));
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  // Synchronize when route param or searchParams changes
  React.useEffect(() => {
    if (effectiveId) {
      setActiveSubId(effectiveId);
    }
  }, [effectiveId]);

  const selectedSub = subscriptions.find(s => s.id === activeSubId) || subscriptions[0];

  const totalRevenue    = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.total, 0);
  const pendingAmt      = invoices.filter(i => i.status === 'Issued').reduce((s, i) => s + i.total, 0);
  const paidCount       = invoices.filter(i => i.status === 'Paid').length;
  const overdueCount    = invoices.filter(i => i.status === 'Overdue').length;
  const partialCount    = invoices.filter(i => i.status === 'Partially Paid').length;
  const activeSubs      = subscriptions.filter(s => s.status === 'Active').length;
  const mrr             = calculateMRR(subscriptions);

  const kpis = [
    { label: 'Total Revenue', value: formatINR(totalRevenue), icon: TrendingUp,    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  accent: '#10b981' },
    { label: 'Pending Payments', value: formatINR(pendingAmt), icon: Clock,         color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   accent: '#3b82f6' },
    { label: 'Paid Invoices',    value: paidCount,             icon: CheckCircle,   color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',    accent: '#06b6d4' },
    { label: 'Overdue',          value: overdueCount,          icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    accent: '#ef4444' },
    { label: 'Active Subs',      value: activeSubs,            icon: RefreshCw,     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',   accent: '#8b5cf6' },
    { label: 'MRR',              value: formatINR(Math.round(mrr)), icon: CreditCard, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b' },
  ];

  const STATUS_MAP = {
    Paid: 'billing-badge-paid', Issued: 'billing-badge-issued',
    Overdue: 'billing-badge-overdue', Cancelled: 'billing-badge-cancelled',
    'Partially Paid': 'billing-badge-issued', Draft: 'billing-badge-neutral',
  };

  const recent = [...invoices].slice(0, 6);

  // Handle invoice generation from recurring subscription
  const handleGenerateInvoice = (sub) => {
    try {
      const inv = createInvoiceFromSubscription(sub);
      setGeneratedInvoice(inv);
      success(
        'Invoice Generated Successfully',
        `Tax invoice ${inv.id} generated for ${sub.customerName} for ${formatINR(inv.total)}.`
      );
    } catch (err) {
      toastError('Invoice Generation Failed', err.message);
    }
  };

  return (
    <div className="billing-page">
      {/* Header */}
      <div className="billing-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            {selectedSub && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setActiveSubId('');
                  setSearchParams({});
                }}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <ArrowLeft size={14} /> All Billing
              </button>
            )}
            <h1 className="billing-page-title" style={{ margin: 0 }}>
              {selectedSub ? `Billing Detail: ${selectedSub.id}` : 'Billing Dashboard'}
            </h1>
          </div>
          <p className="billing-page-subtitle">
            {selectedSub
              ? `Recurring contract schedule and automated invoice generation for ${selectedSub.customerName}.`
              : 'Revenue overview, invoice status and subscription MRR.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/sales/invoices')}>
            <FileText size={16} /> Invoices List
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/sales/subscriptions')}>
            <RefreshCw size={16} /> Subscriptions List
          </button>
        </div>
      </div>

      {/* 10. Dedicated Subscription Billing Detail & Recurring Schedule Section */}
      {selectedSub && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="card-surface" style={{ border: '1.5px solid var(--primary-500)', background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.04) 0%, rgba(59, 130, 246, 0.01) 100%)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge" style={{ background: 'var(--primary-500)', color: '#fff', fontWeight: 700 }}>
                    10. BILLING DETAIL
                  </span>
                  <span className={`billing-badge ${selectedSub.status === 'Active' ? 'billing-badge-active' : 'billing-badge-neutral'}`}>
                    {selectedSub.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedSub.planName || selectedSub.productName}
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>Customer: <strong style={{ color: 'var(--text-primary)' }}>{selectedSub.customerName}</strong></span>
                  <span>•</span>
                  <span>Subscription ID: <code style={{ color: 'var(--primary-500)', fontWeight: 700 }}>{selectedSub.id}</code></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleGenerateInvoice(selectedSub)}
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                    padding: '0.65rem 1.25rem'
                  }}
                >
                  <FileText size={18} />
                  Generate Invoice ({formatINR(selectedSub.amount)})
                </button>
              </div>
            </div>

            {/* Generated Invoice Alert & Quick Navigators */}
            {generatedInvoice && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={24} color="var(--color-success)" />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                      Invoice Generated: {generatedInvoice.id}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.15rem' }}>
                      Issued to {generatedInvoice.customerName} for {formatINR(generatedInvoice.total)} (Net 30 days due).
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/sales/invoices')}
                    style={{ fontWeight: 600 }}
                  >
                    Invoices List
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/sales/invoices/${generatedInvoice.id}`)}
                    style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    Invoice Detail <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Recurring Schedule Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Billing Interval</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedSub.billingCycle}</div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Recurring Cycle Amount</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-success)' }}>{formatINR(selectedSub.amount)}</div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Contract Start Date</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {new Date(selectedSub.startDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Next Scheduled Cycle</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                  {new Date(selectedSub.nextBillingDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </div>
              </div>
            </div>

            {/* Recurring Schedule Timeline Table */}
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--primary-500)" />
                Recurring Schedule & Billing Forecast
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="dealflow-table" style={{ width: '100%', fontSize: '0.875rem' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Cycle Period</th>
                      <th style={{ textAlign: 'left' }}>Billing Event</th>
                      <th style={{ textAlign: 'left' }}>Scheduled Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Cycle 1 (Initial)</td>
                      <td>Order Inception & Fulfillment Complete</td>
                      <td>{new Date(selectedSub.startDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(selectedSub.amount)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Billed / Completed</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="billing-table-action-btn" onClick={() => navigate('/invoices')}>
                          View Invoices <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                    <tr style={{ background: 'rgba(59, 130, 246, 0.04)' }}>
                      <td style={{ fontWeight: 600 }}>Cycle 2 (Upcoming)</td>
                      <td>{selectedSub.billingCycle} Renewal Cycle</td>
                      <td>{new Date(selectedSub.nextBillingDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-500)' }}>{formatINR(selectedSub.amount)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-600)', fontSize: '0.75rem', fontWeight: 700 }}>
                          Ready to Invoice
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleGenerateInvoice(selectedSub)}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                        >
                          Generate Invoice
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="billing-kpi-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div className="billing-kpi-card" key={i} style={{ '--kpi-accent': k.accent }}>
              <div className="billing-kpi-card-top">
                <div className="billing-kpi-icon" style={{ background: k.bg, color: k.color }}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="billing-kpi-value">{k.value}</div>
              <div className="billing-kpi-label">{k.label}</div>
            </div>
          );
        })}
      </div>

      {partialCount > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#b45309', fontWeight: 600, marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          {partialCount} invoice{partialCount > 1 ? 's' : ''} with partial payment — balance outstanding.
          <button className="btn btn-secondary" style={{ marginLeft: 'auto', fontSize: '0.8125rem', padding: '0.35rem 0.875rem' }} onClick={() => navigate('/invoices?status=Partially Paid')}>
            Review <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Recent Invoices Ledger */}
      <div className="billing-section">
        <div className="billing-section-header">
          <h2 className="billing-section-title"><FileText size={18} /> 12. Recent Invoices</h2>
          <button className="btn btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }} onClick={() => navigate('/invoices')}>
            View Invoices List <ArrowRight size={14} />
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="billing-empty-state"><FileText size={48} /><p>No invoices yet.</p></div>
        ) : (
          <div className="billing-table-wrap">
            <table className="billing-table">
              <thead><tr>
                <th>Invoice</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Action</th>
              </tr></thead>
              <tbody>
                {recent.map(inv => (
                  <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/invoices/${inv.id}`)} className="clickable-row">
                    <td><span className="billing-invoice-id">{inv.id}</span></td>
                    <td style={{ fontWeight: 600 }}>{inv.customerName}</td>
                    <td className="billing-amount-cell">{formatINR(inv.total)}</td>
                    <td>{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                    <td><span className={`billing-badge ${STATUS_MAP[inv.status] || 'billing-badge-neutral'}`}>{inv.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="billing-table-action-btn" onClick={() => navigate(`/invoices/${inv.id}`)}>
                        13. View Detail <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
