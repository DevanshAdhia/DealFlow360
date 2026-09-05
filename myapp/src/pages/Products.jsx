import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Layers, 
  Tag, 
  Search, 
  Plus, 
  Filter, 
  SlidersHorizontal, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ExternalLink,
  BookOpen,
  Edit3,
  Trash2,
  Download,
  X
} from 'lucide-react';
import { getAllProducts, getProductCategories, getProductPriceLists } from '../services/productService.js';
import { formatINR } from '../utils/formatters.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { SummaryCard } from '../components/common/SummaryCard.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { useToast } from '../hooks/useToast.js';

export const Products = () => {
  const navigate = useNavigate();
  const { success } = useToast();

  const [productsList, setProductsList] = useState(() => {
    try {
      const saved = localStorage.getItem('dealflow360_products_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return getAllProducts();
  });

  useEffect(() => {
    try {
      localStorage.setItem('dealflow360_products_v2', JSON.stringify(productsList));
    } catch (_) {}
  }, [productsList]);
  const [editingProduct, setEditingProduct] = useState(null);
  const categories = useMemo(() => getProductCategories(), []);
  const priceLists = useMemo(() => getProductPriceLists(), []);

  // Filter States (Strictly inside the List Page as required)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ACTIVE | INACTIVE | ARCHIVED
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL | Hardware | Services | Subscription
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | ONE_TIME | RECURRING | BOTH

  // New Product Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    productCode: '',
    categoryId: 'CAT-001',
    unitPrice: '',
    unit: 'Unit',
    isSubscription: false,
    description: ''
  });

  // Calculate Summary metrics
  const totalProducts = productsList.length;
  const totalVariants = productsList.reduce((sum, p) => sum + (p.variantsCount || 0), 0);
  const totalPricelists = priceLists.length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return productsList.filter(prod => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = prod.name?.toLowerCase().includes(query);
        const matchSku = prod.productCode?.toLowerCase().includes(query);
        const matchCat = prod.categoryName?.toLowerCase().includes(query);
        if (!matchName && !matchSku && !matchCat) return false;
      }

      // Status Filter
      if (statusFilter !== 'ALL' && prod.status !== statusFilter) {
        return false;
      }

      // Category Filter (Hardware, Services, Subscription)
      if (categoryFilter !== 'ALL') {
        const catName = prod.categoryName?.toLowerCase() || '';
        if (categoryFilter === 'Hardware' && !catName.includes('hardware') && !catName.includes('iot')) return false;
        if (categoryFilter === 'Services' && !catName.includes('service') && !catName.includes('support')) return false;
        if (categoryFilter === 'Subscription' && !catName.includes('subscription') && !catName.includes('platform')) return false;
      }

      // Product Type Filter (ONE_TIME, RECURRING, BOTH)
      if (typeFilter !== 'ALL') {
        if (prod.productType !== typeFilter) return false;
      }

      return true;
    }).sort((a, b) => b.unitPrice - a.unitPrice); // Sorted by priority/price
  }, [productsList, searchTerm, statusFilter, categoryFilter, typeFilter]);

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.unitPrice) return;

    const newProd = {
      id: `PROD-${String(productsList.length + 1).padStart(3, '0')}`,
      productCode: newProductForm.productCode || `PRD-NEW-${Date.now().toString().slice(-4)}`,
      name: newProductForm.name,
      categoryId: newProductForm.categoryId,
      description: newProductForm.description || 'Newly registered catalog product.',
      unitPrice: Number(newProductForm.unitPrice) || 0,
      costPrice: Math.round(Number(newProductForm.unitPrice) * 0.6) || 0,
      unit: newProductForm.unit || 'Unit',
      defaultQty: 10,
      minMargin: 30,
      gstRate: 18,
      isSubscription: newProductForm.isSubscription,
      categoryName: categories.find(c => c.id === newProductForm.categoryId)?.name || 'General',
      variantsCount: 0,
      quantityOnHand: 25,
      availableQuantity: 25,
      productType: newProductForm.isSubscription ? 'RECURRING' : 'ONE_TIME',
      status: 'ACTIVE'
    };

    setProductsList(prev => [newProd, ...prev]);
    setShowNewModal(false);
    setNewProductForm({
      name: '',
      productCode: '',
      categoryId: 'CAT-001',
      unitPrice: '',
      unit: 'Unit',
      isSubscription: false,
      description: ''
    });
    success('Product Created', `Added ${newProd.name} (${newProd.id}) to master catalog.`);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProductsList(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    success('Product Updated', `Successfully updated ${editingProduct.name} (${editingProduct.id}).`);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Are you sure you want to remove ${productName || productId} from the catalog?`)) {
      setProductsList(prev => prev.filter(p => p.id !== productId));
      success('Product Deleted', `Removed product from catalog.`);
    }
  };

  return (
    <div className="product-catalog-page" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Page Header */}
      <PageHeader
        title="Product Catalog"
        subtitle="Every product, variant and price list in one place."
        breadcrumbs={[
          { label: 'Sales', path: '/sales/dashboard' },
          { label: 'Products', path: '/sales/products' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => alert(`Active Price Lists:\n` + priceLists.map(pl => `• ${pl.name} (${pl.code}) - Tier Multiplier: ${pl.multiplier}`).join('\n'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={15} />
              Manage Price Lists
            </button>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(productsList, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `products_catalog_export_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                success('Catalog Exported', `Downloaded ${productsList.length} products.`);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
              title="Download Entire Product Catalog as JSON"
            >
              <Download size={15} />
              Export Catalog
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#1e40af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Plus size={15} />
              New Product
            </button>
          </div>
        }
      />

      {/* 2. Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <SummaryCard
          icon={Package}
          label="Total Products"
          value={totalProducts}
          subtext="Active master catalog SKUs"
          badgeText="Catalog Live"
          badgeType="success"
          color="#2563eb"
        />
        <SummaryCard
          icon={Tag}
          label="Price Lists"
          value={totalPricelists}
          subtext="Enterprise, Mid-Market, Standard"
          badgeText="3 Tiers"
          badgeType="neutral"
          color="#7c3aed"
        />
        <SummaryCard
          icon={Layers}
          label="Variants"
          value={totalVariants}
          subtext="Configurable attributes & addons"
          badgeText="Multi-Attribute"
          badgeType="warning"
          color="#059669"
        />
      </div>

      {/* 3. Filter Bar (Search, Status, Category, Product Type) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        {/* Top Row: Search & Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '380px',
            width: '100%'
          }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search by Name, SKU, Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                fontSize: '0.8125rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                color: '#0f172a'
              }}
            />
          </div>

          {/* Status Tabs: All, Active, Inactive, Archived */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
            {['ALL', 'ACTIVE', 'INACTIVE', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: statusFilter === st ? '#ffffff' : 'transparent',
                  color: statusFilter === st ? '#1e40af' : '#64748b',
                  boxShadow: statusFilter === st ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: Category Filter and Product Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
          {/* Category Filter: All, Hardware, Services, Subscription */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Category:</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['ALL', 'Hardware', 'Services', 'Subscription'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: categoryFilter === cat ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: categoryFilter === cat ? '#eff6ff' : '#ffffff',
                    color: categoryFilter === cat ? '#1e40af' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Type Filter: All, ONE_TIME, RECURRING, BOTH */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Type:</span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[
                { key: 'ALL', label: 'All Types' },
                { key: 'ONE_TIME', label: 'One-Time' },
                { key: 'RECURRING', label: 'Recurring' },
                { key: 'BOTH', label: 'Hybrid/Both' }
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(t.key)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: typeFilter === t.key ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                    backgroundColor: typeFilter === t.key ? '#f5f3ff' : '#ffffff',
                    color: typeFilter === t.key ? '#6d28d9' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Products Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
        className="billing-table-wrap"
      >
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No Products Match Filters"
            message="Try adjusting your search criteria or resetting filters to view products."
            action={
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setTypeFilter('ALL');
                }}
                className="btn btn-secondary"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <table className="billing-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PRODUCT NAME</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>CATEGORY</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>VARIANTS</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>PRICE</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>UNIT</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TAX</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>STATUS</th>
                <th style={{ padding: '0.75rem 1rem', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr
                  key={prod.id}
                  onClick={() => navigate(`/sales/products/${prod.id}`)}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                        {prod.name}
                      </span>
                      <span style={{ fontFamily: 'Courier New, monospace', fontSize: '0.75rem', color: '#64748b' }}>
                        {prod.productCode} • {prod.id}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.8125rem', color: '#334155' }}>
                    <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {prod.categoryName}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.8125rem' }}>
                    {prod.variantsCount > 0 ? (
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        {prod.variantsCount} Variant{prod.variantsCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Standard</span>
                    )}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                    {formatINR(prod.unitPrice)}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    {prod.unit}
                  </td>
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    {prod.gstRate}% GST
                  </td>
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <StatusBadge status={prod.status} size="sm" />
                  </td>
                  <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        title="Edit Product"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct({ ...prod });
                        }}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#334155'
                        }}
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        title="Delete Product"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(prod.id, prod.name);
                        }}
                        style={{
                          padding: '0.35rem 0.6rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#dc2626'
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales/products/${prod.id}`);
                        }}
                        className="billing-table-action-btn"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        View <ArrowRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Product Modal */}
      {showNewModal && (
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
          onClick={() => setShowNewModal(false)}
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              Add New Product to Catalog
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Configure base SKU details. Tier pricelists and variants will automatically derive from configuration.
            </p>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Copilot Enterprise Accelerator"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Product Code / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="PRD-AI-01"
                    value={newProductForm.productCode}
                    onChange={(e) => setNewProductForm({ ...newProductForm, productCode: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Category
                  </label>
                  <select
                    value={newProductForm.categoryId}
                    onChange={(e) => setNewProductForm({ ...newProductForm, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Base Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={newProductForm.unitPrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unitPrice: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. License, Appliance, Month"
                    value={newProductForm.unit}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="subCheckbox"
                  checked={newProductForm.isSubscription}
                  onChange={(e) => setNewProductForm({ ...newProductForm, isSubscription: e.target.checked })}
                />
                <label htmlFor="subCheckbox" style={{ fontSize: '0.8125rem', color: '#1e293b', fontWeight: 500, cursor: 'pointer' }}>
                  Is Recurring / Subscription Billing
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px', backgroundColor: '#1e40af', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
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
          onClick={() => setEditingProduct(null)}
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
                Edit Product: {editingProduct.productCode}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Update catalog details, base price, unit, and lifecycle status.
            </p>

            <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Product Code / SKU
                  </label>
                  <input
                    type="text"
                    value={editingProduct.productCode}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productCode: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Status
                  </label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Base Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.unitPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
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
