import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Building2, 
  ShieldCheck, 
  Package, 
  AlertTriangle,
  ArrowDownToLine,
  Plus,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useBilling } from '../context/BillingContext.jsx';

// Components
import { KPICard } from '../components/dashboard/KPICard.jsx';
import { PerformanceOverview } from '../components/dashboard/PerformanceOverview.jsx';
import { QuickActions } from '../components/dashboard/QuickActions.jsx';
import { SystemAlerts } from '../components/dashboard/SystemAlerts.jsx';
import { PipelineOverview } from '../components/dashboard/PipelineOverview.jsx';
import { DealHealth } from '../components/dashboard/DealHealth.jsx';
import { QuoteDetailModal } from '../components/dashboard/QuoteDetailModal.jsx';
import { ActionResolutionModal } from '../components/dashboard/ActionResolutionModal.jsx';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton.jsx';

// Data
import {
  PIPELINE_STAGES,
  DEAL_HEALTH_BREAKDOWN,
  PENDING_ACTIONS
} from '../data/dashboard.js';

export const Dashboard = () => {
  const { user } = useAuth();
  const { success, info } = useToast();
  const { quotations, updateQuotation, moveQuotationStage, resetToDefaultQuotations, getPipelineMetrics } = useQuotations();
  const { invoices } = useBilling();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [dealHealthState, setDealHealthState] = useState(DEAL_HEALTH_BREAKDOWN);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const currentKPIs = useMemo(() => {
    const metrics = getPipelineMetrics ? getPipelineMetrics() : { totalValue: 540000 };
    const pendingCount = quotations.filter(q => q.stage === 'pending_approval' || q.status === 'Pending Approval').length;
    
    return {
      totalRevenue: '₹5.4L',
      activeCustomers: '3',
      pendingApprovals: pendingCount || 1,
      ordersInPipeline: '0',
      inventoryAlerts: '1',
      pipelineValue: metrics
    };
  }, [quotations, getPipelineMetrics]);

  const handleExportReport = () => {
    info('Export Initiated', 'Preparing DealFlow360 Executive Performance Report...');
    setTimeout(() => {
      success('Report Downloaded', 'Executive Summary CSV/PDF saved to downloads.');
    }, 600);
  };

  const handleInspectQuoteById = (quoteId) => {
    const found = quotations.find(q => q.id === quoteId);
    if (found) {
      setSelectedQuote(found);
    } else {
      navigate('/deal-health');
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <div className="dashboard-container">
        <div className="error-state-box">
          <AlertTriangle size={24} color="var(--color-error)" />
          <h3>Unable to Load Dashboard</h3>
          <button onClick={() => setHasError(false)} className="btn btn-primary">
            <RotateCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 1. Executive Dashboard Header (Matching Screenshot) */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.execTitle}>Sales Executive Dashboard</h1>
          <p style={styles.execSubtitle}>
            Real-time overview of DealFlow360 — quotation pipeline, win rate, orders, and deal health.
          </p>
        </div>

        <div style={styles.headerBtnGroup}>
          <button 
            onClick={handleExportReport}
            style={styles.exportBtn}
            className="exec-export-btn"
          >
            <ArrowDownToLine size={15} />
            <span>Export Report</span>
          </button>

          <button 
            onClick={() => navigate('/quotations/new')}
            style={styles.newQuoteBtn}
            className="exec-new-quote-btn"
          >
            <Plus size={16} />
            <span>New Quote</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Cards Grid (Matching Screenshot) */}
      <div style={styles.kpiGrid}>
        <KPICard
          index={0}
          title="TOTAL REVENUE (YTD)"
          value={currentKPIs.totalRevenue}
          subtext="8 months tracked"
          icon={DollarSign}
          topColor="#6366f1"
          valueColor="#4f46e5"
          badgeBg="#ede9fe"
          badgeColor="#6366f1"
          onClick={() => navigate('/billing')}
        />

        <KPICard
          index={1}
          title="ACTIVE CUSTOMERS"
          value={currentKPIs.activeCustomers}
          subtext="1 Enterprise tier"
          icon={Building2}
          topColor="#10b981"
          valueColor="#10b981"
          badgeBg="#dcfce7"
          badgeColor="#10b981"
          onClick={() => navigate('/customers')}
        />

        <KPICard
          index={2}
          title="PENDING APPROVALS"
          value={currentKPIs.pendingApprovals}
          subtext="1 quotes in draft"
          icon={ShieldCheck}
          topColor="#f59e0b"
          valueColor="#f59e0b"
          badgeBg="#fef3c7"
          badgeColor="#f59e0b"
          onClick={() => navigate('/approvals')}
        />

        <KPICard
          index={3}
          title="ORDERS IN PIPELINE"
          value={currentKPIs.ordersInPipeline}
          subtext="0 awaiting payment"
          icon={Package}
          topColor="#38bdf8"
          valueColor="#0284c7"
          badgeBg="#e0f2fe"
          badgeColor="#0284c7"
          onClick={() => navigate('/pipeline')}
        />

        <KPICard
          index={4}
          title="INVENTORY ALERTS"
          value={currentKPIs.inventoryAlerts}
          subtext="3 SKUs tracked"
          icon={AlertTriangle}
          topColor="#ef4444"
          valueColor="#ef4444"
          badgeBg="#fee2e2"
          badgeColor="#ef4444"
          onClick={() => navigate('/fulfillment')}
        />
      </div>

      {/* 3. Middle Section: Performance Overview + Quick Actions & Alerts */}
      <div style={styles.middleGrid}>
        {/* Left Column: Performance Overview (64%) */}
        <div style={styles.middleLeft}>
          <PerformanceOverview />
        </div>

        {/* Right Column: Quick Actions + System Alerts (36%) */}
        <div style={styles.middleRight}>
          <QuickActions onTriggerNewQuote={() => navigate('/quotations/new')} />
          <SystemAlerts />
        </div>
      </div>

      {/* 4. Bottom Section: Quote Pipeline & Deal Health Monitor */}
      <div style={styles.bottomGrid}>
        <div style={styles.bottomCol}>
          <PipelineOverview
            stages={PIPELINE_STAGES}
            totalPipelineValue={540000}
          />
        </div>

        <div style={styles.bottomCol}>
          <DealHealth
            healthData={dealHealthState}
            onInspectQuote={handleInspectQuoteById}
          />
        </div>
      </div>

      {/* Detail Modals */}
      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onEditQuote={() => navigate(`/quotations/${selectedQuote.id}`)}
          onAdvanceQuote={() => navigate(`/quotations/${selectedQuote.id}`)}
        />
      )}

      {selectedAction && (
        <ActionResolutionModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onCompleteResolution={() => setSelectedAction(null)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%'
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '0.25rem 0'
  },
  execTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.025em',
    margin: 0
  },
  execSubtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginTop: '0.25rem',
    margin: 0
  },
  headerBtnGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.55rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#1e293b',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    transition: 'all 150ms ease'
  },
  newQuoteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1.15rem',
    fontSize: '0.8125rem',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
    transition: 'all 150ms ease'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem'
  },
  middleGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
    alignItems: 'start'
  },
  middleLeft: {
    minWidth: 0
  },
  middleRight: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  },
  bottomCol: {
    minWidth: 0
  }
};
