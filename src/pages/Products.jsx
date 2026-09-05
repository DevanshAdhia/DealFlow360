import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
import { getProducts, getCategories, saveEntity, deleteEntity } from '../services/storageService';

function Products() {
  const [products, setProducts] = useState(() => getProducts());
  const [categories] = useState(() => getCategories());
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', cost: 0, price: 0, stock: 0, status: 'Active'
  });

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const calculateMargin = (price, cost) => {
    if (!price || price <= 0) return { margin: 0, percent: 0 };
    const margin = price - cost;
    const percent = ((margin / price) * 100).toFixed(1);
    return { margin, percent };
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', category: '', cost: 0, price: 0, stock: 0, status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      toast.error('Name and SKU are required');
      return;
    }
    if (Number(formData.price) <= 0 || Number(formData.cost) < 0) {
      toast.error('Invalid pricing');
      return;
    }
    
    const isNew = !editingProduct;
    const entity = { 
      ...formData, 
      id: isNew ? undefined : editingProduct.id,
      cost: Number(formData.cost),
      price: Number(formData.price),
      stock: Number(formData.stock)
    };
    
    const updated = saveEntity('df_products', entity, isNew);
    setProducts(updated);
    toast.success(`Product ${isNew ? 'created' : 'updated'} successfully`);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updated = deleteEntity('df_products', id);
      setProducts(updated);
      toast.success('Product deleted successfully');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Product Management</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Product</Button>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All Products</span>
          <Input 
            placeholder="Search products..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ marginBottom: 0, width: '250px' }}
          />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Cost</th>
                  <th>Price</th>
                  <th>Margin</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const { margin, percent } = calculateMargin(p.price, p.cost);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.sku}</td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.category}</td>
                      <td>${p.cost.toFixed(2)}</td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>
                        <span style={{ color: percent < 15 ? 'var(--danger)' : 'var(--success)' }}>
                          ${margin.toFixed(2)} ({percent}%)
                        </span>
                      </td>
                      <td>
                        <Badge type={p.stock > 20 ? 'Healthy' : p.stock > 0 ? 'Low Stock' : 'Critical'}>
                          {p.stock}
                        </Badge>
                      </td>
                      <td><Badge>{p.status}</Badge></td>
                      <td>
                        <Button variant="secondary" onClick={() => handleOpenModal(p)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}>Edit</Button>
                        <Button variant="danger" onClick={() => handleDelete(p.id)} style={{ padding: '0.25rem 0.5rem' }}>Delete</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Create Product'}>
        <form onSubmit={handleSubmit}>
          <Input label="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div style={{ flex: 1 }}><Input label="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required /></div>
            <div style={{ flex: 1 }}><Select label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} options={['', ...categories.map(c => c.name)]} required /></div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div style={{ flex: 1 }}><Input label="Cost Price ($)" type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required /></div>
            <div style={{ flex: 1 }}><Input label="Selling Price ($)" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required /></div>
          </div>
          
          <div style={{ backgroundColor: 'var(--surface-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Calculated Margin:</span>
            <strong>${calculateMargin(formData.price, formData.cost).margin.toFixed(2)} ({calculateMargin(formData.price, formData.cost).percent}%)</strong>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div style={{ flex: 1 }}><Input label="Stock Quantity" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required /></div>
            <div style={{ flex: 1 }}><Select label="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} options={['Active', 'Inactive']} /></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Products;
