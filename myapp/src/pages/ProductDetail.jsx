import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Tag, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  DollarSign, 
  Percent, 
  Boxes,
  ShieldCheck,
  Building2,
  FileText,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { getProductById } from '../services/productService.js';
import { formatINR } from '../utils/formatters.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { useToast } from '../hooks/useToast.js';

export const ProductDetail = () => {
  const { productId, id } = useParams();
  const navigate = useNavigate();
  const { success } = useToast();
  const targetId = productId || id;

  const initialProduct = getProductById(targetId);
  const [product, setProduct] = useState(initialProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(initialProduct ? { ...initialProduct } : null);

  // Detail Route Safety (Section 21: If user enters /sales/products/INVALID show Product Not Found)
  if (!product) {
    return (
      <div className="product-detail-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <ErrorState
          title="Product Not Found"
          message={`No product could be found with SKU/ID "${targetId}". Please verify the catalog identifier.`}
          backButton={{
            label: '← Back to Products',
            path: '/sales/products'
          }}
        />
      </div>
    );
  }

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setProduct(editForm);
    setIsEditing(false);
    success('Product Updated', `Changes to ${editForm.name} saved successfully.`);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}? This action cannot be undone.`)) {
      success('Product Deleted', `Product ${product.name} removed from catalog.`);
      navigate('/sales/products');
    }
  };

  return (
    <div className="product-detail-page" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Page Header & Breadcrumbs */}
      <PageHeader
        title="Product and Pricelist"
        subtitle={`${product.name} (${product.productCode})`}
        badge={<StatusBadge status={product.status || 'ACTIVE'} />}
        breadcrumbs={[
          { label: 'Sales', path: '/sales/dashboard' },
          { label: 'Products', path: '/sales/products' },
          { label: product.name, path: `/sales/products/${product.id}` }
        ]}
        backButton={{
          label: '← Back to Products',
          path: '/sales/products'
        }}
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => {
                setEditForm({ ...product });
                setIsEditing(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Edit3 size={15} />
              Edit Product
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={15} />
              Delete Product
            </button>
            <button
              onClick={() => navigate('/quotations/new')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.1rem',
                backgroundColor: '#1e40af',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <FileText size={15} />
              Create Quotation
            </button>
          </div>
        }
      />

      {/* Main Grid: Section 1 General Info & Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Section 1: General Info Card */}
        <div
          style={{
            gridColumn: 'span 2',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <Package size={20} color="#1e40af" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              General Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Product Name
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                {product.name}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Category
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af' }}>
                {product.categoryName} ({product.categoryCode})
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Base MSRP Price
              </span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                {formatINR(product.unitPrice)}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Unit of Measure
              </span>
              <span style={{ fontSize: '0.875rem', color: '#334155' }}>
                {product.unit}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Applicable Tax
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669' }}>
                {product.gstRate}% GST
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Subscription Billing
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: product.isSubscription ? '#7c3aed' : '#64748b' }}>
                {product.isSubscription ? 'Yes (Recurring)' : 'No (One-Time CapEx)'}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Recurring Cycle
              </span>
              <span style={{ fontSize: '0.875rem', color: '#334155' }}>
                {product.recurringCycle}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Quantity on Hand
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: product.quantityOnHand > 0 ? '#059669' : '#b91c1c' }}>
                {product.quantityOnHand} Units in Stock
              </span>
            </div>
          </div>

          {product.description && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Description
              </span>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Commercial Insights Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <ShieldCheck size={20} color="#059669" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Governance & Margin
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Cost Price</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155' }}>{formatINR(product.costPrice || product.unitPrice * 0.55)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Target Floor Margin</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>{product.minMargin || 35}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Fulfillment Model</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af' }}>
                  {product.isSubscription ? 'Digital Provisioning' : 'Warehouse Inventory'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.75rem', color: '#1e40af' }}>
            <strong>Quotation Integrity:</strong> Product master changes only affect future quotations. Existing quotation line item snapshots remain immutable.
          </div>
        </div>
      </div>

      {/* Section 2: Product Variants Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={20} color="#7c3aed" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Section 2: Product Variants
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {product.variants.length} Configurable Attributes
          </span>
        </div>

        {product.variants.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No additional variants registered for this product SKU. Product is supplied in standard specification.
          </div>
        ) : (
          <div className="billing-table-wrap">
            <table className="billing-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>ATTRIBUTE</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>VALUES</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>EXTRA PRICE</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      {v.attribute}
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.8125rem', color: '#334155' }}>
                      <span style={{ padding: '0.2rem 0.6rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                        {v.values}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: v.extraPrice > 0 ? '#059669' : '#64748b', textAlign: 'right' }}>
                      {v.extraPrice > 0 ? `+ ${formatINR(v.extraPrice)}` : 'Included in MSRP'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Pricelists Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Tag size={20} color="#2563eb" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Section 3: Tiered Pricelists & Price Rules
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {product.priceRules.length} Tier Rules Configured
          </span>
        </div>

        <div className="billing-table-wrap">
          <table className="billing-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TIER / PRICE BOOK</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CURRENCY</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PRICE RULE</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>EFFECTIVE UNIT RATE</th>
              </tr>
            </thead>
            <tbody>
              {product.priceRules.map((rule) => (
                <tr key={rule.priceListId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                        {rule.tier}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {rule.priceListName}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                    {rule.currency}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.8125rem', color: '#1e40af', fontWeight: 500 }}>
                    {rule.priceRule}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>
                    {formatINR(rule.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {isEditing && editForm && (
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
          onClick={() => setIsEditing(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Edit {product.name}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Update product details and pricing.
            </p>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Base Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.unitPrice}
                    onChange={(e) => setEditForm({ ...editForm, unitPrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={editForm.gstRate}
                    onChange={(e) => setEditForm({ ...editForm, gstRate: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px', backgroundColor: '#1e40af', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
