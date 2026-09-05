import React from 'react';
import { 
  Search, 
  Filter, 
  RotateCw, 
  Calendar, 
  Sparkles, 
  X, 
  CheckCircle2,
  Shield,
  Activity,
  Layers
} from 'lucide-react';
import { getRoleBadgeColor } from '../../data/users.js';

export const DashboardHeader = ({
  user,
  timePeriod,
  setTimePeriod,
  dealStatus,
  setDealStatus,
  dealHealth,
  setDealHealth,
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing,
  totalMatchingQuotes,
  onResetFilters
}) => {
  const hasActiveFilters = 
    timePeriod !== 'all' || 
    dealStatus !== 'all' || 
    dealHealth !== 'all' || 
    searchQuery.trim() !== '';

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-header-card">
      {/* Top Greeting & Workspace Persona Meta */}
      <div className="dashboard-header-top">
        <div className="dashboard-header-greeting">
          <div className="dashboard-greeting-title">
            <span>{getGreetingTime()}, {user?.name?.split(' ')[0] || 'Sales Rep'}</span>
            <Sparkles size={20} color="var(--primary-500)" />
          </div>
          <p className="dashboard-greeting-subtitle">
            Sales Rep Workspace • Track pipeline velocity, discount approvals, and close active deals.
          </p>
        </div>

        <div className="dashboard-header-meta">
          <span className={`badge ${getRoleBadgeColor(user?.role)}`}>
            <Shield size={12} />
            {user?.roleLabel || 'Sales Rep'}
          </span>
          <span className="badge badge-primary">
            <Layers size={12} />
            {user?.assignedWorkspace || 'Sales Workspace'}
          </span>
          <button 
            onClick={onRefresh} 
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem' }}
            title="Refresh dashboard data"
            disabled={isRefreshing}
          >
            <RotateCw size={14} className={isRefreshing ? 'spinner' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Toolbar */}
      <div className="dashboard-filters-bar">
        <div className="dashboard-filter-group">
          {/* Live Search */}
          <div className="dashboard-search-box">
            <Search size={15} color="var(--text-muted)" />
            <input 
              type="text"
              placeholder="Search by Quote ID (e.g. Q-1041), Customer, or Product..."
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

          {/* Time Period Filter */}
          <div className="dashboard-select-wrapper">
            <Calendar size={14} color="var(--primary-500)" />
            <select 
              value={timePeriod} 
              onChange={(e) => setTimePeriod(e.target.value)}
              className="dashboard-select"
              aria-label="Filter by time period"
            >
              <option value="all">Time: All Time</option>
              <option value="today">Time: Today</option>
              <option value="this_week">Time: This Week</option>
              <option value="this_month">Time: This Month</option>
              <option value="this_quarter">Time: This Quarter</option>
            </select>
          </div>

          {/* Deal Stage Filter */}
          <div className="dashboard-select-wrapper">
            <Filter size={14} color="var(--color-warning)" />
            <select 
              value={dealStatus} 
              onChange={(e) => setDealStatus(e.target.value)}
              className="dashboard-select"
              aria-label="Filter by deal status"
            >
              <option value="all">Stage: All Stages</option>
              <option value="draft">Stage: Draft</option>
              <option value="pending_approval">Stage: Pending Approval</option>
              <option value="negotiation">Stage: Negotiation</option>
              <option value="confirmed">Stage: Confirmed / Won</option>
            </select>
          </div>

          {/* Deal Health Filter */}
          <div className="dashboard-select-wrapper">
            <Activity size={14} color="var(--accent-teal)" />
            <select 
              value={dealHealth} 
              onChange={(e) => setDealHealth(e.target.value)}
              className="dashboard-select"
              aria-label="Filter by deal health"
            >
              <option value="all">Health: All Health</option>
              <option value="healthy">Health: Healthy</option>
              <option value="at_risk">Health: At Risk</option>
              <option value="critical">Health: Critical</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        <div className="dashboard-filter-actions">
          {hasActiveFilters && (
            <>
              <span className="dashboard-active-filter-pill">
                <CheckCircle2 size={12} />
                {totalMatchingQuotes} {totalMatchingQuotes === 1 ? 'quote' : 'quotes'} found
              </span>
              <button 
                onClick={onResetFilters} 
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                Reset Filters
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
