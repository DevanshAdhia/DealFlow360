// DealFlow360 — Dashboard Mock Datasets for Phase 2: Sales Rep Workspace (INR)

export const BASE_STATS = {
  activeDeals: {
    title: 'Active Deals',
    value: 18,
    unit: 'Deals',
    change: '+3 this week',
    trend: 'up',
    trendValue: '+20%',
    statusText: 'In active negotiation or proposal stage',
    color: 'var(--primary-500)'
  },
  pipelineValue: {
    title: 'Pipeline Value',
    value: 14205000,
    prefix: '₹',
    formatted: '₹1.42 Cr',
    change: '+14.2% vs target',
    trend: 'up',
    trendValue: '+14.2%',
    statusText: 'Target: ₹1.25 Cr for Q3',
    color: 'var(--color-success)'
  },
  pendingApprovals: {
    title: 'Pending Approvals',
    value: 3,
    unit: 'Quotes',
    change: '2 VP / 1 Finance',
    trend: 'neutral',
    trendValue: 'Avg 2h turnaround',
    statusText: 'Highest discount: 22% (Q-1041)',
    color: 'var(--color-warning)'
  },
  wonDeals: {
    title: 'Won Deals (QTD)',
    value: 24,
    unit: 'Closed',
    change: '+18% MoM',
    trend: 'up',
    trendValue: '+18%',
    statusText: '₹68.2L total closed value',
    color: 'var(--accent-teal)'
  },
  dealHealth: {
    title: 'Deal Health',
    value: 88,
    suffix: '%',
    formatted: '88%',
    change: '14 Healthy / 4 Flagged',
    trend: 'neutral',
    trendValue: 'Risk Index: 12',
    statusText: '2 At Risk, 1 Critical',
    color: 'var(--accent-purple)'
  },
  monthlyRevenue: {
    title: 'Monthly Revenue',
    value: 3854000,
    prefix: '₹',
    formatted: '₹38.5L',
    change: '108% Quota Attainment',
    trend: 'up',
    trendValue: '+8% vs Quota',
    statusText: 'Quota: ₹35,50,000 / month',
    color: 'var(--primary-600)'
  }
};

export const PIPELINE_STAGES = [
  {
    id: 'draft',
    name: 'Draft',
    count: 4,
    value: 1450000,
    formattedValue: '₹14.5L',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.15)',
    border: 'rgba(100, 116, 139, 0.3)',
    percentage: 10,
    description: 'Initial quotation configuration & line item scoping'
  },
  {
    id: 'pending_approval',
    name: 'Pending Approval',
    count: 3,
    value: 2100000,
    formattedValue: '₹21.0L',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.3)',
    percentage: 15,
    description: 'Awaiting Discount or Margin Matrix sign-off'
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    count: 6,
    value: 6405000,
    formattedValue: '₹64.05L',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
    percentage: 45,
    description: 'Customer reviewing terms, pricing redlines, or SLA tiers'
  },
  {
    id: 'confirmed',
    name: 'Confirmed',
    count: 5,
    value: 4250000,
    formattedValue: '₹42.5L',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)',
    percentage: 30,
    description: 'Agreed contracts pending final signature & fulfillment routing'
  }
];

export const DEAL_HEALTH_BREAKDOWN = {
  overallScore: 88,
  healthyCount: 14,
  atRiskCount: 3,
  criticalCount: 1,
  flaggedDeals: [
    {
      id: 'Q-1041',
      customer: 'NovaTech Systems',
      amount: 1334580,
      riskLevel: 'At Risk',
      riskScore: 78,
      riskFactors: ['High discount requested (22%)', 'Exceeds rep limit (15%)', 'Awaiting VP approval'],
      mitigation: 'Adjust line item support tier to maintain margin above 30%',
      stage: 'Pending Approval',
      assignedTo: 'Alex Morgan'
    },
    {
      id: 'Q-1038',
      customer: 'Vanguard Logistics',
      amount: 5321800,
      riskLevel: 'Critical',
      riskScore: 85,
      riskFactors: ['Competitor price pressure', 'Stalled negotiation (>14 days)', 'Mumbai hub stock bottleneck'],
      mitigation: 'Split warehouse shipment and propose 2-year extended contract incentive',
      stage: 'Negotiation',
      assignedTo: 'Alex Morgan'
    },
    {
      id: 'Q-1045',
      customer: 'SolarGrid Energy',
      amount: 4200000,
      riskLevel: 'At Risk',
      riskScore: 68,
      riskFactors: ['Margin compression (<24%)', 'Custom SLA redlines'],
      mitigation: 'Bundle standard maintenance package to restore 32% margin',
      stage: 'Draft',
      assignedTo: 'Alex Morgan'
    }
  ]
};

