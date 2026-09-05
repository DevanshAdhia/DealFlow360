import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  FileSearch,
  ExternalLink
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { useQuotations } from '../context/QuotationContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { mockActivity } from '../data/mockQuotations.js';

const normalize = (s) => (s || '').toUpperCase().replace(/\s+/g, '_');

export const CustomerDashboard = () => {
  const { currentCustomer } = useCustomer();
  const { customerQuotations } = useQuotations();
  const navigate = useNavigate();

  const firstName = (currentCustomer?.contactName || 'John Carter').split(' ')[0];

  /* ── 1. KPI Counts ── */
  const counts = useMemo(() => {
    let newQuotes = 0;
    let underNeg = 0;
    let approved = 0;
    let rejected = 0;
    let confirmed = 0;

    customerQuotations.forEach(q => {
      const s = normalize(q.status);
      if (s === 'SENT' || s === 'NEW' || s === 'AWAITING_RESPONSE') newQuotes++;
      else if (s === 'UNDER_NEGOTIATION' || s === 'REVISED' || s === 'APPROVAL_REQUIRED') underNeg++;
      else if (s === 'APPROVED') approved++;
      else if (s === 'REJECTED') rejected++;
      else if (s === 'CONFIRMED') confirmed++;
    });

    return { newQuotes, underNeg, approved, rejected, confirmed };
  }, [customerQuotations]);

  /* ── 2. Action Required Items (Prioritized) ── */
  const actionItems = useMemo(() => {
    const items = [];
    customerQuotations.forEach(q => {
      const s = normalize(q.status);
      const id = q.quotationNumber || q.id;
      const title = q.title || q.notes || 'Quotation Proposal';

      if (s === 'SENT' || s === 'NEW') {
        items.push({
          id,
          title,
          status: 'New Proposal',
          statusType: 'new',
          message: 'Please review and confirm this quotation.',
          actionLabel: 'Review Quote',
          route: `/customer/quotations/${id}`,
          priority: 1
        });
      } else if (s === 'APPROVED') {
        items.push({
          id,
          title,
          status: 'Approved',
          statusType: 'approved',
          message: 'Your requested discount has been approved by sales management.',
          actionLabel: 'Review & Confirm',
          route: `/customer/quotations/${id}`,
          priority: 1
        });
      } else if (s === 'REVISED') {
        items.push({
          id,
          title,
          status: 'Revised Quote',
          statusType: 'revised',
          message: 'Sales team has responded to your discount request with updated terms.',
          actionLabel: 'Review Revision',
          route: `/customer/quotations/${id}`,
          priority: 2
        });
      } else if (s === 'APPROVAL_REQUIRED') {
        items.push({
          id,
          title,
          status: 'Approval Required',
          statusType: 'warning',
          message: 'Requested terms exceed authorization limit; currently under commercial review.',
          actionLabel: 'View Status',
          route: `/customer/quotations/${id}`,
          priority: 3
        });
      } else if (s === 'REJECTED') {
        items.push({
          id,
          title,
          status: 'Request Rejected',
          statusType: 'rejected',
          message: q.rejectionReason || 'Requested terms exceeded guidelines. Negotiate again or request change.',
          actionLabel: 'View Reason & Renegotiate',
          route: `/customer/quotations/${id}/reject`,
          priority: 2
        });
      }
    });

    return items.sort((a, b) => a.priority - b.priority);
  }, [customerQuotations]);

  /* ── 3. Active Negotiations ── */
  const activeNegotiations = useMemo(() => {
    return customerQuotations.filter(q => {
      const s = normalize(q.status);
      return s === 'UNDER_NEGOTIATION' || s === 'APPROVAL_REQUIRED' || s === 'REVISED';
    });
  }, [customerQuotations]);

  const getStatusBadge = (status) => {
    const s = normalize(status);
    switch (s) {
      case 'SENT':
      case 'NEW':
        return { label: 'Sent', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'UNDER_NEGOTIATION':
        return { label: 'Under Negotiation', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'REVISED':
        return { label: 'Revised', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'APPROVAL_REQUIRED':
        return { label: 'Approval Required', bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
      case 'APPROVED':
        return { label: 'Approved', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'REJECTED':
        return { label: 'Rejected', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case 'CONFIRMED':
        return { label: 'Confirmed', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      default:
        return { label: status, bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div className="content-wrapper">
      {/* ── 1. WELCOME SECTION ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' }}>
            <Sparkles size={14} />
            <span>DealFlow360 Customer Portal</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
            Good morning, {firstName} 👋
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9375rem', maxWidth: '640px', lineHeight: 1.5 }}>
            Review your latest quotations, continue negotiations with your sales representative, and confirm approved proposals for <strong>{currentCustomer?.companyName}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/customer/quotations')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9px',
            fontWeight: 600,
            fontSize: '0.9375rem',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
        >
          <FileText size={18} />
          <span>View All Quotations</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* ── 2. ACTION REQUIRED SECTION (Top Priority!) ── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} color="#2563eb" />
              <span>Action Required</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
              Quotations waiting for your immediate review, confirmation, or renegotiation.
            </p>
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '4px 12px', borderRadius: '12px' }}>
            {actionItems.length} {actionItems.length === 1 ? 'Action' : 'Actions'} Pending
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {actionItems.map(item => {
            const isApproved = item.statusType === 'approved';
            const isRejected = item.statusType === 'rejected';
            const isRevised = item.statusType === 'revised';

            return (
              <div
                key={item.id}
                style={{
                  background: isApproved ? '#f0fdf4' : isRejected ? '#fef2f2' : isRevised ? '#faf5ff' : '#ffffff',
                  border: isApproved ? '1px solid #bbf7d0' : isRejected ? '1px solid #fecaca' : isRevised ? '1px solid #e9d5ff' : '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0f172a' }}>
                      Quote #{item.id}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : isRevised ? '#f3e8ff' : '#eff6ff',
                      color: isApproved ? '#15803d' : isRejected ? '#b91c1c' : isRevised ? '#7e22ce' : '#1d4ed8'
                    }}>
                      {item.status}
                    </span>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1e293b', marginBottom: '6px' }}>
                    {item.title}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    "{item.message}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(item.route)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    background: isRejected ? '#dc2626' : isApproved ? '#16a34a' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                  }}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. SUMMARY CARDS ── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Card 1: New Quotations */}
          <div
            onClick={() => navigate('/customer/quotations')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                NEW QUOTATIONS
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {counts.newQuotes}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '8px' }}>
              Quotes waiting for your review
            </div>
          </div>

          {/* Card 2: Under Negotiation */}
          <div
            onClick={() => navigate('/customer/negotiations')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                UNDER NEGOTIATION
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {counts.underNeg}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '8px' }}>
              Active commercial discussions
            </div>
          </div>

          {/* Card 3: Approved */}
          <div
            onClick={() => navigate('/customer/quotations')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                APPROVED
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {counts.approved}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '8px' }}>
              Ready for your confirmation
            </div>
          </div>

          {/* Card 4: Rejected */}
          <div
            onClick={() => navigate('/customer/quotations')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                REJECTED
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {counts.rejected}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '8px' }}>
              Needs your attention / renegotiate
            </div>
          </div>

          {/* Card 5: Confirmed */}
          <div
            onClick={() => navigate('/customer/quotations')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CONFIRMED
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {counts.confirmed}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '8px' }}>
              Processing in fulfillment
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MY QUOTATIONS TABLE ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '32px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              My Quotations
            </h2>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
              All formal proposals issued for {currentCustomer?.companyName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/customer/quotations')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Quote Number</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Quotation</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Date</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Valid Until</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Total</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {customerQuotations.map(q => {
                const id = q.quotationNumber || q.id;
                const badge = getStatusBadge(q.status);
                const s = normalize(q.status);

                let actionText = 'Review';
                let actionRoute = `/customer/quotations/${id}`;
                let actionBtnStyle = { background: '#2563eb', color: '#ffffff' };

                if (s === 'UNDER_NEGOTIATION' || s === 'REVISED') {
                  actionText = 'Continue';
                  actionRoute = `/customer/quotations/${id}`;
                } else if (s === 'APPROVED') {
                  actionText = 'Confirm';
                  actionRoute = `/customer/quotations/${id}`;
                  actionBtnStyle = { background: '#16a34a', color: '#ffffff' };
                } else if (s === 'REJECTED') {
                  actionText = 'View Reason';
                  actionRoute = `/customer/quotations/${id}/reject`;
                  actionBtnStyle = { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
                } else if (s === 'CONFIRMED') {
                  actionText = 'View';
                  actionRoute = `/customer/quotations/${id}`;
                  actionBtnStyle = { background: '#f1f5f9', color: '#334155' };
                }

                return (
                  <tr
                    key={id}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onClick={() => navigate(actionRoute)}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                      {id}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#1e293b', fontWeight: 500 }}>
                      {q.title || 'Hardware & Service Bundle'}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>
                      {formatDate(q.createdAt)}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748b' }}>
                      {formatDate(q.validUntil)}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a' }}>
                      {formatCurrency(q.total)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); navigate(actionRoute); }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '7px',
                          border: 'none',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          ...actionBtnStyle
                        }}
                      >
                        {actionText}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5 & 6. ACTIVE NEGOTIATIONS & ACTIVITY TIMELINE ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Active Negotiations */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Active Negotiations
            </h2>
            <button
              type="button"
              onClick={() => navigate('/customer/negotiations')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
            >
              All Discussions
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeNegotiations.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                No active negotiations right now.
              </div>
            ) : (
              activeNegotiations.map(q => {
                const id = q.quotationNumber || q.id;
                return (
                  <div
                    key={id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{id}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                        Under Negotiation
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b', marginBottom: '6px' }}>
                      {q.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '12px', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                      <strong>Sales response: </strong>
                      "{q.notes || 'Counter offer under management evaluation.'}"
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Total: <strong>{formatCurrency(q.total)}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate(`/customer/quotations/${id}`)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <span>Continue Negotiation</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
            Recent Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mockActivity.map(act => (
              <div
                key={act.id}
                onClick={() => act.quotationId && navigate(`/customer/quotations/${act.quotationId}`)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: act.quotationId ? 'pointer' : 'default'
                }}
              >
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: act.type === 'approved' ? '#16a34a' : act.type === 'rejected' ? '#dc2626' : '#2563eb',
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
                    {act.desc}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    {act.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
