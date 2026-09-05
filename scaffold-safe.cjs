const fs = require('fs');
const path = require('path');

const pageConfigs = {
  'Users': { getter: 'getUsers', key: 'df_users', title: 'User Management', desc: 'Manage system users and access.' },
  'Roles': { getter: 'getRoles', key: 'df_roles', title: 'Roles & Permissions', desc: 'Configure RBAC.' },
  'Customers': { getter: 'getCustomers', key: 'df_customers', title: 'Customer Directory', desc: 'View and manage all B2B clients.' },
  'Products': { getter: 'getProducts', key: 'df_products', title: 'Product Catalog', desc: 'Manage product master data.' },
  'Categories': { getter: 'getCategories', key: 'df_categories', title: 'Categories', desc: 'Organize products.' },
  'PriceLists': { getter: 'getPriceLists', key: 'df_pricelists', title: 'Price Lists', desc: 'Tiered pricing and MSAs.' },
  'DiscountRules': { getter: 'getDiscountRules', key: 'df_discount_rules', title: 'Discount Rules', desc: 'Automated discount engine rules.' },
  'ApprovalRules': { getter: 'getApprovalRules', key: 'df_approval_rules', title: 'Approval Rules', desc: 'Multi-level quoting workflows.' },
  'Quotations': { getter: 'getQuotations', key: 'df_quotations', title: 'Quotations', desc: 'Active quotes.' },
  'Orders': { getter: 'getOrders', key: 'df_orders', title: 'Orders', desc: 'Sales order pipeline.' },
  'Warehouses': { getter: 'getWarehouses', key: 'df_warehouses', title: 'Warehouses', desc: 'Fulfillment locations.' },
  'Inventory': { getter: 'getInventory', key: 'df_inventory', title: 'Inventory Levels', desc: 'Real-time stock tracking.' },
  'Billing': { getter: 'getInvoices', key: 'df_invoices', title: 'Billing & Invoices', desc: 'Financial transactions.' },
  'Notifications': { getter: 'getNotifications', key: 'df_notifications', title: 'System Notifications', desc: 'Alerts and approvals.' },
  'AuditLogs': { getter: 'getAuditLogs', key: 'df_audit', title: 'Audit Logs', desc: 'System activity tracking.' }
};

const pagesDir = path.join(__dirname, 'src', 'pages');

Object.entries(pageConfigs).forEach(([page, config]) => {
  const file = path.join(pagesDir, `${page}.jsx`);
  
  const content = `import React, { useState, useEffect } from 'react';
import { ${config.getter}, saveEntity, deleteEntity } from '../services/storageService';
import { DataTable, Modal, ConfirmDialog } from '../components/common/UI';
import { toast } from 'react-toastify';

function ${page}() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedData = ${config.getter}();
    setData(loadedData);

    if (loadedData.length > 0) {
      const allKeys = Object.keys(loadedData[0]).filter(k => k !== 'id' && k !== 'description');
      
      let keysToUse = [];
      if (allKeys.includes('name')) keysToUse.push('name');
      else if (allKeys.includes('title')) keysToUse.push('title');
      
      if (allKeys.includes('sku')) keysToUse.push('sku');
      if (allKeys.includes('email')) keysToUse.push('email');
      if (allKeys.includes('role')) keysToUse.push('role');
      if (allKeys.includes('amount')) keysToUse.push('amount');
      
      for (const k of allKeys) {
         if (!keysToUse.includes(k) && k !== 'status' && keysToUse.length < 3) {
            keysToUse.push(k);
         }
      }
      
      if (allKeys.includes('status')) keysToUse.push('status');

      const generatedColumns = keysToUse.map(k => ({
        Header: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'),
        accessor: k,
        sortable: true
      }));
      
      generatedColumns.push({
        Header: 'Actions',
        accessor: 'actions',
        sortable: false,
        Cell: row => (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleOpenModal(row)} style={{ backgroundColor: 'white', color: '#4f46e5', border: '1px solid #e0e7ff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}>Edit</button>
            <button onClick={() => setDeleteConfirmId(row.id)} style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}>Delete</button>
          </div>
        )
      });
      setColumns(generatedColumns);
    } else {
      setColumns([
        { Header: 'ID', accessor: 'id' },
        { Header: 'Status', accessor: 'status' }
      ]);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      const empty = data.length > 0 ? Object.keys(data[0]).reduce((acc, k) => ({...acc, [k]: ''}), {}) : { name: '', status: 'Active' };
      setFormData(empty);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isNew = !editingItem;
    saveEntity('${config.key}', formData, isNew);
    toast.success(isNew ? 'Record created successfully!' : 'Record updated successfully!');
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = () => {
    deleteEntity('${config.key}', deleteConfirmId);
    toast.info('Record deleted.');
    setDeleteConfirmId(null);
    loadData();
  };

  const totalCount = data.length;
  const activeCount = data.filter(d => d.status === 'Active' || d.status === 'Healthy' || d.status === 'Approved' || d.status === 'Shipped').length;
  const pendingCount = data.filter(d => d.status === 'Pending' || d.status === 'Inactive' || d.status === 'Low Stock' || d.status === 'Unread').length;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem', color: '#111827' }}>${config.title}</h1>
          <p className="page-subtitle" style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>${config.desc}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>
            Export
          </button>
          <button onClick={() => handleOpenModal()} style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>
            + Add New
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', borderTop: '4px solid #8b5cf6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '12px' }}>TOTAL RECORDS</div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#6d28d9' }}>{totalCount}</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', borderTop: '4px solid #10b981', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '12px' }}>ACTIVE / HEALTHY</div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#059669' }}>{activeCount}</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', borderTop: '4px solid #f59e0b', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', letterSpacing: '0.05em', marginBottom: '12px' }}>ATTENTION NEEDED</div>
          <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#d97706' }}>{pendingCount}</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>Data Directory</h2>
        </div>
        <div style={{ padding: '20px' }}>
          {data.length > 0 ? (
            <DataTable columns={columns} data={data} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
              No ${page.toLowerCase()} found. Click "+ Add New" to create one.
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Record' : 'Create Record'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.keys(formData).filter(k => k !== 'id').map(key => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <input 
                type="text" 
                value={formData[key] || ''} 
                onChange={e => setFormData({...formData, [key]: e.target.value})} 
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }} 
              />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#4f46e5', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
      />
    </div>
  );
}

export default ${page};
`;
  fs.writeFileSync(file, content);
  console.log(`Generated ${page}.jsx`);
});
