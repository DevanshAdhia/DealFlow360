import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  XCircle,
  ArrowLeft,
  AlertOctagon,
  RefreshCw,
  MessageSquare,
  Package,
  CreditCard,
  Send,
  HelpCircle,
  FileText,
  ChevronRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency } from '../utils/formatters.js';

export const CustomerQuotationReject = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { currentCustomer } = useCustomer();
  const { getQuotationById, requestNegotiation } = useQuotations();
  const { success, info } = useToast();

  const quotation = useMemo(() => {
    return getQuotationById(quotationId);
  }, [quotationId, getQuotationById]);

  // Renegotiation state
  const [changeType, setChangeType] = useState('Counter Discount');
  const [requestedValue, setRequestedValue] = useState('14%');
  const [reason, setReason] = useState('We would like to proceed with a 14% discount which conforms with the maximum tier allowance.');
  const [showRenegotiateForm, setShowRenegotiateForm] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [salesQuestion, setSalesQuestion] = useState('');

  if (!quotation) {
    return (
      <div className="content-wrapper" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ background: '#fee2e2', color: '#dc2626', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertOctagon size={24} />
        </div>
        <h2>Quotation Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>The specified quotation could not be found or you do not have permission to access it.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/customer/quotations')}>
          Return to My Quotations
        </button>
      </div>
    );
  }

  const requestedDisc = quotation.requestedDiscount || 20;
  const maxApprovedDisc = quotation.maxApprovedDiscount || 15;
  const difference = requestedDisc - maxApprovedDisc;

  const handleSubmitNewRequest = (e) => {
    e.preventDefault();
    try {
      requestNegotiation({
        quotationId: quotation.id,
        changeType,
        requestedValue,
        reason
      });
      success('Renegotiation request submitted! Status changed to Under Negotiation.');
      navigate(`/customer/quotations/${quotation.id}`);
    } catch (err) {
      // Fallback
      navigate(`/customer/quotations/${quotation.id}`);
    }
  };

  const handleSendSalesMessage = (e) => {
    e.preventDefault();
    if (!salesQuestion.trim()) return;
    info('Message transmitted to Sarah Wilson. You will receive a response shortly.');
    setContactSalesOpen(false);
    setSalesQuestion('');
  };

  return (
    <div className="content-wrapper" style={{ width: '100%', boxSizing: 'border-box', paddingBottom: '60px' }}>
      {/* Navigation breadcrumb */}
      <button
        type="button"
        onClick={() => navigate(`/customer/quotations/${quotation.id}`)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: '#2563eb',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginBottom: '20px'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Quotation {quotation.quotationNumber || quotation.id}</span>
      </button>

      {/* Main Rejection Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #fecaca',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.05)',
        marginBottom: '28px'
      }}>
        <div style={{
          background: '#fef2f2',
          borderBottom: '1px solid #fee2e2',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '18px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#ef4444',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <XCircle size={26} />
          </div>
          <div>
            <div style={{ display: 'inline-block', background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              REJECTED PROPOSAL
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b', margin: '0 0 6px 0' }}>
              Request Could Not Be Approved
            </h1>
            <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.9375rem' }}>
              The commercial terms submitted for <strong>Quotation {quotation.quotationNumber || quotation.id} ({quotation.title || 'Hardware Package'})</strong> were evaluated and could not be authorized under current corporate guidelines.
            </p>
          </div>
        </div>

        {/* Detailed Reason & Comparison Breakdown */}
        <div style={{ padding: '28px 32px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
            Commercial Governance Feedback
          </h3>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #ef4444',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            fontSize: '0.9375rem',
            color: '#334155',
            lineHeight: 1.6
          }}>
            <strong>Official Reason: </strong>
            "{quotation.rejectionReason || 'The requested 20% discount exceeds the maximum approved discount for this customer tier.'}"
          </div>

          {/* Diff Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 20px'
            }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Your Requested Discount
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>
                {requestedDisc}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Exceeded policy limits
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 20px'
            }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Maximum Approved
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>
                {maxApprovedDisc}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Authorized for {currentCustomer?.tier || 'Gold'} Tier
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 20px'
            }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Variance Gap
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>
                +{difference}%
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Reduction required to proceed
              </div>
            </div>
          </div>

          {/* Clear Next Actions */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Recommended Next Actions
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 20px 0' }}>
              A rejected counter-offer does not conclude your purchase. You can renegotiate with viable parameters or discuss customized structuring with your sales director.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowRenegotiateForm(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                }}
              >
                <RefreshCw size={18} />
                <span>Negotiate Again</span>
              </button>

              <button
                type="button"
                onClick={() => { setShowRenegotiateForm(true); setChangeType('Quantity'); setRequestedValue('4 Units'); setReason('Increase quantity to qualify for preferred tier pricing.'); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Package size={16} />
                <span>Request Quantity Change</span>
              </button>

              <button
                type="button"
                onClick={() => setContactSalesOpen(v => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={16} />
                <span>Ask Sales Team</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/customer/quotations')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '9px',
                  padding: '12px 20px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <span>Close Negotiation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ask Sales Team Drawer/Box */}
      {contactSalesOpen && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #cbd5e1',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
            Consult with Account Executive (Sarah Wilson)
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: '#64748b' }}>
            Ask a question regarding what alternative structures or multi-year terms might allow higher discounts.
          </p>
          <form onSubmit={handleSendSalesMessage}>
            <textarea
              rows={3}
              value={salesQuestion}
              onChange={(e) => setSalesQuestion(e.target.value)}
              placeholder="What alternative terms or contract duration would enable our requested discount?"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                marginBottom: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setContactSalesOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Send size={15} />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interactive Renegotiation Form */}
      {showRenegotiateForm && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #3b82f6',
          padding: '28px 32px',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <RefreshCw size={20} color="#2563eb" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              What would you like to change?
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 20px 0' }}>
            Choose which commercial dimension you want to adjust to restart negotiation.
          </p>

          <form onSubmit={handleSubmitNewRequest}>
            {/* Change Type Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
              {['Counter Discount', 'Quantity', 'Product', 'Payment Terms', 'Other'].map(type => {
                const selected = changeType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setChangeType(type);
                      if (type === 'Counter Discount') {
                        setRequestedValue(`${maxApprovedDisc}%`);
                        setReason(`Adjusting requested discount to ${maxApprovedDisc}% to fit policy thresholds.`);
                      } else if (type === 'Quantity') {
                        setRequestedValue('12 Units');
                        setReason('Increasing volume to qualify for higher discount threshold.');
                      } else if (type === 'Payment Terms') {
                        setRequestedValue('Net 60');
                        setReason('Requesting Net 60 payment terms.');
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: selected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: selected ? '#eff6ff' : '#ffffff',
                      color: selected ? '#1d4ed8' : '#334155',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Requested Value */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Your Proposed Value / Adjustment:
              </label>
              <input
                type="text"
                value={requestedValue}
                onChange={(e) => setRequestedValue(e.target.value)}
                placeholder="e.g. 15% discount or 12 units"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            {/* Reason */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Reason & Business Justification:
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this revised proposal works for both organizations..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRenegotiateForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Send size={15} />
                <span>Submit New Request (Status → Under Negotiation)</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
