import React, { useState } from 'react';
import { Button, Input, Badge } from '../components/common/UI';
import { getInvoices } from '../services/storageService';

function Billing() {
  const [invoices] = useState(() => getInvoices());
  const [search, setSearch] = useState('');

  const filtered = invoices.filter(i => 
    i.invoiceId.toLowerCase().includes(search.toLowerCase()) || 
    i.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Billing & Invoicing</h1>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Invoice Ledger</span>
          <Input placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Invoice ID</th><th>Order Ref</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id}>
                    <td><strong>{i.invoiceId}</strong></td><td>{i.order}</td><td>{i.customer}</td>
                    <td>${i.amount.toLocaleString()}</td><td>{i.due}</td>
                    <td><Badge type={i.status === 'Paid' ? 'success' : 'warning'}>{i.status}</Badge></td>
                    <td><Button variant="secondary" style={{padding: '0.25rem 0.5rem'}}>Download PDF</Button></td>
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

export default Billing;
