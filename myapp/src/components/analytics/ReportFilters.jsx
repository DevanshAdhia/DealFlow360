import React from 'react';
import { Filter, RotateCcw, Download, Printer } from 'lucide-react';

export const ReportFilters = ({
  filters,
  onChange,
  onReset,
  onExportCSV,
  onPrint,
  customerOptions = [],
  salesRepOptions = [],
  productOptions = []
}) => {
  return (
    <div className="reports-filter-bar">
      <div className="reports-filter-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--primary-400)" />
          <span>GLOBAL ANALYTICS FILTERS</span>
        </div>
        <button 
          onClick={onReset} 
          className="btn btn-secondary" 
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem' }}
          title="Reset all filters to defaults"
        >
          <RotateCcw size={12} />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="reports-filter-row">
        {/* Date Range */}
        <div className="reports-filter-group">
          <label>Date Range</label>
          <select 
            className="reports-filter-select"
            value={filters.dateRange}
            onChange={(e) => onChange('dateRange', e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="this_week">Past 7 Days</option>
            <option value="this_month">Past 30 Days</option>
            <option value="this_quarter">Past 90 Days</option>
            <option value="this_year">This Year</option>
          </select>
        </div>

        {/* Customer */}
        <div className="reports-filter-group">
          <label>Customer</label>
          <select 
            className="reports-filter-select"
            value={filters.customer}
            onChange={(e) => onChange('customer', e.target.value)}
          >
            <option value="all">All Customers</option>
            {customerOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sales Representative */}
        <div className="reports-filter-group">
          <label>Sales Representative</label>
          <select 
            className="reports-filter-select"
            value={filters.salesRep}
            onChange={(e) => onChange('salesRep', e.target.value)}
          >
            <option value="all">All Sales Reps</option>
            {salesRepOptions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div className="reports-filter-group">
          <label>Product Catalog</label>
          <select 
            className="reports-filter-select"
            value={filters.product}
            onChange={(e) => onChange('product', e.target.value)}
          >
            <option value="all">All Products</option>
            {productOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Deal Status */}
        <div className="reports-filter-group">
          <label>Deal Stage / Status</label>
          <select 
            className="reports-filter-select"
            value={filters.dealStatus}
            onChange={(e) => onChange('dealStatus', e.target.value)}
          >
            <option value="all">All Stages</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="negotiation">Negotiation</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>

        {/* Deal Health */}
        <div className="reports-filter-group">
          <label>Deal Health</label>
          <select 
            className="reports-filter-select"
            value={filters.dealHealth}
            onChange={(e) => onChange('dealHealth', e.target.value)}
          >
            <option value="all">All Health Levels</option>
            <option value="healthy">Healthy (0-30)</option>
            <option value="at risk">At Risk (31-60)</option>
            <option value="critical">Critical (61-100)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
