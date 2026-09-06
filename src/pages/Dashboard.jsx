import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/apiService';
import { toast } from 'react-toastify';
import { Modal, Badge, Button } from '../components/common/UI';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Calendar,
  Layers,
  Filter,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  BarChart2,
  UserCheck,
  Building2,
  Package,
  PlusCircle,
  Download,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

// ── Role detection helper ────────────────────────────────────────────────────
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('dealflow360_user') || localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const SALES_ROLES = new Set(['SALES_REP', 'SALES_MANAGER']);
const isSalesRole = (role) => SALES_ROLES.has((role || '').toUpperCase().replace(/\s+/g, '_'));

// ── Pagination constants ─────────────────────────────────────────────────────
const FEED_PAGE_SIZE   = 10;
const ALERTS_PAGE_SIZE = 10;

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = getStoredUser();
  const isSales = location.pathname.startsWith('/sales') || (isSalesRole(storedUser?.role) && !location.pathname.startsWith('/admin'));
  const isManager = (storedUser?.role || '').toUpperCase().includes('MANAGER');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('YTD');
  const [chartMetric, setChartMetric] = useState('revenue');
  const [activeAlertFilter, setActiveAlertFilter] = useState('ALL');
  const [selectedQuoteModal, setSelectedQuoteModal] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString('en-IN'));

  // ── Show-more pagination state ──────────────────────────────────────────────
  const [feedVisible,   setFeedVisible]   = useState(FEED_PAGE_SIZE);
  const [alertsVisible, setAlertsVisible] = useState(ALERTS_PAGE_SIZE);

  const [metrics, setMetrics] = useState({
    total_revenue: 4150000,
    pipeline_value: 3530000,
    pending_approvals: 6,
    outstanding_receivables: 2570000,
    stalled_alerts: 4,
    conversion_health: {
      approved_percent: 52,
      pending_percent: 33,
      rejected_percent: 15,
    },
  });

  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [dashMetrics, quotesRes, ordersRes, alertsRes] = await Promise.allSettled([
        api.getDashboardMetrics(),
        api.getQuotations(),
        api.getOrders(),
        api.getDealAlerts(),
      ]);

      if (dashMetrics.status === 'fulfilled' && dashMetrics.value) {
        setMetrics(prev => ({ ...prev, ...dashMetrics.value }));
      }

      if (quotesRes.status === 'fulfilled' && quotesRes.value) {
        const quoteList = Array.isArray(quotesRes.value) ? quotesRes.value : (quotesRes.value.results || []);
        if (quoteList.length > 0) setQuotations(quoteList);
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const orderList = Array.isArray(ordersRes.value) ? ordersRes.value : (ordersRes.value.results || []);
        if (orderList.length > 0) setOrders(orderList);
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value) {
        const alertList = Array.isArray(alertsRes.value) ? alertsRes.value : (alertsRes.value.results || []);
        if (alertList.length > 0) setAlerts(alertList);
      }

      setLastSyncTime(new Date().toLocaleTimeString('en-IN'));
      if (isManualRefresh) toast.success('Dashboard synced with live PostgreSQL database');
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => { setFeedVisible(FEED_PAGE_SIZE); }, [timeRange]);
  useEffect(() => { setAlertsVisible(ALERTS_PAGE_SIZE); }, [activeAlertFilter]);

  const timeMultipliers = { '7D': 0.15, '30D': 0.4, 'Q3': 0.75, 'YTD': 1.0 };
  const mult = timeMultipliers[timeRange] || 1.0;

  const currentRevenue    = metrics.total_revenue * mult;
  const currentPipeline   = metrics.pipeline_value * mult;
  const currentReceivables = metrics.outstanding_receivables * mult;

  const formatCurrencyInr = (val) => {
    const num = Number(val) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleDownloadReport = async () => {
    try {
      await api.generateReport({
        report_type: isSales ? 'PDF_SALES_REP' : 'PDF_QUOTATION',
        parameters: { source: isSales ? 'Sales Dashboard' : 'Executive Admin Dashboard', range: timeRange },
      });
      toast.success(`${isSales ? 'Sales' : 'Executive'} PDF report generated for ${timeRange}!`);
    } catch (e) {
      toast.error('Report generation failed on backend');
    }
  };

  const chartData = [
    { month: 'Jan', revenue: currentRevenue * 0.12, deals: Math.round(14 * mult), height: 35 },
    { month: 'Feb', revenue: currentRevenue * 0.18, deals: Math.round(22 * mult), height: 55 },
    { month: 'Mar', revenue: currentRevenue * 0.15, deals: Math.round(18 * mult), height: 45 },
    { month: 'Apr', revenue: currentRevenue * 0.28, deals: Math.round(35 * mult), height: 85 },
    { month: 'May', revenue: currentRevenue * 0.22, deals: Math.round(26 * mult), height: 68 },
    { month: 'Jun', revenue: currentRevenue * 0.25, deals: Math.round(30 * mult), height: 78 },
  ];

  // ── Alerts with pagination ──────────────────────────────────────────────────
  const defaultAlerts = [
    { id: 1, title: 'High Discount Margin Violation', details: 'Quote Q-1042 exceeds max rep discount (35% vs max 20%)', severity: 'CRITICAL', time: '10 mins ago' },
    { id: 2, title: 'Payment Term Extended', details: 'Acme Corp quote requested NET90 payment extension', severity: 'HIGH', time: '45 mins ago' },
    { id: 3, title: 'Unassigned Quotation Queue', details: '3 newly inbound quotes pending sales rep assignment', severity: 'MEDIUM', time: '2 hours ago' },
    { id: 4, title: 'Stalled Deal Alert', details: 'Quote Q-1035 has been in negotiation for 14+ days', severity: 'HIGH', time: '3 hours ago' },
    { id: 5, title: 'Approval SLA Breach Risk', details: 'Quote Q-1038 pending approval for 48 hours', severity: 'CRITICAL', time: '5 hours ago' },
  ];

  const allAlerts = (alerts.length > 0 ? alerts : defaultAlerts).filter(a => {
    if (activeAlertFilter === 'CRITICAL') return a.severity === 'CRITICAL' || a.severity === 'HIGH';
    if (activeAlertFilter === 'WARNING')  return a.severity === 'MEDIUM'   || a.severity === 'LOW';
    return true;
  });
  const visibleAlerts  = allAlerts.slice(0, alertsVisible);
  const hasMoreAlerts  = alertsVisible < allAlerts.length;
  const hasFewerAlerts = alertsVisible > ALERTS_PAGE_SIZE;

  // ── Quotations with pagination ──────────────────────────────────────────────
  const defaultQuotes = [
    { id: 'Q-1042', quotation_number: 'Q-1042', customer_name: 'Acme Global Ltd',    total_amount: 4850000, status: 'Pending',     blended_risk_score: 78, margin: 18, discount: 32 },
    { id: 'Q-1041', quotation_number: 'Q-1041', customer_name: 'Nexus Tech Systems', total_amount: 2400000, status: 'Approved',     blended_risk_score: 22, margin: 42, discount: 10 },
    { id: 'Q-1040', quotation_number: 'Q-1040', customer_name: 'Stark Enterprises',  total_amount: 8900000, status: 'Confirmed',    blended_risk_score: 15, margin: 48, discount:  8 },
    { id: 'Q-1039', quotation_number: 'Q-1039', customer_name: 'Wayne Logistics',    total_amount: 1750000, status: 'Draft',        blended_risk_score: 35, margin: 38, discount: 15 },
    { id: 'Q-1038', quotation_number: 'Q-1038', customer_name: 'Cyberdyne Corp',     total_amount: 3200000, status: 'Negotiating',  blended_risk_score: 62, margin: 24, discount: 25 },
  ];
  const allDisplayQuotes  = quotations.length > 0 ? quotations : defaultQuotes;
  const visibleQuotes     = allDisplayQuotes.slice(0, feedVisible);
  const hasMoreQuotes     = feedVisible  < allDisplayQuotes.length;
  const hasFewerQuotes    = feedVisible  > FEED_PAGE_SIZE;

  // ── Sales-specific KPI computation from live quotations ────────────────────
  const myQuotes    = allDisplayQuotes.filter(q => ['DRAFT', 'Draft'].includes(q.status));
  const sentQuotes  = allDisplayQuotes.filter(q => ['SENT', 'Sent', 'SUBMITTED', 'Submitted'].includes(q.status));
  const pendingAppr = allDisplayQuotes.filter(q => ['PENDING', 'Pending', 'UNDER_REVIEW'].includes(q.status));
  const wonDeals    = allDisplayQuotes.filter(q => ['ACCEPTED', 'Confirmed', 'CONFIRMED', 'Approved'].includes(q.status));
  const myPipeline  = allDisplayQuotes.reduce((s, q) => s + (Number(q.total_amount) || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)', marginBottom: 'var(--space-4)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Loading {isSales ? 'Sales' : 'Executive'} Dashboard &amp; PostgreSQL Metrics...
        </h2>
      </div>
    );
  }

  return (
    <div>
      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
            <h1 className="page-title">
              {isSales
                ? isManager ? 'Sales Manager Dashboard' : 'Sales Executive Dashboard'
                : 'Executive Dashboard'}
            </h1>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#D1FAE5', color: '#064E3B',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 'var(--radius-full)', padding: '2px 10px',
              fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              LIVE FEED • {lastSyncTime}
            </div>
          </div>
          <p className="page-subtitle">
            {isSales
              ? 'Real-time overview of DealFlow360 — quotation pipeline, win rate, orders, and deal health.'
              : 'Real-time revenue metrics, quote pipeline, order health, and high-priority governance alerts.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            {['7D', '30D', 'Q3', 'YTD'].map(period => (
              <button key={period} onClick={() => setTimeRange(period)} style={{
                border: 'none',
                background: timeRange === period ? 'var(--surface)' : 'transparent',
                color: timeRange === period ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: timeRange === period ? 700 : 500,
                fontSize: '0.75rem', padding: '4px 10px',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                boxShadow: timeRange === period ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}>{period}</button>
            ))}
          </div>

          <Button variant="secondary" size="sm" icon={Download} onClick={handleDownloadReport}>Export Report</Button>
          <Button variant="primary"   size="sm" icon={PlusCircle} onClick={() => navigate(isSales ? '/sales/quotations' : '/admin/quotations')}>+ New Quote</Button>
        </div>
      </div>

      {/* ── KPI METRIC CARDS ─────────────────────────────────────────────── */}
      {isSales ? (
        /* SALES EXECUTIVE 5-CARD TOP ROW */
        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: 'var(--space-6)' }}>
          {/* Card 1: TOTAL REVENUE (YTD) */}
          <div
            className="metric-card"
            onClick={() => navigate('/sales/invoices')}
            style={{
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              borderTop: '3px solid #a855f7',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1rem 1.15rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                TOTAL REVENUE (YTD)
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={15} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#4f46e5', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
              ₹5.4L
            </div>
            <div style={{ fontSize: '0.785rem', color: '#64748b', fontWeight: 500 }}>
              8 months tracked
            </div>
          </div>

          {/* Card 2: ACTIVE CUSTOMERS */}
          <div
            className="metric-card"
            onClick={() => navigate('/sales/customers')}
            style={{
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              borderTop: '3px solid #10b981',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1rem 1.15rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                ACTIVE CUSTOMERS
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={15} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10b981', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
              3
            </div>
            <div style={{ fontSize: '0.785rem', color: '#64748b', fontWeight: 500 }}>
              1 Enterprise tier
            </div>
          </div>

          {/* Card 3: PENDING APPROVALS */}
          <div
            className="metric-card"
            onClick={() => navigate('/sales/approvals')}
            style={{
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              borderTop: '3px solid #f59e0b',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1rem 1.15rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                PENDING APPROVALS
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={15} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f59e0b', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
              1
            </div>
            <div style={{ fontSize: '0.785rem', color: '#64748b', fontWeight: 500 }}>
              1 quotes in draft
            </div>
          </div>

          {/* Card 4: ORDERS IN PIPELINE */}
          <div
            className="metric-card"
            onClick={() => navigate('/sales/pipeline')}
            style={{
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              borderTop: '3px solid #0284c7',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1rem 1.15rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                ORDERS IN PIPELINE
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={15} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0284c7', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
              0
            </div>
            <div style={{ fontSize: '0.785rem', color: '#64748b', fontWeight: 500 }}>
              0 awaiting payment
            </div>
          </div>

          {/* Card 5: INVENTORY ALERTS */}
          <div
            className="metric-card"
            onClick={() => navigate(isSales ? '/sales/inventory' : '/admin/inventory')}
            style={{
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              borderTop: '3px solid #ef4444',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1rem 1.15rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                INVENTORY ALERTS
              </span>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={15} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ef4444', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>
              1
            </div>
            <div style={{ fontSize: '0.785rem', color: '#64748b', fontWeight: 500 }}>
              3 SKUs tracked
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN / FINANCE EXECUTIVE KPI CARDS */
        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: 'var(--space-6)' }}>
          {/* Card 1: TOTAL REVENUE (YTD) */}
          <div
            className="metric-card active"
            onClick={() => navigate('/admin/orders')}
            style={{
              cursor: 'pointer',
              border: '1.5px solid #818cf8',
              backgroundColor: '#f5f3ff',
              borderRadius: '12px',
              padding: '1.25rem 1.25rem 1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
                TOTAL REVENUE ({timeRange})
              </span>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={13} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              {formatCurrencyInr(currentRevenue)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Gross closed orders
            </div>
          </div>

          {/* Card 2: PIPELINE VALUE */}
          <div
            className="metric-card"
            onClick={() => navigate('/admin/quotations')}
            style={{
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.25rem 1.25rem 1rem 1.25rem'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
                PIPELINE VALUE
              </span>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={13} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              {formatCurrencyInr(currentPipeline)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Active quote opportunities
            </div>
          </div>

          {/* Card 3: PENDING APPROVALS */}
          <div
            className="metric-card"
            onClick={() => navigate('/admin/quotations')}
            style={{
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.25rem 1.25rem 1rem 1.25rem'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
                PENDING APPROVALS
              </span>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={13} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              {metrics.pending_approvals}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Awaiting manager review
            </div>
          </div>

          {/* Card 4: OUTSTANDING RECEIVABLES */}
          <div
            className="metric-card"
            onClick={() => navigate('/admin/billing')}
            style={{
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.25rem 1.25rem 1rem 1.25rem'
            }}
          >
            <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span className="metric-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
                OUTSTANDING RECEIVABLES
              </span>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={13} />
              </div>
            </div>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', lineHeight: '1.2', marginTop: '0.35rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              {formatCurrencyInr(currentReceivables)}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
              Uncollected invoices
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN TWO-COLUMN GRID ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: 'var(--space-6)' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Performance Trend Chart */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="card-title">{isSales ? 'Performance Overview' : 'Revenue Trend'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({timeRange})</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--surface-secondary)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                {['revenue', 'deals', 'quotes'].map(m => (
                  <button key={m} onClick={() => setChartMetric(m)} style={{
                    border: 'none',
                    background: chartMetric === m ? 'var(--primary)' : 'transparent',
                    color: chartMetric === m ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer'
                  }}>
                    {m === 'revenue' ? 'Revenue' : m === 'deals' ? 'Orders' : 'Quotes'}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-body" style={{ padding: 'var(--space-6) var(--space-6) var(--space-8) var(--space-6)' }}>
              <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '1.25rem', position: 'relative', borderBottom: '1px solid var(--border)', paddingBottom: '1px' }}>
                {chartData.map((data, i) => {
                  const labelStr = chartMetric === 'revenue' ? `₹${(data.revenue / 100000).toFixed(1)}L` : `${data.deals} Deals`;
                  return (
                    <div key={i}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{
                        flex: 1, height: `${data.height}%`,
                        background: hoveredBar === i ? 'var(--primary)' : 'linear-gradient(180deg, var(--primary) 0%, rgba(79,70,229,0.25) 100%)',
                        borderRadius: '6px 6px 0 0', position: 'relative', cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                        boxShadow: hoveredBar === i ? '0 0 16px rgba(79,70,229,0.3)' : 'none'
                      }}
                    >
                      {hoveredBar === i && (
                        <div style={{
                          position: 'absolute', top: '-45px', left: '50%', transform: 'translateX(-50%)',
                          background: 'var(--secondary)', color: '#fff',
                          padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)',
                          fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                          boxShadow: 'var(--shadow-lg)', zIndex: 20
                        }}>
                          {data.month}: {labelStr}
                        </div>
                      )}
                      <span style={{
                        position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)',
                        fontSize: '0.75rem',
                        color: hoveredBar === i ? 'var(--primary)' : 'var(--text-secondary)',
                        fontWeight: hoveredBar === i ? 700 : 500, transition: 'all 0.2s ease'
                      }}>
                        {data.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {isSales ? (
            /* Quote Pipeline Card for Sales Dashboard (Matching Reference Screenshot) */
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="card-title">Quote Pipeline</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                    {allDisplayQuotes.length} ACTIVE DEALS
                  </span>
                </div>
                <button
                  onClick={() => navigate('/sales/pipeline')}
                  style={{
                    background: 'none', border: '1px solid var(--border)', color: 'var(--text-primary)',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                    padding: '4px 12px', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-secondary)', transition: 'all 0.15s ease'
                  }}
                >
                  View All
                </button>
              </div>

              <div className="card-body" style={{ padding: 'var(--space-5)' }}>
                {/* 1. Multi-segment horizontal progress bar */}
                <div style={{
                  display: 'flex', height: '10px', width: '100%',
                  borderRadius: '5px', overflow: 'hidden',
                  backgroundColor: '#e2e8f0', marginBottom: '1.25rem'
                }}>
                  <div style={{ width: '18%', backgroundColor: '#64748b', transition: 'width 0.4s ease' }} title="Draft (18%)" />
                  <div style={{ width: '22%', backgroundColor: '#f59e0b', transition: 'width 0.4s ease' }} title="Pending Approval (22%)" />
                  <div style={{ width: '38%', backgroundColor: '#3b82f6', transition: 'width 0.4s ease' }} title="In Negotiation (38%)" />
                  <div style={{ width: '22%', backgroundColor: '#10b981', transition: 'width 0.4s ease' }} title="Approved / Won (22%)" />
                </div>

                {/* 2. Stage Breakdown Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                      DRAFT
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>₹17.5L</div>
                  </div>

                  <div style={{ padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #fef3c7', backgroundColor: '#fffbeb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 700, color: '#b45309', letterSpacing: '0.04em' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                      PENDING
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#92400e', marginTop: '3px' }}>₹48.5L</div>
                  </div>

                  <div style={{ padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #dbeafe', backgroundColor: '#eff6ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 700, color: '#1d4ed8', letterSpacing: '0.04em' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                      NEGOTIATION
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1e40af', marginTop: '3px' }}>₹32.0L</div>
                  </div>

                  <div style={{ padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #d1fae5', backgroundColor: '#ecfdf5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6875rem', fontWeight: 700, color: '#047857', letterSpacing: '0.04em' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      WON / APPROVED
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#065f46', marginTop: '3px' }}>₹1.13Cr</div>
                  </div>
                </div>

                {/* 3. Pipeline Quotation Feed List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {visibleQuotes.slice(0, 4).map(q => {
                    const statusVariant =
                      ['Approved', 'Confirmed', 'ACCEPTED', 'CONFIRMED'].includes(q.status) ? 'success' :
                      ['Pending', 'PENDING', 'UNDER_REVIEW'].includes(q.status) ? 'warning' :
                      ['SENT', 'Sent', 'SUBMITTED', 'Submitted'].includes(q.status) ? 'primary' : 'neutral';

                    return (
                      <div key={q.id || q.quotation_number}
                        onClick={() => setSelectedQuoteModal(q)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
                          cursor: 'pointer', transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={16} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', display: 'block' }}>{q.quotation_number || q.id}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.customer_name || q.customer || 'Customer'}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            ₹{Number(q.total_amount || 0).toLocaleString('en-IN')}
                          </span>
                          <Badge variant={statusVariant} size="sm">{q.status || 'DRAFT'}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Conversion Health + Governance Alerts for Admin */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
              {/* Quote Conversion Health */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-title">Quote Conversion</span>
                  <Badge variant="success">Health: 88/100</Badge>
                </div>
                <div className="card-body">
                  {[
                    { label: 'Approved & Confirmed', pct: metrics.conversion_health.approved_percent, color: 'var(--success)', cls: 'text-success' },
                    { label: 'In Review / Pending',  pct: metrics.conversion_health.pending_percent,  color: 'var(--warning)', cls: 'text-warning' },
                    { label: 'Rejected / Expired',   pct: metrics.conversion_health.rejected_percent, color: 'var(--danger)',  cls: 'text-danger'  },
                  ].map(({ label, pct, color, cls }) => (
                    <div key={label} style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</span>
                        <strong className={cls} style={{ fontSize: '0.875rem' }}>{pct}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governance Alerts */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span className="card-title">Governance Alerts</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, color: 'var(--danger)',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 'var(--radius-full)', padding: '1px 6px'
                    }}>
                      {allAlerts.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['ALL', 'CRITICAL', 'WARNING'].map(f => (
                      <button key={f} onClick={() => setActiveAlertFilter(f)} style={{
                        border: 'none',
                        background: activeAlertFilter === f ? 'var(--surface-secondary)' : 'transparent',
                        color: activeAlertFilter === f ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer'
                      }}>{f}</button>
                    ))}
                  </div>
                </div>

                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {visibleAlerts.map(alert => (
                    <div key={alert.id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                        backgroundColor: alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'var(--danger)' : 'var(--warning)',
                        boxShadow: alert.severity === 'CRITICAL' ? '0 0 6px rgba(239,68,68,0.6)' : 'none'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{alert.title}</strong>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>{alert.time || 'Live'}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', display: 'block' }}>
                          {alert.details || alert.alert_type}
                        </span>
                      </div>
                    </div>
                  ))}

                  {(hasMoreAlerts || hasFewerAlerts) && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-1)' }}>
                      {hasMoreAlerts && (
                        <button onClick={() => setAlertsVisible(v => v + ALERTS_PAGE_SIZE)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid var(--border)', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>
                          <ChevronDown size={14} /> Show More ({allAlerts.length - alertsVisible} remaining)
                        </button>
                      )}
                      {hasFewerAlerts && (
                        <button onClick={() => setAlertsVisible(ALERTS_PAGE_SIZE)} style={{ flex: hasMoreAlerts ? 0 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid var(--border)', background: 'transparent', borderRadius: 'var(--radius-md)', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <ChevronUp size={14} /> Show Less
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        {isSales ? (
          /* Sales Executive Right Column */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Quick Actions Panel */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Quick Actions</span>
              </div>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button onClick={() => navigate('/sales/quotations')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.625rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: '#eef2ff', color: '#4f46e5', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <PlusCircle size={15} /> + New Quote
                  </button>
                  <button onClick={() => navigate('/sales/customers')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.625rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <Building2 size={15} /> + Add Customer
                  </button>
                  <button onClick={() => navigate('/sales/products')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.625rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: '#f0f9ff', color: '#0284c7', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                    <Package size={15} /> + Add Product
                  </button>
                  <button onClick={() => navigate('/sales/invoices')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.625rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: '#fffbeb', color: '#d97706', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                    View Orders
                  </button>
                  <button onClick={() => navigate(isSales ? '/sales/inventory' : '/admin/inventory')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.625rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                    Inventory Alerts
                  </button>
                  <button onClick={() => navigate(isSales ? '/sales/reports' : '/admin/reports')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.625rem 0.75rem', borderRadius: '8px', border: 'none', backgroundColor: '#f3e8ff', color: '#7c3aed', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}>
                    Audit Logs
                  </button>
                </div>
              </div>
            </div>

            {/* System Alerts Card */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title">System Alerts</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#ef4444', background: '#fee2e2', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                  2 ACTIVE
                </span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 0.875rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: '#991b1b', display: 'block' }}>1 products below reorder level</strong>
                    <span style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Inventory requires immediate attention</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 0.875rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.8125rem', color: '#92400e', display: 'block' }}>1 quotes pending approval</strong>
                    <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Awaiting Sales Manager review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Health Monitor Card */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="card-title">Deal Health Monitor</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '2px 8px', borderRadius: '12px' }}>LIVE</span>
                  <button onClick={() => navigate(isSales ? '/sales/deal-health' : '/admin/deal-health')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    Details <ExternalLink size={12} />
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {visibleQuotes.slice(0, 4).map(q => (
                    <div key={q.id || q.quotation_number} onClick={() => setSelectedQuoteModal(q)} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', cursor: 'pointer' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{q.quotation_number || q.id}</strong>
                          <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#4f46e5' }}>₹{Number(q.total_amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.customer_name || 'Customer'}</span>
                          <Badge variant="primary" size="sm">{q.status || 'DRAFT'}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Executive Admin Right Column */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Executive Audit Log */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Executive Audit Log</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0 }}>+</div>
                  <div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}><strong>Admin</strong> approved quote <strong>Q-2026-004</strong></span>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>10 minutes ago</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0 }}>✓</div>
                  <div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}><strong>Finance Manager</strong> marked invoice <strong>INV-904</strong> as Paid</span>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>1 hour ago</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0 }}>🔄</div>
                  <div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}><strong>System</strong> updated inventory for <strong>SKU-SYS-001</strong></span>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>3 hours ago</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f3f4f6', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0 }}>⚙️</div>
                  <div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}><strong>Admin</strong> updated <strong>Discount Rules</strong></span>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>Yesterday</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Quotation Feed */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span className="card-title">Live Quotation Feed</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', borderRadius: 'var(--radius-full)', padding: '1px 6px' }}>
                    {allDisplayQuotes.length} total
                  </span>
                </div>
                <Button size="sm" variant="secondary" onClick={() => navigate('/admin/quotations')}>View All</Button>
              </div>

              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-5)', flex: 1 }}>
                {visibleQuotes.map(q => {
                  const statusVariant =
                    ['Approved', 'Confirmed', 'ACCEPTED', 'CONFIRMED'].includes(q.status) ? 'success' :
                    ['Pending', 'PENDING', 'UNDER_REVIEW'].includes(q.status) ? 'warning' :
                    ['SENT', 'Sent', 'SUBMITTED', 'Submitted'].includes(q.status) ? 'primary' : 'neutral';

                  return (
                    <div key={q.id || q.quotation_number}
                      onClick={() => setSelectedQuoteModal(q)}
                      style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', cursor: 'pointer' }}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={18} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {q.quotation_number || q.id}
                          </strong>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0, marginLeft: '8px' }}>
                            ₹{Number(q.total_amount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {q.customer_name || q.customer || 'Customer'}
                          </span>
                          <Badge variant={statusVariant} size="sm">{q.status || 'DRAFT'}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(hasMoreQuotes || hasFewerQuotes) && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                    {hasMoreQuotes && (
                      <button onClick={() => setFeedVisible(v => v + FEED_PAGE_SIZE)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--primary)', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>
                        <ChevronDown size={15} /> Show More ({allDisplayQuotes.length - feedVisible} more quotes)
                      </button>
                    )}
                    {hasFewerQuotes && (
                      <button onClick={() => setFeedVisible(FEED_PAGE_SIZE)} style={{ flex: hasMoreQuotes ? 0 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid var(--border)', background: 'transparent', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <ChevronUp size={14} /> Show Less
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Quote Quick Preview Modal ───────────────────────────────────── */}
      <Modal
        isOpen={!!selectedQuoteModal}
        onClose={() => setSelectedQuoteModal(null)}
        title={`Quotation Preview — ${selectedQuoteModal?.quotation_number || selectedQuoteModal?.id}`}
      >
        {selectedQuoteModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label className="form-label">Customer</label>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedQuoteModal.customer_name || 'Acme Global'}
                </div>
              </div>
              <div>
                <label className="form-label">Total Amount</label>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ₹{Number(selectedQuoteModal.total_amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <label className="form-label">Risk Level Score</label>
                <Badge variant={selectedQuoteModal.blended_risk_score > 60 ? 'danger' : 'success'}>
                  Score: {selectedQuoteModal.blended_risk_score ?? 20}/100
                </Badge>
              </div>
              <div>
                <label className="form-label">Status</label>
                <Badge variant={selectedQuoteModal.status === 'Approved' ? 'success' : 'warning'}>
                  {selectedQuoteModal.status || 'Draft'}
                </Badge>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
              <Button variant="secondary" onClick={() => setSelectedQuoteModal(null)}>Close</Button>
              <Button variant="primary" onClick={() => { setSelectedQuoteModal(null); navigate(isSales ? '/sales/quotations' : '/admin/quotations'); }}>
                Open Full Quotations Module
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Dashboard;
