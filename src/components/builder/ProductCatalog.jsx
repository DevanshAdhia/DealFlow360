import React, { useState, useMemo } from 'react';
import { Plus, Search, Package, CheckCircle2, Filter } from 'lucide-react';
import { dataService } from '../../services/dataService.js';
import { formatINR } from '../../utils/formatters.js';

const CATEGORY_ICONS = {
  'Software Solutions': '📦',
  'Enterprise Hardware': '💻',
  'Cloud & Infrastructure': '☁️',
  'Professional Services': '🛠️',
  Hardware:    '💻',
  Software:    '📦',
  Services:    '🛠️',
  Accessories: '⌨️',
  Support:     '🛡️',
  Cloud:       '☁️',
  Security:    '🔒',
  Infrastructure: '🖥️',
};

const ALL_CATEGORIES = ['All', ...dataService.getCategories().map(c => c.name)];

export const ProductCatalog = ({ cartItems = [], onAddProduct }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('name_asc');

  const cartProductIds = useMemo(
    () => new Set(cartItems.map(i => i.productId || i.id)),
    [cartItems]
  );

  const filtered = useMemo(() => {
    let list = dataService.getProducts().filter(p => p.active !== false);

    // Category filter
    if (category !== 'All') list = list.filter(p => p.category === category);

    // Search filter
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sort === 'name_asc') return a.name.localeCompare(b.name);
      const priceA = a.unitPrice || a.price || 0;
      const priceB = b.unitPrice || b.price || 0;
      if (sort === 'price_asc') return priceA - priceB;
      if (sort === 'price_desc') return priceB - priceA;
      return 0;
    });

    return list;
  }, [search, category, sort]);

  return (
    <div className="builder-panel">
      <div className="builder-col-header">
        <span className="builder-col-title">
          <Package size={13} />
          Product Catalog
        </span>
        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
          {filtered.length} products
        </span>
      </div>

      {/* Search & Filters */}
      <div className="catalog-search-bar">
        <div className="dashboard-search-box" style={{ flex: 1 }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            className="dashboard-search-input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="catalog-filter-row">
          <select
            className="catalog-filter-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {ALL_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="catalog-filter-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="name_asc">A → Z</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="builder-col-body">
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0.5rem', color: 'var(--text-muted)' }}>
            <Package size={32} color="var(--border-medium)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.8rem' }}>No products match your search.</p>
          </div>
        ) : (
          filtered.map(product => {
            const inCart = cartProductIds.has(product.id);
            const margin = product.costPrice
              ? Math.round(((product.price - product.costPrice) / product.price) * 100)
              : null;

            return (
              <div key={product.id} className="product-card">
                <div className="product-card-header">
                  <div className="product-icon-box">
                    <span style={{ fontSize: '1.1rem' }}>
                      {CATEGORY_ICONS[product.category] || '📦'}
                    </span>
                  </div>
                  <div className="product-card-meta">
                    <div className="product-card-name">{product.name}</div>
                    <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                        {product.category}
                      </span>
                      <span className="product-gst-badge">GST {product.gstRate}%</span>
                      {product.stock < 9999 && (
                        <span className="product-stock-badge">Stock: {product.stock}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="product-card-desc">{product.description}</div>

                <div className="product-card-footer">
                  <div className="product-price-block">
                    <span className="product-price">{formatINR(product.price)}</span>
                    {product.costPrice && (
                      <span className="product-cost">
                        Cost: {formatINR(product.costPrice)}
                        {margin !== null && (
                          <span style={{
                            marginLeft: '0.3rem',
                            color: margin >= 30 ? 'var(--color-success)' : margin >= 15 ? 'var(--color-warning)' : 'var(--color-error)',
                            fontWeight: 700
                          }}>
                            ({margin}% margin)
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {inCart ? (
                    <span className="product-in-cart-badge">
                      <CheckCircle2 size={10} style={{ display: 'inline', marginRight: '0.2rem' }} />
                      In Cart
                    </span>
                  ) : (
                    <button
                      className="product-add-btn"
                      onClick={() => onAddProduct(product)}
                      title={`Add ${product.name} to quotation`}
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
