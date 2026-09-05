import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  RotateCw,
  AlertTriangle,
  Download,
  Filter,
  SlidersHorizontal,
  Code,
  User,
  Users,
  LayoutGrid,
  List,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { QuotationStats } from '../components/quotations/QuotationStats.jsx';
import { QuotationTable } from '../components/quotations/QuotationTable.jsx';
import { Button, Input, Select, Modal } from '../components/common/UI.jsx';

import { dataService } from '../services/dataService.js';
import { formatINRCompact, formatINR } from '../utils/formatters.js';

// ── Customer Selector Modal ──────────────────────────────────────────────────
const CustomerSelectorModal = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const customers = useMemo(() => dataService.getCustomers(), []);
  
  const filtered = customers.filter(c => 
    c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Customer for Quotation">
      <div style={{ marginBottom: '1rem' }}>
        <Input 
          icon={Search}
          placeholder="Search customers..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</p>
        ) : (
          filtered.map(c => (
            <div 
              key={c.id}
              onClick={() => onSelect(c.id)}
              style={{
                padding: '0.75rem', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{c.companyName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.id} - {c.industry}</div>
              </div>
              <ArrowRight size={16} color="var(--primary)" />
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

// ── Stage Configuration ──────────────────────────────────────────────────────
const KANBAN_STAGES = [
  {
    id: 'draft',
    label: 'Draft',
    icon: FileText,
    color: '#64748B',
    bg: '#F1F5F9',
    borderColor: '#CBD5E1',
    accentColor: 'var(--text-secondary)',
  },
  {
    id: 'pending_approval',
    label: 'Pending Approval',
    icon: Clock,
    color: '#D97706',
    bg: '#FFFBEB',
    borderColor: '#FDE68A',
    accentColor: '#D97706',
  },
  {
    id: 'approved',
    label: 'Approved',
    icon: ShieldCheck,
    color: '#059669',
    bg: '#F0FDF4',
    borderColor: '#A7F3D0',
    accentColor: '#059669',
  },
  {
    id: 'returned_for_revision',
    label: 'Returned',
    icon: RefreshCw,
    color: '#7C3AED',
    bg: '#F5F3FF',
    borderColor: '#DDD6FE',
    accentColor: '#7C3AED',
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    icon: TrendingUp,
    color: '#2563EB',
    bg: '#EFF6FF',
    borderColor: '#BFDBFE',
    accentColor: '#2563EB',
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    icon: CheckCircle2,
    color: '#16A34A',
    bg: '#F0FDF4',
    borderColor: '#86EFAC',
    accentColor: '#16A34A',
  },
];

// Helper: map a quotation's stage to a kanban column
const getKanbanStageId = (q) => {
  if (q.stage) {
    // Normalize: if returned_for_revision not in KANBAN_STAGES, fallback to draft
    const validIds = KANBAN_STAGES.map((s) => s.id);
    if (validIds.includes(q.stage)) return q.stage;
  }
  const status = (q.status || '').toLowerCase();
  if (status.includes('pending')) return 'pending_approval';
  if (status.includes('approved')) return 'approved';
  if (status.includes('returned')) return 'returned_for_revision';
  if (status.includes('negotiation')) return 'negotiation';
  if (status.includes('confirmed')) return 'confirmed';
  return 'draft';
};

// ── Health Badge ─────────────────────────────────────────────────────────────
const HealthDot = ({ health }) => {
  const map = {
    healthy: '#10B981',
    'at risk': '#F59E0B',
    critical: '#EF4444',
  };
  const key = (health || '').toLowerCase();
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: map[key] || '#94A3B8',
        flexShrink: 0,
      }}
    />
  );
};

// ── Kanban Card ──────────────────────────────────────────────────────────────
const KanbanCard = ({ quotation, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const health = (quotation.health || 'Healthy').toLowerCase();
  const healthColors = {
    healthy: { text: '#059669', bg: '#ECFDF5' },
    'at risk': { text: '#D97706', bg: '#FFFBEB' },
    critical: { text: '#DC2626', bg: '#FEF2F2' },
  };
  const hc = healthColors[health] || healthColors.healthy;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#FAFBFF' : '#FFFFFF',
        border: `1px solid ${hovered ? '#C7D2FE' : '#E2E8F0'}`,
        borderRadius: '10px',
        padding: '0.875rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: hovered ? '0 4px 12px rgba(79,70,229,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        marginBottom: '0.625rem',
      }}
    >
      {/* Quote number + health */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
          {quotation.quotationNumber || quotation.id}
        </span>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '9999px',
            backgroundColor: hc.bg,
            color: hc.text,
          }}
        >
          {quotation.health || 'Healthy'}
        </span>
      </div>

      {/* Customer name */}
      <div
        style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.25rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {quotation.customerName || quotation.customer || 'Unknown Customer'}
      </div>

      {/* Sales rep */}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
        {quotation.salesRepName || 'Alex Morgan'}
      </div>

      {/* Value + Margin */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {formatINRCompact(quotation.total || quotation.subtotal || 0)}
        </span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {(quotation.margin || 0).toFixed(1)}% margin
        </span>
      </div>

      {/* Discount bar if > 0 */}
      {(quotation.discount || 0) > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <div
            style={{
              fontSize: '0.65rem',
              color: quotation.discount > 20 ? '#DC2626' : quotation.discount > 10 ? '#D97706' : '#059669',
              fontWeight: 600,
            }}
          >
            {quotation.discount}% discount
          </div>
          <div style={{ height: 3, backgroundColor: '#E2E8F0', borderRadius: 4, marginTop: 2 }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(quotation.discount * 5, 100)}%`,
                backgroundColor:
                  quotation.discount > 20 ? '#EF4444' : quotation.discount > 10 ? '#F59E0B' : '#10B981',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Date */}
      <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
      </div>
    </div>
  );
};

// ── Kanban Column ────────────────────────────────────────────────────────────
const KanbanColumn = ({ stage, quotations, onCardClick }) => {
  const Icon = stage.icon;
  const total = quotations.reduce((s, q) => s + (q.total || q.subtotal || 0), 0);

  return (
    <div
      style={{
        flex: '0 0 220px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FAFBFC',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        minWidth: 210,
        maxWidth: 250,
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: '0.75rem 0.875rem',
          borderBottom: `2px solid ${stage.borderColor}`,
          backgroundColor: stage.bg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Icon size={14} color={stage.color} />
          <span style={{ fontSize: '0.7375rem', fontWeight: 800, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {stage.label}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '1px 7px',
              borderRadius: '9999px',
              backgroundColor: stage.color,
              color: '#FFF',
            }}
          >
            {quotations.length}
          </span>
        </div>
        {quotations.length > 0 && (
          <div style={{ fontSize: '0.7rem', color: stage.color, fontWeight: 600 }}>
            {formatINRCompact(total)}
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{ padding: '0.625rem 0.75rem', flex: 1, overflowY: 'auto', minHeight: 80, maxHeight: 520 }}>
        {quotations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            No quotations
          </div>
        ) : (
          quotations.map((q) => (
            <KanbanCard key={q.id} quotation={q} onClick={() => onCardClick(q)} />
          ))
        )}
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
export const Quotations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    quotations,
    archivedQuotations,
    duplicateQuotation,
    archiveQuotation,
    restoreQuotation,
    moveQuotationStage,
    deleteQuotation,
  } = useQuotations();
  const { success, info } = useToast();

  const handleDelete = (id) => {
    deleteQuotation(id);
    success('Quotation Deleted', `Successfully removed quotation record.`);
  };

  const currentRepId = user?.id || 'USR-001';

  // View mode: 'kanban' | 'table'
  const [viewMode, setViewMode] = useState('kanban');

  // Scope: 'my' | 'all'
  const [scopeTab, setScopeTab] = useState('my');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);


  const handleExport = (quotesToExport) => {
    alert("Exporting " + quotesToExport.length + " quotations as CSV...");
    // Mock export functionality
  };

  const handleCreateNew = (customerId) => {
    setIsCustomerModalOpen(false);
    navigate('/quotations/new', { state: { preSelectedCustomerId: customerId } });
  };

  // Compute displayed list
  const displayedQuotations = useMemo(() => {
    let list = statusFilter === 'archived' ? [...archivedQuotations] : [...quotations];

    if (scopeTab === 'my') {
      list = list.filter((q) => q.salesRepId === currentRepId);
    }

    if (statusFilter !== 'all' && statusFilter !== 'archived') {
      list = list.filter((q) => q.stage === statusFilter);
    }

    if (healthFilter !== 'all') {
      list = list.filter((q) => (q.health || '').toLowerCase() === healthFilter.toLowerCase());
    }

    if (tierFilter !== 'all') {
      list = list.filter((q) => q.customerTierId === tierFilter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        return (
          (item.id || '').toLowerCase().includes(q) ||
          (item.quotationNumber || '').toLowerCase().includes(q) ||
          (item.customerName || item.customer || '').toLowerCase().includes(q) ||
          (item.salesRepName || '').toLowerCase().includes(q) ||
          (item.notes || '').toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) => {
      const valA = a.total || a.subtotal || 0;
      const valB = b.total || b.subtotal || 0;
      const marginA = a.margin || 0;
      const marginB = b.margin || 0;
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      const custA = (a.customerName || a.customer || '').toLowerCase();
      const custB = (b.customerName || b.customer || '').toLowerCase();

      switch (sortBy) {
        case 'oldest': return dateA - dateB;
        case 'highest_value': return valB - valA;
        case 'lowest_value': return valA - valB;
        case 'highest_margin': return marginB - marginA;
        case 'customer_az': return custA.localeCompare(custB);
        case 'newest':
        default: return dateB - dateA;
      }
    });

    return list;
  }, [quotations, archivedQuotations, scopeTab, currentRepId, statusFilter, healthFilter, tierFilter, searchQuery, sortBy]);

  // Kanban grouping
  const kanbanGroups = useMemo(() => {
    const groups = {};
    KANBAN_STAGES.forEach((s) => (groups[s.id] = []));
    displayedQuotations.forEach((q) => {
      const stageId = getKanbanStageId(q);
      if (groups[stageId]) groups[stageId].push(q);
      else groups['draft'].push(q);
    });
    return groups;
  }, [displayedQuotations]);

  const handleDuplicate = (id) => {
    const duplicated = duplicateQuotation(id);
    if (duplicated) {
      success('Quotation Cloned', `Created new draft ${duplicated.quotationNumber || duplicated.id}.`);
      navigate(`/quotations/${duplicated.quotationNumber || duplicated.id}`);
    }
  };

  const handleArchive = (id) => {
    archiveQuotation(id);
    info('Quotation Archived', `${id} moved to archived list.`);
  };

  const handleRestore = (id) => {
    restoreQuotation(id);
    success('Quotation Restored', `${id} restored to active quotations list.`);
  };

  const handleMoveStage = (id, newStage) => {
    const res = moveQuotationStage(id, newStage);
    if (res.success) {
      success('Stage Updated', `Quotation moved to ${newStage.replace('_', ' ')}`);
    } else {
      info('Stage Transition Notice', res.error || 'Could not move stage');
    }
  };

  const myQuotesCount = quotations.filter((q) => q.salesRepId === currentRepId).length;
  const allQuotesCount = quotations.length;

  // Pipeline summary stats
  const pipelineValue = displayedQuotations.reduce((s, q) => s + (q.total || 0), 0);
  const pendingCount = displayedQuotations.filter((q) => q.stage === 'pending_approval').length;
  const confirmedCount = displayedQuotations.filter((q) => q.stage === 'confirmed').length;
  const approvedCount = displayedQuotations.filter((q) => q.stage === 'approved').length;

  return (
    <div className="quotations-page-container">
      {/* ── 1. Header ── */}
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className="page-title">Commercial Quotations</h1>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: '9999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)'
            }}>
              SALES PORTAL
            </span>
          </div>
          <p className="page-subtitle">
            Manage your deal lifecycle — from draft through approval, negotiation, and confirmation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>


          {/* Export / Download Quotations */}
          <button
            onClick={() => {
              const dataStr = JSON.stringify(quotations, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `quotations_export_${new Date().toISOString().slice(0, 10)}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              success('Quotations Exported', `Downloaded ${quotations.length} quotations.`);
            }}
            className="btn btn-secondary"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontWeight: 600, fontSize: '0.8125rem',
              padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-md)'
            }}
            title="Download All Quotations as JSON"
          >
            <Download size={15} />
            <span>Export</span>
          </button>

          {/* New Quotation */}
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="btn btn-primary"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontWeight: 700, fontSize: '0.8125rem',
              padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)'
            }}
          >
            <Plus size={16} />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI Strip ── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Pipeline Value', value: formatINRCompact(pipelineValue), icon: Activity, color: '#4F46E5' },
          { label: 'Pending Approval', value: pendingCount, icon: Clock, color: '#D97706' },
          { label: 'Approved', value: approvedCount, icon: ShieldCheck, color: '#059669' },
          { label: 'Confirmed', value: confirmedCount, icon: CheckCircle2, color: '#16A34A' },
        ].map((kpi) => {
          const KpiIcon = kpi.icon;
          return (
            <div key={kpi.label} style={{
              flex: '1 1 160px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0.875rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '8px',
                backgroundColor: `${kpi.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <KpiIcon size={18} color={kpi.color} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.125rem' }}>{kpi.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpi.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Toolbar ── */}
      <div className="card" style={{ padding: '0.875rem 1.125rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Scope tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--surface-secondary)', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'my', label: `My Quotes (${myQuotesCount})`, icon: User },
              { id: 'all', label: `All (${allQuotesCount})`, icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setScopeTab(id)}
                style={{
                  border: 'none', cursor: 'pointer',
                  backgroundColor: scopeTab === id ? '#FFFFFF' : 'transparent',
                  color: scopeTab === id ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: scopeTab === id ? 'var(--shadow-sm)' : 'none',
                  padding: '0.35rem 0.75rem', borderRadius: '6px',
                  fontSize: '0.7875rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}
              >
                <Icon size={13} /><span>{label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 220, backgroundColor: 'var(--surface-secondary)', borderRadius: '8px', padding: '0.35rem 0.75rem', border: '1px solid #E2E8F0' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by quote #, customer, rep..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8125rem', color: 'var(--text-primary)', width: '100%' }}
            />
          </div>

          {/* Stage filter */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-input" style={{ fontSize: '0.8rem', padding: '0.38rem 0.7rem', width: 'auto' }}>
            <option value="all">All Stages</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="returned_for_revision">Returned</option>
            <option value="negotiation">Negotiation</option>
            <option value="confirmed">Confirmed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Health */}
          <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)} className="select-input" style={{ fontSize: '0.8rem', padding: '0.38rem 0.7rem', width: 'auto' }}>
            <option value="all">All Health</option>
            <option value="healthy">Healthy</option>
            <option value="at risk">At Risk</option>
            <option value="critical">Critical</option>
          </select>

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select-input" style={{ fontSize: '0.8rem', padding: '0.38rem 0.7rem', width: 'auto' }}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_value">Highest Value</option>
            <option value="highest_margin">Highest Margin</option>
            <option value="customer_az">Customer A–Z</option>
          </select>

          {/* View mode toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', backgroundColor: 'var(--surface-secondary)', padding: '3px', borderRadius: '8px', gap: '2px' }}>
            {[{ id: 'kanban', Icon: LayoutGrid }, { id: 'table', Icon: List }].map(({ id, Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                title={id === 'kanban' ? 'Kanban View' : 'Table View'}
                style={{
                  border: 'none', cursor: 'pointer',
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px',
                  backgroundColor: viewMode === id ? '#FFFFFF' : 'transparent',
                  color: viewMode === id ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: viewMode === id ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Main Content ── */}
      {viewMode === 'kanban' ? (
        // KANBAN BOARD
        <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.875rem', minWidth: 'max-content' }}>
            {KANBAN_STAGES.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                quotations={kanbanGroups[stage.id] || []}
                onCardClick={(q) => navigate(`/quotations/${q.id}`)}
              />
            ))}
          </div>
        </div>
      ) : (
        // TABLE VIEW
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {displayedQuotations.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <AlertTriangle size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Quotations Found</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No quotations found in this view.'}
              </p>
              <button onClick={() => setIsCustomerModalOpen(true)} className="btn btn-primary">
                <Plus size={16} /><span>Create Quotation</span>
              </button>
            </div>
          ) : (
            <QuotationTable
              quotations={displayedQuotations}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onMoveStage={handleMoveStage}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      <CustomerSelectorModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        onSelect={handleCreateNew} 
      />
    </div>
  );
};
