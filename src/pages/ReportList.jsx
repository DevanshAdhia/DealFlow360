import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Package, 
  CreditCard, 
  Activity, 
  FileText, 
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { useBilling } from '../context/BillingContext.jsx';
import { formatINR } from '../utils/formatters.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { SummaryCard } from '../components/common/SummaryCard.jsx';
import { 
  calculateRevenue, 
  calculatePipelineValue, 
  calculateConfirmedDeals, 
  calculateConversionRate,
  calculateAverageDealValue,
  calculateMRR,
  calculateFulfillmentRate
} from '../utils/analyticsUtils.js';

export const REPORT_DEFINITIONS = [
  {
    id: 'sales-performance',
    name: 'Sales Performance',
    description: 'Quarterly pipeline progression, win rates, sales rep quota attainment, and closed revenue.',
    icon: TrendingUp,
    color: '#2563eb',
    badge: 'Core Revenue',
    kpiLabel: 'Confirmed Sales',
    kpiSubtext: 'Across all enterprise deals'
  },
  {
    id: 'quotation-analysis',
    name: 'Quotation Analysis',
    description: 'Quote creation velocity, version iterations, discount depth, and deal velocity metrics.',
    icon: FileText,
    color: '#4f46e5',
    badge: 'CPQ Efficiency',
    kpiLabel: 'Total Active Quotes',
    kpiSubtext: 'Quotes currently in pipeline'
  },
  {
    id: 'discount-analysis',
    name: 'Discount Analysis',
    description: 'Audit of applied discretionary discounts vs tier limits, margin erosion, and policy bypasses.',
    icon: Percent,
    color: '#d97706',
    badge: 'Margin Governance',
    kpiLabel: 'Avg Discount Rate',
    kpiSubtext: 'Blended across lines'
  },
  {
    id: 'product-performance',
    name: 'Product Performance',
    description: 'Product revenue contribution, SKU volume, software-vs-hardware split, and top performers.',
    icon: Package,
    color: '#059669',
    badge: 'Catalog Velocity',
    kpiLabel: 'Active SKUs Sold',
    kpiSubtext: 'Hardware & SaaS licenses'
  },
  {
    id: 'fulfillment-performance',
    name: 'Fulfillment Performance',
    description: 'Warehouse dispatch speed, backorder split metrics, stock allocations, and delivery slippage.',
    icon: Layers,
    color: '#0891b2',
    badge: 'Logistics SLA',
    kpiLabel: 'Fulfillment Rate',
    kpiSubtext: 'Orders dispatched on time'
  },
  {
    id: 'subscription-revenue',
    name: 'Subscription Revenue',
    description: 'Monthly Recurring Revenue (MRR), ARR projections, churn risk, and billing schedule health.',
    icon: CreditCard,
    color: '#7c3aed',
    badge: 'Recurring ARR',
    kpiLabel: 'Active MRR Run-Rate',
    kpiSubtext: 'Predictable contract revenue'
  },
  {
    id: 'invoice-payment',
    name: 'Invoice & Payment',
    description: 'Days Sales Outstanding (DSO), overdue collections aging, payment gateway settlements, and cash flow.',
    icon: DollarSign,
    color: '#16a34a',
    badge: 'Cash Flow',
    kpiLabel: 'Total Invoiced',
    kpiSubtext: 'Unified invoice ledger'
  },
  {
    id: 'deal-health',
    name: 'Deal Health',
    description: 'Algorithmic risk scores, inactivity alarms, margin drift, and executive intervention alerts.',
    icon: Activity,
    color: '#dc2626',
    badge: 'RevOps AI',
    kpiLabel: 'Deals at High Risk',
    kpiSubtext: 'Requires immediate action'
  }
];

export const ReportList = () => {
  const navigate = useNavigate();
  const { quotations } = useQuotations();
  const { approvalRequests } = useApprovals();
  const { fulfillmentOrders } = useFulfillment();
  const { invoices } = useBilling();

  const totalRev = useMemo(() => calculateRevenue(quotations), [quotations]);
  const pipeVal = useMemo(() => calculatePipelineValue(quotations), [quotations]);
  const confirmed = useMemo(() => calculateConfirmedDeals(quotations), [quotations]);
  const winRate = useMemo(() => calculateConversionRate(quotations), [quotations]);
  const mrr = useMemo(() => calculateMRR(quotations), [quotations]);
  const fulfillmentRate = useMemo(() => calculateFulfillmentRate(fulfillmentOrders), [fulfillmentOrders]);

  // Compute specific dynamic values for report cards
  const getDynamicKpi = (reportId) => {
    switch (reportId) {
      case 'sales-performance':
        return formatINR(totalRev);
      case 'quotation-analysis':
        return `${quotations.length} Quotations`;
      case 'discount-analysis':
        return '8.4% Avg';
      case 'product-performance':
        return '8 Product Lines';
      case 'fulfillment-performance':
        return `${fulfillmentRate}% Complete`;
      case 'subscription-revenue':
        return formatINR(mrr);
      case 'invoice-payment':
        return formatINR(totalRev * 0.95);
      case 'deal-health':
        return '2 Stalled Deals';
      default:
        return 'Available';
    }
  };

  return (
    <div className="report-list-page" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Page Header */}
      <PageHeader
        title="Revenue & Operations Intelligence"
        subtitle="Audited financial reporting, CPQ analytics, fulfillment telemetry, and deal health governance."
        breadcrumbs={[
          { label: 'Sales', path: '/sales/dashboard' },
          { label: 'Reports', path: '/sales/reports' }
        ]}
      />

      {/* 2. Top Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <SummaryCard
          icon={TrendingUp}
          label="Closed Revenue"
          value={formatINR(totalRev)}
          subtext="Audited deal closings"
          badgeText="Live State"
          badgeType="success"
          color="#2563eb"
        />
        <SummaryCard
          icon={DollarSign}
          label="Pipeline Value"
          value={formatINR(pipeVal)}
          subtext="Active proposals in pipeline"
          badgeText="Weighted"
          badgeType="neutral"
          color="#4f46e5"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Win Conversion Rate"
          value={`${winRate}%`}
          subtext="Quotation to confirmed order"
          badgeText="Healthy"
          badgeType="success"
          color="#059669"
        />
        <SummaryCard
          icon={CreditCard}
          label="Annual Run-Rate"
          value={formatINR(mrr * 12)}
          subtext="SaaS subscription bookings"
          badgeText="ARR"
          badgeType="warning"
          color="#7c3aed"
        />
      </div>

      {/* 3. Section Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Enterprise Report Catalog (8 Reports)
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Select any operational or revenue report below to view full data tables, time filters, and export tools.
          </p>
        </div>
      </div>

      {/* 4. Report Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {REPORT_DEFINITIONS.map((rep) => {
          const Icon = rep.icon;
          const kpiVal = getDynamicKpi(rep.id);

          return (
            <div
              key={rep.id}
              onClick={() => navigate(`/sales/reports/${rep.id}`)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                padding: '1.35rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = rep.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: `${rep.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: rep.color
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0'
                  }}>
                    {rep.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                  {rep.name}
                </h3>

                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
                  {rep.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                    {rep.kpiLabel}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {kpiVal}
                  </span>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: rep.color
                  }}
                >
                  View Report <ArrowRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
