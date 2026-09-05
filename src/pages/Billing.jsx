import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

function Billing() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchInvoices = async () => {
    setPageLoading(true);
    try {
      const res = await api.getInvoices();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load invoices from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);
  useEffect(() => { setTablePage(1); }, [search, filterStatus]);

  const filteredData = data.filter(inv => {
    const matchSearch = !search || (inv.invoiceId || inv.invoice_number)?.toLowerCase().includes(search.toLowerCase()) || (inv.customer || inv.customer_name)?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (invoice, newStatus) => {
    try {
      const backendStatus = newStatus.toUpperCase().replace(' ', '_');
      await api.updateInvoice(invoice.id, { status: backendStatus });
      toast.success(`Invoice status updated to ${newStatus}.`);
      await fetchInvoices();
    } catch (err) {
      toast.error(err.message || 'Failed to update invoice status.');
    }
  };

  const totalInvoices = data.length;
  const paidCount = data.filter(i => i.status === 'Paid' || i.status === 'PAID').length;
  const overdueCount = data.filter(i => i.status === 'Overdue' || i.status === 'OVERDUE').length;
  const outstandingAmount = data.filter(i => i.status !== 'Paid' && i.status !== 'PAID' && i.status !== 'CANCELLED' && i.status !== 'Cancelled').reduce((s, i) => s + Number(i.total_amount || i.amount || 0), 0);

  const columns = [
    { Header: 'Invoice Number', accessor: 'invoice_number', sortable: true, Cell: row => row.invoice_number || row.invoiceId || row.id },
    { Header: 'Customer', accessor: 'customer_name', sortable: true, Cell: row => row.customer_name || row.customer || 'N/A' },
    { Header: 'Quotation', accessor: 'quotation_number', sortable: true, Cell: row => row.quotation_number || row.quotation || 'N/A' },
    { Header: 'Amount', accessor: 'total_amount', sortable: true, Cell: row => `₹${Number(row.total_amount ?? row.amount ?? 0).toLocaleString('en-IN')}` },
    { Header: 'Due Date', accessor: 'due_date', sortable: true, Cell: row => row.due_date || row.due || 'N/A' },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status || 'ISSUED'}</Badge> },
    {
      Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {row.status !== 'PAID' && row.status !== 'Paid' && row.status !== 'CANCELLED' && row.status !== 'Cancelled' && (
            <button onClick={() => handleStatusChange(row, 'Paid')} className="btn-table-action success">Mark Paid</button>
          )}
          {row.status === 'DRAFT' && (
            <button onClick={() => handleStatusChange(row, 'Issued')} className="btn-table-action edit">Issue</button>
          )}
          {row.status !== 'CANCELLED' && row.status !== 'Cancelled' && row.status !== 'PAID' && row.status !== 'Paid' && (
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
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading invoices from backend…</div>
        ) : (
          <DataTable columns={columns} data={filteredData} emptyMessage="No invoices found." currentPage={tablePage} onPageChange={setTablePage} />
        )}
      </div>
    </div>
  );
}

export default Billing;
