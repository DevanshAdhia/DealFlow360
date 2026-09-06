import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Building2,
  MessageSquare,
  Sparkles,
  Send,
  HelpCircle,
  Package,
  CreditCard,
  Percent,
  Check,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';

const normalize = (s) => (s || '').toUpperCase().replace(/\s+/g, '_');

export const CustomerQuotationDetail = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { currentCustomer } = useCustomer();
  const {
    getQuotationById,
    getQuotationItemsForQuote,
    getNegotiationsForQuote,
    getCommentsForQuote,
    acceptQuote,
    requestNegotiation,
    submitCustomerCounterRequest,
    addComment,
    updateQuotation
  } = useQuotations();
  const { success, error, info } = useToast();

  // Local interactive overrides for seamless Hackathon demo execution
  const [localStatus, setLocalStatus] = useState(null);
  const [localDiscount, setLocalDiscount] = useState(null);
  const [localTimeline, setLocalTimeline] = useState([]);

  // Modals & Panels
  const [counterDiscountOpen, setCounterDiscountOpen] = useState(false);
  const [counterDiscountVal, setCounterDiscountVal] = useState(18);
  const [counterReason, setCounterReason] = useState('We are increasing our order volume and request preferred commercial pricing.');

  const [lineQuestionModal, setLineQuestionModal] = useState(null);
  const [lineQuestionText, setLineQuestionText] = useState('');

  const [lineChangeModal, setLineChangeModal] = useState(null);
  const [lineChangeQty, setLineChangeQty] = useState(12);
  const [lineChangeReason, setLineChangeReason] = useState('Please increase the quantity to 12 units for our regional team.');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const quotation = useMemo(() => {
    return getQuotationById(quotationId);
  }, [quotationId, getQuotationById]);

  if (!quotation) {
    return (
      <div className="content-wrapper" style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Quotation Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          The requested quotation could not be located or belongs to another organization.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/customer/quotations')}>
          Return to My Quotations
        </button>
      </div>
    );
  }

  const initialItems = useMemo(() => {
    if (!quotation) return [];
    if (typeof getQuotationItemsForQuote === 'function') {
      const items = getQuotationItemsForQuote(quotation.id);
      if (Array.isArray(items) && items.length > 0) return items;
    }
    return Array.isArray(quotation.items) && quotation.items.length > 0 ? quotation.items : [
      { id: '1', productName: 'Dell PowerEdge R750 Server', sku: 'HW-SRV-750', unitPrice: 180000, quantity: 1, total: 180000 },
      { id: '2', productName: 'Enterprise Cloud License 1-Yr', sku: 'SW-CLD-ENT', unitPrice: 100000, quantity: 1, total: 100000 }
    ];
  }, [quotation, getQuotationItemsForQuote]);

  const [localItems, setLocalItems] = useState(null);
  const lineItems = localItems || initialItems;

  // Active status (considering local simulation)
  const currentStatus = localStatus || quotation.status;
  const s = normalize(currentStatus);

  // Financial calculations
  const subtotal = useMemo(() => {
    if (localItems && localItems.length > 0) {
      return localItems.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
    }
    return quotation.subtotal || 280000;
  }, [localItems, quotation.subtotal]);

  const activeDiscountRate = localDiscount != null ? localDiscount : (quotation.discount || 10);
  const discountAmount = (subtotal * activeDiscountRate) / 100;
  const shipping = quotation.shipping || 0;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.18;
  const grandTotal = taxableAmount + tax + shipping;

  // Counter offer dynamic calculation
  const counterDiscountAmount = (subtotal * counterDiscountVal) / 100;
  const counterTaxable = subtotal - counterDiscountAmount;
  const counterGrandTotal = counterTaxable + (counterTaxable * 0.18) + shipping;
  const counterSavings = grandTotal - counterGrandTotal;

  // Status Flow Progress Steps
  const isRejectedFlow = s === 'REJECTED';
  const steps = isRejectedFlow
    ? [
        { key: 'SENT', label: 'Sent' },
        { key: 'UNDER_NEGOTIATION', label: 'Under Negotiation' },
        { key: 'APPROVAL_REQUIRED', label: 'Approval Required' },
        { key: 'REJECTED', label: 'Rejected' },
        { key: 'RENEGOTIATE', label: 'Negotiation Available' }
      ]
    : [
        { key: 'SENT', label: 'Sent' },
        { key: 'UNDER_NEGOTIATION', label: 'Under Negotiation' },
        { key: 'APPROVAL_REQUIRED', label: 'Approval Required' },
        { key: 'APPROVED', label: 'Approved' },
        { key: 'CONFIRMED', label: 'Confirmed' }
      ];

  const getStepIndex = (statusKey) => {
    if (statusKey === 'SENT' || statusKey === 'NEW') return 0;
    if (statusKey === 'UNDER_NEGOTIATION') return 1;
    if (statusKey === 'APPROVAL_REQUIRED') return 2;
    if (statusKey === 'APPROVED' || statusKey === 'REVISED') return 3;
    if (statusKey === 'REJECTED') return 3;
    if (statusKey === 'CONFIRMED') return 4;
    return 0;
  };

  const currentStepIndex = getStepIndex(s);

  // Handlers
  const handleCounterSubmit = (e) => {
    e.preventDefault();
    setCounterDiscountOpen(false);

    // Business rule: If counter discount > 15%, automatically requires manager approval!
    if (counterDiscountVal > 15) {
      setLocalStatus('APPROVAL_REQUIRED');
      setLocalDiscount(counterDiscountVal);
      if (updateQuotation) {
        updateQuotation(quotation.id, { status: 'APPROVAL_REQUIRED', discount: counterDiscountVal });
      }
      info(`Proposed ${counterDiscountVal}% discount exceeds 15% threshold. Status routed to APPROVAL REQUIRED.`);
    } else {
      setLocalStatus('UNDER_NEGOTIATION');
      setLocalDiscount(counterDiscountVal);
      if (updateQuotation) {
        updateQuotation(quotation.id, { status: 'UNDER_NEGOTIATION', discount: counterDiscountVal });
      }
      success(`Counter offer of ${counterDiscountVal}% submitted. Status changed to UNDER NEGOTIATION.`);
    }
  };

  const handleLineQuestionSubmit = (e) => {
    e.preventDefault();
    if (!lineQuestionText.trim()) return;
    try {
      addComment(quotation.id, `[Item: ${lineQuestionModal.productName}] Question: ${lineQuestionText}`);
    } catch (err) {
      console.warn('Caught fallback for addComment:', err);
    }
    setLocalTimeline(prev => [
      { date: 'Just now', title: 'Customer Question Submitted', desc: `Inquiry on "${lineQuestionModal.productName}": "${lineQuestionText}"`, done: true },
      ...prev
    ]);
    success(`Question regarding "${lineQuestionModal.productName}" sent to sales team.`);
    setLineQuestionModal(null);
    setLineQuestionText('');
  };

  const handleLineChangeSubmit = (e) => {
    e.preventDefault();
    const newQty = parseInt(lineChangeQty, 10) || 1;
    
    const updatedItems = lineItems.map(it => {
      if (it.id === lineChangeModal.id || it.productName === lineChangeModal.productName) {
        const itemDiscount = it.discount != null ? it.discount : activeDiscountRate;
        const newTotal = it.unitPrice * newQty * (1 - itemDiscount / 100);
        return { ...it, quantity: newQty, total: newTotal };
      }
      return it;
    });
    setLocalItems(updatedItems);

    const newSubtotal = updatedItems.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
    const newDiscountAmt = (newSubtotal * activeDiscountRate) / 100;
    const newTaxable = newSubtotal - newDiscountAmt;
    const newTax = newTaxable * 0.18;
    const newGrandTotal = newTaxable + newTax + shipping;

    try {
      requestNegotiation({
        quotationId: quotation.id,
        changeType: 'Quantity Change',
        requestedValue: `${newQty} units of ${lineChangeModal.productName}`,
        reason: lineChangeReason
      });
    } catch (err) {
      console.warn('requestNegotiation fallback caught:', err);
    }
    
    setLocalStatus('UNDER_NEGOTIATION');
    if (updateQuotation) {
      updateQuotation(quotation.id, { 
        status: 'UNDER_NEGOTIATION',
        subtotal: newSubtotal,
        total: newGrandTotal
      });
    }

    setLocalTimeline(prev => [
      {
        date: 'Just now',
        title: `Quantity Change: ${lineChangeModal.productName}`,
        desc: `Updated requested quantity to ${newQty} units. Note: ${lineChangeReason}`,
        done: true
      },
      ...prev
    ]);

    success(`Change request submitted for ${lineChangeModal.productName}. Status changed to UNDER NEGOTIATION.`);
    setLineChangeModal(null);
  };

  const handleConfirmQuotation = () => {
    if (!agreeTerms) {
      error('Please accept the agreement checkbox before confirming.');
      return;
    }
    setLocalStatus('CONFIRMED');
    if (updateQuotation) {
      updateQuotation(quotation.id, { status: 'CONFIRMED', confirmedAt: new Date().toISOString() });
    }
    setConfirmModalOpen(false);
    success('✓ Quotation Confirmed! Order is proceeding to fulfillment and billing.');
  };

  return (
    <div className="content-wrapper" style={{ width: '100%', boxSizing: 'border-box', paddingBottom: '60px' }}>
      {/* ── DEMO CONTROLS BAR (Clean White Theme matching portal UI color) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={14} />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#1e40af' }}>
            Interactive Hackathon Demo Bar:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => { setCounterDiscountOpen(true); setCounterDiscountVal(18); }}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            1. Propose Counter (18%)
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalStatus('APPROVAL_REQUIRED');
              if (updateQuotation) updateQuotation(quotation.id, { status: 'APPROVAL_REQUIRED', discount: 18 });
              info('Status set to APPROVAL REQUIRED');
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#fff7ed', border: '1px solid #fdba74', color: '#c2410c', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            2. Simulate Threshold Exceeded
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalStatus('REJECTED');
              if (updateQuotation) updateQuotation(quotation.id, {
                status: 'REJECTED',
                requestedDiscount: 20,
                maxApprovedDiscount: 15,
                rejectionReason: 'The requested 20% discount exceeds the maximum approved discount for this customer tier.'
              });
              navigate(`/customer/quotations/${quotation.id}/reject`);
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            3. Simulate Rejection
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalStatus('APPROVED');
              setLocalDiscount(15);
              if (updateQuotation) updateQuotation(quotation.id, { status: 'APPROVED', discount: 15, approvedDiscount: 15, savings: 15000 });
              success('Status set to APPROVED (15% discount approved)');
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            4. Simulate Approval
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalStatus('REVISED');
              if (updateQuotation) updateQuotation(quotation.id, {
                status: 'REVISED',
                discount: 14,
                previousTerms: { discount: 10, quantity: 10, subtotal: 330000 },
                revisedTerms: { discount: 14, quantity: 12, subtotal: 310000 }
              });
              success('Status set to REVISED');
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#f5f3ff', border: '1px solid #d8b4fe', color: '#6d28d9', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            5. Simulate Revised
          </button>
          <button
            type="button"
            onClick={() => {
              setLocalStatus(null);
              setLocalDiscount(null);
              setLocalItems(null);
              setLocalTimeline([]);
              if (updateQuotation) updateQuotation(quotation.id, { status: quotation.status || 'SENT' });
              info('Reset to original quote state');
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Top Header & Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => navigate('/customer/quotations')}
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
            marginBottom: '12px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Quotations</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Quote #{quotation.quotationNumber || quotation.id}
              </h1>
              <span style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '20px',
                background: s === 'CONFIRMED' || s === 'APPROVED' ? '#dcfce7' : s === 'REJECTED' ? '#fee2e2' : s === 'APPROVAL_REQUIRED' ? '#ffedd5' : '#eff6ff',
                color: s === 'CONFIRMED' || s === 'APPROVED' ? '#15803d' : s === 'REJECTED' ? '#b91c1c' : s === 'APPROVAL_REQUIRED' ? '#c2410c' : '#1d4ed8',
                border: '1px solid currentColor'
              }}>
                {s.replace(/_/g, ' ')}
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '1rem', fontWeight: 600, color: '#475569' }}>
              {quotation.title || 'Enterprise Commercial Bundle'}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {s !== 'CONFIRMED' && (
              <button
                type="button"
                onClick={() => setCounterDiscountOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: '#ffffff',
                  color: '#2563eb',
                  border: '1.5px solid #2563eb',
                  borderRadius: '9px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Percent size={16} />
                <span>Counter Discount</span>
              </button>
            )}

            {s === 'REJECTED' ? (
              <button
                type="button"
                onClick={() => navigate(`/customer/quotations/${quotation.id}/reject`)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} />
                <span>Negotiate Again</span>
              </button>
            ) : s === 'CONFIRMED' ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#dcfce7',
                color: '#15803d',
                borderRadius: '9px',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                <CheckCircle2 size={18} />
                <span>Quotation Confirmed</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={s === 'APPROVAL_REQUIRED'}
                onClick={() => setConfirmModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  background: s === 'APPROVAL_REQUIRED' ? '#cbd5e1' : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9px',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: s === 'APPROVAL_REQUIRED' ? 'not-allowed' : 'pointer',
                  boxShadow: s === 'APPROVAL_REQUIRED' ? 'none' : '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
                }}
              >
                <CheckCircle2 size={18} />
                <span>Confirm Quotation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── STATUS NOTIFICATION BANNERS ── */}
      {s === 'CONFIRMED' && (
        <div style={{
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#065f46',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={22} color="#059669" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>✓ Quotation Confirmed</div>
            <div style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
              Your quotation has been successfully confirmed. Your order will now proceed to fulfillment and billing.
            </div>
          </div>
        </div>
      )}

      {s === 'APPROVAL_REQUIRED' && (
        <div style={{
          background: '#fff7ed',
          border: '1px solid #ffedd5',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#9a3412',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={22} color="#ea580c" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Approval Required</div>
            <div style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
              Your requested terms require additional approval from the sales director and finance team before acceptance can occur.
            </div>
          </div>
        </div>
      )}

      {s === 'APPROVED' && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#166534',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={22} color="#16a34a" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>✓ Quotation Approved</div>
              <div style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
                Your requested 15% discount has been authorized! Difference: <strong>₹15,000 savings</strong>.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirmModalOpen(true)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            Review & Confirm
          </button>
        </div>
      )}

      {s === 'REJECTED' && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#991b1b',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <XCircle size={22} color="#dc2626" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>✕ Request Rejected</div>
              <div style={{ fontSize: '0.8125rem', marginTop: '2px' }}>
                "{quotation.rejectionReason || 'The requested discount exceeds the maximum approved threshold.'}"
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/customer/quotations/${quotation.id}/reject`)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            View Reason & Negotiate
          </button>
        </div>
      )}

      {/* ── SECTION 9: STATUS FLOW PROGRESS BAR ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '18px', letterSpacing: '0.05em' }}>
          Quotation Governance Progress
        </div>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '30px',
            right: '30px',
            height: '3px',
            background: '#e2e8f0',
            zIndex: 1
          }} />

          {steps.map((step, idx) => {
            const isPassed = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            let circleBg = '#ffffff';
            let circleBorder = '#cbd5e1';
            let circleColor = '#64748b';

            if (isPassed) {
              circleBg = '#2563eb';
              circleBorder = '#2563eb';
              circleColor = '#ffffff';
            } else if (isCurrent) {
              if (s === 'REJECTED') {
                circleBg = '#ef4444';
                circleBorder = '#ef4444';
                circleColor = '#ffffff';
              } else if (s === 'APPROVAL_REQUIRED') {
                circleBg = '#ea580c';
                circleBorder = '#ea580c';
                circleColor = '#ffffff';
              } else if (s === 'CONFIRMED' || s === 'APPROVED') {
                circleBg = '#16a34a';
                circleBorder = '#16a34a';
                circleColor = '#ffffff';
              } else {
                circleBg = '#2563eb';
                circleBorder = '#2563eb';
                circleColor = '#ffffff';
              }
            }

            return (
              <div
                key={step.key}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: circleBg,
                  border: `2px solid ${circleBorder}`,
                  color: circleColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none'
                }}>
                  {isPassed ? <Check size={16} /> : idx + 1}
                </div>
                <span style={{
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#0f172a' : '#64748b',
                  textAlign: 'center'
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2-COLUMN MAIN VIEWPORT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px' }}>
        {/* Left Column: Quotation Details & Items */}
        <div style={{ minWidth: 0 }}>
          {/* Metadata Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Customer</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{currentCustomer?.companyName || 'Acme Corporation'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{currentCustomer?.contactName || 'John Carter'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Prepared By</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{quotation.salesRepName || 'Sarah Wilson'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Senior Commercial Director</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Created Date</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{formatDate(quotation.createdAt)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Valid Until</div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{formatDate(quotation.validUntil)}</div>
              </div>
            </div>
          </div>

          {/* Section 16: Revised Quotation Comparison (if REVISED) */}
          {s === 'REVISED' && quotation.previousTerms && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #ddd6fe',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 2px 4px rgba(124, 58, 237, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                  REVISED QUOTATION
                </span>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  "Sales team has updated your commercial quotation terms."
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#64748b' }}>Parameter</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#64748b' }}>Previous Terms</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#64748b' }}>Revised Terms</th>
                    <th style={{ padding: '10px', textAlign: 'right', color: '#64748b' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>Discount</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>10%</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#16a34a' }}>14%</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Increased</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>Quantity</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>10 Units</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#2563eb' }}>12 Units</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Changed</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', fontWeight: 600 }}>Grand Total</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>₹3,50,460</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(grandTotal)}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Approved</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Line Items Table with Action Buttons (Ask Question & Request Change) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Products & Line Items ({lineItems.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Interactive Line-Level Negotiation Enabled
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Product & Category</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>Qty</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>Unit Price</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#475569' }}>Discount</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>Line Total</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>Line Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{item.category || 'Hardware'}</div>
                      </td>
                      <td style={{ padding: '16px 14px', textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '16px 14px', textAlign: 'right', color: '#475569' }}>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {item.discount || activeDiscountRate}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {formatCurrency(item.total || (item.unitPrice * item.quantity * (1 - (item.discount || activeDiscountRate) / 100)))}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => { setLineQuestionModal(item); setLineQuestionText(''); }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Ask Question
                          </button>
                          <button
                            type="button"
                            onClick={() => { setLineChangeModal(item); setLineChangeQty(item.quantity); }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Request Change
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 13: Negotiation Timeline */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
              Quotation History & Discussion Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                ...localTimeline,
                { date: '04 Sep', title: 'Quotation Sent', desc: 'Commercial proposal sent by Sarah Wilson.', done: true },
                { date: '04 Sep', title: 'Customer Viewed Quotation', desc: 'Opened by John Carter.', done: true },
                { date: '05 Sep', title: 'Commercial Review Initiated', desc: 'Customer requested discount / term evaluation.', done: true },
                { date: '05 Sep', title: 'Sales Team Evaluated Terms', desc: 'Pricing reviewed against customer tier parameters.', done: s !== 'SENT' },
                { date: '06 Sep', title: s === 'REJECTED' ? 'Proposal Rejected' : s === 'CONFIRMED' ? 'Quotation Confirmed' : 'Revised Terms Available', desc: s === 'REJECTED' ? 'Terms exceeded maximum allowance.' : s === 'CONFIRMED' ? 'Order dispatched to fulfillment.' : 'Awaiting customer formal confirmation.', done: s === 'CONFIRMED' || s === 'REJECTED' }
              ].map((ev, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: ev.done ? '#2563eb' : '#e2e8f0',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}>
                    {ev.done ? <Check size={14} /> : idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                      <span style={{ color: '#64748b', marginRight: '8px', fontSize: '0.8125rem' }}>{ev.date}</span>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                      {ev.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quotation Summary Card (Section 10A) */}
        <div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            position: 'sticky',
            top: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: '0 0 18px 0' }}>
              Quotation Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(subtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                <span>Discount ({activeDiscountRate}%)</span>
                <span style={{ fontWeight: 600 }}>-{formatCurrency(discountAmount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Tax (GST 18%)</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(tax)}</span>
              </div>

              {shipping > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Shipping & Handling</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(shipping)}</span>
                </div>
              )}

              <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '16px', marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Grand Total</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Inclusive of all applicable taxes & shipping
                </div>
              </div>
            </div>

            {/* Action Buttons in Summary Card */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {s === 'CONFIRMED' ? (
                <div style={{
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  borderRadius: '9px',
                  padding: '12px',
                  textAlign: 'center',
                  color: '#15803d',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  ✓ Order Locked & Confirmed
                </div>
              ) : s === 'REJECTED' ? (
                <button
                  type="button"
                  onClick={() => navigate(`/customer/quotations/${quotation.id}/reject`)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '9px',
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  View Reason & Renegotiate
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={s === 'APPROVAL_REQUIRED'}
                    onClick={() => setConfirmModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '9px',
                      background: s === 'APPROVAL_REQUIRED' ? '#cbd5e1' : '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      cursor: s === 'APPROVAL_REQUIRED' ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Confirm Quotation
                  </button>

                  <button
                    type="button"
                    onClick={() => setCounterDiscountOpen(true)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '9px',
                      background: '#ffffff',
                      color: '#2563eb',
                      border: '1px solid #2563eb',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Counter Discount
                  </button>
                </>
              )}
            </div>

            {/* Assistance Note */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
              Questions about this quote? Speak directly with <strong>Sarah Wilson</strong> at <a href="mailto:sarah@dealflow360.com" style={{ color: '#2563eb' }}>sarah@dealflow360.com</a>.
            </div>
          </div>
        </div>
      </div>

      {/* ── COUNTER DISCOUNT MODAL / PANEL (Section 12) ── */}
      {counterDiscountOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Propose Counter Discount
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 20px 0' }}>
              Submit an adjusted discount request to your dedicated sales representative.
            </p>

            <form onSubmit={handleCounterSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CURRENT DISCOUNT</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {activeDiscountRate}%
                  </div>
                </div>

                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>REQUESTED DISCOUNT</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                    {counterDiscountVal}%
                  </div>
                </div>
              </div>

              {/* Slider / Input */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                    Adjust Requested Discount Rate:
                  </label>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563eb' }}>{counterDiscountVal}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={counterDiscountVal}
                  onChange={(e) => setCounterDiscountVal(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  <span>5% (Standard)</span>
                  <span style={{ color: '#ea580c', fontWeight: 600 }}>15% (Approval Threshold)</span>
                  <span>25% (Executive)</span>
                </div>
              </div>

              {/* Dynamic expected total */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>Expected Grand Total:</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{formatCurrency(counterGrandTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#16a34a' }}>
                  <span>Projected Savings:</span>
                  <span style={{ fontWeight: 700 }}>-{formatCurrency(counterSavings > 0 ? counterSavings : 0)}</span>
                </div>
              </div>

              {counterDiscountVal > 15 && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '10px 14px', borderRadius: '8px', fontSize: '0.75rem', color: '#c2410c', marginBottom: '16px' }}>
                  <strong>Governance Note:</strong> A discount above 15% will automatically route this quotation into <strong>APPROVAL REQUIRED</strong> status for executive review.
                </div>
              )}

              {/* Reason */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Commercial Justification:
                </label>
                <textarea
                  rows={3}
                  value={counterReason}
                  onChange={(e) => setCounterReason(e.target.value)}
                  placeholder="Explain your volume requirements or timeline..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCounterDiscountOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
                  Submit Counter Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LINE QUESTION MODAL (Section 11) ── */}
      {lineQuestionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Ask Question: {lineQuestionModal.productName}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Submit an item-level inquiry directly to the commercial engineering team.
            </p>
            <form onSubmit={handleLineQuestionSubmit}>
              <textarea
                rows={4}
                value={lineQuestionText}
                onChange={(e) => setLineQuestionText(e.target.value)}
                placeholder="Is installation, on-site setup, or extended warranty included in this line price?"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '16px' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLineQuestionModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Send size={14} />
                  <span>Send Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LINE CHANGE REQUEST MODAL (Section 11) ── */}
      {lineChangeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              Request Change: {lineChangeModal.productName}
            </h3>
            <form onSubmit={handleLineChangeSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Current Quantity</span>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', marginTop: '2px' }}>
                    {lineChangeModal.quantity} units
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
                    Requested Quantity:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lineChangeQty}
                    onChange={(e) => setLineChangeQty(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Reason for Adjustment:
                </label>
                <textarea
                  rows={3}
                  value={lineChangeReason}
                  onChange={(e) => setLineChangeReason(e.target.value)}
                  placeholder="Explain quantity or specification need..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLineChangeModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <span>Submit Change Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CONFIRM QUOTATION MODAL (Section 17) ── */}
      {confirmModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Confirm Quotation?
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 20px 0' }}>
              Please review the final commercial terms before confirming. Once confirmed, this quotation is locked and proceeds immediately to fulfillment.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Quotation Reference:</span>
                <strong style={{ color: '#0f172a' }}>{quotation.quotationNumber || quotation.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Agreed Discount:</span>
                <strong style={{ color: '#16a34a' }}>{activeDiscountRate}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Total Line Items:</span>
                <strong style={{ color: '#0f172a' }}>{lineItems.length} Products</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '1rem' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Final Total:</span>
                <span style={{ fontWeight: 800, color: '#2563eb' }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <input
                type="checkbox"
                id="agreeCheckbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
              />
              <label htmlFor="agreeCheckbox" style={{ fontSize: '0.8125rem', color: '#334155', cursor: 'pointer', lineHeight: 1.4 }}>
                I have reviewed and agree to the commercial terms, delivery schedule, and payment conditions specified in this quotation.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!agreeTerms}
                onClick={handleConfirmQuotation}
                style={{
                  padding: '10px 22px',
                  borderRadius: '9px',
                  background: agreeTerms ? '#16a34a' : '#cbd5e1',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: agreeTerms ? 'pointer' : 'not-allowed'
                }}
              >
                Confirm Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
