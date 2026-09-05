import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Package, 
  CreditCard, 
  Activity, 
  FileText, 
  Layers, 
  Download, 
  Printer, 
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { useBilling } from '../context/BillingContext.jsx';
import { formatINR } from '../utils/formatters.js';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { SummaryCard } from '../components/common/SummaryCard.jsx';
import { ErrorState } from '../components/common/ErrorState.jsx';
import { REPORT_DEFINITIONS } from './ReportList.jsx';
import { 
  calculateRevenue, 
  calculatePipelineValue, 
  calculateConfirmedDeals, 
  calculateConversionRate,
  calculateAverageDealValue,
  calculateMRR,
  getRevenueTrend,
  getPipelineByStage,
  getDealsByStatus,
  getSalesRepPerformance,
  getDealHealthAnalytics,
  getApprovalAnalytics,
  getFulfillmentAnalytics,
  getBillingAnalytics,
  calculateCustomerAnalytics,
  calculateProductAnalytics,
  calculateDiscountAnalytics
} from '../utils/analyticsUtils.js';

import PRODUCTS_DATA from '../data/products.json';
import { WAREHOUSES } from '../data/warehouses.js';

// Visual Tabs / Specialized Views for Reports
import { SalesAnalyticsTab } from '../components/analytics/SalesAnalyticsTab.jsx';
import { DealHealthAnalyticsTab } from '../components/analytics/DealHealthAnalyticsTab.jsx';
import { ApprovalAnalyticsTab } from '../components/analytics/ApprovalAnalyticsTab.jsx';
import { FulfillmentAnalyticsTab } from '../components/analytics/FulfillmentAnalyticsTab.jsx';
import { BillingAnalyticsTab } from '../components/analytics/BillingAnalyticsTab.jsx';
import { ProductAnalyticsTab } from '../components/analytics/ProductAnalyticsTab.jsx';
import { DiscountAnalyticsTab } from '../components/analytics/DiscountAnalyticsTab.jsx';
import { CustomerAnalyticsTab } from '../components/analytics/CustomerAnalyticsTab.jsx';

