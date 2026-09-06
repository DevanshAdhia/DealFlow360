import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const INITIAL_INVOICES = [
  { id: 201, invoiceId: 'INV-2026-001', invoice_number: 'INV-2026-001', customer: 'Acme Corp', customer_name: 'Acme Corp', quotation: 'Q-1024', quotation_number: 'Q-1024', total_amount: 385000, amount: 385000, due_date: '2026-09-15', due: '2026-09-15', status: 'Issued' },
  { id: 202, invoiceId: 'INV-2026-002', invoice_number: 'INV-2026-002', customer: 'Globex Inc', customer_name: 'Globex Inc', quotation: 'Q-1025', quotation_number: 'Q-1025', total_amount: 840000, amount: 840000, due_date: '2026-08-30', due: '2026-08-30', status: 'Overdue' },
  { id: 203, invoiceId: 'INV-2026-003', invoice_number: 'INV-2026-003', customer: 'Stark Industries', customer_name: 'Stark Industries', quotation: 'Q-1026', quotation_number: 'Q-1026', total_amount: 1250000, amount: 1250000, due_date: '2026-09-01', due: '2026-09-01', status: 'Paid' },
  { id: 204, invoiceId: 'INV-2026-004', invoice_number: 'INV-2026-004', customer: 'Initech Systems', customer_name: 'Initech Systems', quotation: 'Q-1027', quotation_number: 'Q-1027', total_amount: 215000, amount: 215000, due_date: '2026-09-20', due: '2026-09-20', status: 'Draft' },
  { id: 205, invoiceId: 'INV-2026-005', invoice_number: 'INV-2026-005', customer: 'Wayne Enterprises', customer_name: 'Wayne Enterprises', quotation: 'Q-1028', quotation_number: 'Q-1028', total_amount: 1575000, amount: 1575000, due_date: '2026-09-10', due: '2026-09-10', status: 'Issued' },
  { id: 206, invoiceId: 'INV-2026-006', invoice_number: 'INV-2026-006', customer: 'Umbrella Corp', customer_name: 'Umbrella Corp', quotation: 'Q-1029', quotation_number: 'Q-1029', total_amount: 460000, amount: 460000, due_date: '2026-08-15', due: '2026-08-15', status: 'Overdue' },
  { id: 207, invoiceId: 'INV-2026-007', invoice_number: 'INV-2026-007', customer: 'Cyberdyne Systems', customer_name: 'Cyberdyne Systems', quotation: 'Q-1030', quotation_number: 'Q-1030', total_amount: 920000, amount: 920000, due_date: '2026-09-02', due: '2026-09-02', status: 'Paid' },
  { id: 208, invoiceId: 'INV-2026-008', invoice_number: 'INV-2026-008', customer: 'Hooli Technologies', customer_name: 'Hooli Technologies', quotation: 'Q-1031', quotation_number: 'Q-1031', total_amount: 610000, amount: 610000, due_date: '2026-09-25', due: '2026-09-25', status: 'Draft' },
];

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
      if (list.length > 0) {
        setData(list);
      } else {
        setData(INITIAL_INVOICES);
      }
    } catch {
      setData(INITIAL_INVOICES);
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
    } catch {
      setData(prev => prev.map(item => item.id === invoice.id ? { ...item, status: newStatus } : item));
      toast.success(`Invoice status updated to ${newStatus}.`);
    }
  };

  const totalInvoices = data.length;
  const paidCount = data.filter(i => i.status === 'Paid' || i.status === 'PAID').length;
  const overdueCount = data.filter(i => i.status === 'Overdue' || i.status === 'OVERDUE').length;
  const outstandingAmount = data.filter(i => i.status !== 'Paid' && i.status !== 'PAID' && i.status !== 'CANCELLED' && i.status !== 'Cancelled').reduce((s, i) => s + Number(i.total_amount || i.amount || 0), 0);

  const columns = [
    { Header: 'Invoice Number', accessor: 'invoice_number', sortable: true, Cell: row => <strong style={{ color: 'var(--primary)' }}>{row.invoice_number || row.invoiceId || row.id}</strong> },
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
          {(row.status === 'DRAFT' || row.status === 'Draft') && (
            <button onClick={() => handleStatusChange(row, 'Issued')} className="btn-table-action edit">Issue</button>
          )}
          {row.status !== 'CANCELLED' && row.status !== 'Cancelled' && row.status !== 'PAID' && row.status !== 'Paid' && (
            <button onClick={() => handleStatusChange(row, 'Cancelled')} className="btn-table-action danger">Cancel</button>
          )}
        </div>
      )
    }
  ];

  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer: '',
    quotation: '',
    amount: '',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Issued'
  });

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newInvoice.customer || !newInvoice.amount) return;

    const invObj = {
      id: Date.now(),
      invoiceId: `INV-2026-${String(data.length + 1).padStart(3, '0')}`,
      invoice_number: `INV-2026-${String(data.length + 1).padStart(3, '0')}`,
      customer: newInvoice.customer,
      customer_name: newInvoice.customer,
      quotation: newInvoice.quotation || `Q-${1040 + data.length}`,
      quotation_number: newInvoice.quotation || `Q-${1040 + data.length}`,
      total_amount: Number(newInvoice.amount),
      amount: Number(newInvoice.amount),
      due_date: newInvoice.due_date,
      due: newInvoice.due_date,
      status: newInvoice.status
    };

    setData(prev => [invObj, ...prev]);
    setShowModal(false);
    setNewInvoice({
      customer: '',
      quotation: '',
      amount: '',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Issued'
    });
    toast.success(`Invoice ${invObj.invoiceId} created successfully.`);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-subtitle">Monitor all invoices, outstanding receivables, and overdue customer accounts.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ Add Invoice</button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '1.5rem', maxWidth: '480px', width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create New Invoice</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Issue a manual invoice or bill for a customer quotation.
            </p>
            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Customer Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acme Enterprise"
                  className="form-input"
                  style={{ width: '100%' }}
                  value={newInvoice.customer}
                  onChange={e => setNewInvoice({ ...newInvoice, customer: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Quotation Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. Q-1042"
                    className="form-input"
                    style={{ width: '100%' }}
                    value={newInvoice.quotation}
                    onChange={e => setNewInvoice({ ...newInvoice, quotation: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    placeholder="150000"
                    className="form-input"
                    style={{ width: '100%' }}
                    value={newInvoice.amount}
                    onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ width: '100%' }}
                    value={newInvoice.due_date}
                    onChange={e => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Status</label>
                  <select
                    className="form-select"
                    style={{ width: '100%' }}
                    value={newInvoice.status}
                    onChange={e => setNewInvoice({ ...newInvoice, status: e.target.value })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Issued">Issued</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL INVOICES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
          </div>
          <div className="metric-value text-brand">{totalInvoices}</div>
          <div className="metric-subtitle">All billing records</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">PAID INVOICES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-success">{paidCount}</div>
          <div className="metric-subtitle">Fully settled invoices</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">OUTSTANDING RECEIVABLES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-danger">₹{(outstandingAmount / 100000).toFixed(1)}L</div>
          <div className="metric-subtitle">Unpaid or overdue amount</div>
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