export const RECENT_QUOTATIONS = [
  {
    id: 'Q-1042',
    customer: 'Acme Corp',
    contactPerson: 'Sarah Connor',
    contactEmail: 's.connor@acmecorp.com',
    amount: 1997504,
    stage: 'Negotiation',
    stageKey: 'negotiation',
    health: 'Healthy',
    healthKey: 'healthy',
    riskScore: 15,
    discount: 8,
    margin: 36.4,
    date: '2026-09-04',
    timeAgo: '3 hours ago',
    validUntil: '2026-09-25',
    timePeriod: 'this_week',
    items: [
      { name: 'Cloud DealFlow Enterprise — 50 Seats', quantity: 50, unitPrice: 3200, total: 1600000 },
      { name: '24/7 Dedicated SLA Tier', quantity: 1, unitPrice: 240000, total: 240000 }
    ],
    notes: 'Customer requested minor discount on multi-year contract renewal. Terms looking positive.'
  },
  {
    id: 'Q-1041',
    customer: 'NovaTech Systems',
    contactPerson: 'Michael Chang',
    contactEmail: 'm.chang@novatech.io',
    amount: 1334580,
    stage: 'Pending Approval',
    stageKey: 'pending_approval',
    health: 'At Risk',
    healthKey: 'at_risk',
    riskScore: 78,
    discount: 22,
    margin: 26.8,
    date: '2026-09-04',
    timeAgo: '5 hours ago',
    validUntil: '2026-09-18',
    timePeriod: 'this_week',
    items: [
      { name: 'Security Gateway Appliance Pro', quantity: 2, unitPrice: 185000, total: 370000 },
      { name: 'Global Data Pipeline Core Engine', quantity: 1, unitPrice: 1080000, total: 1080000 }
    ],
    notes: 'Rep applied 22% discount to match competitor quote. Escalated to Sarah Jenkins (VP Sales) for approval.'
  },
  {
    id: 'Q-1040',
    customer: 'GlobalSoft Technologies',
    contactPerson: 'Jessica Sterling',
    contactEmail: 'j.sterling@globalsoft.com',
    amount: 2970650,
    stage: 'Confirmed',
    stageKey: 'confirmed',
    health: 'Healthy',
    healthKey: 'healthy',
    riskScore: 10,
    discount: 5,
    margin: 41.2,
    date: '2026-09-03',
    timeAgo: '1 day ago',
    validUntil: '2026-09-30',
    timePeriod: 'this_week',
    items: [
      { name: 'Global Multi-Region Core Platform', quantity: 1, unitPrice: 2200000, total: 2200000 },
      { name: 'Enterprise Compliance Audit Module', quantity: 1, unitPrice: 450000, total: 450000 }
    ],
    notes: 'Customer accepted initial proposal. Procurement finalizing digital signatures.'
  },
  {
    id: 'Q-1039',
    customer: 'Horizon Dynamics',
    contactPerson: 'Arthur Pendelton',
    contactEmail: 'arthur@horizondynamics.org',
    amount: 3823200,
    stage: 'Draft',
    stageKey: 'draft',
    health: 'Healthy',
    healthKey: 'healthy',
    riskScore: 22,
    discount: 10,
    margin: 34.0,
    date: '2026-09-02',
    timeAgo: '2 days ago',
    validUntil: '2026-09-28',
    timePeriod: 'this_week',
    items: [
      { name: 'Custom ERP Sync & Connector Pack', quantity: 1, unitPrice: 2800000, total: 2800000 },
      { name: 'Cloud DealFlow Enterprise (25 Seats)', quantity: 25, unitPrice: 32000, total: 800000 }
    ],
    notes: 'Scoping line items for warehouse module integration with client engineering team.'
  },
  {
    id: 'Q-1038',
    customer: 'Vanguard Logistics',
    contactPerson: 'David Miller',
    contactEmail: 'd.miller@vanguardlogistics.com',
    amount: 5321800,
    stage: 'Negotiation',
    stageKey: 'negotiation',
    health: 'Critical',
    healthKey: 'critical',
    riskScore: 85,
    discount: 18,
    margin: 22.5,
    date: '2026-08-31',
    timeAgo: '4 days ago',
    validUntil: '2026-09-15',
    timePeriod: 'this_month',
    items: [
      { name: 'Fleet Telemetry Edge Sensor Kit (100 units)', quantity: 100, unitPrice: 14500, total: 1450000 },
      { name: 'Global Data Pipeline Core Engine', quantity: 1, unitPrice: 4050000, total: 4050000 }
    ],
    notes: 'Client stalled on pricing due to competitor offer. Mumbai warehouse inventory low.'
  },
  {
    id: 'Q-1037',
    customer: 'Helios Medical',
    contactPerson: 'Dr. Rebecca Vance',
    contactEmail: 'r.vance@heliosmed.org',
    amount: 1345200,
    stage: 'Confirmed',
    stageKey: 'confirmed',
    health: 'Healthy',
    healthKey: 'healthy',
    riskScore: 8,
    discount: 0,
    margin: 48.0,
    date: '2026-08-28',
    timeAgo: '6 days ago',
    validUntil: '2026-09-20',
    timePeriod: 'this_month',
    items: [
      { name: 'HIPAA Compliance & Audit Shield', quantity: 1, unitPrice: 1140000, total: 1140000 }
    ],
    notes: 'Fast-tracked purchase order approved by hospital board. Ready for provisioning.'
  },
  {
    id: 'Q-1036',
    customer: 'Apex Global Technologies',
    contactPerson: 'Elena Rostova',
    contactEmail: 'customer@dealflow360.demo',
    amount: 4241864,
    stage: 'Draft',
    stageKey: 'draft',
    health: 'At Risk',
    healthKey: 'at_risk',
    riskScore: 62,
    discount: 14,
    margin: 29.5,
    date: '2026-08-25',
    timeAgo: '1 week ago',
    validUntil: '2026-09-06',
    timePeriod: 'this_month',
    items: [
      { name: 'Global Data Pipeline Core Engine', quantity: 1, unitPrice: 3380000, total: 3380000 },
      { name: '24/7 Dedicated SLA Support Tier', quantity: 1, unitPrice: 800000, total: 800000 }
    ],
    notes: 'Quote expires in 24 hours. Elena reviewed draft but has not finalized commercial terms.'
  },
  {
    id: 'Q-1035',
    customer: 'Quantum Stream Corp',
    contactPerson: 'Liam O\'Connor',
    contactEmail: 'liam@quantumstream.io',
    amount: 8230500,
    stage: 'Confirmed',
    stageKey: 'confirmed',
    health: 'Healthy',
    healthKey: 'healthy',
    riskScore: 12,
    discount: 7,
    margin: 38.5,
    date: '2026-08-19',
    timeAgo: '2 weeks ago',
    validUntil: '2026-09-10',
    timePeriod: 'this_quarter',
    items: [
      { name: 'Global Data Pipeline & Edge Infrastructure', quantity: 2, unitPrice: 3150000, total: 6300000 },
      { name: '24/7 Dedicated SLA Support Tier', quantity: 1, unitPrice: 1200000, total: 1200000 }
    ],
    notes: 'Major strategic win. Net 30 payment terms with annual recurring subscription.'
  }
];