export const ReportDetail = () => {
  const { reportId, id } = useParams();
  const navigate = useNavigate();
  const targetId = reportId || id;

  const { quotations } = useQuotations();
  const { approvalRequests } = useApprovals();
  const { fulfillmentOrders } = useFulfillment();
  const { invoices } = useBilling();

  const [dateRange, setDateRange] = useState('ALL');
  const [exportLoading, setExportLoading] = useState(false);

  const reportConfig = REPORT_DEFINITIONS.find(r => r.id === targetId);

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    if (dateRange === 'ALL') return quotations;
    // Simple filter mock for demonstration
    return quotations;
  }, [quotations, dateRange]);

  // Calculations
  const revenue = useMemo(() => calculateRevenue(filteredQuotations), [filteredQuotations]);
  const pipelineValue = useMemo(() => calculatePipelineValue(filteredQuotations), [filteredQuotations]);
  const confirmedDeals = useMemo(() => calculateConfirmedDeals(filteredQuotations), [filteredQuotations]);
  const conversionRate = useMemo(() => calculateConversionRate(filteredQuotations), [filteredQuotations]);
  const avgDealValue = useMemo(() => calculateAverageDealValue(filteredQuotations), [filteredQuotations]);
  const mrr = useMemo(() => calculateMRR(filteredQuotations), [filteredQuotations]);

  const revenueTrend = useMemo(() => getRevenueTrend(filteredQuotations), [filteredQuotations]);
  const pipelineStages = useMemo(() => getPipelineByStage(filteredQuotations), [filteredQuotations]);
  const dealsByStatus = useMemo(() => getDealsByStatus(filteredQuotations), [filteredQuotations]);
  const repPerformance = useMemo(() => getSalesRepPerformance(filteredQuotations), [filteredQuotations]);
  const dealHealthAnalytics = useMemo(() => getDealHealthAnalytics(filteredQuotations), [filteredQuotations]);
  const approvalAnalytics = useMemo(() => getApprovalAnalytics(approvalRequests), [approvalRequests]);
  const fulfillmentAnalytics = useMemo(() => getFulfillmentAnalytics(fulfillmentOrders), [fulfillmentOrders]);
  const billingAnalytics = useMemo(() => getBillingAnalytics(invoices), [invoices]);
  const productAnalytics = useMemo(() => calculateProductAnalytics(filteredQuotations, PRODUCTS_DATA), [filteredQuotations]);
  const discountAnalytics = useMemo(() => calculateDiscountAnalytics(filteredQuotations), [filteredQuotations]);
  const customerAnalytics = useMemo(() => calculateCustomerAnalytics(filteredQuotations), [filteredQuotations]);

  // Route Safety (Section 21: If user enters /sales/reports/INVALID show Report Not Found)
  if (!reportConfig) {
    return (
      <div className="report-detail-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        <ErrorState
          title="Report Not Found"
          message={`No analytical report could be found for identifier "${targetId}". Please select an available report from the catalog.`}
          backButton={{
            label: '← Back to Reports',
            path: '/sales/reports'
          }}
        />
      </div>
    );
  }

  const handleExportCSV = () => {
    setExportLoading(true);
    setTimeout(() => {
      const headers = ['Record_ID', 'Entity', 'Status', 'Amount_INR', 'Date'];
      const rows = filteredQuotations.map(q => [
        q.id,
        q.accountName || 'Acme Corp',
        q.status,
        q.pricing?.total || 0,
        q.createdAt || '2026-09-01'
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + 
        [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${targetId}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportLoading(false);
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  // Render appropriate content view based on reportId
  const renderReportContent = () => {
    switch (targetId) {
      case 'sales-performance':
        return (
          <SalesAnalyticsTab
            revenue={revenue}
            pipelineValue={pipelineValue}
            confirmedDeals={confirmedDeals}
            conversionRate={conversionRate}
            avgDealValue={avgDealValue}
            mrr={mrr}
            revenueTrend={revenueTrend}
            pipelineStages={pipelineStages}
            dealsByStatus={dealsByStatus}
            repPerformance={repPerformance}
            filteredQuotations={filteredQuotations}
          />
        );
      case 'quotation-analysis':
        return (
          <CustomerAnalyticsTab customerAnalytics={customerAnalytics} />
        );
      case 'discount-analysis':
        return (
          <DiscountAnalyticsTab discountAnalytics={discountAnalytics} />
        );
      case 'product-performance':
        return (
          <ProductAnalyticsTab productAnalytics={productAnalytics} />
        );
      case 'fulfillment-performance':
        return (
          <FulfillmentAnalyticsTab 
            analytics={fulfillmentAnalytics} 
            orders={fulfillmentOrders} 
            warehouses={WAREHOUSES} 
          />
        );
      case 'subscription-revenue':
      case 'invoice-payment':
        return (
          <BillingAnalyticsTab 
            analytics={billingAnalytics} 
            invoices={invoices} 
          />
        );
      case 'deal-health':
        return (
          <DealHealthAnalyticsTab analytics={dealHealthAnalytics} />
        );
      default:
        return (
          <SalesAnalyticsTab
            revenue={revenue}
            pipelineValue={pipelineValue}
            confirmedDeals={confirmedDeals}
            conversionRate={conversionRate}
            avgDealValue={avgDealValue}
            mrr={mrr}
            revenueTrend={revenueTrend}
            pipelineStages={pipelineStages}
            dealsByStatus={dealsByStatus}
            repPerformance={repPerformance}
            filteredQuotations={filteredQuotations}
          />
        );
    }
  };

  return (
    <div className="report-detail-page" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* 1. Page Header */}
      <PageHeader
        title={reportConfig.name}
        subtitle={reportConfig.description}
        badge={
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            backgroundColor: `${reportConfig.color}15`,
            color: reportConfig.color,
            border: `1px solid ${reportConfig.color}40`
          }}>
            {reportConfig.badge}
          </span>
        }
        breadcrumbs={[
          { label: 'Sales', path: '/sales/dashboard' },
          { label: 'Reports', path: '/sales/reports' },
          { label: reportConfig.name, path: `/sales/reports/${reportConfig.id}` }
        ]}
        backButton={{
          label: '← Back to Reports',
          path: '/sales/reports'
        }}
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.9rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              Print / PDF
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exportLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#1e40af',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <Download size={15} />
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        }
      />

      {/* 2. Filter Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Calendar size={16} color="#64748b" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>Period Scope:</span>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {['ALL', 'Q3_2026', 'LAST_30_DAYS', 'YEAR_TO_DATE'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: dateRange === range ? '1px solid #1e40af' : '1px solid #e2e8f0',
                  backgroundColor: dateRange === range ? '#eff6ff' : '#ffffff',
                  color: dateRange === range ? '#1e40af' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {range.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Data Source: <strong>Live JSON Records ({filteredQuotations.length} transactions audited)</strong>
        </div>
      </div>

      {/* 3. Real Report Visualization & Data Tables */}
      <div className="report-content-container">
        {renderReportContent()}
      </div>
    </div>
  );
};
