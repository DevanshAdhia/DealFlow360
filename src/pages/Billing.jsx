import React, { useState } from 'react';
import { Button, Input, Select, Badge, DataTable } from '../components/common/UI';
import { getInvoices } from '../services/storageService';

function Billing() {
  const [invoices, setInvoices] = useState(() => getInvoices());
  const [search, setSearch] = useState('');

  const filtered = invoices.filter(i => 
    i.invoiceId.toLowerCase().includes(search.toLowerCase()) || 
    i.customer.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { Header: 'Invoice ID', accessor: 'invoiceId', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.invoiceId}</strong> },
    { Header: 'Order Ref', accessor: 'order', sortable: true, Cell: row => <span style={{ color: 'var(--text-tertiary)' }}>{row.order}</span> },
    { Header: 'Customer', accessor: 'customer', sortable: true },
    { Header: 'Amount', accessor: 'amount', sortable: true, Cell: row => <span style={{ fontWeight: 600 }}>${row.amount.toLocaleString()}</span> },
    { Header: 'Due Date', accessor: 'due', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge type={row.status === 'Paid' ? 'success' : row.status === 'Overdue' ? 'danger' : 'warning'}>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <Button variant="secondary" style={{ padding: '0.375rem 0.75rem' }}>Download PDF</Button>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Billing & Accounts Receivable</h1>
          <p className="page-subtitle">Track invoice ledgers, monitor outstanding balances, and record payments.</p>
        </div>
        <Button className="btn-primary">+ Create Invoice</Button>
      </div>

      <div className="metric-grid">
        <div className="metric-card active">
          <div className="metric-header">
            <span className="metric-title">OUTSTANDING BALANCE</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-brand">${invoices.filter(i=>i.status !== 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</div>
          <div className="metric-subtitle">Across all accounts</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">OVERDUE</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-danger">${invoices.filter(i=>i.status === 'Overdue').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</div>
          <div className="metric-subtitle">Requires immediate action</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">COLLECTED YTD</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">${invoices.filter(i=>i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</div>
          <div className="metric-subtitle">Successfully processed</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <svg className="filter-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            className="filter-search-input"
            placeholder="Search by Invoice ID or Customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="filter-select">
          <option>Status: All</option>
          <option>Draft</option>
          <option>Issued</option>
          <option>Overdue</option>
          <option>Paid</option>
        </select>
        
        <select className="filter-select">
          <option>Date Range: Last 30 Days</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="empty-state" style={{ minHeight: '250px', border: 'none', backgroundColor: 'transparent' }}>
            <div className="empty-state-icon-container">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="empty-state-title">No Invoices Found</h3>
            <p className="empty-state-desc">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Billing;
