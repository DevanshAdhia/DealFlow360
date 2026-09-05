import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
import { getCustomers, saveEntity, deleteEntity } from '../services/storageService';

function Customers() {
  const [customers, setCustomers] = useState(() => getCustomers());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '', industry: '', tier: 'Standard', status: 'Active'
  });

  const tiers = ['Standard', 'Silver', 'Gold', 'Platinum', 'Enterprise'];

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({ 
        name: customer.name, company: customer.company, email: customer.email, 
        phone: customer.phone, industry: customer.industry, tier: customer.tier, status: customer.status 
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', company: '', email: '', phone: '', industry: '', tier: 'Standard', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.company) {
      toast.error('Name and Company are required');
      return;
    }
    
    const isNew = !editingCustomer;
    const entity = { ...formData, id: isNew ? undefined : editingCustomer.id };
    const updated = saveEntity('df_customers', entity, isNew);
    setCustomers(updated);
    toast.success(`Customer ${isNew ? 'created' : 'updated'} successfully`);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const updated = deleteEntity('df_customers', id);
      setCustomers(updated);
      toast.success('Customer deleted successfully');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Customer Management</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Customer</Button>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All Customers</span>
          <Input 
            placeholder="Search customers..." 
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
                  <th>Customer Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.company}</td>
                    <td>{c.email}</td>
                    <td><Badge type={c.tier === 'Enterprise' || c.tier === 'Platinum' ? 'success' : 'default'}>{c.tier}</Badge></td>
                    <td><Badge>{c.status}</Badge></td>
                    <td>
                      <Button variant="secondary" onClick={() => handleOpenModal(c)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem' }}>Edit</Button>
                      <Button variant="danger" onClick={() => handleDelete(c.id)} style={{ padding: '0.25rem 0.5rem' }}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Create Customer'}>
        <form onSubmit={handleSubmit}>
          <Input label="Primary Contact Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <Input label="Company Name" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} required />
          <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <Input label="Industry" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
          <Select label="Customer Tier" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} options={tiers} />
          <Select label="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} options={['Active', 'Inactive']} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Customers;
