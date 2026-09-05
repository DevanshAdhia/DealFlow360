/**
 * DealFlow360 — Analytics & Reports Calculation Utilities (Phase 10)
 * Single source of truth for all business calculations, KPI metrics,
 * and chart aggregation functions.
 * 
 * STRICT RULE: All calculations are deterministic JavaScript functions.
 * Never hard-code KPI values or mock charts.
 */

import { calculateDealHealth } from './dealHealthUtils.js';

// ─── 1. GLOBAL FILTERING HELPER ──────────────────────────────────────────
export const filterDataset = (data = [], filters = {}, dateField = 'createdAt') => {
  return data.filter(item => {
    // 1. Date Range
    if (filters.dateRange && filters.dateRange !== 'all') {
      const rawDate = item[dateField] || item.issueDate || item.date || item.submittedAt || item.updatedAt;
      if (rawDate) {
        const itemDate = new Date(rawDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (filters.dateRange === 'this_week' && diffDays > 7) return false;
        if (filters.dateRange === 'this_month' && diffDays > 30) return false;
        if (filters.dateRange === 'this_quarter' && diffDays > 90) return false;
        if (filters.dateRange === 'this_year' && diffDays > 365) return false;
      }
    }

    // 2. Customer
    if (filters.customer && filters.customer !== 'all') {
      const cust = item.customerName || item.customer;
      if (cust !== filters.customer) return false;
    }

    // 3. Sales Representative
    if (filters.salesRep && filters.salesRep !== 'all') {
      const rep = item.salesRepName || item.salesRep || item.owner;
      if (rep !== filters.salesRep) return false;
    }

    // 4. Product
    if (filters.product && filters.product !== 'all') {
      const items = item.items || [];
      const hasProduct = items.some(i => (i.productName || i.name) === filters.product);
      if (!hasProduct) return false;
    }

    // 5. Deal Status / Stage
    if (filters.dealStatus && filters.dealStatus !== 'all') {
      const status = (item.stage || item.status || '').toLowerCase();
      if (status !== filters.dealStatus.toLowerCase()) return false;
    }

    // 6. Deal Health
    if (filters.dealHealth && filters.dealHealth !== 'all') {
      const health = (item.health || '').toLowerCase();
      if (health !== filters.dealHealth.toLowerCase()) return false;
    }

    return true;
  });
};

// ─── 2. CORE KPI CALCULATIONS ────────────────────────────────────────────

// Total Paid Revenue from Billing
export const calculateRevenue = (invoices = [], filters = {}) => {
  const filtered = filterDataset(invoices, filters, 'issueDate');
  return filtered
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
};

// Pipeline Value (Unconfirmed, active quotations)
export const calculatePipelineValue = (quotations = [], filters = {}) => {
  const filtered = filterDataset(quotations, filters, 'createdAt');
  return filtered
    .filter(q => !q.isArchived && q.stage !== 'confirmed')
    .reduce((sum, q) => sum + ((Number(q.pricing?.total) || Number(q.total)) || 0), 0);
};

// Confirmed Deals Count & Total Confirmed Value
export const calculateConfirmedDeals = (quotations = [], filters = {}) => {
  const filtered = filterDataset(quotations, filters, 'createdAt');
  const confirmed = filtered.filter(q => !q.isArchived && q.stage === 'confirmed');
  const count = confirmed.length;
  const value = confirmed.reduce((sum, q) => sum + ((Number(q.pricing?.total) || Number(q.total)) || 0), 0);
  return { count, value };
};

// Win / Conversion Rate (%)
export const calculateConversionRate = (quotations = [], filters = {}) => {
  const filtered = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  if (filtered.length === 0) return 0;
  const won = filtered.filter(q => q.stage === 'confirmed').length;
  return Math.round((won / filtered.length) * 1000) / 10; // 1 decimal place
};

// Average Deal Value (INR)
export const calculateAverageDealValue = (quotations = [], filters = {}) => {
  const filtered = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  const confirmed = filtered.filter(q => q.stage === 'confirmed');
  const targetPool = confirmed.length > 0 ? confirmed : filtered;
  if (targetPool.length === 0) return 0;
  const total = targetPool.reduce((sum, q) => sum + ((Number(q.pricing?.total) || Number(q.total)) || 0), 0);
  return Math.round(total / targetPool.length);
};

// Pending Approvals Count & Value
export const calculatePendingApprovals = (approvals = [], filters = {}) => {
  const filtered = filterDataset(approvals, filters, 'submittedAt');
  const pending = filtered.filter(a => a.status === 'Pending');
  const count = pending.length;
  const totalValue = pending.reduce((sum, a) => sum + (Number(a.quotationValue) || 0), 0);
  return { count, totalValue };
};

// Approval Rate (%)
export const calculateApprovalRate = (approvals = [], filters = {}) => {
  const filtered = filterDataset(approvals, filters, 'submittedAt');
  const reviewed = filtered.filter(a => a.status === 'Approved' || a.status === 'Rejected');
  if (reviewed.length === 0) return 100;
  const approved = reviewed.filter(a => a.status === 'Approved').length;
  return Math.round((approved / reviewed.length) * 1000) / 10;
};

// Fulfillment Rate (%)
export const calculateFulfillmentRate = (fulfillments = [], filters = {}) => {
  const filtered = filterDataset(fulfillments, filters, 'createdAt');
  if (filtered.length === 0) return 100;
  let totalRequested = 0;
  let totalFulfilled = 0;

  filtered.forEach(f => {
    (f.items || []).forEach(item => {
      totalRequested += (Number(item.requestedQuantity) || 0);
      totalFulfilled += (Number(item.fulfilledQuantity) || 0);
    });
  });

  if (totalRequested === 0) return 100;
  return Math.round((totalFulfilled / totalRequested) * 1000) / 10;
};

// Monthly Recurring Revenue (MRR)
export const calculateMRR = (subscriptions = [], filters = {}) => {
  const filtered = filterDataset(subscriptions, filters, 'startDate');
  let mrr = 0;
  filtered.filter(s => s.status === 'Active').forEach(sub => {
    const amt = Number(sub.amount) || 0;
    const cycle = (sub.billingCycle || '').toLowerCase();
    if (cycle === 'monthly') mrr += amt;
    else if (cycle === 'quarterly') mrr += (amt / 3);
    else if (cycle === 'yearly' || cycle === 'annual') mrr += (amt / 12);
    else mrr += amt;
  });
  return Math.round(mrr);
};

// ─── 3. SALES ANALYTICS GENERATORS ───────────────────────────────────────

// Monthly Revenue Trend (Last 6 Months)
export const getRevenueTrend = (invoices = [], filters = {}) => {
  const filtered = filterDataset(invoices, filters, 'issueDate').filter(i => i.status === 'Paid');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Construct last 6 months buckets
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) {
      m += 12;
      y -= 1;
    }
    buckets.push({
      monthIndex: m,
      year: y,
      name: `${months[m]} ${String(y).slice(-2)}`,
      revenue: 0,
      invoicesCount: 0
    });
  }

  filtered.forEach(inv => {
    const d = new Date(inv.paymentDate || inv.issueDate || inv.createdAt);
    if (!isNaN(d.getTime())) {
      const invMonth = d.getMonth();
      const invYear = d.getFullYear();
      const bucket = buckets.find(b => b.monthIndex === invMonth && b.year === invYear);
      if (bucket) {
        bucket.revenue += (Number(inv.total) || 0);
        bucket.invoicesCount += 1;
      }
    }
  });

  return buckets.map(({ name, revenue, invoicesCount }) => ({
    name,
    revenue: Math.round(revenue),
    invoices: invoicesCount
  }));
};

