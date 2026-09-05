import React from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutList, 
  LayoutGrid, 
  X, 
  CheckCircle2,
  Calendar,
  Building,
  Activity
} from 'lucide-react';
const CUSTOMERS_DATA = [];

export const QuotationFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  healthFilter,
  setHealthFilter,
  customerFilter,
  setCustomerFilter,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalResults,
  onResetFilters
}) => {
  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    statusFilter !== 'all' || 
    healthFilter !== 'all' || 
    customerFilter !== 'all' || 
    dateFilter !== 'all' ||
    sortBy !== 'newest';

  return (
    <div className="quote-filters-card">
      {/* Search and Filters Left Group */}
      <div className="quote-filters-left">
        {/* Live Search */}
        <div className="dashboard-search-box" style={{ maxWidth: '320px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by ID (e.g. Q-1041), Customer, Rep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dashboard-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="dashboard-select-wrapper">
          <Filter size={14} color="var(--primary-500)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dashboard-select"
            aria-label="Filter by Status"
          >
            <option value="all">Status: All Statuses</option>
            <option value="draft">Status: Draft</option>
            <option value="pending_approval">Status: Pending Approval</option>
            <option value="negotiation">Status: Negotiation</option>
            <option value="confirmed">Status: Confirmed / Won</option>
            <option value="archived">Status: Archived</option>
          </select>
        </div>

        {/* Health Filter */}
        <div className="dashboard-select-wrapper">
          <Activity size={14} color="var(--accent-teal)" />
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="dashboard-select"
            aria-label="Filter by Health"
          >
            <option value="all">Health: All</option>
            <option value="healthy">Health: Healthy</option>
            <option value="at_risk">Health: At Risk</option>
            <option value="critical">Health: Critical</option>
          </select>
        </div>

        {/* Customer Filter */}
        <div className="dashboard-select-wrapper">
          <Building size={14} color="var(--accent-purple)" />
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="dashboard-select"
            aria-label="Filter by Customer"
          >
            <option value="all">Customer: All Accounts</option>
            {CUSTOMERS_DATA.map((c) => (
              <option key={c.id} value={c.companyName}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="dashboard-select-wrapper">
          <Calendar size={14} color="var(--color-warning)" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="dashboard-select"
            aria-label="Filter by Date"
          >
            <option value="all">Date: All Time</option>
            <option value="today">Date: Today</option>
            <option value="this_week">Date: This Week</option>
            <option value="this_month">Date: This Month</option>
            <option value="this_quarter">Date: This Quarter</option>
          </select>
        </div>
      </div>

      {/* Sorting, View Toggle & Reset */}
      <div className="quote-filters-right">
        {/* Sort Select */}
        <div className="dashboard-select-wrapper">
          <ArrowUpDown size={14} color="var(--text-secondary)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="dashboard-select"
            aria-label="Sort Quotations"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest_value">Sort: Highest Value</option>
            <option value="lowest_value">Sort: Lowest Value</option>
            <option value="customer_az">Sort: Customer A-Z</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="view-toggle-group">
          <button
            onClick={() => setViewMode('table')}
            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            title="Table View"
          >
            <LayoutList size={16} />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            title="Card Grid View"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