export const PENDING_ACTIONS = [
  {
    id: 'act-1',
    type: 'discount_approval',
    title: 'Discount approval required',
    quoteId: 'Q-1041',
    customer: 'NovaTech Systems',
    description: '22% discount requested on ₹13,34,580 quote exceeds standard rep authorization limit (15%).',
    badge: 'Approval Needed',
    badgeColor: 'badge-warning',
    priority: 'High',
    actionLabel: 'Request Escalation',
    actionType: 'escalate',
    amount: '₹13.34L',
    time: '25 mins ago'
  },
  {
    id: 'act-2',
    type: 'negotiation_reply',
    title: 'Customer negotiation reply',
    quoteId: 'Q-1042',
    customer: 'Acme Corp',
    description: 'Sarah Connor replied with counter-proposal: ₹18.5L (-7%) in exchange for 2-year commitment.',
    badge: 'Customer Counter',
    badgeColor: 'badge-primary',
    priority: 'High',
    actionLabel: 'Review Terms',
    actionType: 'review_counter',
    amount: '₹19.97L',
    time: '2 hours ago'
  },
  {
    id: 'act-3',
    type: 'fulfillment_issue',
    title: 'Fulfillment inventory bottleneck',
    quoteId: 'Q-1038',
    customer: 'Vanguard Logistics',
    description: 'Mumbai Distribution Hub low on 100x Sensor Units. Requires split shipping from Bangalore.',
    badge: 'Ops Flag',
    badgeColor: 'badge-error',
    priority: 'Critical',
    actionLabel: 'Split Shipment',
    actionType: 'split_warehouse',
    amount: '₹53.21L',
    time: '5 hours ago'
  },
  {
    id: 'act-4',
    type: 'expiry_warning',
    title: 'Quotation expiring within 24h',
    quoteId: 'Q-1036',
    customer: 'Apex Global Technologies',
    description: 'Proposal valid until tomorrow 5:00 PM. No digital signature captured.',
    badge: 'Expiring Soon',
    badgeColor: 'badge-warning',
    priority: 'Medium',
    actionLabel: 'Send Reminder',
    actionType: 'send_reminder',
    amount: '₹42.41L',
    time: '1 day ago'
  }
];