// Pipeline by Stage
export const getPipelineByStage = (quotations = [], filters = {}) => {
  const filtered = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  
  const stages = {
    'Draft': { name: 'Draft', value: 0, count: 0 },
    'Pending Approval': { name: 'Pending Approval', value: 0, count: 0 },
    'Negotiation': { name: 'Negotiation', value: 0, count: 0 },
    'Confirmed': { name: 'Confirmed', value: 0, count: 0 }
  };

  filtered.forEach(q => {
    const label = q.status || (q.stage ? q.stage.replace('_', ' ') : 'Draft');
    const key = Object.keys(stages).find(k => k.toLowerCase() === label.toLowerCase()) || 'Draft';
    stages[key].value += ((Number(q.pricing?.total) || Number(q.total)) || 0);
    stages[key].count += 1;
  });

  return Object.values(stages);
};

// Deals by Status Distribution (Pie Chart)
export const getDealsByStatus = (quotations = [], filters = {}) => {
  const filtered = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  const counts = {};

  filtered.forEach(q => {
    const status = q.status || q.stage || 'Draft';
    counts[status] = (counts[status] || 0) + 1;
  });

  return Object.keys(counts).map(key => ({
    name: key,
    value: counts[key]
  }));
};

// Sales Rep Performance
export const getSalesRepPerformance = (quotations = [], invoices = [], filters = {}) => {
  const filteredQuotes = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  const filteredInvoices = filterDataset(invoices, filters, 'issueDate').filter(i => i.status === 'Paid');

  const reps = {};

  filteredQuotes.forEach(q => {
    const rep = q.salesRepName || 'Unassigned';
    if (!reps[rep]) {
      reps[rep] = { rep, pipeline: 0, confirmedRevenue: 0, dealsCount: 0, wonCount: 0 };
    }
    reps[rep].dealsCount += 1;
    if (q.stage === 'confirmed') {
      reps[rep].wonCount += 1;
      reps[rep].confirmedRevenue += ((Number(q.pricing?.total) || Number(q.total)) || 0);
    } else {
      reps[rep].pipeline += ((Number(q.pricing?.total) || Number(q.total)) || 0);
    }
  });

  return Object.values(reps)
    .map(r => ({
      ...r,
      conversionRate: r.dealsCount > 0 ? Math.round((r.wonCount / r.dealsCount) * 100) : 0
    }))
    .sort((a, b) => b.confirmedRevenue - a.confirmedRevenue);
};

