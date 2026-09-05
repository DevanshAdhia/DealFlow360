import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const ORDER_STATUSES = ['Created', 'Processing', 'Partially Fulfilled', 'Fulfilled', 'Cancelled'];

function Orders() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);

  const fetchOrders = async () => {
    setPageLoading(true);
    try {
      const res = await api.getOrders();
      const list = Array.isArray(res) ? res : res.results || [];
      setData(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load orders from backend.');
      setData([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  useEffect(() => { setTablePage(1); }, [search, filterStatus, filterPayment]);

  const filtered = data.filter(o => {
    const s = !search || (o.orderId || o.order_number)?.toLowerCase().includes(search.toLowerCase()) || (o.customer || o.customer_name)?.toLowerCase().includes(search.toLowerCase());
    return s && (!filterStatus || o.status === filterStatus) && (!filterPayment || o.payment === filterPayment);
  });

  const handleStatusChange = async (order, ns) => {
    try {
      const backendStatus = ns.toUpperCase().replace(' ', '_');
      await api.updateOrder(order.id, { status: backendStatus });
      toast.success(`Order status updated to ${ns}.`);
      await fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.');
    }
  };

  const totalCount = data.length;
  const processingCount = data.filter(o => o.status === 'Processing' || o.status === 'Created' || o.status === 'PENDING' || o.status === 'IN_FULFILLMENT').length;
  const fulfilledCount = data.filter(o => o.status === 'Fulfilled' || o.status === 'FULFILLED' || o.status === 'COMPLETED').length;
  const totalRevenue = data.filter(o => o.status !== 'Cancelled' && o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total_amount || o.amount || 0), 0);

  const columns = [
    { Header: 'Order Number', accessor: 'order_number', sortable: true, Cell: row => row.order_number || row.orderId || row.id },
    { Header: 'Customer', accessor: 'customer_name', sortable: true, Cell: row => row.customer_name || row.customer || 'N/A' },
    { Header: 'Amount', accessor: 'total_amount', sortable: true, Cell: row => `₹${Number(row.total_amount ?? row.amount ?? 0).toLocaleString('en-IN')}` },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status || 'Created'}</Badge> },
    { Header: 'Payment', accessor: 'payment', sortable: true, Cell: row => <Badge>{row.payment || (row.status === 'FULFILLED' || row.status === 'COMPLETED' ? 'Paid' : 'Unpaid')}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => setViewItem(row)} className="btn-table-action edit">View</button>
        {row.status !== 'FULFILLED' && row.status !== 'COMPLETED' && row.status !== 'CANCELLED' && <button onClick={() => handleStatusChange(row, 'Fulfilled')} className="btn-table-action success">Fulfill</button>}
        {row.status !== 'CANCELLED' && <button onClick={() => handleStatusChange(row, 'Cancelled')} className="btn-table-action danger">Cancel</button>}
      </div>
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track, manage and update the status of all sales orders across the pipeline.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL ORDERS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">All-time orders</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">IN PIPELINE</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-warning">{processingCount}</div>
          <div className="metric-subtitle">Processing or created</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">FULFILLED</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{fulfilledCount}</div>
          <div className="metric-subtitle">Completed orders</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span className="metric-title">TOTAL REVENUE</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div className="metric-value text-danger">₹{(totalRevenue / 100000).toFixed(1)}L</div>
          <div className="metric-subtitle">Excl. cancelled</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>All Orders ({filtered.length})</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order or customer…" className="form-input" style={{ width: '220px', height: '32px' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ width: '160px', height: '32px' }}>
              <option value="">All Statuses</option>{ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)} className="form-select" style={{ width: '150px', height: '32px' }}>
              <option value="">All Payments</option>
              <option value="Paid">Paid</option><option value="Unpaid">Unpaid</option><option value="Partially Paid">Partially Paid</option><option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
        {pageLoading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading orders from backend…</div>
        ) : (
          <DataTable columns={columns} data={filtered} emptyMessage="No orders found." currentPage={tablePage} onPageChange={setTablePage} />
        )}
      </div>

      <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title={`Order — ${viewItem?.orderId || viewItem?.order_number || viewItem?.id}`}>
        {viewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[['Order ID', viewItem.orderId || viewItem.order_number], ['Customer', viewItem.customer || viewItem.customer_name], ['Quote ID', viewItem.quoteId || viewItem.quote_number], ['Amount', `₹${Number(viewItem.amount || viewItem.total_amount || 0).toLocaleString('en-IN')}`], ['Status', viewItem.status], ['Payment', viewItem.payment || 'Unpaid'], ['Created', viewItem.created || viewItem.created_at]].map(([label, val]) => (
                <div key={label}><div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div><div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{val || 'N/A'}</div></div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
              {viewItem.status !== 'Fulfilled' && viewItem.status !== 'Cancelled' && <button onClick={() => { handleStatusChange(viewItem, 'Fulfilled'); setViewItem(null); }} className="btn btn-primary">Mark Fulfilled</button>}
              <button onClick={() => setViewItem(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Orders;
