import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Building, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles,
  Code,
  Layers,
  Percent,
  Plus,
  Trash2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { useAuth } from '../hooks/useAuth.js';
import { CustomerSelector } from '../components/quotations/CustomerSelector.jsx';
import { dataService } from '../services/dataService.js';
import { formatINR } from '../utils/formatters.js';
import { JsonInspectorModal } from '../components/common/JsonInspectorModal.jsx';
import { calculateQuotationTotals } from '../utils/quotationCalculations.js';

export const CreateQuotation = () => {
  const navigate = useNavigate();
  const { addQuotation } = useQuotations();
  const { success, error, info } = useToast();
  const { user } = useAuth();

  const allProducts = useMemo(() => dataService.getProducts(), []);
  const allCustomers = useMemo(() => dataService.getCustomers(), []);

  // Wizard Step State (1: Customer Selection, 2: Line Items & Pricing, 3: Review & Commit)
  const [currentStep, setCurrentStep] = useState(1);

  // Active Customer & Dynamic Tier
  const [selectedCustomer, setSelectedCustomer] = useState(allCustomers[0]);
  const customerTier = useMemo(() => {
    return dataService.getCustomerTierById(selectedCustomer?.customerTierId);
  }, [selectedCustomer]);

  // Form Fields State
  const [currency, setCurrency] = useState('INR');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState(customerTier?.defaultPaymentTerms || 'Net 30');
  const [notes, setNotes] = useState('Enterprise standard SLA & software deployment terms.');

  // Discount & Tax
  const [discount, setDiscount] = useState(customerTier ? Math.min(8, customerTier.maxRepDiscount) : 5);
  const [taxRate, setTaxRate] = useState(18);

  // Line Items State — initialize with first product with tier-adjusted pricing
  const [items, setItems] = useState(() => {
    const p1 = dataService.getProducts()[0];
    const initialPrice = dataService.getProductPriceInTier(p1.id, p1.unitPrice, allCustomers[0]?.customerTierId);
    return [
      {
        id: `QI-${Date.now()}-1`,
        productId: p1.id,
        name: p1.name,
        category: p1.categoryName || 'Software Subscription',
        description: p1.description,
        quantity: 25,
        unitPrice: initialPrice,
        costPrice: p1.costPrice,
        gstRate: 18,
      }
    ];
  });

  // When customer changes, re-adjust payment terms and notify of tier rules change
  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    const newTier = dataService.getCustomerTierById(cust.customerTierId);
    setPaymentTerms(cust.paymentTerms || newTier.defaultPaymentTerms);
    
    // Auto-align discount if higher than new tier allowance
    if (discount > newTier.maxRepDiscount) {
      setDiscount(newTier.maxRepDiscount);
    }

    // Update existing items to new tier pricing
    setItems(prev => prev.map(item => {
      const prod = allProducts.find(p => p.id === item.productId) || allProducts[0];
      const tierAdjustedPrice = dataService.getProductPriceInTier(prod.id, prod.unitPrice, newTier.id);
      return {
        ...item,
        unitPrice: tierAdjustedPrice
      };
    }));

    info(
      `Customer Tier Applied: ${newTier.name}`,
      `Price list ${newTier.priceListId} active. Max allowed discount: ${newTier.maxRepDiscount}%.`
    );
  };

  // Pure Business Math
  const totals = useMemo(() => {
    return calculateQuotationTotals(items, discount, taxRate, customerTier?.id);
  }, [items, discount, taxRate, customerTier]);

  // Governance Evaluation
  const isDiscountOverTier = discount > (customerTier?.maxRepDiscount || 15);
  const isMarginLow = totals.margin < 25;
  const requiresApproval = isDiscountOverTier || isMarginLow;

  // JSON Inspector Modal state
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  // Live draft quotation JSON payload for inspection
  const draftQuotationPayload = useMemo(() => {
    return {
      draftMode: true,
      quotationNumber: "Q-AUTO (Generated on save)",
      customer: {
        id: selectedCustomer.id,
        customerCode: selectedCustomer.customerCode,
        companyName: selectedCustomer.companyName,
        contactName: selectedCustomer.contactName,
        email: selectedCustomer.email,
        customerTierId: customerTier.id,
        tierName: customerTier.name
      },
      pricingAndGovernance: {
        priceListId: customerTier.priceListId,
        tierDiscountLimit: customerTier.maxRepDiscount,
        requestedDiscount: discount,
        requiresApproval,
        approvalReason: requiresApproval 
          ? isDiscountOverTier 
            ? `Discount (${discount}%) exceeds ${customerTier.name} limit (${customerTier.maxRepDiscount}%)`
            : `Deal margin (${totals.margin}%) below 25% minimum threshold`
          : "Within representative authority"
      },
      financialSummary: {
        currency,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxableAmount: totals.taxableAmount,
        taxRate: totals.taxRate,
        tax: totals.tax,
        total: totals.total,
        totalCost: totals.totalCost,
        grossProfit: totals.grossProfit,
        marginPercentage: totals.margin
      },
      items: totals.items,
      commercialTerms: {
        validUntil,
        paymentTerms,
        notes
      }
    };
  }, [selectedCustomer, customerTier, discount, currency, totals, requiresApproval, isDiscountOverTier, isMarginLow, validUntil, paymentTerms, notes]);

  const handleAddItem = (productId) => {
    const prod = allProducts.find(p => p.id === productId) || allProducts[0];
    const unitPrice = dataService.getProductPriceInTier(prod.id, prod.unitPrice, customerTier.id);

    setItems(prev => [
      ...prev,
      {
        id: `QI-${Date.now()}-${prev.length + 1}`,
        productId: prod.id,
        name: prod.name,
        category: prod.categoryName || 'Software Subscription',
        description: prod.description,
        quantity: prod.defaultQty || 1,
        unitPrice,
        costPrice: prod.costPrice,
        gstRate: 18
      }
    ]);
  };

  const handleUpdateItem = (itemId, field, val) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    if (items.length <= 1) {
      error('Cannot Remove', 'Quotation must have at least one line item.');
      return;
    }
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCreateQuotation = () => {
    if (!selectedCustomer) {
      error('Customer Required', 'Please select a customer.');
      setCurrentStep(1);
      return;
    }

    if (items.length === 0) {
      error('Items Required', 'Please add at least one line item.');
      setCurrentStep(2);
      return;
    }

    const newQuote = addQuotation({
      customerId: selectedCustomer.id,
      customerCode: selectedCustomer.customerCode,
      customerTierId: customerTier.id,
      customerName: selectedCustomer.companyName,
      contactPerson: selectedCustomer.contactName,
      contactEmail: selectedCustomer.email,
      salesRepId: user?.id || 'USR-001',
      salesRepName: user?.name || 'Alex Morgan',
      currency,
      validUntil,
      paymentTerms,
      notes,
      discount,
      taxRate,
      stage: requiresApproval ? 'pending_approval' : 'draft',
      items: totals.items
    });

    success(
      'Quotation Generated',
      `Quotation ${newQuote.quotationNumber} (${newQuote.id}) has been created successfully.`
    );

    navigate(`/quotations/${newQuote.quotationNumber || newQuote.id}`);
  };

  return (
    <div className="quotations-page-container">
      {/* 1. Header with Breadcrumb & JSON Launcher */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title">Generate New Quotation</h1>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: customerTier.badgeBg,
              color: customerTier.badgeColor
            }}>
              {customerTier.name} Applied
            </span>
          </div>
          <p className="page-subtitle">
            Sales Rep: <strong>{user?.name || 'Alex Morgan'}</strong> — Real-time tier discount limits and margin protection rules active.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentStep(prev => Math.min(prev + 1, 3))}
            disabled={currentStep === 3}
            className="btn btn-secondary"
            style={{ display: currentStep === 3 ? 'none' : 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>Next Step</span>
            <ArrowRight size={15} />
          </button>

          {currentStep === 3 && (
            <button
              onClick={handleCreateQuotation}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
            >
              <CheckCircle2 size={16} />
              <span>Commit & Save Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Step Stepper */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div 
            onClick={() => setCurrentStep(1)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              color: currentStep >= 1 ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 1 ? 'var(--primary)' : 'var(--surface-secondary)',
              color: currentStep >= 1 ? '#FFFFFF' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
              fontWeight: '700'
            }}>
              1
            </div>
            <span style={{ fontWeight: currentStep === 1 ? '800' : '600', fontSize: '0.875rem' }}>
              Customer & Tier Binding
            </span>
          </div>

          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border)' }}></div>

          <div 
            onClick={() => setCurrentStep(2)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              color: currentStep >= 2 ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 2 ? 'var(--primary)' : 'var(--surface-secondary)',
              color: currentStep >= 2 ? '#FFFFFF' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
              fontWeight: '700'
            }}>
              2
            </div>
            <span style={{ fontWeight: currentStep === 2 ? '800' : '600', fontSize: '0.875rem' }}>
              Line Items & CPQ Pricing
            </span>
          </div>

          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border)' }}></div>

          <div 
            onClick={() => setCurrentStep(3)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              cursor: 'pointer',
              color: currentStep >= 3 ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: currentStep >= 3 ? 'var(--primary)' : 'var(--surface-secondary)',
              color: currentStep >= 3 ? '#FFFFFF' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
              fontWeight: '700'
            }}>
              3
            </div>
            <span style={{ fontWeight: currentStep === 3 ? '800' : '600', fontSize: '0.875rem' }}>
              Review & Governance Commit
            </span>
          </div>
        </div>
      </div>

      {/* 3. STEP CONTENT */}

      {/* STEP 1: CUSTOMER SELECTION & DYNAMIC TIER BINDING */}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelectCustomer={handleSelectCustomer}
            />
          </div>

          {/* Active Tier Summary Card */}
          {customerTier && (
            <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--surface-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>
                    Active Governance Configuration: {customerTier.name}
                  </h3>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: customerTier.badgeColor,
                  backgroundColor: customerTier.badgeBg,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  Price List: {customerTier.priceListId}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Max Rep Discount Without Approval:</span>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', marginTop: '2px' }}>
                    {customerTier.maxRepDiscount}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Tier Pricing Multiplier:</span>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', marginTop: '2px' }}>
                    {customerTier.pricingMultiplier}x ({Math.round((1 - customerTier.pricingMultiplier) * 100)}% wholesale discount)
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Standard Payment Terms:</span>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', marginTop: '2px' }}>
                    {selectedCustomer.paymentTerms || customerTier.defaultPaymentTerms}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Service Level Agreement:</span>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem', marginTop: '2px' }}>
                    {customerTier.slaLevel}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setCurrentStep(2)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.25rem' }}
            >
              <span>Continue to Line Items</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LINE ITEMS & CPQ PRICING */}
      {currentStep === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
          {/* Main Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>
                    Quotation Line Items
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    Pricing reflects {customerTier.name} ({customerTier.priceListId}).
                  </p>
                </div>

                {/* Quick Add Product Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddItem(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="select-input"
                    style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add Product Package...</option>
                    {allProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatINR(p.unitPrice)})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Product & Service</th>
                      <th style={{ padding: '0.5rem 0.75rem', width: '90px' }}>Qty</th>
                      <th style={{ padding: '0.5rem 0.75rem', width: '120px' }}>Unit Price (INR)</th>
                      <th style={{ padding: '0.5rem 0.75rem', width: '110px' }}>Line Subtotal</th>
                      <th style={{ padding: '0.5rem 0.75rem', width: '80px' }}>Margin</th>
                      <th style={{ padding: '0.5rem 0.75rem', width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {totals.items.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{item.category}</div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="input"
                            style={{ padding: '0.35rem 0.5rem', width: '70px', fontSize: '0.8125rem', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: '600' }}>{formatINR(item.unitPrice)}</div>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Cost: {formatINR(item.costPrice)}</span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {formatINR(item.subtotal)}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: item.margin < 25 ? '#EF4444' : '#059669',
                            backgroundColor: item.margin < 25 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {item.margin}%
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Commercial terms & notes */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.75rem' }}>
                Commercial Terms & Notes
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="select-input"
                    style={{ width: '100%', marginTop: '4px', fontSize: '0.8125rem' }}
                  >
                    {customerTier.paymentTermsAllowed.map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Quotation Validity</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="input"
                    style={{ width: '100%', marginTop: '4px', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Customer Quotation Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  rows={2}
                  style={{ width: '100%', marginTop: '4px', fontSize: '0.8125rem' }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Engine & Governance Radar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '1rem' }}>
                Pricing & Governance Summary
              </h4>

              {/* Discount Input with Tier Limit Indicator */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Sales Rep Discount:</span>
                  <span style={{ fontWeight: '800', color: isDiscountOverTier ? 'var(--color-error)' : 'var(--primary)' }}>
                    {discount}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="35"
                  step="1"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: isDiscountOverTier ? '#EF4444' : '#4F46E5' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span>0%</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                    Tier Max: {customerTier.maxRepDiscount}%
                  </span>
                  <span>35%</span>
                </div>
              </div>

              {/* Governance Warning Banner if exceeded */}
              {isDiscountOverTier && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#991B1B'
                }}>
                  <ShieldAlert size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Discount Escalation Triggered</strong>
                    <p style={{ margin: '2px 0 0 0' }}>
                      {discount}% exceeds {customerTier.name} rep threshold ({customerTier.maxRepDiscount}%). Quotation will automatically route to Sales Manager for review.
                    </p>
                  </div>
                </div>
              )}

              {/* Margin Guardrail Banner */}
              {isMarginLow && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#92400E'
                }}>
                  <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Low Margin Deal Hurdle</strong>
                    <p style={{ margin: '2px 0 0 0' }}>
                      Deal margin ({totals.margin}%) is below 25% minimum threshold.
                    </p>
                  </div>
                </div>
              )}

              {/* Financial Breakdown Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Catalog Subtotal</span>
                  <span style={{ fontWeight: '600' }}>{formatINR(totals.subtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: discount > 0 ? '#DC2626' : 'inherit' }}>
                  <span>Discount ({discount}%)</span>
                  <span style={{ fontWeight: '600' }}>-{formatINR(totals.discountAmount)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Taxable Value</span>
                  <span style={{ fontWeight: '600' }}>{formatINR(totals.taxableAmount)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
                  <span style={{ fontWeight: '600' }}>+{formatINR(totals.tax)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '0.5rem', fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  <span>Grand Total</span>
                  <span style={{ color: 'var(--primary)' }}>{formatINR(totals.total)}</span>
                </div>

                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={15} color={totals.margin < 25 ? '#EF4444' : '#059669'} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Deal Gross Margin</span>
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '800',
                    color: totals.margin < 25 ? '#EF4444' : '#059669'
                  }}>
                    {totals.margin}%
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.65rem' }}
              >
                <span>Proceed to Review & Commit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW & GOVERNANCE COMMIT */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Quotation Review & Approval Commitment
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Confirm customer details, line items, and governance compliance before generating commercial quotation record.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Account summary */}
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-secondary)' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)' }}>TARGET ACCOUNT</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '4px 0' }}>{selectedCustomer.companyName}</h4>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <div>Contact: <strong>{selectedCustomer.contactName}</strong></div>
                  <div>Email: <strong>{selectedCustomer.email}</strong></div>
                  <div>Tier: <strong>{customerTier.name}</strong></div>
                </div>
              </div>

              {/* Commercial summary */}
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-secondary)' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)' }}>COMMERCIAL SUMMARY</span>
                <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--primary)', margin: '4px 0' }}>
                  {formatINR(totals.total)}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <div>Discount: <strong>{discount}% ({formatINR(totals.discountAmount)})</strong></div>
                  <div>Gross Margin: <strong style={{ color: totals.margin < 25 ? '#EF4444' : '#059669' }}>{totals.margin}%</strong></div>
                  <div>Terms: <strong>{paymentTerms}</strong></div>
                </div>
              </div>

              {/* Governance routing */}
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: requiresApproval ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: requiresApproval ? '#DC2626' : '#059669' }}>
                  GOVERNANCE ROUTING
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '4px 0', color: requiresApproval ? '#DC2626' : '#059669' }}>
                  {requiresApproval ? 'Approval Required' : 'Auto-Approved Draft'}
                </h4>
                <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-secondary)' }}>
                  {requiresApproval 
                    ? isDiscountOverTier 
                      ? `Discount (${discount}%) exceeds ${customerTier.name} allowance (${customerTier.maxRepDiscount}%). Will route to Sales Manager.`
                      : `Deal margin (${totals.margin}%) below 25% minimum threshold. Will route to Finance Director.`
                    : `Commercial terms are within ${customerTier.name} thresholds. Ready for immediate quotation issuance.`}
                </p>
              </div>
            </div>

            {/* Commit actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <button
                onClick={() => setCurrentStep(2)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={15} />
                <span>Back to Line Items</span>
              </button>

              <button
                onClick={handleCreateQuotation}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: '800' }}
              >
                <CheckCircle2 size={18} />
                <span>{requiresApproval ? 'Submit for Governance Approval' : 'Create Commercial Quotation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Live JSON Inspector Modal */}
      <JsonInspectorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        quotationData={draftQuotationPayload}
        title="Live Quotation Construction Payload"
      />
    </div>
  );
};
