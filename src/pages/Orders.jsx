import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, Select, Badge, DataTable, ConfirmDialog } from '../components/common/UI';
import { getOrders, saveEntity } from '../services/storageService';

function Orders() {
  const [orders, setOrders] = useState(() => getOrders());
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    return (o.orderId || '').toLowerCase().includes(s) || 
           (o.customer || '').toLowerCase().includes(s) ||
           (o.quoteId || '').toLowerCase().includes(s);
  });

  const handleCancel = (id) => {
    setOrderToCancel(id);
    setShowConfirm(true);
  };

  const confirmCancel = () => {
    const target = orders.find(o => o.id === orderToCancel);
    if (!target) return;
    
    const updatedEntity = { ...target, status: 'Cancelled' };
    const updated = saveEntity('df_orders', updatedEntity, false);
    
    setOrders(updated);
    toast.info("Order has been cancelled.");
    setShowConfirm(false);
  };

  const columns = [
    { Header: 'Order ID', accessor: 'orderId', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.orderId}</strong> },
    { Header: 'Quote Ref', accessor: 'quoteId', sortable: true, Cell: row => <span style={{ color: 'var(--text-tertiary)' }}>{row.quoteId}</span> },
    { Header: 'Customer', accessor: 'customer', sortable: true },
    { Header: 'Amount', accessor: 'amount', sortable: true, Cell: row => <span style={{ fontWeight: 600 }}>${row.amount.toLocaleString()}</span> },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    { Header: 'Fulfillment', accessor: 'fulfillment', sortable: true, Cell: row => <Badge type={row.fulfillment === 'Fulfilled' ? 'success' : row.fulfillment === 'Processing' ? 'warning' : 'default'}>{row.fulfillment}</Badge> },
    { Header: 'Payment', accessor: 'payment', sortable: true, Cell: row => <Badge type={row.payment === 'Paid' ? 'success' : 'default'}>{row.payment}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" style={{ padding: '0.375rem 0.75rem' }}>Manage</Button>
          {row.status !== 'Cancelled' && row.fulfillment !== 'Fulfilled' && (
            <Button variant="danger" style={{ padding: '0.375rem 0.75rem', backgroundColor: 'var(--surface)', color: 'var(--danger)' }} onClick={() => handleCancel(row.id)}>Cancel</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Order Fulfillment Pipeline</h1>
          <p className="page-subtitle">Track confirmed quotes, manage fulfillment stages, and monitor payment statuses.</p>
        </div>
        <Button className="btn-primary">Export Report</Button>
      </div>

      <div className="metric-grid">
        <div className="metric-card active">
          <div className="metric-header">
            <span className="metric-title">TOTAL ORDERS</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div className="metric-value text-brand">{orders.length}</div>
          <div className="metric-subtitle">All time volume</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">PROCESSING</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <div className="metric-value text-warning">{orders.filter(o=>o.fulfillment==='Processing').length}</div>
          <div className="metric-subtitle">Awaiting fulfillment</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">UNPAID</span>
            <svg className="metric-icon text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-danger">{orders.filter(o=>o.payment==='Pending').length}</div>
          <div className="metric-subtitle">Requires invoicing</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <svg className="filter-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            className="filter-search-input"
            placeholder="Search by Order ID, Quote Ref, or Customer..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="filter-select">
          <option>Status: All</option>
          <option>Processing</option>
          <option>Fulfilled</option>
          <option>Cancelled</option>
        </select>
        
        <select className="filter-select">
          <option>Payment: All</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length > 0 ? (
          <DataTable columns={columns} data={filtered} />
        ) : (
          <div className="empty-state" style={{ minHeight: '250px', border: 'none', backgroundColor: 'transparent' }}>
            <div className="empty-state-icon-container">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h3 className="empty-state-title">No Orders Found</h3>
            <p className="empty-state-desc">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This will release allocated inventory back into the pool."
      />
    </div>
  );
}

export default Orders;