export const SALES_PERFORMANCE = {
  quotesCreated: 38,
  quotesWon: 24,
  winRate: 63.2,
  avgDealValue: 2845000,
  targetQuota: 4500000,
  currentRevenue: 3854000,
  quotaAttainment: 108.5,
  monthlyTrend: [
    { month: 'Apr', target: 3000000, actual: 3200000, wonDeals: 18 },
    { month: 'May', target: 3200000, actual: 3450000, wonDeals: 21 },
    { month: 'Jun', target: 3400000, actual: 3300000, wonDeals: 19 },
    { month: 'Jul', target: 3500000, actual: 3620000, wonDeals: 22 },
    { month: 'Aug', target: 3500000, actual: 3780000, wonDeals: 23 },
    { month: 'Sep', target: 3550000, actual: 3854000, wonDeals: 24 }
  ],
  stageFunnel: [
    { stage: 'Scoping & Drafts', count: 38, conversionRate: '100%' },
    { stage: 'Governance Approved', count: 34, conversionRate: '89.4%' },
    { stage: 'Active Negotiation', count: 29, conversionRate: '76.3%' },
    { stage: 'Closed Won', count: 24, conversionRate: '63.2%' }
  ]
};

export const ACTIVITIES = [
  {
    id: 'act-ev-1',
    type: 'quote_created',
    title: 'Quotation Created',
    description: 'Created draft Q-1045 for SolarGrid Energy (₹42.0L)',
    time: '45 mins ago',
    user: 'Alex Morgan',
    role: 'Sales Rep',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Draft',
    badgeClass: 'badge-neutral'
  },
  {
    id: 'act-ev-2',
    type: 'approval_requested',
    title: 'Approval Escalated',
    description: 'Requested 22% discount sign-off from Sarah Jenkins for NovaTech (#Q-1041)',
    time: '2 hours ago',
    user: 'Alex Morgan',
    role: 'Sales Rep',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Pending',
    badgeClass: 'badge-warning'
  },
  {
    id: 'act-ev-3',
    type: 'customer_replied',
    title: 'Customer Counter-Offer',
    description: 'Acme Corp (Sarah Connor) submitted counter-terms for Quote #Q-1042',
    time: '3 hours ago',
    user: 'Sarah Connor',
    role: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    badge: 'Counter',
    badgeClass: 'badge-primary'
  },
  {
    id: 'act-ev-4',
    type: 'quote_confirmed',
    title: 'Deal Confirmed & Won',
    description: 'GlobalSoft signed agreement for Quote #Q-1040 (₹29.7L)',
    time: '1 day ago',
    user: 'Jessica Sterling',
    role: 'Procurement',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: 'Won',
    badgeClass: 'badge-success'
  },
  {
    id: 'act-ev-5',
    type: 'margin_cleared',
    title: 'Margin Compliance Verified',
    description: 'Helios Medical Quote #Q-1037 cleared RevOps margin check (48% GM)',
    time: '3 days ago',
    user: 'Marcus Vance',
    role: 'Finance Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badge: 'Verified',
    badgeClass: 'badge-success'
  }
];

