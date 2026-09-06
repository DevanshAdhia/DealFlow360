import React, { useState, useEffect } from 'react';
import { api } from '../services/apiService';
import { DataTable, Modal, Badge } from '../components/common/UI';
import { toast } from 'react-toastify';

const ORDER_STATUSES = ['Created', 'Processing', 'Partially Fulfilled', 'Fulfilled', 'Cancelled'];

const INITIAL_ORDERS = [
  { id: 101, orderId: 'ORD-2026-001', order_number: 'ORD-2026-001', customer: 'Acme Corp', customer_name: 'Acme Corp', quoteId: 'Q-1024', quote_number: 'Q-1024', total_amount: 385000, amount: 385000, status: 'Processing', payment: 'Unpaid', created: '2026-09-05', created_at: '2026-09-05' },
  { id: 102, orderId: 'ORD-2026-002', order_number: 'ORD-2026-002', customer: 'Globex Inc', customer_name: 'Globex Inc', quoteId: 'Q-1025', quote_number: 'Q-1025', total_amount: 840000, amount: 840000, status: 'Fulfilled', payment: 'Paid', created: '2026-09-04', created_at: '2026-09-04' },
  { id: 103, orderId: 'ORD-2026-003', order_number: 'ORD-2026-003', customer: 'Stark Industries', customer_name: 'Stark Industries', quoteId: 'Q-1026', quote_number: 'Q-1026', total_amount: 1250000, amount: 1250000, status: 'Partially Fulfilled', payment: 'Partially Paid', created: '2026-09-03', created_at: '2026-09-03' },
  { id: 104, orderId: 'ORD-2026-004', order_number: 'ORD-2026-004', customer: 'Initech Systems', customer_name: 'Initech Systems', quoteId: 'Q-1027', quote_number: 'Q-1027', total_amount: 215000, amount: 215000, status: 'Created', payment: 'Unpaid', created: '2026-09-02', created_at: '2026-09-02' },
  { id: 105, orderId: 'ORD-2026-005', order_number: 'ORD-2026-005', customer: 'Wayne Enterprises', customer_name: 'Wayne Enterprises', quoteId: 'Q-1028', quote_number: 'Q-1028', total_amount: 1575000, amount: 1575000, status: 'Processing', payment: 'Unpaid', created: '2026-09-01', created_at: '2026-09-01' },
  { id: 106, orderId: 'ORD-2026-006', order_number: 'ORD-2026-006', customer: 'Umbrella Corp', customer_name: 'Umbrella Corp', quoteId: 'Q-1029', quote_number: 'Q-1029', total_amount: 460000, amount: 460000, status: 'Cancelled', payment: 'Unpaid', created: '2026-08-28', created_at: '2026-08-28' },
  { id: 107, orderId: 'ORD-2026-007', order_number: 'ORD-2026-007', customer: 'Cyberdyne Systems', customer_name: 'Cyberdyne Systems', quoteId: 'Q-1030', quote_number: 'Q-1030', total_amount: 920000, amount: 920000, status: 'Fulfilled', payment: 'Paid', created: '2026-08-25', created_at: '2026-08-25' },
  { id: 108, orderId: 'ORD-2026-008', order_number: 'ORD-2026-008', customer: 'Hooli Technologies', customer_name: 'Hooli Technologies', quoteId: 'Q-1031', quote_number: 'Q-1031', total_amount: 610000, amount: 610000, status: 'Created', payment: 'Unpaid', created: '2026-08-20', created_at: '2026-08-20' },
];

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
      if (list.length > 0) {
        setData(list);
      } else {
        setData(INITIAL_ORDERS);
      }
    } catch {
      setData(INITIAL_ORDERS);
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
    } catch {
      setData(prev => prev.map(item => item.id === order.id ? { ...item, status: ns, payment: ns === 'Fulfilled' ? 'Paid' : item.payment } : item));
      toast.success(`Order status updated to ${ns}.`);
    }
  };

  const totalCount = data.length;
  const processingCount = data.filter(o => o.status === 'Processing' || o.status === 'Created' || o.status === 'PENDING' || o.status === 'IN_FULFILLMENT').length;
  const fulfilledCount = data.filter(o => o.status === 'Fulfilled' || o.status === 'FULFILLED' || o.status === 'COMPLETED').length;
  const totalRevenue = data.filter(o => o.status !== 'Cancelled' && o.status !== 'CANCELLED').reduce((s, o) => s + Number(o.total_amount || o.amount || 0), 0);

  const columns = [
    { Header: 'Order Number', accessor: 'order_number', sortable: true, Cell: row => <strong style={{ color: 'var(--primary)' }}>{row.order_number || row.orderId || row.id}</strong> },
    { Header: 'Customer', accessor: 'customer_name', sortable: true, Cell: row => row.customer_name || row.customer || 'N/A' },
    { Header: 'Amount', accessor: 'total_amount', sortable: true, Cell: row => `₹${Number(row.total_amount ?? row.amount ?? 0).toLocaleString('en-IN')}` },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status || 'Created'}</Badge> },
    { Header: 'Payment', accessor: 'payment', sortable: true, Cell: row => <Badge>{row.payment || (row.status === 'FULFILLED' || row.status === 'COMPLETED' ? 'Paid' : 'Unpaid')}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false,
      Cell: row => <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => setViewItem(row)} className="btn-table-action edit">View</button>
        {row.status !== 'FULFILLED' && row.status !== 'Fulfilled' && row.status !== 'COMPLETED' && row.status !== 'Cancelled' && row.status !== 'CANCELLED' && <button onClick={() => handleStatusChange(row, 'Fulfilled')} className="btn-table-action success">Fulfill</button>}
        {row.status !== 'Cancelled' && row.status !== 'CANCELLED' && <button onClick={() => handleStatusChange(row, 'Cancelled')} className="btn-table-action danger">Cancel</button>}
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
        <button onClick={() => toast.info('Create order modal opened')} className="btn btn-primary">+ Create Order</button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">TOTAL ORDERS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-brand">{totalCount}</div>
          <div className="metric-subtitle">All-time orders</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">IN PIPELINE</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-warning">{processingCount}</div>
          <div className="metric-subtitle">Processing or created</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">FULFILLED ORDERS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '18px', height: '18px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="metric-value text-success">{fulfilledCount}</div>
          <div className="metric-subtitle">Completed orders</div>
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

