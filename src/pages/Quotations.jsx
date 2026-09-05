import React, { useState } from 'react';
import { Button, Input, Badge } from '../components/common/UI';
import { getQuotations } from '../services/storageService';

function Quotations() {
  const [quotes] = useState(() => getQuotations());
  const [search, setSearch] = useState('');

  const filtered = quotes.filter(q => 
    q.quoteId.toLowerCase().includes(search.toLowerCase()) || 
    q.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quotations Pipeline</h1>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>All Quotes</span>
          <Input placeholder="Search quotes..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Quote ID</th><th>Customer</th><th>Rep</th><th>Amount</th><th>Discount</th><th>Margin</th><th>Risk</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q.id}>
                    <td><strong>{q.quoteId}</strong></td><td>{q.customer}</td><td>{q.rep}</td>
                    <td>${q.amount.toLocaleString()}</td><td>{q.discount}%</td><td>{q.margin}%</td>
                    <td><Badge type={q.risk === 'High' ? 'danger' : 'success'}>{q.risk}</Badge></td>
                    <td><Badge>{q.status}</Badge></td>
                    <td><Button variant="secondary" style={{padding: '0.25rem 0.5rem'}}>View Details</Button></td>
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

export default Quotations;
