import React, { useState } from 'react';
import { getInvoices, saveEntity, addAuditLog } from '../services/storageService';
import { DataTable, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

function Billing() {
  const [data, setData] = useState(() => getInvoices());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const refreshData = () => setData(getInvoices());

  const filteredData = data.filter(inv => {
    const matchSearch = !search || inv.invoiceId?.toLowerCase().includes(search.toLowerCase()) || inv.customer?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (invoice, newStatus) => {
    saveEntity('df_invoices', { ...invoice, status: newStatus }, false);
    addAuditLog(null, `Updated Invoice Status`, 'Invoice', `Invoice ${invoice.invoiceId} marked as ${newStatus}`);
    toast.success(`Invoice ${invoice.invoiceId} marked as ${newStatus}.`);
    refreshData();
  };

  const totalInvoices = data.length;
  const paidCount = data.filter(i => i.status === 'Paid').length;
  const overdueCount = data.filter(i => i.status === 'Overdue').length;
  const outstandingAmount = data.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((s, i) => s + (i.amount || 0), 0);

  const columns = [
    { Header: 'Invoice ID', accessor: 'invoiceId', sortable: true },
    { Header: 'Customer', accessor: 'customer', sortable: true },
    { Header: 'Order', accessor: 'order', sortable: true },
    { Header: 'Amount', accessor: 'amount', sortable: true, Cell: row => `₹${(row.amount || 0).toLocaleString('en-IN')}` },
    { Header: 'Due Date', accessor: 'due', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge onChange={s => handleStatusChange(row, s)}>{row.status}</Badge> },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {row.status !== 'Paid' && row.status !== 'Cancelled' && (
            <button onClick={() => handleStatusChange(row, 'Paid')} className="btn-table-action success">Mark Paid</button>
          )}
          {row.status === 'Draft' && (
            <button onClick={() => handleStatusChange(row, 'Issued')} className="btn-table-action edit">Issue</button>
          )}
          {row.status !== 'Cancelled' && row.status !== 'Paid' && (
            <button onClick={() => handleStatusChange(row, 'Cancelled')} className="btn-table-action danger">Cancel</button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-subtitle">Monitor all invoices, outstanding receivables, and overdue customer accounts.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL INVOICES</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="metric-value text-brand">{totalInvoices}</div>
          <div className="metric-subtitle">All-time invoices</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">PAID</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="metric-value text-success">{paidCount}</div>
          <div className="metric-subtitle">Settled accounts</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">OVERDUE</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="metric-value text-danger">{overdueCount}</div>
          <div className="metric-subtitle">Past due date</div>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">OUTSTANDING</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="metric-value text-warning">₹{(outstandingAmount / 100000).toFixed(1)}L</div>
          <div className="metric-subtitle">Uncollected receivables</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>All Invoices ({filteredData.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice ID or customer…" className="form-input" style={{ width: '220px', height: '32px' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '160px', height: '32px' }}>
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Issued">Issued</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={filteredData} emptyMessage="No invoices found." />
      </div>
    </div>
  );
}

export default Billing;