export const NOTIFICATIONS_DATA = [
  {
    id: 'notif-1',
    title: 'High Discount Escalation Triggered',
    message: 'Quote #Q-1041 for NovaTech Systems has a 22% discount pending VP approval.',
    time: '25m ago',
    type: 'alert',
    read: false,
    link: '/approvals'
  },
  {
    id: 'notif-2',
    title: 'Customer Counter-Offer Received',
    message: 'Acme Corp counter-offered ₹18.5L on Quote #Q-1042 with 2-year contract terms.',
    time: '2h ago',
    type: 'info',
    read: false,
    link: '/quotations'
  },
  {
    id: 'notif-3',
    title: 'Deal Won: GlobalSoft Technologies',
    message: 'Quote #Q-1040 (₹29.7L) successfully confirmed and marked as Closed Won.',
    time: '1d ago',
    type: 'success',
    read: false,
    link: '/quotations'
  },
  {
    id: 'notif-4',
    title: 'Mumbai Warehouse Shortage',
    message: 'Inventory constraint flagged for Vanguard Logistics Quote #Q-1038.',
    time: '1d ago',
    type: 'alert',
    read: true,
    link: '/fulfillment'
  }
];

// Dynamic filter helper
export const filterQuotations = (quotes, { timePeriod = 'all', status = 'all', health = 'all', searchQuery = '' }) => {
  return quotes.filter((quote) => {
    // Time period filter
    if (timePeriod !== 'all') {
      if (timePeriod === 'today' && quote.timeAgo.indexOf('hour') === -1 && quote.timeAgo.indexOf('min') === -1) {
        return false;
      }
      if (timePeriod === 'this_week' && quote.timePeriod !== 'this_week' && quote.timeAgo.indexOf('hour') === -1) {
        return false;
      }
      if (timePeriod === 'this_month' && quote.timePeriod === 'this_quarter') {
        return false;
      }
    }

    // Status filter
    if (status !== 'all' && quote.stageKey !== status) {
      return false;
    }

    // Health filter
    if (health !== 'all' && quote.healthKey !== health) {
      return false;
    }

    // Search query filter (matches Quote ID, Customer, Items, Notes)
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchId = quote.id.toLowerCase().includes(q);
      const matchCustomer = (quote.customer || quote.customerName || '').toLowerCase().includes(q);
      const matchContact = (quote.contactPerson || '').toLowerCase().includes(q);
      const matchNotes = (quote.notes || '').toLowerCase().includes(q);
      const matchItems = quote.items && quote.items.some(item => item.name.toLowerCase().includes(q));

      if (!matchId && !matchCustomer && !matchContact && !matchNotes && !matchItems) {
        return false;
      }
    }

    return true;
  });
};

// Helper for Indian currency abbreviated formatting
const formatINRAbbr = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
};

// Compute dynamic KPI stats based on filtered quotes
export const computeFilteredKPIs = (filteredQuotes, allQuotes = RECENT_QUOTATIONS) => {
  const activeQuotes = filteredQuotes.filter(q => q.stageKey !== 'confirmed');
  const wonQuotes = filteredQuotes.filter(q => q.stageKey === 'confirmed');
  const pendingQuotes = filteredQuotes.filter(q => q.stageKey === 'pending_approval');
  
  const pipelineVal = activeQuotes.reduce((acc, q) => acc + (q.amount || q.total || 0), 0);
  const wonVal = wonQuotes.reduce((acc, q) => acc + (q.amount || q.total || 0), 0);

  const healthyCount = filteredQuotes.filter(q => q.healthKey === 'healthy').length;
  const totalCount = filteredQuotes.length || 1;
  const healthPercent = Math.round((healthyCount / totalCount) * 100);

  return {
    activeDeals: {
      ...BASE_STATS.activeDeals,
      value: activeQuotes.length,
      change: `${activeQuotes.length} active quotes displayed`
    },
    pipelineValue: {
      ...BASE_STATS.pipelineValue,
      value: pipelineVal,
      formatted: formatINRAbbr(pipelineVal)
    },
    pendingApprovals: {
      ...BASE_STATS.pendingApprovals,
      value: pendingQuotes.length,
      change: `${pendingQuotes.length} awaiting sign-off`
    },
    wonDeals: {
      ...BASE_STATS.wonDeals,
      value: wonQuotes.length,
      statusText: `${formatINRAbbr(wonVal)} closed value`
    },
    dealHealth: {
      ...BASE_STATS.dealHealth,
      value: healthPercent,
      formatted: `${healthPercent}%`,
      change: `${healthyCount} Healthy / ${totalCount - healthyCount} Flagged`
    },
    monthlyRevenue: {
      ...BASE_STATS.monthlyRevenue
    }
  };
};
