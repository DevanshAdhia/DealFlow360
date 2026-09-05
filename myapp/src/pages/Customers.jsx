import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  DollarSign, 
  Briefcase, 
  ShieldCheck, 
  ExternalLink, 
  X, 
  LayoutGrid, 
  List,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Edit3,
  Trash2,
  Download
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useToast } from '../hooks/useToast.js';
import { formatINR, formatINRCompact } from '../utils/formatters.js';
const INITIAL_CUSTOMERS = [];
import { Button, Input, Select, Badge, Modal } from '../components/common/UI.jsx';

const STORAGE_CUSTOMERS_KEY = 'dealflow360_customers_v2';

const EXTENDED_INITIAL_CUSTOMERS = [
  ...INITIAL_CUSTOMERS,
  {
    id: 'C-006',
    companyName: 'Vertex Systems',
    contactName: 'Kavita Reddy',
    email: 'kavita@vertexsys.in',
    phone: '+91-9000000006',
    industry: 'Aerospace & Defense',
    tier: 'Platinum',
    city: 'Pune',
    gstin: '27AABCV1234F6Z1',
    paymentTerms: 'Net 45',
    creditLimit: 5000000,
    address: '401 Tech Vista Tower, Hinjewadi Phase 1, Pune, MH 411057'
  },
  {
    id: 'C-007',
    companyName: 'Vanguard Logistics',
    contactName: 'David Miller',
    email: 'david@vanguardlog.in',
    phone: '+91-9000000007',
    industry: 'Logistics',
    tier: 'Gold',
    city: 'Gurugram',
    gstin: '06AABCV1234G7Z2',
    paymentTerms: 'Net 30',
    creditLimit: 2500000,
    address: 'Plot 88, Cyber City Phase 2, Gurugram, HR 122002'
  },
  {
    id: 'C-008',
    companyName: 'Helios Medical',
    contactName: 'Dr. Rajiv Menon',
    email: 'rajiv@heliosmed.in',
    phone: '+91-9000000008',
    industry: 'Healthcare',
    tier: 'Platinum',
    city: 'New Delhi',
    gstin: '07AABCH1234H8Z3',
    paymentTerms: 'Net 15',
    creditLimit: 7500000,
    address: '12 Medical Square, Connaught Place, New Delhi, DL 110001'
  }
].map(c => ({
  ...c,
  paymentTerms: c.paymentTerms || 'Net 30',
  creditLimit: c.creditLimit || (c.tier === 'Platinum' ? 5000000 : c.tier === 'Gold' ? 2500000 : 1000000),
  address: c.address || `${c.city || 'Mumbai'}, India`
}));

