import React, { useState } from 'react';
import { Button, Input, Badge, DataTable } from '../components/common/UI';
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
        <div className="page-title-group">
          <h1 className="page-title">Quotations & CPQ Ledger</h1>
          <p className="page-subtitle">Create, configure, manage commercial agreements, and enforce discount matrix rules.</p>
        </div>
        <Button className="btn-primary">+ New Quotation</Button>
      </div>

      {/* Metrics Row */}
      <div className="metric-grid">
        <div className="metric-card active">
          <div className="metric-header">
            <span className="metric-title">TOTAL QUOTES</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="metric-value text-brand">{quotes.length}</div>
          <div className="metric-subtitle">₹0 Total Volume</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">DRAFT</span>
            <svg className="metric-icon text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <div className="metric-value text-secondary">{quotes.filter(q=>q.status==='Draft').length}</div>
          <div className="metric-subtitle">₹0 scoping</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">PENDING APPROVAL</span>
            <svg className="metric-icon text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-warning">{quotes.filter(q=>q.status==='Pending').length}</div>
          <div className="metric-subtitle">₹0 in review</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">NEGOTIATION</span>
            <svg className="metric-icon text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <div className="metric-value text-brand">0</div>
          <div className="metric-subtitle">₹0 active talks</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">CONFIRMED</span>
            <svg className="metric-icon text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="metric-value text-success">{quotes.filter(q=>q.status==='Approved').length}</div>
          <div className="metric-subtitle">₹0 closed won</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">PIPELINE VALUE</span>
            <span className="text-success font-bold">$</span>
          </div>
          <div className="metric-value text-success">₹0</div>
          <div className="metric-subtitle">Active open pipeline</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-search">
          <svg className="filter-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            className="filter-search-input"
            placeholder="Search by ID (e.g. Q-1041), Customer, Rep..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select className="filter-select">
          <option>Status: All Statuses</option>
        </select>
        
        <select className="filter-select">
          <option>Health: All</option>
        </select>
        
        <select className="filter-select">
          <option>Customer: All Accounts</option>
        </select>
        
        <select className="filter-select">
          <option>Sort: Newest First</option>
        </select>

        <div className="view-toggles">
          <button className="view-toggle-btn active">
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
          <button className="view-toggle-btn">
            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="empty-state">
        <div className="empty-state-icon-container">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <h3 className="empty-state-title">No Quotations Found</h3>
        <p className="empty-state-desc">No quotations match your current search and filter criteria.</p>
        <div className="empty-state-actions">
          <Button variant="secondary">Reset Filters</Button>
          <Button>+ New Quotation</Button>
        </div>
      </div>
    </div>
  );
}

export default Quotations;