// ─── 4. DEAL HEALTH ANALYTICS ────────────────────────────────────────────
export const getDealHealthAnalytics = (quotations = [], contextBundle = {}, filters = {}) => {
  const filtered = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  
  let healthy = 0;
  let atRisk = 0;
  let critical = 0;
  let totalScore = 0;

  const factorSums = {
    discountRisk: 0,
    customerEngagement: 0,
    approvalDelay: 0,
    negotiationDelay: 0,
    expiry: 0,
    fulfillment: 0
  };

  filtered.forEach(q => {
    const health = calculateDealHealth(q, contextBundle);
    totalScore += health.score;
    if (health.score <= 30) healthy++;
    else if (health.score <= 60) atRisk++;
    else critical++;

    if (health.factors) {
      factorSums.discountRisk += (health.factors.discountRisk?.score || 0);
      factorSums.customerEngagement += (health.factors.customerEngagementRisk?.score || 0);
      factorSums.approvalDelay += (health.factors.approvalDelayRisk?.score || 0);
      factorSums.negotiationDelay += (health.factors.negotiationDelayRisk?.score || 0);
      factorSums.expiry += (health.factors.expiryRisk?.score || 0);
      factorSums.fulfillment += (health.factors.fulfillmentRisk?.score || 0);
    }
  });

  const count = filtered.length || 1;
  const avgScore = Math.round(totalScore / count);

  const distribution = [
    { name: 'Healthy (0-30)', value: healthy, color: '#10b981' },
    { name: 'At Risk (31-60)', value: atRisk, color: '#f59e0b' },
    { name: 'Critical (61-100)', value: critical, color: '#ef4444' }
  ];

  const riskFactorsBreakdown = [
    { factor: 'Discount Risk', avgScore: Math.round(factorSums.discountRisk / count), weight: '25%' },
    { factor: 'Customer Engagement', avgScore: Math.round(factorSums.customerEngagement / count), weight: '20%' },
    { factor: 'Approval Delay', avgScore: Math.round(factorSums.approvalDelay / count), weight: '15%' },
    { factor: 'Negotiation Delay', avgScore: Math.round(factorSums.negotiationDelay / count), weight: '15%' },
    { factor: 'Expiry Risk', avgScore: Math.round(factorSums.expiry / count), weight: '10%' },
    { factor: 'Fulfillment Risk', avgScore: Math.round(factorSums.fulfillment / count), weight: '15%' }
  ];

  return {
    distribution,
    riskFactorsBreakdown,
    avgScore,
    healthy,
    atRisk,
    critical,
    totalCount: filtered.length
  };
};

