import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBilling } from '../context/BillingContext.jsx';
import { calculateMRR } from '../utils/billingUtils.js';
import { formatINR } from '../utils/formatters.js';
import { 
  RefreshCw, 
  Plus, 
  ArrowRight, 
  Info, 
  FileText, 
  CheckCircle2, 
  PauseCircle, 
  XCircle,
  PlayCircle
} from 'lucide-react';
import { useToast } from '../hooks/useToast.js';

export const Subscriptions = () => {
  const navigate = useNavigate();
  const { subscriptions, setSubscriptions, pauseSubscription, resumeSubscription, cancelSubscription } = useBilling();
  const { success } = useToast();

  // Subcategory filter state: 'ALL' | 'Active' | 'Paused' | 'Cancelled'
  const [filter, setFilter] = useState('ALL');
  const [confirmAction, setConfirmAction] = useState(null);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  // New Plan form state
  const [newPlanForm, setNewPlanForm] = useState({
    customerName: '',
    planName: '',
    billingCycle: 'Monthly',
    amount: ''
  });

  const activeCount = subscriptions.filter(s => s.status === 'Active').length;
  const pausedCount = subscriptions.filter(s => s.status === 'Paused').length;
  const cancelledCount = subscriptions.filter(s => s.status === 'Cancelled').length;

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'ALL') return subscriptions;
    return subscriptions.filter(s => s.status === filter);
  }, [subscriptions, filter]);

  const handleAction = () => {
    if (!confirmAction) return;
    const { type, sub } = confirmAction;
    if (type === 'pause')  pauseSubscription(sub.id);
    if (type === 'resume') resumeSubscription(sub.id);
    if (type === 'cancel') cancelSubscription(sub.id);
    setConfirmAction(null);
  };

  const handleCreateNewPlan = (e) => {
    e.preventDefault();
    if (!newPlanForm.customerName || !newPlanForm.planName) return;

    const newSub = {
      id: `SUB-${8100 + subscriptions.length + 1}`,
      customerId: `CUST-${String(subscriptions.length + 1).padStart(3, '0')}`,
      customerName: newPlanForm.customerName,
      planName: newPlanForm.planName,
      productName: newPlanForm.planName,
      amount: Number(newPlanForm.amount) || 15000,
      billingCycle: newPlanForm.billingCycle,
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active'
    };

    if (typeof setSubscriptions === 'function') {
      setSubscriptions(prev => [newSub, ...prev]);
    } else {
      subscriptions.unshift(newSub);
    }

    setShowNewPlanModal(false);
    setNewPlanForm({ customerName: '', planName: '', billingCycle: 'Monthly', amount: '' });
    success('New Plan Created', `Added ${newSub.planName} for ${newSub.customerName}.`);
  };

  const formatNextBill = (sub) => {
    if (!sub.nextBillingDate || sub.status === 'Cancelled' || sub.status === 'Paused') {
      return '—';
    }
    const d = new Date(sub.nextBillingDate);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="subscriptions-page" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.5rem 1rem 2rem 1rem' }}>
      {/* 1. Page Header (Exact wireframe: Subscriptions (List)) */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
          Subscriptions (List)
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Every recurring plan across every customer, regardless of which order it came from
        </p>
      </div>

      {/* 2. Subcategory Filter Badges & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          {/* All Plans Pill Button */}
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem 1.1rem',
              borderRadius: '6px',
              border: filter === 'ALL' ? '2px solid #1d4ed8' : '1px solid #cbd5e1',
              backgroundColor: filter === 'ALL' ? '#2563eb' : '#ffffff',
              color: filter === 'ALL' ? '#ffffff' : '#334155',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: filter === 'ALL' ? '0 0 0 3px rgba(37, 99, 235, 0.25)' : '0 1px 2px rgba(0,0,0,0.05)',
              transform: filter === 'ALL' ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}
            title="Show All Subscriptions"
          >
            All ({subscriptions.length})
          </button>

          {/* Active Pill Button */}
          <button
            type="button"
            onClick={() => setFilter('Active')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem 1.1rem',
              borderRadius: '6px',
              border: filter === 'Active' ? '2px solid #14532d' : '1.5px solid #15803d',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: filter === 'Active' ? '0 0 0 3px rgba(22, 163, 74, 0.35)' : '0 1px 2px rgba(0,0,0,0.05)',
              transform: filter === 'Active' ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}
            title="Filter by Active Subscriptions"
          >
            {activeCount} Active
          </button>

          {/* Paused Pill Button */}
          <button
            type="button"
            onClick={() => setFilter('Paused')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem 1.1rem',
              borderRadius: '6px',
              border: filter === 'Paused' ? '2px solid #7c2d12' : '1.5px solid #c2410c',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: filter === 'Paused' ? '0 0 0 3px rgba(234, 88, 12, 0.35)' : '0 1px 2px rgba(0,0,0,0.05)',
              transform: filter === 'Paused' ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}
            title="Filter by Paused Subscriptions"
          >
            {pausedCount} Paused
          </button>

          {/* Cancelled Pill Button */}
          <button
            type="button"
            onClick={() => setFilter('Cancelled')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem 1.1rem',
              borderRadius: '6px',
              border: filter === 'Cancelled' ? '2px solid #7f1d1d' : '1.5px solid #b91c1c',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: filter === 'Cancelled' ? '0 0 0 3px rgba(220, 38, 38, 0.35)' : '0 1px 2px rgba(0,0,0,0.05)',
              transform: filter === 'Cancelled' ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.15s ease'
            }}
            title="Filter by Cancelled Subscriptions"
          >
            {cancelledCount} Cancelled
          </button>
        </div>

        {/* Search Input for Subscriptions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#ffffff',
          padding: '0.4rem 0.75rem',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}>
          <input
            type="text"
            placeholder="Search plans or customers..."
            value={newPlanForm.searchTerm || ''}
            onChange={(e) => setNewPlanForm(prev => ({ ...prev, searchTerm: e.target.value }))}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.8125rem',
              color: '#0f172a',
              width: '190px'
            }}
          />
          {newPlanForm.searchTerm && (
            <button
              type="button"
              onClick={() => setNewPlanForm(prev => ({ ...prev, searchTerm: '' }))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', color: '#94a3b8' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Subscriptions Table with Grid Borders */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          marginBottom: '1rem'
        }}
        className="billing-table-wrap"
      >
        <table className="billing-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', textTransform: 'none' }}>Customer</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', textTransform: 'none' }}>Plan</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', textTransform: 'none' }}>Cycle</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0', textTransform: 'none' }}>Next Bill</th>
              <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'none' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  No subscriptions found matching the selected subcategory or search criteria.
                </td>
              </tr>
            ) : (
              filteredSubscriptions
                .filter(sub => {
                  if (!newPlanForm.searchTerm) return true;
                  const term = newPlanForm.searchTerm.toLowerCase();
                  return (
                    (sub.customerName || '').toLowerCase().includes(term) ||
                    (sub.planName || sub.productName || '').toLowerCase().includes(term) ||
                    (sub.billingCycle || '').toLowerCase().includes(term)
                  );
                })
                .map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => navigate(`/sales/subscriptions/${sub.id}`)}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Click to view subscription billing detail"
                  >
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                      {sub.customerName}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                      {sub.planName || sub.productName}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                      {sub.billingCycle}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', color: '#475569', borderRight: '1px solid #e2e8f0' }}>
                      {formatNextBill(sub)}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem' }}>
                      <span style={{
                        fontWeight: 600,
                        color: sub.status === 'Active' ? '#16a34a' : sub.status === 'Paused' ? '#ea580c' : '#dc2626'
                      }}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Notice Box: Click a subscription row to open its billing detail and proration history. */}
      <div
        style={{
          backgroundColor: '#fefce8',
          border: '1px solid #fef08a',
          borderRadius: '8px',
          padding: '0.75rem 1.25rem',
          fontSize: '0.8125rem',
          color: '#854d0e',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem'
        }}
      >
        <span>Click a subscription row to open its billing detail and proration history.</span>
      </div>

      {/* 5. Button: + New Plan (Admin) */}
      <div>
        <button
          type="button"
          onClick={() => setShowNewPlanModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            backgroundColor: '#ffffff',
            border: '1px solid #94a3b8',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#1e293b',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <Plus size={14} />
          New Plan (Admin)
        </button>
      </div>

      {/* Create New Plan Modal */}
      {showNewPlanModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowNewPlanModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Create Subscription Plan (Admin)
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Register a recurring service schedule for an enterprise customer account.
            </p>

            <form onSubmit={handleCreateNewPlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={newPlanForm.customerName}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, customerName: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Care Plan 2yr"
                  value={newPlanForm.planName}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, planName: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Billing Cycle
                  </label>
                  <select
                    value={newPlanForm.billingCycle}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, billingCycle: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Recurring Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newPlanForm.amount}
                    onChange={(e) => setNewPlanForm({ ...newPlanForm, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewPlanModal(false)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px', backgroundColor: '#1e40af', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
