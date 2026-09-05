import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, Modal } from '../components/common/UI';
import { getInventory, saveEntity, getProducts, addAuditLog, getSession } from '../services/storageService';

function Inventory() {
  const [inventory, setInventory] = useState(() => getInventory());
  const [products] = useState(() => getProducts());
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [adjType, setAdjType] = useState('Increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  const filtered = inventory.filter(i => 
    i.product.toLowerCase().includes(search.toLowerCase()) || 
    i.warehouse.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (item) => {
    setEditingItem(item);
    setAdjType('Increase');
    setQuantity('');
    setReason('');
    setIsModalOpen(true);
  };

  const handleAdjust = (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      toast.error('Valid quantity required');
      return;
    }

    let newAvail = editingItem.available;
    if (adjType === 'Increase') newAvail += qty;
    if (adjType === 'Decrease') {
      if (newAvail < qty) {
        toast.error('Stock cannot become negative');
        return;
      }
      newAvail -= qty;
    }

    const newStatus = newAvail > 20 ? 'Healthy' : newAvail > 0 ? 'Low Stock' : 'Critical';
    
    const updatedEntity = { ...editingItem, available: newAvail, status: newStatus };
    const updatedList = saveEntity('df_inventory', updatedEntity, false);
    
    // Log audit
    const session = getSession();
    addAuditLog(session, 'Adjusted Inventory', 'Inventory', `${adjType}d ${qty} units of ${editingItem.product} in ${editingItem.warehouse}. Reason: ${reason}`);

    setInventory(updatedList);
    toast.success('Inventory adjusted successfully');
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Stock Levels</span>
          <Input 
            placeholder="Search products/warehouses..." 
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
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Available Stock</th>
                  <th>Reserved</th>
                  <th>Incoming</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.product}</td>
                    <td>{item.warehouse}</td>
                    <td>{item.available}</td>
                    <td>{item.reserved}</td>
                    <td>{item.incoming}</td>
                    <td><Badge>{item.status}</Badge></td>
                    <td>
                      <Button variant="primary" onClick={() => handleOpenModal(item)} style={{ padding: '0.25rem 0.5rem' }}>Adjust</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Adjust Stock: ${editingItem?.product}`}>
        <form onSubmit={handleAdjust}>
          <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
            Current Available in <strong>{editingItem?.warehouse}</strong>: {editingItem?.available}
          </div>
          
          <Select label="Adjustment Type" value={adjType} onChange={e => setAdjType(e.target.value)} options={['Increase', 'Decrease']} />
          <Input label="Quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          <Input label="Reason" value={reason} onChange={e => setReason(e.target.value)} required />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Confirm Adjustment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Inventory;
