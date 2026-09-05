import React, { useState } from 'react';
import { getQuotations, saveEntity, deleteEntity, addAuditLog } from '../services/storageService';
import { DataTable, Modal, ConfirmDialog, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const STATUSES = ['Draft', 'Pending', 'Negotiating', 'Approved', 'Rejected', 'Confirmed'];

function Quotations() {
  const [data, setData] = useState(() => getQuotations());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const refresh = () => setData(getQuotations());
  const filtered = data.filter(q => {
    const s = !search || q.quoteId?.toLowerCase().includes(search.toLowerCase()) || q.customer?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterStatus || q.status === filterStatus) && (!filterRisk || q.risk === filterRisk);
  });

  const handleStatusChange = (q, ns) => {
    saveEntity('df_quotations', { ...q, status: ns }, false);
    addAuditLog(null, `${ns} Quotation`, 'Quotation', `Quote ${q.quoteId} → ${ns}`);
    toast.success(`Quote ${q.quoteId} ${ns.toLowerCase()}.`);
    refresh();
  };

  const handleDelete = () => {
    const q = data.find(x => x.id === deleteConfirmId);
    deleteEntity('df_quotations', deleteConfirmId);
    addAuditLog(null, 'Deleted Quotation', 'Quotation', `Deleted ${q?.quoteId}`);
    toast.info('Quotation deleted.'); setDeleteConfirmId(null); refresh();
  };

  const totalCount = data.length;
  const pendingCount = data.filter(q => q.status === 'Pending').length;
  const approvedCount = data.filter(q => q.status === 'Approved' || q.status === 'Confirmed').length;
  const highRiskCount = data.filter(q => q.risk === 'High' || q.risk === 'Critical').length;
  const totalValue = data.reduce((s, q) => s + Number(q.amount || 0), 0);

  const columns = [
    { Header: 'Quote ID', accessor: 'quoteId', sortable: true },
    { Header: 'Customer', accessor: 'customer', sortable: true },
    { Header: 'Amount', accessor: 'amount', sortable: true, Cell: row => `₹${Number(row.amount || 0).toLocaleString('en-IN')}` },
    { Header: 'Discount', accessor: 'discount', sortable: true, Cell: row => `${row.discount || 0}%` },
    { Header: 'Risk', accessor: 'risk', sortable: true, Cell: row => <Badge>{row.risk || 'Low'}</Badge> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge onChange={s => handleStatusChange(row, s)}>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
          <h1 className="page-title">Quotations</h1>
          <p className="page-subtitle">Monitor and manage all sales quotations, approvals, risk assessments and pipeline.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL QUOTES</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">All-time quotes</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">PENDING APPROVAL</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-warning">{pendingCount}</div>
          <div className="metric-subtitle">Awaiting review</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">APPROVED / CONFIRMED</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{approvedCount}</div>
          <div className="metric-subtitle">Ready to order</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">PIPELINE VALUE</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div className="metric-value text-danger">₹{(totalValue / 100000).toFixed(1)}L</div>
          <div className="metric-subtitle">Total pipeline</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>All Quotations ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quote ID or customer…" className="form-input" style={{ width: '220px', height: '32px' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="form-select" style={{ width: '140px', height: '32px' }}>
              <option value="">All Risk Levels</option>
              <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
            </select>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No quotations found." />
      </div>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={`Quote Detail — ${viewItem?.quoteId}`}>
        {viewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[['Customer', viewItem.customer], ['Sales Rep', viewItem.rep], ['Amount', `₹${Number(viewItem.amount || 0).toLocaleString('en-IN')}`], ['Discount', `${viewItem.discount || 0}%`], ['Margin', `${viewItem.margin || 0}%`], ['Risk', viewItem.risk], ['Status', viewItem.status], ['Created', viewItem.created], ['Expiry', viewItem.expiry]].map(([label, val]) => (
                <div key={label}><div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div><div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{val}</div></div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
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