export const Customers = () => {
  const navigate = useNavigate();
  const { quotations } = useQuotations();
  const { success, error } = useToast();

  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOMERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return EXTENDED_INITIAL_CUSTOMERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Selected customer for detail drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // New customer modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    industry: 'Technology',
    tier: 'Gold',
    city: 'Mumbai',
    gstin: '',
    paymentTerms: 'Net 30',
    creditLimit: 2500000,
    address: ''
  });

  // Persist customers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOMERS_KEY, JSON.stringify(customers));
    } catch (_) {}
  }, [customers]);

  // Map quotes to customers
  const customerMetricsMap = useMemo(() => {
    const map = {};
    customers.forEach(c => {
      map[c.id] = {
        totalQuotes: 0,
        totalValue: 0,
        activeQuotes: 0,
        quotes: []
      };
    });

    quotations.forEach(q => {
      const custId = q.customerId;
      if (map[custId]) {
        map[custId].totalQuotes += 1;
        map[custId].totalValue += (q.total || 0);
        if (q.stage !== 'cancelled' && !q.isArchived) {
          map[custId].activeQuotes += 1;
        }
        map[custId].quotes.push(q);
      }
    });

    return map;
  }, [customers, quotations]);

  // Overall KPIs
  const totalAccounts = customers.length;
  const platinumAccounts = customers.filter(c => c.tier === 'Platinum').length;
  const totalPipelineValue = Object.values(customerMetricsMap).reduce((acc, curr) => acc + curr.totalValue, 0);
  const avgDealValue = totalAccounts > 0 ? totalPipelineValue / totalAccounts : 0;

  // Industries list
  const industries = useMemo(() => {
    const set = new Set(customers.map(c => c.industry).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        c.companyName.toLowerCase().includes(q) ||
        (c.contactName && c.contactName.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.gstin && c.gstin.toLowerCase().includes(q));

      const matchesTier = tierFilter === 'All' || c.tier === tierFilter;
      const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;

      return matchesSearch && matchesTier && matchesIndustry;
    });
  }, [customers, searchQuery, tierFilter, industryFilter]);

  // Create new customer handler
  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.companyName.trim() || !newCustomerForm.email.trim()) {
      error('Validation Error', 'Company Name and Email are required.');
      return;
    }

    const nextIdNumber = customers.length + 1;
    const newId = `C-${String(nextIdNumber).padStart(3, '0')}`;
    const newCust = {
      id: newId,
      ...newCustomerForm,
      creditLimit: Number(newCustomerForm.creditLimit) || 1000000
    };

    setCustomers(prev => [newCust, ...prev]);
    setShowAddModal(false);
    success('Customer Added', `${newCust.companyName} added to directory.`);
    setNewCustomerForm({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      industry: 'Technology',
      tier: 'Gold',
      city: 'Mumbai',
      gstin: '',
      paymentTerms: 'Net 30',
      creditLimit: 2500000,
      address: ''
    });
  };

  const [editingCustomer, setEditingCustomer] = useState(null);

  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? editingCustomer : c));
    if (selectedCustomer && selectedCustomer.id === editingCustomer.id) {
      setSelectedCustomer(editingCustomer);
    }
    success('Customer Updated', `Account details for ${editingCustomer.companyName} have been saved.`);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customerId, companyName) => {
    if (window.confirm(`Are you sure you want to remove ${companyName || customerId} from customer accounts? This action cannot be undone.`)) {
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomer && selectedCustomer.id === customerId) {
        setSelectedCustomer(null);
      }
      success('Customer Deleted', `Account ${companyName || customerId} removed.`);
    }
  };

  const getTierBadgeClass = (tier) => {
    switch (tier) {
      case 'Platinum': return 'badge-tier-platinum';
      case 'Gold': return 'badge-tier-gold';
      default: return 'badge-tier-silver';
    }
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      {/* 1. Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">
            Customer Accounts & Agreements
          </h1>
          <p className="page-subtitle">
            Centralized master enterprise accounts, contract terms, and transaction ledger.
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: '0.65rem' }}>
          <Button 
            variant="secondary"
            icon={Download}
            onClick={() => {
              const dataStr = JSON.stringify(customers, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `customers_export_${new Date().toISOString().slice(0, 10)}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              success('Customers Exported', `Downloaded ${customers.length} customer accounts.`);
            }}
          >
            Export Accounts
          </Button>
          <Button 
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* 2. KPI / Metric Cards Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--primary)' }} />
          <div className="metric-card-top">
            <span className="metric-card-label">TOTAL ACCOUNTS</span>
            <div className="metric-card-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Building2 size={16} />
            </div>
          </div>
          <div className="metric-card-value">{totalAccounts}</div>
          <div className="metric-card-sub">Active enterprise accounts</div>
        </div>

        <div className="metric-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--primary)' }} />
          <div className="metric-card-top">
            <span className="metric-card-label">PLATINUM STRATEGIC</span>
            <div className="metric-card-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="metric-card-value">{platinumAccounts}</div>
          <div className="metric-card-sub">Tier 1 priority SLA accounts</div>
        </div>

        <div className="metric-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--success)' }} />
          <div className="metric-card-top">
            <span className="metric-card-label">CUMULATIVE DEAL VALUE</span>
            <div className="metric-card-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: 'var(--success)' }}>{formatINRCompact(totalPipelineValue)}</div>
          <div className="metric-card-sub">Lifetime transacted volume</div>
        </div>

        <div className="metric-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--warning)' }} />
          <div className="metric-card-top">
            <span className="metric-card-label">AVG ACCOUNT VALUE</span>
            <div className="metric-card-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="metric-card-value" style={{ color: 'var(--warning-text)' }}>{formatINRCompact(avgDealValue)}</div>
          <div className="metric-card-sub">Average value per contract</div>
        </div>
      </div>

      {/* 3. Main Content Card */}
      <div className="card">
        {/* 3a. Toolbar */}
        <div className="toolbar">
          <div className="toolbar-group">
            <div style={{ minWidth: '280px', flex: '1 1 320px' }}>
              <Input 
                type="search"
                placeholder="Search company, contact, city, GSTIN..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '150px' }}>
              <Select 
                value={tierFilter} 
                onChange={(e) => setTierFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Tiers' },
                  { value: 'Platinum', label: 'Platinum' },
                  { value: 'Gold', label: 'Gold' },
                  { value: 'Silver', label: 'Silver' }
                ]}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <Select 
                value={industryFilter} 
                onChange={(e) => setIndustryFilter(e.target.value)}
                options={industries.map(ind => ({ value: ind, label: ind === 'All' ? 'All Industries' : ind }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: viewMode === 'grid' ? 'var(--primary-light)' : 'var(--surface)',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
              style={{
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: viewMode === 'table' ? 'var(--primary-light)' : 'var(--surface)',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="customers-grid">
          {filteredCustomers.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No customers found matching your criteria.
            </div>
          ) : (
            filteredCustomers.map(cust => {
              const metrics = customerMetricsMap[cust.id] || { totalQuotes: 0, totalValue: 0 };
              return (
                <div 
                  key={cust.id} 
                  className="customer-card"
                  onClick={() => setSelectedCustomer(cust)}
                >
                  <div className="customer-card-header">
                    <div className="customer-avatar-box">
                      {cust.companyName.charAt(0)}
                    </div>
                    <div className="customer-card-titles">
                      <div className="customer-company-name">{cust.companyName}</div>
                      <div className="customer-industry-text">{cust.industry} • {cust.city || 'India'}</div>
                    </div>
                    <span className={`badge ${getTierBadgeClass(cust.tier)}`}>
                      {cust.tier}
                    </span>
                  </div>

                  <div className="customer-card-details">
                    <div className="customer-detail-item">
                      <span className="customer-detail-label">Contact Person</span>
                      <span className="customer-detail-value">{cust.contactName || 'N/A'}</span>
                    </div>
                    <div className="customer-detail-item">
                      <span className="customer-detail-label">Payment Terms</span>
                      <span className="customer-detail-value">{cust.paymentTerms}</span>
                    </div>
                    <div className="customer-detail-item">
                      <span className="customer-detail-label">Credit Limit</span>
                      <span className="customer-detail-value" style={{ color: 'var(--primary-600)' }}>
                        {formatINRCompact(cust.creditLimit || 0)}
                      </span>
                    </div>
                    <div className="customer-detail-item">
                      <span className="customer-detail-label">Total Spend</span>
                      <span className="customer-detail-value">
                        {formatINRCompact(metrics.totalValue)} ({metrics.totalQuotes} deals)
                      </span>
                    </div>
                  </div>

                  <div className="customer-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {cust.gstin || '27AABCA1234A1Z5'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button 
                        type="button"
                        className="btn-icon"
                        style={{ padding: '0.3rem', borderRadius: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCustomer({ ...cust });
                        }}
                        title="Edit Customer"
                      >
                        <Edit3 size={14} color="#475569" />
                      </button>
                      <button 
                        type="button"
                        className="btn-icon"
                        style={{ padding: '0.3rem', borderRadius: '4px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(cust.id, cust.companyName);
                        }}
                        title="Delete Customer"
                      >
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        title="Inspect Account"
                      >
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="card-surface" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="quotations-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Account ID / Company</th>
                  <th>Contact Person</th>
                  <th>Location</th>
                  <th>Tier</th>
                  <th>Payment Terms</th>
                  <th style={{ textAlign: 'right' }}>Total Contract Value</th>
                  <th style={{ textAlign: 'center' }}>Deals</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(cust => {
                    const metrics = customerMetricsMap[cust.id] || { totalQuotes: 0, totalValue: 0 };
                    return (
                      <tr 
                        key={cust.id} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedCustomer(cust)}
                      >
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{cust.companyName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cust.id} • {cust.industry}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{cust.contactName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cust.email}</div>
                        </td>
                        <td>
                          <div>{cust.city || 'India'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cust.gstin}</div>
                        </td>
                        <td>
                          <span className={`badge ${getTierBadgeClass(cust.tier)}`}>
                            {cust.tier}
                          </span>
                        </td>
                        <td>{cust.paymentTerms}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatINR(metrics.totalValue)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-neutral">{metrics.totalQuotes}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <button 
                              type="button"
                              className="btn-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCustomer({ ...cust });
                              }}
                              title="Edit Customer"
                            >
                              <Edit3 size={15} color="#475569" />
                            </button>
                            <button 
                              type="button"
                              className="btn-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCustomer(cust.id, cust.companyName);
                              }}
                              title="Delete Customer"
                            >
                              <Trash2 size={15} color="#dc2626" />
                            </button>
                            <button 
                              className="btn-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(cust);
                              }}
                              title="View Account"
                            >
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomer && (
        <div className="customer-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div className="customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="customer-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="customer-avatar-box" style={{ width: 48, height: 48 }}>
                  {selectedCustomer.companyName.charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {selectedCustomer.companyName}
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Account {selectedCustomer.id} • {selectedCustomer.industry}
                  </div>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedCustomer(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="customer-modal-body">
              {/* Account Quick Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACCOUNT TIER</div>
                  <div style={{ marginTop: '0.35rem' }}>
                    <span className={`badge ${getTierBadgeClass(selectedCustomer.tier)}`}>
                      {selectedCustomer.tier}
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CREDIT LIMIT</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-600)', marginTop: '0.2rem' }}>
                    {formatINR(selectedCustomer.creditLimit || 0)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LIFETIME VALUE</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.2rem' }}>
                    {formatINR(customerMetricsMap[selectedCustomer.id]?.totalValue || 0)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PAYMENT TERMS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {selectedCustomer.paymentTerms}
                  </div>
                </div>
              </div>

              {/* Contact and Corporate Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={16} color="var(--primary-500)" />
                    Primary Contact
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600 }}>{selectedCustomer.contactName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Mail size={14} /> {selectedCustomer.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Phone size={14} /> {selectedCustomer.phone}
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--primary-500)" />
                    Billing & Tax Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>City:</span> {selectedCustomer.city || 'Mumbai'}, India</div>
                    <div><span style={{ color: 'var(--text-muted)' }}>GSTIN:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedCustomer.gstin}</span></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Address:</span> {selectedCustomer.address}</div>
                  </div>
                </div>
              </div>

              {/* Linked Quotations */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="var(--primary-500)" />
                  Linked Quotations & Commercial Deals
                </h4>
                
                {customerMetricsMap[selectedCustomer.id]?.quotes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                    No active quotations on record for this customer.
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <table className="quotations-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Quote ID</th>
                          <th>Date</th>
                          <th>Stage</th>
                          <th style={{ textAlign: 'right' }}>Amount</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerMetricsMap[selectedCustomer.id]?.quotes.map(q => (
                          <tr key={q.id}>
                            <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>{q.id}</td>
                            <td style={{ fontSize: '0.8125rem' }}>{q.createdAt?.split('T')[0] || '2026-09-01'}</td>
                            <td>
                              <span className={`badge badge-${q.stage === 'confirmed' ? 'success' : q.stage === 'draft' ? 'neutral' : 'primary'}`}>
                                {q.stage}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(q.total)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                className="btn-icon"
                                onClick={() => navigate(`/quotations/${q.id}`)}
                                title="Open Quotation"
                              >
                                <ExternalLink size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="customer-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setEditingCustomer({ ...selectedCustomer });
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}
                >
                  <Edit3 size={15} />
                  <span>Edit Account</span>
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleDeleteCustomer(selectedCustomer.id, selectedCustomer.companyName)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', borderColor: '#fecaca' }}
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedCustomer(null);
                    navigate('/quotations/new');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} />
                  <span>Create Quotation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="customer-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="customer-modal" style={{ maxWidth: 650 }} onClick={(e) => e.stopPropagation()}>
            <div className="customer-modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Add New Customer Account</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div className="customer-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>Company Legal Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Apex Enterprises Pvt Ltd"
                      value={newCustomerForm.companyName}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, companyName: e.target.value })}
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>Primary Contact Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Amit Verma"
                      value={newCustomerForm.contactName}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contactName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>Contact Email *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. amit@apex.in"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>Contact Phone</label>
                    <input 
                      type="text" 
                      placeholder="+91-9876543210"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>Industry</label>
                    <select 
                      value={newCustomerForm.industry}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, industry: e.target.value })}
                    >
                      <option value="Technology">Technology</option>
                      <option value="IT Services">IT Services</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Aerospace & Defense">Aerospace & Defense</option>
                    </select>
                  </div>

                  <div className="settings-input-group">
                    <label>Account Tier</label>
                    <select 
                      value={newCustomerForm.tier}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, tier: e.target.value })}
                    >
                      <option value="Platinum">Platinum (Enterprise Strategic)</option>
                      <option value="Gold">Gold (Mid-Market)</option>
                      <option value="Silver">Silver (Emerging)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai"
                      value={newCustomerForm.city}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>GSTIN Tax Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 27AABCA1234A1Z5"
                      value={newCustomerForm.gstin}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>Payment Terms</label>
                    <select 
                      value={newCustomerForm.paymentTerms}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, paymentTerms: e.target.value })}
                    >
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days (Standard)</option>
                      <option value="Net 45">Net 45 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                    </select>
                  </div>

                  <div className="settings-input-group">
                    <label>Credit Limit (INR ₹)</label>
                    <input 
                      type="number" 
                      value={newCustomerForm.creditLimit}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, creditLimit: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="customer-modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="customer-modal-backdrop" onClick={() => setEditingCustomer(null)}>
          <div className="customer-modal" style={{ maxWidth: 650 }} onClick={(e) => e.stopPropagation()}>
            <div className="customer-modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Edit Customer: {editingCustomer.companyName}</h2>
              <button className="btn-icon" onClick={() => setEditingCustomer(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer}>
              <div className="customer-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>Company Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={editingCustomer.companyName}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, companyName: e.target.value })}
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>Industry</label>
                    <input 
                      type="text" 
                      value={editingCustomer.industry}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, industry: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>Contact Person *</label>
                    <input 
                      type="text" 
                      required 
                      value={editingCustomer.contactName}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, contactName: e.target.value })}
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      required 
                      value={editingCustomer.email}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>City / Location</label>
                    <input 
                      type="text" 
                      value={editingCustomer.city}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>GSTIN (15 characters)</label>
                    <input 
                      type="text" 
                      value={editingCustomer.gstin}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, gstin: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="settings-input-group">
                    <label>Account Tier</label>
                    <select 
                      value={editingCustomer.tier}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, tier: e.target.value })}
                    >
                      <option value="Platinum">Platinum (Enterprise Tier)</option>
                      <option value="Gold">Gold (Mid-Market Tier)</option>
                      <option value="Silver">Silver (Growth Tier)</option>
                    </select>
                  </div>
                </div>

                <div className="settings-input-group">
                  <label>Official Registered Address</label>
                  <input 
                    type="text" 
                    value={editingCustomer.address}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="settings-input-group">
                    <label>Payment Terms</label>
                    <select 
                      value={editingCustomer.paymentTerms}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, paymentTerms: e.target.value })}
                    >
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days (Standard)</option>
                      <option value="Net 45">Net 45 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                    </select>
                  </div>

                  <div className="settings-input-group">
                    <label>Credit Limit (INR ₹)</label>
                    <input 
                      type="number" 
                      value={editingCustomer.creditLimit}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, creditLimit: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="customer-modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingCustomer(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