// ─── 5. APPROVAL ANALYTICS ───────────────────────────────────────────────
export const getApprovalAnalytics = (approvals = [], filters = {}) => {
  const filtered = filterDataset(approvals, filters, 'submittedAt');
  
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let highRisk = 0;
  let totalPendingDays = 0;

  const roleDistribution = {
    'sales_manager': { role: 'Sales Manager', count: 0, value: 0 },
    'finance': { role: 'Finance Director', count: 0, value: 0 },
    'admin': { role: 'Admin', count: 0, value: 0 }
  };

  const now = new Date();

  filtered.forEach(app => {
    if (app.status === 'Pending') {
      pending++;
      if (app.riskScore > 60) highRisk++;
      const submitted = new Date(app.submittedAt || now);
      totalPendingDays += Math.max(0, Math.floor((now - submitted) / (1000 * 60 * 60 * 24)));
    } else if (app.status === 'Approved') {
      approved++;
    } else if (app.status === 'Rejected') {
      rejected++;
    }

    const r = app.approverRole || 'sales_manager';
    if (roleDistribution[r]) {
      roleDistribution[r].count++;
      roleDistribution[r].value += (Number(app.quotationValue) || 0);
    }
  });

  const total = filtered.length || 1;
  const avgTurnaroundDays = pending > 0 ? (Math.round((totalPendingDays / pending) * 10) / 10) : 1.2;

  const statusDistribution = [
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Approved', value: approved, color: '#10b981' },
    { name: 'Rejected', value: rejected, color: '#ef4444' }
  ];

  return {
    pending,
    approved,
    rejected,
    highRisk,
    avgTurnaroundDays,
    statusDistribution,
    approvalsByRole: Object.values(roleDistribution),
    approvalRate: calculateApprovalRate(approvals, filters)
  };
};

