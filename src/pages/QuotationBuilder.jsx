import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Briefcase, 
  History, 
  Code,
  Layers,
  Sparkles
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { checkApprovalRequired } from '../data/approvalRules.js';
import { dataService } from '../services/dataService.js';

import { ProductCatalog } from '../components/builder/ProductCatalog.jsx';
import { CartLineItem } from '../components/builder/CartLineItem.jsx';
import { BuilderSummary } from '../components/builder/BuilderSummary.jsx';
import { RecommendationPanel } from '../components/builder/RecommendationPanel.jsx';
import { computeLineItem, calculateQuotationTotals } from '../utils/quotationCalculations.js';

export const QuotationBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getQuotationById, updateQuotation } = useQuotations();
  const { submitApproval, getApprovalByQuotationId } = useApprovals();
  const { success, info, error } = useToast();

  const [quote, setQuote] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalReason, setApprovalReason] = useState('');
  
  // Initialize
  useEffect(() => {
    const found = getQuotationById(id);
    if (found) {
      setQuote(found);
      setGlobalDiscount(found.discount || 0);
      
      // Hydrate cart items with full product details
      const allProducts = dataService.getProducts();
      const hydratedItems = (found.items || []).map(item => {
        const prodDef = allProducts.find(p => p.id === item.productId || p.name === item.name);
        return computeLineItem({
          ...item,
          productId: item.productId || prodDef?.id,
          costPrice: prodDef?.costPrice || item.costPrice || item.unitPrice * 0.55,
          category: prodDef?.category || prodDef?.categoryName || item.category || 'Software Subscription'
        });
      });
      setCartItems(hydratedItems);
    } else {
      navigate('/quotations');
    }
  }, [id, getQuotationById, navigate]);

  const customerTier = useMemo(() => {
    return dataService.getCustomerTierById(quote?.customerTierId);
  }, [quote]);

  const needsApproval = checkApprovalRequired(globalDiscount, customerTier?.maxRepDiscount || 15);

  const handleAddProduct = (product) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      if (existingIndex >= 0) {
        const newItems = [...prev];
        const item = newItems[existingIndex];
        newItems[existingIndex] = computeLineItem({
          ...item,
          quantity: item.quantity + 1
        });
        return newItems;
      } else {
        return [...prev, computeLineItem({
          id: `item-${Date.now()}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          quantity: 1,
          unitPrice: product.unitPrice || product.price,
          costPrice: product.costPrice,
          discount: 0
        })];
      }
    });
    info('Product Added', `${product.name} added to quotation.`);
  };

  const handleUpdateItem = (index, updates) => {
    setCartItems(prev => {
      const newItems = [...prev];
      newItems[index] = computeLineItem({
        ...newItems[index],
        ...updates
      });
      return newItems;
    });
  };

  const handleRemoveItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleReplaceProduct = (sourceId, targetProduct) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.productId === sourceId) {
          return computeLineItem({
            ...item,
            productId: targetProduct.id,
            name: targetProduct.name,
            unitPrice: targetProduct.unitPrice || targetProduct.price,
            costPrice: targetProduct.costPrice,
            category: targetProduct.category,
          });
        }
        return item;
      });
    });
    success('Product Upgraded', `Replaced with ${targetProduct.name}`);
  };

  const handleSave = () => {
    updateQuotation(quote.id, {
      items: cartItems,
      discount: globalDiscount,
      activityNote: 'Updated quotation via CPQ Builder'
    });
    success('Quotation Saved', 'All changes have been saved successfully.');
    navigate(`/quotations/${quote.quotationNumber || quote.id}`);
  };

  const handleSubmitApproval = () => {
    if (!approvalReason.trim()) {
      error('Reason Required', 'Please provide a business justification for this discount.');
      return;
    }
    
    // Save first
    updateQuotation(quote.id, {
      items: cartItems,
      discount: globalDiscount,
      stage: 'pending_approval',
      activityNote: `Submitted for discount approval: ${approvalReason}`
    });
    
    // Submit approval
    const updatedQuote = { ...quote, items: cartItems, discount: globalDiscount };
    if (submitApproval) {
      submitApproval(updatedQuote, globalDiscount, approvalReason);
    }
    
    setIsApprovalModalOpen(false);
    success('Approval Requested', 'Your request has been routed to the sales manager/finance.');
    navigate(`/quotations/${quote.quotationNumber || quote.id}`);
  };

  if (!quote) return null;

  // Live draft builder payload for JSON inspector
  const currentBuilderPayload = {
    quotationNumber: quote.quotationNumber,
    id: quote.id,
    customer: {
      name: quote.customerName,
      customerTier: customerTier?.name,
      priceList: customerTier?.priceListId,
      maxAllowedDiscount: customerTier?.maxRepDiscount
    },
    pricingSummary: {
      globalDiscount,
      needsApproval,
      itemsCount: cartItems.length
    },
    items: cartItems
  };

  return (
    <div className="builder-container">
      {/* HEADER */}
      <div className="builder-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate(`/quotations/${quote.quotationNumber || quote.id}`)}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                CPQ Builder: {quote.quotationNumber || quote.id}
              </h1>
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                backgroundColor: customerTier?.badgeBg,
                color: customerTier?.badgeColor,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                {customerTier?.name}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Customer: <strong>{quote.customerName || quote.customer}</strong> • Price Book: <strong>{customerTier?.priceListId}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Live JSON Inspector button */}
          

          <button className="btn btn-secondary" onClick={handleSave}>
            <Save size={16} /> Save Draft
          </button>

          {needsApproval ? (
            <button className="btn btn-primary" onClick={() => setIsApprovalModalOpen(true)} style={{ backgroundColor: 'var(--warning-500)', borderColor: 'var(--warning-500)', color: 'black' }}>
              <ShieldAlert size={16} /> Submit for Approval
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSave}>
              <CheckCircle2 size={16} /> Save & Exit
            </button>
          )}
        </div>
      </div>

      <div className="builder-grid">
        {/* LEFT COLUMN: Catalog & Customer Info */}
        <div className="builder-col">
          {/* Customer Profile / Tier Section */}
          <div className="card-surface" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--primary-500)"/> Customer Governance Profile
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Account:</span> <strong>{quote.customerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Customer Tier:</span> <strong style={{ color: customerTier?.badgeColor }}>{customerTier?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Max Rep Discount:</span> <strong>{customerTier?.maxRepDiscount}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SLA Support:</span> <strong>{customerTier?.slaLevel}</strong>
              </div>
            </div>
          </div>

          <div className="card-surface" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ProductCatalog onAddProduct={handleAddProduct} />
          </div>
        </div>

        {/* MIDDLE COLUMN: Cart */}
        <div className="builder-col" style={{ flex: 2 }}>
          <div className="card-surface" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Quotation Line Items</h3>
              <span className="badge badge-neutral">{cartItems.length} Items</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <p>No items in the quotation.</p>
                  <p style={{ fontSize: '0.8rem' }}>Select products from the catalog to build the deal.</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <CartLineItem
                    key={item.id || index}
                    item={item}
                    onUpdate={(updates) => handleUpdateItem(index, updates)}
                    onRemove={() => handleRemoveItem(index)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary & Recommendations */}
        <div className="builder-col">
          <BuilderSummary
            cartItems={cartItems}
            globalDiscount={globalDiscount}
            onGlobalDiscountChange={setGlobalDiscount}
          />
          
          <div className="card-surface" style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Deal Recommendations</h3>
            <RecommendationPanel
              cartItems={cartItems}
              customerTier={customerTier?.name || "Enterprise"}
              customerIndustry="Technology"
              onAddProduct={handleAddProduct}
              onReplaceProduct={handleReplaceProduct}
            />
          </div>
        </div>
      </div>

      {/* Approval Reason Modal */}
      {isApprovalModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card-surface" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="var(--warning-500)" />
              Approval Required
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              A discount of <strong>{globalDiscount}%</strong> exceeds the {customerTier?.name} limit of {customerTier?.maxRepDiscount}%. Please provide a business justification.
            </p>
            <textarea 
              className="form-input"
              rows={4} 
              placeholder="Why is this discount necessary?"
              value={approvalReason}
              onChange={e => setApprovalReason(e.target.value)}
              style={{ marginBottom: '1.5rem', width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setIsApprovalModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitApproval}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Live JSON Inspector Modal */}
      
    </div>
  );
};
