import React, { useState } from 'react';
import { Button, Input, Badge, DataTable } from '../components/common/UI';
import { getWarehouses } from '../services/storageService';

function Warehouses() {
  const [warehouses] = useState(() => getWarehouses());
  const [search, setSearch] = useState('');

  const filtered = warehouses.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.location.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { Header: 'Name', accessor: 'name', sortable: true, Cell: row => <strong style={{fontWeight: 600, color: 'var(--secondary)'}}>{row.name}</strong> },
    { Header: 'Location', accessor: 'location', sortable: true, Cell: row => <span style={{ color: 'var(--text-secondary)' }}>{row.location}</span> },
    { Header: 'Manager', accessor: 'manager', sortable: true },
    { Header: 'Capacity', accessor: 'capacity', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true, Cell: row => <Badge>{row.status}</Badge> },
    { Header: 'Actions', accessor: 'actions', sortable: false, Cell: row => (
        <Button variant="secondary" style={{ padding: '0.375rem 0.75rem' }}>Edit</Button>
      )
    }
  ];

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
          <DataTable columns={columns} data={filtered} emptyMessage="No warehouses found." />
        </div>
      </div>
    </div>
  );
}

export default Warehouses;
