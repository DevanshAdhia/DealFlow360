import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, DataTable, ConfirmDialog } from '../components/common/UI';
import { getProducts, saveEntity, deleteEntity } from '../services/storageService';

function Products() {
  const [products, setProducts] = useState(() => getProducts());
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const filtered = products.filter(p => {
    const s = search.toLowerCase();
    return (p.name || '').toLowerCase().includes(s) || 
           (p.sku || '').toLowerCase().includes(s);
  });

  const handleDelete = (id) => {
    setProductToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    const updated = deleteEntity('df_products', productToDelete);
    setProducts(updated);
    toast.success("Product deleted successfully.");
    setShowConfirm(false);
  };

  const columns = [
    { Header: 'Product Name', accessor: 'name', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.name}</strong> },
    { Header: 'SKU', accessor: 'sku', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.sku}</span> },
    { Header: 'Category', accessor: 'category', sortable: true },
    { Header: 'Cost', accessor: 'cost', sortable: true, Cell: row => `$${row.cost.toLocaleString()}` },
    { Header: 'Price', accessor: 'price', sortable: true, Cell: row => <span style={{ fontWeight: 600 }}>${row.price.toLocaleString()}</span> },
    { Header: 'Stock', accessor: 'stock', sortable: true, Cell: row => <Badge type={row.stock > 20 ? 'success' : 'warning'}>{row.stock} units</Badge> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" style={{ padding: '0.375rem 0.75rem' }}>Edit</Button>
          <Button variant="danger" style={{ padding: '0.375rem 0.75rem' }} onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Manage inventory SKUs, define base pricing, and organize product categories.</p>
        </div>
        <Button className="btn-primary">+ Add Product</Button>
      </div>

      <div className="metric-grid">
        <div className="metric-card active">
          <div className="metric-header">
            <span className="metric-title">TOTAL SKUS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </div>
          <div className="metric-value text-brand">{products.length}</div>
          <div className="metric-subtitle">Active catalog items</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">LOW STOCK</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div className="metric-value text-warning">{products.filter(p=>p.stock <= 20).length}</div>
          <div className="metric-subtitle">Requires replenishment</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">AVG MARGIN</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div className="metric-value text-success">
            {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (((p.price || 0) - (p.cost || 0)) / (p.price || 1) * 100), 0) / products.length) : 0}%
          </div>
          <div className="metric-subtitle">Gross profit margin</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <svg className="filter-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            className="filter-search-input"
            placeholder="Search by Product Name or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="filter-select">
          <option>Category: All</option>
          <option>Software</option>
          <option>Hardware</option>
          <option>Services</option>
        </select>
        
        <select className="filter-select">
          <option>Stock Status: All</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="empty-state" style={{ minHeight: '250px', border: 'none', backgroundColor: 'transparent' }}>
            <div className="empty-state-icon-container">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
            <h3 className="empty-state-title">No Products Found</h3>
            <p className="empty-state-desc">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will be removed from the active catalog."
      />
    </div>
  );
}

export default Products;
