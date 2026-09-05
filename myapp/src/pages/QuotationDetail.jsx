import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Archive, 
  Download, 
  Edit3, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Building, 
  User, 
  Mail, 
  DollarSign, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  FileEdit,
  Activity,
  Code,
  Layers,
  Package,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Plus,
  Send,
  Truck,
  Trash2
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { formatINR } from '../utils/formatters.js';
import { Button, Badge } from '../components/common/UI.jsx';
import { dataService } from '../services/dataService.js';
import { getRecommendationsForCart } from '../data/recommendations.js';

export const QuotationDetail = () => {
  const { id, quotationId } = useParams();
  const targetId = quotationId || id;
  const navigate = useNavigate();
  const { 
    getQuotationById, 
    updateQuotation, 
    duplicateQuotation, 
    archiveQuotation, 
    restoreQuotation, 
    moveQuotationStage,
    deleteQuotation
  } = useQuotations();
  const { getApprovalByQuotationId, submitForApproval, getApprovalStatus } = useApprovals();
  const { getFulfillmentByQuotationId, createFulfillment } = useFulfillment();
  const { success, error, info } = useToast();

  const quote = getQuotationById(targetId);
  const latestApproval = quote ? getApprovalByQuotationId(quote.quotationNumber || quote.id) : null;
  const fulfillment = quote ? getFulfillmentByQuotationId(quote.quotationNumber || quote.id) : null;

  // JSON Inspector Modal state
  
  // Negotiation Counter Modal / Input state
  const [counterDiscount, setCounterDiscount] = useState(quote?.negotiationDetails?.requestedDiscount || 10);
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);

  if (!quote) {
    return (
      <div className="quotations-page-container">
        <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', maxWidth: '500px', margin: '3rem auto' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <ShieldAlert size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Quotation Not Found</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            The quotation with ID "{targetId}" does not exist or has been permanently removed.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/sales/quotations')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
          >
            <ArrowLeft size={16} />
            Back to Quotations List
          </button>
        </div>
      </div>
    );
  }

  const customerTier = dataService.getCustomerTierById(quote.customerTierId);

  // Recommendations calculated in real-time based on cart items
  const recommendations = getRecommendationsForCart(quote.items || [], dataService.getProducts());

  const handleDuplicate = () => {
    const duplicated = duplicateQuotation(quote.id);
    if (duplicated) {
      success('Quotation Cloned', `Created draft ${duplicated.quotationNumber || duplicated.id} from ${quote.quotationNumber || quote.id}.`);
      navigate(`/quotations/${duplicated.quotationNumber || duplicated.id}`);
    }
  };

  const handleArchive = () => {
    archiveQuotation(quote.id);
    info('Quotation Archived', `${quote.quotationNumber || quote.id} has been moved to archive.`);
    navigate('/quotations');
  };

  const handleRestore = () => {
    restoreQuotation(quote.id);
    success('Quotation Restored', `${quote.quotationNumber || quote.id} restored to active pipeline.`);
  };

  const handleSubmitForApproval = () => {
    if (quote.stage === 'pending_approval') {
      info('Already Submitted', 'This quotation is already pending approval.');
      return;
    }
    const { isRequired, steps, triggeredRules } = submitForApproval(quote, customerTier);
    if (!isRequired) {
      // No approval needed — move directly to approved
      moveQuotationStage(quote.id, 'approved');
      success('Auto-Approved ✓', 'No approval required. Quotation marked as Approved.');
    } else {
      moveQuotationStage(quote.id, 'pending_approval');
      success(
        'Submitted for Approval',
        `${quote.quotationNumber} requires ${steps.length}-step approval. Routed to ${steps[0]?.approverTitle || 'manager'}.`
      );
      navigate('/approvals');
    }
  };

  const handleMoveStage = (newStage) => {
    const res = moveQuotationStage(quote.id, newStage);
    if (res && res.success) {
      success('Stage Transitioned', `Quotation moved to ${newStage.replace('_', ' ').toUpperCase()}.`);
    } else if (res && res.error) {
      error('Stage Blocked', res.error);
    }
  };

  const handleAddRecommendation = (rec) => {
    const prod = rec.product;
    const unitPrice = dataService.getProductPriceInTier(prod.id, prod.unitPrice, customerTier.id);

    const newItem = {
      id: `QI-${Date.now()}`,
      productId: prod.id,
      name: prod.name,
      category: prod.category,
      description: prod.description,
      quantity: 1,
      unitPrice,
      costPrice: prod.costPrice,
      gstRate: 18
    };

    const updatedItems = [...(quote.items || []), newItem];
    updateQuotation(quote.id, {
      items: updatedItems,
      activityNote: `Added recommended upsell: ${prod.name}`
    });

    success('Item Added to Quotation', `${prod.name} added with tier discount.`);
  };

  const handleAcceptNegotiation = () => {
    const reqDiscount = quote.negotiationDetails?.requestedDiscount || quote.discount;
    updateQuotation(quote.id, {
      discount: reqDiscount,
      stage: 'confirmed',
      negotiationDetails: {
        ...quote.negotiationDetails,
        hasActiveNegotiation: false,
        status: 'ACCEPTED_AND_CLOSED'
      },
      activityNote: `Accepted customer counter-offer at ${reqDiscount}% discount. Deal confirmed.`
    });
    success('Negotiation Accepted', `Applied ${reqDiscount}% concession. Deal marked as Confirmed!`);
  };

  const handleSendCounterOffer = () => {
    updateQuotation(quote.id, {
      discount: counterDiscount,
      stage: 'negotiation',
      negotiationDetails: {
        ...quote.negotiationDetails,
        lastCounterOfferDate: new Date().toISOString(),
        status: 'COUNTER_OFFER_SENT_TO_CUSTOMER'
      },
      activityNote: `Sales rep countered with revised ${counterDiscount}% discount.`
    });
    setIsNegotiationOpen(false);
    success('Counter-Offer Dispatched', `Revised offer of ${counterDiscount}% sent to customer.`);
  };

  const stages = [
    { id: 'draft', label: 'Draft' },
    { id: 'pending_approval', label: 'Pending Approval' },
    { id: 'approved', label: 'Approved' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'confirmed', label: 'Confirmed' },
  ];
  // For returned/rejected, handle separately
  const currentStageIndex = stages.findIndex(s => s.id === quote.stage);
  const isReturnedOrRejected = quote.stage === 'returned_for_revision' || quote.stage === 'rejected';

  return (
    <div className="quotations-page-container">
      {/* 1. Header Toolbar */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <button
            onClick={() => navigate('/quotations')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '0.5rem'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Commercial Quotations</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '1.35rem',
              fontWeight: '900',
              color: 'var(--primary)',
              backgroundColor: 'var(--primary-light)',
              padding: '2px 10px',
              borderRadius: 'var(--radius-md)'
            }}>
              {quote.quotationNumber || quote.id}
            </span>

            <span style={{
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-secondary)',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              ID: {quote.id}
            </span>

            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: customerTier.badgeBg,
              color: customerTier.badgeColor
            }}>
              {customerTier.name}
            </span>

            <Badge variant={quote.stage === 'confirmed' ? 'success' : quote.stage === 'negotiation' ? 'info' : quote.stage === 'pending_approval' ? 'warning' : 'neutral'}>
              {quote.status || quote.stage}
            </Badge>

            <Badge variant={quote.health === 'Healthy' ? 'success' : quote.health === 'Critical' ? 'danger' : 'warning'}>
              {quote.health}
            </Badge>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Account: <strong>{quote.customerName}</strong> ({quote.customerCode}) • Sales Rep: <strong>{quote.salesRepName}</strong> • Updated: {new Date(quote.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Prominent Live JSON Inspector Button */}
          

          {/* Direct Download Quotation Button */}
          <button
            onClick={() => {
              const dataStr = JSON.stringify(quote, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `quotation_${quote.quotationNumber || quote.id}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              success('Quotation Downloaded', `Saved quotation_${quote.quotationNumber || quote.id}.json`);
            }}
            className="btn"
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: '600',
              fontSize: '0.8125rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            <span>Download JSON</span>
          </button>

          <Button
            variant="secondary"
            icon={FileEdit}
            onClick={() => navigate(`/quotations/${quote.quotationNumber || quote.id}/builder`)}
          >
            Edit in CPQ Builder
          </Button>

          <Button
            variant="secondary"
            icon={Copy}
            onClick={handleDuplicate}
          >
            Clone
          </Button>

          {quote.isArchived ? (
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={handleRestore}
            >
              Restore
            </Button>
          ) : (
            <Button
              variant="secondary"
              icon={Archive}
              onClick={handleArchive}
            >
              Archive
            </Button>
          )}

          {/* Delete Quotation */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to permanently delete quotation ${quote.quotationNumber || quote.id}?`)) {
                deleteQuotation(quote.id);
                success('Quotation Deleted', `Successfully deleted ${quote.quotationNumber || quote.id}.`);
                navigate('/sales/quotations');
              }
            }}
            className="btn"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
              fontSize: '0.8125rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
          {/* Submit for Approval button (shown for draft or returned) */}
          {(quote.stage === 'draft' || quote.stage === 'returned_for_revision') && !quote.isArchived && (
            <button
              onClick={handleSubmitForApproval}
              className="btn"
              style={{
                backgroundColor: '#D97706', color: '#FFF',
                border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontWeight: 700, fontSize: '0.8125rem',
                padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer'
              }}
            >
              <Send size={15} />
              <span>Submit for Approval</span>
            </button>
          )}
          {/* View Approval button (shown for pending/approved/returned/rejected) */}
          {['pending_approval', 'approved', 'returned_for_revision', 'rejected'].includes(quote.stage) && (
            <button
              onClick={() => navigate(`/approvals/${quote.id}`)}
              className="btn"
              style={{
                backgroundColor: 'rgba(79,70,229,0.08)', color: '#4F46E5',
                border: '1px solid rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontWeight: 700, fontSize: '0.8125rem',
                padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer'
              }}
            >
              <ShieldCheck size={15} />
              <span>View Approval</span>
            </button>
          )}
          {/* Fulfillment integration: Only approved/confirmed quotations enter fulfillment */}
          {['approved', 'confirmed'].includes(quote.stage) && (
            <button
              onClick={() => {
                if (!fulfillment && createFulfillment) {
                  createFulfillment(quote);
                }
                const foId = fulfillment?.orderId || `SO-${quote.id.replace('QID-', '').padStart(4, '0')}`;
                navigate(`/fulfillment/${foId}`);
              }}
              className="btn"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--color-success)',
                border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontWeight: 700, fontSize: '0.8125rem',
                padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer'
              }}
            >
              <Truck size={15} />
              <span>View in Fulfillment</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Stage Progress Stepper */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {stages.map((stg, idx) => {
            const isPassed = idx < currentStageIndex;
            const isActive = idx === currentStageIndex;

            return (
              <React.Fragment key={stg.id}>
                <div 
                  onClick={() => !quote.isArchived && handleMoveStage(stg.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: !quote.isArchived ? 'pointer' : 'default',
                    color: isActive ? 'var(--primary)' : isPassed ? 'var(--success)' : 'var(--text-secondary)'
                  }}
                  title={`Click to transition stage to ${stg.label}`}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'var(--primary)' : isPassed ? 'var(--success-bg)' : 'var(--surface-secondary)',
                    color: isActive ? '#FFFFFF' : isPassed ? 'var(--success-text)' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <span style={{ fontWeight: isActive ? '800' : '600', fontSize: '0.8125rem' }}>
                    {stg.label}
                  </span>
                </div>

                {idx < stages.length - 1 && (
                  <div style={{ flex: 1, height: '2px', backgroundColor: isPassed ? 'var(--success)' : 'var(--border)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Main Quotation Grid: Left = Commercial Specs, Right = 5 Key Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem' }}>
        {/* Left Column: Commercial Summary, Items Table, Activity Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Account & Commercial Terms Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} color="var(--primary)" />
                <span>Commercial Account Terms</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Currency: <strong>{quote.currency || 'INR'}</strong>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Customer Company</span>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{quote.customerName}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Contact Person</span>
                <div style={{ fontWeight: '600' }}>{quote.contactPerson}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                <div style={{ color: 'var(--primary)' }}>{quote.contactEmail}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Terms</span>
                <div style={{ fontWeight: '700' }}>{quote.paymentTerms || 'Net 30'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Validity Until</span>
                <div style={{ fontWeight: '600' }}>{quote.validUntil || '30 Days'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Customer Tier</span>
                <div style={{ fontWeight: '700', color: customerTier.badgeColor }}>{customerTier.name}</div>
              </div>
            </div>
          </div>

          {/* Line Items Table with Margin & Cost Visibility */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>
                  Quotation Line Items ({quote.items?.length || 0})
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Pricing bound to price list {customerTier.priceListId}
                </span>
              </div>

              <Button
                variant="secondary"
                icon={Plus}
                onClick={() => navigate(`/quotations/${quote.quotationNumber || quote.id}/builder`)}
              >
                Configure Items
              </Button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Item Description</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Line Subtotal</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {(quote.items || []).map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{item.category}</div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                        {formatINR(item.unitPrice)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {formatINR(item.subtotal || (item.quantity * item.unitPrice))}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: (item.margin || 40) < 25 ? '#EF4444' : '#059669',
                          backgroundColor: (item.margin || 40) < 25 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {item.margin || 40}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Breakdown */}
            <div style={{
              marginTop: '1.25rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.8125rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Line Items Subtotal:</span>
                <span style={{ fontWeight: '600' }}>{formatINR(quote.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: quote.discount > 0 ? '#DC2626' : 'inherit' }}>
                <span>Quotation Discount ({quote.discount}%):</span>
                <span style={{ fontWeight: '700' }}>-{formatINR(quote.discountAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Taxable Contract Value:</span>
                <span style={{ fontWeight: '600' }}>{formatINR(quote.taxableAmount || (quote.subtotal - quote.discountAmount))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>GST (18%):</span>
                <span style={{ fontWeight: '600' }}>+{formatINR(quote.tax)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '2px solid var(--border)',
                paddingTop: '0.5rem',
                fontSize: '1.15rem',
                fontWeight: '900',
                color: 'var(--text-primary)'
              }}>
                <span>Total Committed Value:</span>
                <span style={{ color: 'var(--primary)' }}>{formatINR(quote.total)}</span>
              </div>

              <div style={{
                marginTop: '0.5rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gross Profit / Margin:</span>
                <span style={{ fontWeight: '800', color: (quote.margin || 35) < 25 ? '#EF4444' : '#059669' }}>
                  {formatINR(quote.grossProfit || (quote.total - (quote.totalCost || quote.total * 0.6)))} ({quote.margin || 35}% Margin)
                </span>
              </div>
            </div>
          </div>

          {/* Activity Audit Trail */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} color="var(--primary)" />
              <span>Quotation Activity & Audit Log</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(quote.activity || []).map((act, i) => (
                <div key={act.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.8125rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '6px' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{act.event}</span>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                      By {act.user} • {act.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 5 Crucial Panels (Approval, Upsell, Negotiation, Fulfillment, Subscription) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* AREA 6: APPROVAL STATUS */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                  Approval Governance Status
                </h3>
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: quote.approvalStatus === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : quote.approvalStatus === 'NOT_REQUIRED' ? 'rgba(100, 116, 139, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: quote.approvalStatus === 'APPROVED' ? '#059669' : quote.approvalStatus === 'NOT_REQUIRED' ? '#64748B' : '#D97706'
              }}>
                {quote.approvalStatus || 'NOT_REQUIRED'}
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>
                Threshold Check: <strong>{quote.discount}% discount vs {customerTier.maxRepDiscount}% tier max</strong>
              </div>
              <div>
                Margin Check: <strong>{quote.margin}% vs 25% minimum hurdle</strong>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '6px', backgroundColor: 'var(--surface-secondary)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
                {quote.approvalDetails?.reason || 'Within representative authority.'}
              </div>
            </div>
          </div>

          {/* AREA 7: UPSELL & CROSS-SELL PANEL */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="#4F46E5" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                  Upsell & Cross-Sell Opportunities
                </h3>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--primary)' }}>
                {recommendations.length} Suggestions
              </span>
            </div>

            {recommendations.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                All recommended package upgrades and complementary modules are already attached to this quote.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {recommendations.map(rec => (
                  <div key={rec.id} style={{
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {rec.title}
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#059669' }}>
                        {rec.priceImpact}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {rec.reason}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                      <button
                        onClick={() => handleAddRecommendation(rec)}
                        className="btn"
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '3px 8px',
                          fontSize: '0.6875rem',
                          fontWeight: '700',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Plus size={12} />
                        <span>Add to Quote</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AREA 8: CUSTOMER NEGOTIATION VISIBILITY */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={16} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                  Customer Negotiation Visibility
                </h3>
              </div>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: quote.negotiationDetails?.hasActiveNegotiation ? 'rgba(59, 130, 246, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                color: quote.negotiationDetails?.hasActiveNegotiation ? '#2563EB' : '#64748B'
              }}>
                {quote.negotiationDetails?.status || 'INACTIVE'}
              </span>
            </div>

            {quote.negotiationDetails?.hasActiveNegotiation ? (
              <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <div style={{ fontWeight: '700', color: '#1E40AF', marginBottom: '2px' }}>
                    Customer Counter-Offer: {quote.negotiationDetails.requestedDiscount}% Discount
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Target Total: <strong>{formatINR(quote.negotiationDetails.customerTargetTotal || 1950000)}</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                    "{quote.negotiationDetails.customerNotes}"
                  </p>
                </div>

                {/* Counter Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                  <button
                    onClick={handleAcceptNegotiation}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', fontWeight: '700' }}
                  >
                    Accept Counter
                  </button>

                  <button
                    onClick={() => setIsNegotiationOpen(true)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', fontWeight: '700' }}
                  >
                    Counter-Offer
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                No active counter-offers from customer. Commercial proposal is under standard review.
              </p>
            )}
          </div>

          {/* AREA 9: FULFILLMENT SUMMARY VISIBILITY */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={16} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                  Fulfillment & Warehouse Summary
                </h3>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#059669' }}>
                {quote.fulfillmentDetails?.status || 'READY_TO_ALLOCATE'}
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>
                Assigned Hub: <strong>{quote.fulfillmentDetails?.warehouseName || 'Mumbai Central Fulfillment'}</strong>
              </div>
              <div>
                Order Reference: <strong>{quote.fulfillmentDetails?.fulfillmentOrderId || 'FO-501'}</strong>
              </div>
              <div>
                Reserved Inventory: <strong>{quote.fulfillmentDetails?.reservedItemsCount || quote.items?.length || 2} Packages</strong>
              </div>
              <div>
                Estimated Dispatch: <strong>{quote.fulfillmentDetails?.estimatedShipDays || 3} Business Days</strong>
              </div>
            </div>
          </div>

          {/* AREA 10: SUBSCRIPTION & BILLING SUMMARY */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={16} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                  Subscription & Billing Schedule
                </h3>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--primary)' }}>
                {quote.subscriptionDetails?.billingCycle || 'Annual'} Contract
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div>
                Duration: <strong>{quote.subscriptionDetails?.contractDurationMonths || 12} Months Commitment</strong>
              </div>
              <div>
                ARR Impact: <strong style={{ color: 'var(--text-primary)' }}>{formatINR(quote.subscriptionDetails?.annualRecurringRevenue || quote.total)}</strong>
              </div>
              <div>
                MRR Equivalent: <strong>{formatINR(quote.subscriptionDetails?.monthlyRecurringRevenue || Math.round(quote.total / 12))}</strong>
              </div>
              <div>
                Auto-Renew Clause: <strong>{quote.subscriptionDetails?.autoRenew ? 'Active (Annual SLA)' : 'Manual Renewal'}</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Live JSON Inspector Modal */}
      

      {/* 5. Negotiation Counter-Offer Mini Modal */}
      {isNegotiationOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Submit Revised Counter-Offer
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Enter negotiated discount percentage to counter the customer's request.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Counter Discount (%)</label>
              <input
                type="number"
                min="0"
                max={customerTier.maxRepDiscount}
                value={counterDiscount}
                onChange={(e) => setCounterDiscount(Number(e.target.value))}
                className="input"
                style={{ width: '100%', marginTop: '4px' }}
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                Tier max without approval: {customerTier.maxRepDiscount}%
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setIsNegotiationOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSendCounterOffer}
                className="btn btn-primary"
              >
                Dispatch Counter-Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
