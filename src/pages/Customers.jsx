import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, DataTable, ConfirmDialog } from '../components/common/UI';
import { getCustomers, saveEntity, deleteEntity } from '../services/storageService';

function Customers() {
  const [customers, setCustomers] = useState(() => getCustomers());
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const filtered = customers.filter(c => {
    const s = search.toLowerCase();
    return (c.name || '').toLowerCase().includes(s) || 
           (c.company || '').toLowerCase().includes(s) ||
           (c.email || '').toLowerCase().includes(s);
  });

  const handleDelete = (id) => {
    setCustomerToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    const updated = deleteEntity('df_customers', customerToDelete);
    setCustomers(updated);
    toast.success("Customer record deleted.");
    setShowConfirm(false);
  };

  const columns = [
    { Header: 'Customer', accessor: 'name', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.name || 'Unknown'}</strong> },
    { Header: 'Company', accessor: 'company', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.company || '-'}</span> },
    { Header: 'Tier', accessor: 'tier', sortable: true, Cell: row => <Badge type={row.tier === 'Enterprise' ? 'warning' : 'info'}>{row.tier || 'Standard'}</Badge> },
    { Header: 'Credit Limit', accessor: 'creditLimit', sortable: true, Cell: row => <span style={{ fontWeight: 500 }}>${(row.creditLimit || 0).toLocaleString()}</span> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status || 'Active'}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" style={{ padding: '0.375rem 0.75rem' }}>View Profile</Button>
          <Button variant="danger" style={{ padding: '0.375rem 0.75rem' }} onClick={() => handleDelete(row.id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Customer Directory</h1>
          <p className="page-subtitle">Manage client accounts, assign tiers, and monitor credit limits for quoting.</p>
        </div>
        <Button className="btn-primary">+ Add Customer</Button>
      </div>

      <div className="metric-grid">
        <div className="metric-card active">
          <div className="metric-header">
            <span className="metric-title">TOTAL ACCOUNTS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div className="metric-value text-brand">{customers.length}</div>
          <div className="metric-subtitle">Across all regions</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">ENTERPRISE TIER</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
          </div>
          <div className="metric-value text-warning">{customers.filter(c=>c.tier==='Enterprise').length}</div>
          <div className="metric-subtitle">High priority clients</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">CREDIT LIMIT</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">${(customers.reduce((sum, c) => sum + (c.creditLimit || 0), 0) / 1000).toFixed(0)}k</div>
          <div className="metric-subtitle">Total exposure available</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <svg className="filter-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            className="filter-search-input"
            placeholder="Search by Name, Company, or Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="filter-select">
          <option>Tier: All Tiers</option>
          <option>Enterprise</option>
          <option>Platinum</option>
          <option>Gold</option>
        </select>
        
        <select className="filter-select">
          <option>Status: Active Only</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="empty-state" style={{ minHeight: '250px', border: 'none', backgroundColor: 'transparent' }}>
            <div className="empty-state-icon-container">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h3 className="empty-state-title">No Customers Found</h3>
            <p className="empty-state-desc">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action will not affect historical quotes or orders, but will prevent future transactions."
      />
    </div>
  );
}

export default Customers;