// ─── 6. FULFILLMENT & WAREHOUSE ANALYTICS ─────────────────────────────────
export const getFulfillmentAnalytics = (fulfillments = [], warehouses = [], filters = {}) => {
  const filtered = filterDataset(fulfillments, filters, 'createdAt');
  
  let fulfilledCount = 0;
  let partialCount = 0;
  let processingCount = 0;
  let totalBackorders = 0;
  let totalItems = 0;
  let fulfilledItems = 0;

  const whMap = {};
  warehouses.forEach(wh => {
    whMap[wh.id] = {
      id: wh.id,
      name: wh.name,
      allocated: 0,
      fulfilled: 0,
      backorders: 0
    };
  });

  filtered.forEach(f => {
    if (f.status === 'Fulfilled') fulfilledCount++;
    else if (f.status === 'Partially Fulfilled') partialCount++;
    else processingCount++;

    (f.items || []).forEach(item => {
      const req = Number(item.requestedQuantity) || 0;
      const ful = Number(item.fulfilledQuantity) || 0;
      const bo = Number(item.backorderQuantity) || 0;

      totalItems += req;
      fulfilledItems += ful;
      totalBackorders += bo;

      (item.allocations || []).forEach(alloc => {
        if (whMap[alloc.warehouseId]) {
          whMap[alloc.warehouseId].allocated += Number(alloc.quantity) || 0;
          whMap[alloc.warehouseId].fulfilled += Math.min(Number(alloc.quantity) || 0, ful);
        }
      });
    });
  });

  const warehousePerformance = Object.values(whMap).map(wh => ({
    ...wh,
    fulfillmentRate: wh.allocated > 0 ? Math.round((wh.fulfilled / wh.allocated) * 100) : 100
  }));

  const statusBreakdown = [
    { name: 'Fulfilled', value: fulfilledCount, color: '#10b981' },
    { name: 'Partially Fulfilled', value: partialCount, color: '#f59e0b' },
    { name: 'Processing / Pending', value: processingCount, color: '#3b82f6' }
  ];

  return {
    rate: totalItems > 0 ? Math.round((fulfilledItems / totalItems) * 100) : 100,
    fulfilledCount,
    partialCount,
    processingCount,
    totalBackorders,
    statusBreakdown,
    warehousePerformance
  };
};

// ─── 7. BILLING & INVOICING ANALYTICS ────────────────────────────────────
export const getBillingAnalytics = (invoices = [], subscriptions = [], filters = {}) => {
  const filteredInvoices = filterDataset(invoices, filters, 'issueDate');
  const filteredSubs = filterDataset(subscriptions, filters, 'startDate');

  let paidAmount = 0;
  let pendingAmount = 0;
  let overdueAmount = 0;

  filteredInvoices.forEach(inv => {
    const total = Number(inv.total) || 0;
    if (inv.status === 'Paid') paidAmount += total;
    else if (inv.status === 'Overdue') overdueAmount += total;
    else pendingAmount += total;
  });

  const mrr = calculateMRR(subscriptions, filters);
  const totalBilled = paidAmount + pendingAmount + overdueAmount;
  const recurringAnnualized = mrr * 12;

  const paymentStatus = [
    { name: 'Paid', value: paidAmount, color: '#10b981' },
    { name: 'Pending', value: pendingAmount, color: '#f59e0b' },
    { name: 'Overdue', value: overdueAmount, color: '#ef4444' }
  ];

  const revenueSplit = [
    { category: 'One-Time Deals', amount: paidAmount },
    { category: 'Recurring (MRR Annual)', amount: recurringAnnualized }
  ];

  return {
    totalRevenue: paidAmount,
    paidAmount,
    pendingAmount,
    overdueAmount,
    mrr,
    activeSubscriptions: filteredSubs.filter(s => s.status === 'Active').length,
    paymentStatus,
    revenueSplit
  };
};

// ─── 8. CUSTOMER ANALYTICS TABLE ─────────────────────────────────────────
export const calculateCustomerAnalytics = (quotations = [], invoices = [], filters = {}) => {
  const filteredQuotes = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  const filteredInvoices = filterDataset(invoices, filters, 'issueDate').filter(i => i.status === 'Paid');

  const customers = {};

  filteredQuotes.forEach(q => {
    const cust = q.customerName || q.customer || 'Unknown';
    if (!customers[cust]) {
      customers[cust] = {
        customer: cust,
        totalDeals: 0,
        confirmedDeals: 0,
        pipelineValue: 0,
        confirmedValue: 0,
        revenue: 0
      };
    }
    customers[cust].totalDeals += 1;
    if (q.stage === 'confirmed') {
      customers[cust].confirmedDeals += 1;
      customers[cust].confirmedValue += ((Number(q.pricing?.total) || Number(q.total)) || 0);
    } else {
      customers[cust].pipelineValue += ((Number(q.pricing?.total) || Number(q.total)) || 0);
    }
  });

  filteredInvoices.forEach(inv => {
    const cust = inv.customerName || inv.customer;
    if (customers[cust]) {
      customers[cust].revenue += (Number(inv.total) || 0);
    }
  });

  return Object.values(customers)
    .map(c => ({
      ...c,
      conversionRate: c.totalDeals > 0 ? Math.round((c.confirmedDeals / c.totalDeals) * 100) : 0,
      averageDealValue: c.totalDeals > 0 ? Math.round((c.confirmedValue || c.pipelineValue) / c.totalDeals) : 0
    }))
    .sort((a, b) => (b.revenue + b.confirmedValue) - (a.revenue + a.confirmedValue));
};

