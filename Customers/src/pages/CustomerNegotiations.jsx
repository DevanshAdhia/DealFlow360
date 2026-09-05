import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight, Clock, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const normalize = (s) => (s || '').toUpperCase().replace(/\s+/g, '_');

export const CustomerNegotiations = () => {
  const { customerQuotations } = useQuotations();
  const navigate = useNavigate();

  // Quotations with active or historical negotiation activity
  const negotiations = useMemo(() => {
    return customerQuotations.filter(q => {
      const s = normalize(q.status);
      return s === 'UNDER_NEGOTIATION' || s === 'APPROVAL_REQUIRED' || s === 'REVISED' || s === 'REJECTED' || s === 'APPROVED';
    });
  }, [customerQuotations]);

  const getStatusBadge = (status) => {
    const s = normalize(status);
    switch (s) {
      case 'UNDER_NEGOTIATION':
        return { label: 'Under Negotiation', bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'APPROVAL_REQUIRED':
        return { label: 'Approval Required', bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
      case 'REVISED':
        return { label: 'Revised Quotation', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'APPROVED':
        return { label: 'Approved Terms', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'REJECTED':
        return { label: 'Rejected Terms', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      default:
        return { label: status, bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
          Negotiations & Counter Offers
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Track active discussions, discount counter offers, and management review states with your account team.
        </p>
      </div>

      {negotiations.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#f8fafc',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <MessageSquare size={24} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
            No Active Negotiations
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 20px' }}>
            When you propose counter offers, request quantity changes, or ask questions on quotation line items, they will be tracked here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/customer/quotations')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Review Quotations
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {negotiations.map(q => {
            const id = q.quotationNumber || q.id;
            const badge = getStatusBadge(q.status);
            const s = normalize(q.status);

            let actionText = 'Continue Negotiation';
            let actionRoute = `/customer/quotations/${id}`;
            let actionBtnStyle = { background: '#2563eb', color: '#ffffff' };

            let lastCustomerReq = `Requested adjustment: ${q.requestedDiscount || (q.discount || 10) + 5}% discount`;
            let salesResponse = q.notes || 'Counter offer undergoing commercial and pricing governance check.';

            if (s === 'REJECTED') {
              actionText = 'View Reason & Renegotiate';
              actionRoute = `/customer/quotations/${id}/reject`;
              actionBtnStyle = { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
              lastCustomerReq = `Customer requested ${q.requestedDiscount || 20}% discount`;
              salesResponse = q.rejectionReason || 'The requested discount exceeds maximum approved allowance for this customer tier.';
            } else if (s === 'APPROVED') {
              actionText = 'Review & Confirm Terms';
              actionRoute = `/customer/quotations/${id}`;
              actionBtnStyle = { background: '#16a34a', color: '#ffffff' };
              lastCustomerReq = `Customer requested ${q.approvedDiscount || 15}% discount`;
              salesResponse = `Manager approved ${q.approvedDiscount || 15}% discount. Ready for customer confirmation.`;
            } else if (s === 'REVISED') {
              actionText = 'Review Revision';
              actionRoute = `/customer/quotations/${id}`;
              actionBtnStyle = { background: '#7c3aed', color: '#ffffff' };
              lastCustomerReq = 'Customer requested quantity increase to 12 units and pricing review';
              salesResponse = 'Sales revised quotation: 12 units granted with 14% discount.';
            }

            return (
              <div
                key={id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                      {id}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1e293b', margin: '0 0 14px 0' }}>
                    {q.title || 'Enterprise Commercial Bundle'}
                  </h3>

                  {/* Customer Request Block */}
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Last Customer Request
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 600 }}>
                      {lastCustomerReq}
                    </div>
                  </div>

                  {/* Sales Response Block */}
                  <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Sales Team Response
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#166534' }}>
                      "{salesResponse}"
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b', marginBottom: '16px' }}>
                    <span>Quotation Total: <strong>{formatCurrency(q.total)}</strong></span>
                    <span>Valid until: {formatDate(q.validUntil)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(actionRoute)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    ...actionBtnStyle
                  }}
                >
                  <span>{actionText}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
