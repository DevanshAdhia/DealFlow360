import React, { useState } from 'react';
import { Button, Input, Badge } from '../components/common/UI';
import { getOrders } from '../services/storageService';

function Orders() {
  const [orders] = useState(() => getOrders());
  const [search, setSearch] = useState('');

  const filtered = orders.filter(o => 
    o.orderId.toLowerCase().includes(search.toLowerCase()) || 
    o.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Order Fulfillment</h1>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All Orders</span>
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Order ID</th><th>Quote ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Fulfillment</th><th>Payment</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.orderId}</strong></td><td>{o.quoteId}</td><td>{o.customer}</td>
                    <td>${o.amount.toLocaleString()}</td>
                    <td><Badge>{o.status}</Badge></td>
                    <td><Badge type={o.fulfillment === 'Shipped' ? 'success' : 'warning'}>{o.fulfillment}</Badge></td>
                    <td><Badge type={o.payment === 'Paid' ? 'success' : 'danger'}>{o.payment}</Badge></td>
                    <td><Button variant="secondary" style={{padding: '0.25rem 0.5rem'}}>Manage</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;
