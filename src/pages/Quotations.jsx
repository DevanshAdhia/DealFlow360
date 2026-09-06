import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, ConfirmDialog, Badge, QuickStatusBadge } from '../components/common/UI';
import { toast } from 'react-toastify';

const STATUSES = ['Draft', 'Pending', 'Negotiating', 'Approved', 'Rejected', 'Confirmed'];

function Quotations() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchQuotations = async () => {
    setPageLoading(true);
    try {
      const res = await api.getQuotations();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load quotations from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);
  const matchStatus = (quoteStatus, targetFilter) => {
    if (!targetFilter) return true;
    const qStat = String(quoteStatus || '').toUpperCase().trim();
    const fStat = String(targetFilter || '').toUpperCase().trim();

    if (fStat === 'REJECTED') {
      return qStat === 'REJECTED' || qStat === 'DECLINED' || qStat === 'REJECTED_BY_CUSTOMER' || qStat === 'CANCELLED';
    }
    if (fStat === 'APPROVED') {
      return qStat === 'APPROVED' || qStat === 'ACCEPTED';
    }
    if (fStat === 'CONFIRMED') {
      return qStat === 'CONFIRMED' || qStat === 'ACCEPTED';
    }
    if (fStat === 'PENDING') {
      return qStat === 'PENDING' || qStat === 'SUBMITTED' || qStat === 'UNDER_REVIEW' || qStat === 'APPROVAL_REQUIRED';
    }
    if (fStat === 'NEGOTIATING') {
      return qStat === 'NEGOTIATING' || qStat === 'UNDER_NEGOTIATION' || qStat === 'REVISED';
    }
    if (fStat === 'DRAFT') {
      return qStat === 'DRAFT' || qStat === 'NEW';
    }

    return qStat === fStat || qStat.includes(fStat);
  };

  const filtered = data.filter(q => {
    const qNum = q.quotation_number || q.quote_number || q.quoteId || q.id || '';
    const custName = q.customer_name || q.customer || '';
    const matchesSearch = !search || qNum.toLowerCase().includes(search.toLowerCase()) || custName.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = !filterRisk || (q.risk_level || q.risk || '').toLowerCase() === filterRisk.toLowerCase();
    return matchesSearch && matchStatus(q.status, filterStatus) && matchesRisk;
  });

  const handleStatusChange = async (q, ns) => {
    try {
      if (ns === 'Approved') {
        await api.submitQuotation(q.id);
      }
      toast.success(`Quote status updated to ${ns}.`);
      await fetchQuotations();
    } catch (err) {
      toast.error(err.message || 'Failed to update quotation status.');
    }
  };

  const handleDelete = () => {
    toast.info('Delete quotation operation restricted by backend policies.');
    setDeleteConfirmId(null);
  };

  const totalCount = data.length;
  const pendingCount = data.filter(q => q.status === 'Pending' || q.status === 'SUBMITTED').length;
  const approvedCount = data.filter(q => q.status === 'Approved' || q.status === 'APPROVED' || q.status === 'Confirmed' || q.status === 'SENT').length;
  const totalValue = data.reduce((s, q) => s + Number(q.total_amount || q.amount || 0), 0);

  const columns = [
    { Header: 'Quote Number', accessor: 'quotation_number', sortable: true, Cell: row => row.quotation_number || row.quote_number || row.quoteId || row.id },
    { Header: 'Customer', accessor: 'customer_name', sortable: true, Cell: row => row.customer_name || row.customer || 'N/A' },
    { Header: 'Amount', accessor: 'total_amount', sortable: true, Cell: row => `₹${Number(row.total_amount ?? row.amount ?? 0).toLocaleString('en-IN')}` },
    { Header: 'Discount', accessor: 'discount_percent', sortable: true, Cell: row => `${row.discount_percent ?? row.discount_percentage ?? row.discount ?? 0}%` },
    { Header: 'Risk', accessor: 'risk_level', sortable: true, Cell: row => {
        const risk = row.risk_level || row.risk || 'Low';
        const variant = risk === 'Critical' || risk === 'High' ? 'danger' : risk === 'Medium' ? 'warning' : 'success';
        return <Badge variant={variant}>{risk}</Badge>;
      } 
    },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => (
        <QuickStatusBadge 
          currentStatus={row.status || 'Draft'} 
          onStatusChange={(ns) => handleStatusChange(row, ns)} 
        />
      ) 
    },
    { Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        <button onClick={() => setViewItem(row)} className="btn-table-action edit">View</button>
        {row.status === 'Pending' && <button onClick={() => handleStatusChange(row, 'Approved')} className="btn-table-action success">Approve</button>}
        {row.status === 'Pending' && <button onClick={() => handleStatusChange(row, 'Rejected')} className="btn-table-action danger">Reject</button>}
        {row.status === 'Approved' && <button onClick={() => handleStatusChange(row, 'Confirmed')} className="btn-table-action success">Confirm</button>}
        <button onClick={() => setDeleteConfirmId(row.id)} className="btn-table-action danger">Delete</button>
      </div>
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Quotation Management</h1>
          <p className="page-subtitle">Track, review, and approve commercial sales quotations.</p>
        </div>
        <button onClick={() => toast.info('New quotation builder opened')} className="btn btn-primary">+ Create Quotation</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL QUOTES</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">All-time quotations</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">PENDING APPROVAL</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-warning">{pendingCount}</div>
          <div className="metric-subtitle">Awaiting managerial review</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">APPROVED & CONFIRMED</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-success">{approvedCount}</div>
          <div className="metric-subtitle">Ready to convert to order</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>All Quotations ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quote number or customer…" className="form-input" style={{ width: '220px', height: '32px' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Risk Levels</option>
              <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
            </select>
          </div>
        </div>
        {pageLoading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading quotations from backend…</div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No quotations found." currentPage={tablePage} onPageChange={setTablePage} />
        )}
      </div>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={`Quote Detail — ${viewItem?.quotation_number || viewItem?.quote_number || viewItem?.id}`}>
        {viewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              {[
                ['Quotation Number', viewItem.quotation_number || viewItem.quote_number || viewItem.id],
                ['Customer', viewItem.customer_name || viewItem.customer || 'N/A'],
                ['Sales Rep', viewItem.sales_rep_name || viewItem.rep || 'N/A'],
                ['Amount', `₹${Number(viewItem.total_amount ?? viewItem.amount ?? 0).toLocaleString('en-IN')}`],
                ['Discount', `${viewItem.discount_percent ?? viewItem.discount ?? 0}% (₹${Number(viewItem.discount_amount || 0).toLocaleString('en-IN')})`],
                ['Margin', `${viewItem.margin_percent ?? viewItem.margin ?? 0}% (₹${Number(viewItem.margin_amount || 0).toLocaleString('en-IN')})`],
                ['Risk Level', `${viewItem.risk_level || viewItem.risk || 'Low'} (Score: ${viewItem.blended_risk_score ?? '0'})`],
                ['Status', viewItem.status],
                ['Created Date', viewItem.created_at ? new Date(viewItem.created_at).toLocaleString('en-IN') : 'N/A'],
                ['Expiry Date', viewItem.valid_until || 'N/A']
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {val || 'N/A'}
                  </div>
                </div>
              ))}
            </div>

            {viewItem.notes && (
              <div style={{ background: 'var(--surface-secondary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>NOTES / PROJECT DETAILS</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{viewItem.notes}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              {viewItem.status === 'Pending' && <><button onClick={() => { handleStatusChange(viewItem, 'Approved'); setViewItem(null); }} className="btn btn-primary">Approve</button><button onClick={() => { handleStatusChange(viewItem, 'Rejected'); setViewItem(null); }} className="btn btn-danger">Reject</button></>}
              {viewItem.status === 'Approved' && <button onClick={() => { handleStatusChange(viewItem, 'Confirmed'); setViewItem(null); }} className="btn btn-primary">Confirm Order</button>}
              <button onClick={() => setViewItem(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} onConfirm={handleDelete} title="Delete Quotation" message="Permanently delete this quotation?" />
    </div>
  );
}

export default Quotations;