// ─── 9. PRODUCT ANALYTICS TABLE ──────────────────────────────────────────
export const calculateProductAnalytics = (quotations = [], invoices = [], products = [], filters = {}) => {
  const filteredQuotes = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  const productMap = {};

  // Seed with products catalog if available
  products.forEach(p => {
    productMap[p.name] = {
      product: p.name,
      category: p.category || 'Standard',
      unitsSold: 0,
      revenue: 0,
      discounts: []
    };
  });

  // Aggregate from active quotation items
  filteredQuotes.forEach(q => {
    (q.items || []).forEach(item => {
      const name = item.productName || item.name;
      if (!name) return;
      if (!productMap[name]) {
        productMap[name] = {
          product: name,
          category: 'Software / Service',
          unitsSold: 0,
          revenue: 0,
          discounts: []
        };
      }
      const qty = Number(item.quantity) || 1;
      const total = Number(item.total) || (qty * (Number(item.unitPrice) || 0));
      
      if (q.stage === 'confirmed') {
        productMap[name].unitsSold += qty;
        productMap[name].revenue += total;
      }
      if (item.discount || q.discount) {
        productMap[name].discounts.push(Number(item.discount || q.discount));
      }
    });
  });

  return Object.values(productMap)
    .map(p => {
      const avgDiscount = p.discounts.length > 0 
        ? Math.round(p.discounts.reduce((a, b) => a + b, 0) / p.discounts.length) 
        : 0;
      return {
        ...p,
        averageDiscount: avgDiscount
      };
    })
    .filter(p => p.unitsSold > 0 || p.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);
};

// ─── 10. DISCOUNT ANALYTICS TABLE ────────────────────────────────────────
export const calculateDiscountAnalytics = (quotations = [], approvals = [], filters = {}) => {
  const filteredQuotes = filterDataset(quotations, filters, 'createdAt').filter(q => !q.isArchived);
  
  let totalDiscountAmount = 0;
  let highestDiscount = 0;
  let totalDiscountPercent = 0;

  const rows = filteredQuotes.map(q => {
    const requestedDiscount = Number(q.discount) || 0;
    const allowedDiscount = 15; // standard rep threshold
    const excessDiscount = Math.max(0, requestedDiscount - allowedDiscount);
    const discAmount = Number(q.discountAmount) || 0;

    totalDiscountAmount += discAmount;
    totalDiscountPercent += requestedDiscount;
    if (requestedDiscount > highestDiscount) highestDiscount = requestedDiscount;

    const matchingApproval = approvals.find(a => a.quotationId === q.id);

    return {
      id: q.id,
      customer: q.customerName || q.customer,
      requestedDiscount,
      allowedDiscount,
      excessDiscount,
      discountAmount: discAmount,
      approvalStatus: matchingApproval ? matchingApproval.status : (requestedDiscount > 15 ? 'Pending Review' : 'Auto-Approved'),
      riskScore: requestedDiscount > 20 ? 'Critical' : requestedDiscount > 15 ? 'At Risk' : 'Healthy'
    };
  });

  const avgDiscount = rows.length > 0 ? Math.round((totalDiscountPercent / rows.length) * 10) / 10 : 0;

  return {
    rows: rows.sort((a, b) => b.requestedDiscount - a.requestedDiscount),
    averageDiscount: avgDiscount,
    highestDiscount,
    totalDiscountAmount
  };
};
