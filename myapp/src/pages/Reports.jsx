import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity, 
  CheckCircle2, 
  Package, 
  Download, 
  Printer, 
  Users, 
  ShoppingBag, 
  Percent, 
  ShieldCheck, 
  Layers, 
  CreditCard,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useQuotations } from '../context/QuotationContext.jsx';
import { useApprovals } from '../context/ApprovalContext.jsx';
import { useFulfillment } from '../context/FulfillmentContext.jsx';
import { useBilling } from '../context/BillingContext.jsx';
import { formatINR } from '../utils/formatters.js';

// Analytics & Reports Calculators
import {
  calculateRevenue,
  calculatePipelineValue,
  calculateConfirmedDeals,
  calculateConversionRate,
  calculateAverageDealValue,
  calculatePendingApprovals,
  calculateFulfillmentRate,
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

// Reusable Components
import { AnalyticsKPICard } from '../components/analytics/AnalyticsKPICard.jsx';
import { ReportFilters } from '../components/analytics/ReportFilters.jsx';
import { SalesAnalyticsTab } from '../components/analytics/SalesAnalyticsTab.jsx';
import { DealHealthAnalyticsTab } from '../components/analytics/DealHealthAnalyticsTab.jsx';
import { ApprovalAnalyticsTab } from '../components/analytics/ApprovalAnalyticsTab.jsx';
import { FulfillmentAnalyticsTab } from '../components/analytics/FulfillmentAnalyticsTab.jsx';
import { BillingAnalyticsTab } from '../components/analytics/BillingAnalyticsTab.jsx';
import { CustomerAnalyticsTab } from '../components/analytics/CustomerAnalyticsTab.jsx';
import { ProductAnalyticsTab } from '../components/analytics/ProductAnalyticsTab.jsx';
import { DiscountAnalyticsTab } from '../components/analytics/DiscountAnalyticsTab.jsx';

export const Reports = () => {
  const { quotations } = useQuotations();
  const { approvals } = useApprovals();
  const { fulfillments, inventory } = useFulfillment();
  const { invoices, subscriptions } = useBilling();

  // Active Report Tab State
  const [activeTab, setActiveTab] = useState('sales'); // sales, customer, product, operational, financial, deal_health, discount

  // Global Filter State
  const [filters, setFilters] = useState({
    dateRange: 'all',
    customer: 'all',
    salesRep: 'all',
    product: 'all',
    dealStatus: 'all',
    dealHealth: 'all'
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'all',
      customer: 'all',
      salesRep: 'all',
      product: 'all',
      dealStatus: 'all',
      dealHealth: 'all'
    });
  };

  // Filter option lists derived from active datasets
  const customerOptions = useMemo(() => {
    const set = new Set(quotations.map(q => q.customerName || q.customer).filter(Boolean));
    return Array.from(set);
  }, [quotations]);

  const salesRepOptions = useMemo(() => {
    const set = new Set(quotations.map(q => q.salesRepName || q.salesRep).filter(Boolean));
    return Array.from(set);
  }, [quotations]);

  const productOptions = useMemo(() => {
    const set = new Set(PRODUCTS_DATA.map(p => p.name));
    return Array.from(set);
  }, []);

  // Context bundle for Deal Health engine
  const contextBundle = useMemo(() => ({
    approvals: approvals || [],
    fulfillments: fulfillments || [],
    inventory: inventory || []
  }), [approvals, fulfillments, inventory]);

  // ─── DYNAMIC 9 MASTER KPIS (Zero hardcoding) ──────────────────────
  const kpis = useMemo(() => {
    const totalRev = calculateRevenue(invoices, filters);
    const pipeVal = calculatePipelineValue(quotations, filters);
    const confirmed = calculateConfirmedDeals(quotations, filters);
    const convRate = calculateConversionRate(quotations, filters);
    const avgDeal = calculateAverageDealValue(quotations, filters);
    const pendingApp = calculatePendingApprovals(approvals, filters);
    const fulfillRate = calculateFulfillmentRate(fulfillments, filters);
    const activeSubs = subscriptions.filter(s => s.status === 'Active').length;
    const mrr = calculateMRR(subscriptions, filters);

    return {
      totalRev,
      pipeVal,
      confirmedCount: confirmed.count,
      confirmedVal: confirmed.value,
      convRate,
      avgDeal,
      pendingAppCount: pendingApp.count,
      fulfillRate,
      activeSubs,
      mrr
    };
  }, [quotations, invoices, approvals, fulfillments, subscriptions, filters]);

  // ─── TAB-SPECIFIC ANALYTICS DATASETS ──────────────────────────────
  const salesAnalytics = useMemo(() => ({
    revenueTrend: getRevenueTrend(invoices, filters),
    pipelineByStage: getPipelineByStage(quotations, filters),
    dealsByStatus: getDealsByStatus(quotations, filters),
    salesRepPerformance: getSalesRepPerformance(quotations, invoices, filters)
  }), [quotations, invoices, filters]);

  const dealHealthAnalytics = useMemo(() => {
    return getDealHealthAnalytics(quotations, contextBundle, filters);
  }, [quotations, contextBundle, filters]);

  const approvalAnalytics = useMemo(() => {
    return getApprovalAnalytics(approvals, filters);
  }, [approvals, filters]);

  const fulfillmentAnalytics = useMemo(() => {
    return getFulfillmentAnalytics(fulfillments, WAREHOUSES, filters);
  }, [fulfillments, filters]);

  const billingAnalytics = useMemo(() => {
    return getBillingAnalytics(invoices, subscriptions, filters);
  }, [invoices, subscriptions, filters]);

  const customerAnalytics = useMemo(() => {
    return calculateCustomerAnalytics(quotations, invoices, filters);
  }, [quotations, invoices, filters]);

  const productAnalytics = useMemo(() => {
    return calculateProductAnalytics(quotations, invoices, PRODUCTS_DATA, filters);
  }, [quotations, invoices, filters]);

  const discountAnalytics = useMemo(() => {
    return calculateDiscountAnalytics(quotations, approvals, filters);
  }, [quotations, approvals, filters]);

  // ─── CSV EXPORT OF FILTERED REPORT ────────────────────────────────
  const handleExportCSV = () => {
    const rows = [
      ['DealFlow360 Executive Analytics Report'],
      ['Generated At', new Date().toLocaleString()],
      ['Applied Filters', JSON.stringify(filters)],
      [],
      ['MASTER METRICS', 'CALCULATED VALUE'],
      ['Total Paid Revenue', formatINR(kpis.totalRev)],
      ['Pipeline Value', formatINR(kpis.pipeVal)],
      ['Confirmed Deals Count', kpis.confirmedCount],
      ['Conversion Rate (%)', `${kpis.convRate}%`],
      ['Average Deal Value', formatINR(kpis.avgDeal)],
      ['Pending Approvals Count', kpis.pendingAppCount],
      ['Fulfillment Rate (%)', `${kpis.fulfillRate}%`],
      ['Active Subscriptions', kpis.activeSubs],
      ['Monthly Recurring Revenue (MRR)', formatINR(kpis.mrr)],
      [],
      ['TOP CUSTOMERS IN FILTERED POOL'],
      ['Customer', 'Total Deals', 'Pipeline Value', 'Confirmed Value', 'Paid Revenue', 'Win Rate']
    ];

    customerAnalytics.forEach(c => {
      rows.push([
        c.customer,
        c.totalDeals,
        c.pipelineValue,
        c.confirmedValue,
        c.revenue,
        `${c.conversionRate}%`
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dealflow360_analytics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-container">
      {/* 1. Header & Quick Export Actions */}
      <div className="reports-header">
        <div className="reports-title">
          <h1>
            <BarChart3 size={28} color="var(--primary-500)" />
            Reports & Business Intelligence
          </h1>
          <p>
            Real-time, cross-functional performance analytics across the entire DealFlow360 sales lifecycle.
          </p>
        </div>

        <div className="reports-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => window.print()}
            title="Print executive report summary"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleExportCSV}
            title="Export currently filtered analytics dataset as CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Global Multi-Criteria Filter Bar */}
      <ReportFilters 
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        customerOptions={customerOptions}
        salesRepOptions={salesRepOptions}
        productOptions={productOptions}
      />

      {/* 3. Master 9 KPI Summary Cards */}
      <div className="reports-kpi-grid">
        <AnalyticsKPICard 
          title="Total Revenue"
          value={formatINR(kpis.totalRev)}
          subtitle="Realized cash from paid invoices"
          icon={DollarSign}
          color="#10b981"
          bg="rgba(16, 185, 129, 0.12)"
        />
        <AnalyticsKPICard 
          title="Pipeline Value"
          value={formatINR(kpis.pipeVal)}
          subtitle="Unconfirmed active proposals"
          icon={TrendingUp}
          color="#3b82f6"
          bg="rgba(59, 130, 246, 0.12)"
        />
        <AnalyticsKPICard 
          title="Confirmed Deals"
          value={kpis.confirmedCount}
          subtitle={`Total value: ${formatINR(kpis.confirmedVal)}`}
          icon={CheckCircle2}
          color="#8b5cf6"
          bg="rgba(139, 92, 246, 0.12)"
        />
        <AnalyticsKPICard 
          title="Conversion Rate"
          value={`${kpis.convRate}%`}
          subtitle="Proposals won vs total created"
          icon={Target}
          color="#f59e0b"
          bg="rgba(245, 158, 11, 0.12)"
        />
        <AnalyticsKPICard 
          title="Avg Deal Value"
          value={formatINR(kpis.avgDeal)}
          subtitle="Average contract size"
          icon={Activity}
          color="#06b6d4"
          bg="rgba(6, 182, 212, 0.12)"
        />
        <AnalyticsKPICard 
          title="Pending Approvals"
          value={kpis.pendingAppCount}
          subtitle="Awaiting manager or finance sign-off"
          icon={Clock}
          color="#ef4444"
          bg="rgba(239, 68, 68, 0.12)"
        />
        <AnalyticsKPICard 
          title="Fulfillment Rate"
          value={`${kpis.fulfillRate}%`}
          subtitle="Order items dispatched without backorder"
          icon={Package}
          color="#10b981"
          bg="rgba(16, 185, 129, 0.12)"
        />
        <AnalyticsKPICard 
          title="Active Subscriptions"
          value={kpis.activeSubs}
          subtitle="Recurring SaaS & license accounts"
          icon={RefreshCw}
          color="#8b5cf6"
          bg="rgba(139, 92, 246, 0.12)"
        />
        <AnalyticsKPICard 
          title="Monthly Recurring (MRR)"
          value={formatINR(kpis.mrr)}
          subtitle="Predictable recurring baseline"
          icon={CreditCard}
          color="#3b82f6"
          bg="rgba(59, 130, 246, 0.12)"
        />
      </div>

      {/* 4. Report Domain Tabs */}
      <div className="reports-tabs-nav">
        <button 
          className={`reports-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <TrendingUp size={16} />
          <span>Sales Report</span>
        </button>

        <button 
          className={`reports-tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveTab('customer')}
        >
          <Users size={16} />
          <span>Customer Report</span>
        </button>

        <button 
          className={`reports-tab-btn ${activeTab === 'product' ? 'active' : ''}`}
          onClick={() => setActiveTab('product')}
        >
          <ShoppingBag size={16} />
          <span>Product Report</span>
        </button>

        <button 
          className={`reports-tab-btn ${activeTab === 'deal_health' ? 'active' : ''}`}
          onClick={() => setActiveTab('deal_health')}
        >
          <ShieldCheck size={16} />
          <span>Deal Health Report</span>
        </button>

        <button 
          className={`reports-tab-btn ${activeTab === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveTab('financial')}
        >
          <DollarSign size={16} />
          <span>Financial Report</span>
        </button>

        <button 
          className={`reports-tab-btn ${activeTab === 'operational' ? 'active' : ''}`}
          onClick={() => setActiveTab('operational')}
        >
          <Package size={16} />
          <span>Operational Report</span>
        </button>

        <button 
          className={`reports-tab-btn ${activeTab === 'discount' ? 'active' : ''}`}
          onClick={() => setActiveTab('discount')}
        >
          <Percent size={16} />
          <span>Discount Governance</span>
        </button>
      </div>

      {/* 5. Active Tab Contents */}
      <div>
        {activeTab === 'sales' && (
          <SalesAnalyticsTab 
            revenueTrend={salesAnalytics.revenueTrend}
            pipelineByStage={salesAnalytics.pipelineByStage}
            dealsByStatus={salesAnalytics.dealsByStatus}
            salesRepPerformance={salesAnalytics.salesRepPerformance}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerAnalyticsTab customers={customerAnalytics} />
        )}

        {activeTab === 'product' && (
          <ProductAnalyticsTab products={productAnalytics} />
        )}

        {activeTab === 'deal_health' && (
          <DealHealthAnalyticsTab dealHealthAnalytics={dealHealthAnalytics} />
        )}

        {activeTab === 'financial' && (
          <BillingAnalyticsTab billingAnalytics={billingAnalytics} />
        )}

        {activeTab === 'operational' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <FulfillmentAnalyticsTab fulfillmentAnalytics={fulfillmentAnalytics} />
            <ApprovalAnalyticsTab approvalAnalytics={approvalAnalytics} />
          </div>
        )}

        {activeTab === 'discount' && (
          <DiscountAnalyticsTab discountAnalytics={discountAnalytics} />
        )}
      </div>
    </div>
  );
};
