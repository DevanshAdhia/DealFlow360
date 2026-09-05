import React, { useState } from 'react';
import { Button, Input, Badge } from '../components/common/UI';
import { getWarehouses } from '../services/storageService';

function Warehouses() {
  const [warehouses] = useState(() => getWarehouses());
  const [search, setSearch] = useState('');

  const filtered = warehouses.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Warehouses & Locations</h1>
        <Button>+ Add Warehouse</Button>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Facility Directory</span>
          <Input placeholder="Search locations..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Location</th><th>Manager</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id}>
                    <td><strong>{w.name}</strong></td><td>{w.location}</td><td>{w.manager}</td>
                    <td>{w.capacity}</td><td><Badge>{w.status}</Badge></td>
                    <td><Button variant="secondary" style={{padding: '0.25rem 0.5rem'}}>Edit</Button></td>
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

export default Warehouses;
