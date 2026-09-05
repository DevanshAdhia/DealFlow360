/**
 * DealFlow360 - Centralized Enterprise Navigation Configuration
 * 
 * Defines the top-level module architecture and strictly enforces
 * the hover submenu standard: ONLY List and Detail.
 */

export const DEFAULT_DETAIL_IDS = {
  quotations: 'Q-1001',
  approvals: 'Q-1002',
  fulfillment: 'FO-1042',
  subscriptions: 'SUB-8091',
  invoices: 'INV-1042',
  dealHealth: 'Q-1001',
  reports: 'sales-performance',
  products: 'PROD-001'
};

export const NAVIGATION_CONFIG = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/sales/dashboard',
    hasSubmenu: false
  },
  {
    key: 'quotations',
    label: 'Quotations',
    path: '/sales/quotations',
    hasSubmenu: true,
    defaultDetailId: DEFAULT_DETAIL_IDS.quotations,
    children: [
      {
        key: 'quotation-list',
        label: 'Quotation List',
        path: '/sales/quotations'
      },
      {
        key: 'quotation-detail',
        label: 'Quotation Detail',
        paramKey: ':quotationId',
        pathTemplate: '/sales/quotations/:quotationId'
      }
    ]
  },
  {
    key: 'approvals',
    label: 'Approvals',
    path: '/sales/approvals',
    hasSubmenu: true,
    defaultDetailId: DEFAULT_DETAIL_IDS.approvals,
    children: [
      {
        key: 'approval-list',
        label: 'Approval List',
        path: '/sales/approvals'
      },
      {
        key: 'approval-detail',
        label: 'Approval Detail',
        paramKey: ':quotationId',
        pathTemplate: '/sales/approvals/:quotationId'
      }
    ]
  },
  {
    key: 'fulfillment',
    label: 'Fulfillment',
    path: '/sales/fulfillment',
    hasSubmenu: true,
    defaultDetailId: DEFAULT_DETAIL_IDS.fulfillment,
    children: [
      {
        key: 'fulfillment-list',
        label: 'Fulfillment List',
        path: '/sales/fulfillment'
      },
      {
        key: 'fulfillment-detail',
        label: 'Fulfillment Detail',
        paramKey: ':fulfillmentId',
        pathTemplate: '/sales/fulfillment/:fulfillmentId'
      }
    ]
  },
  {
    key: 'subscriptions',
    label: 'Subscriptions',
    path: '/sales/subscriptions',
    hasSubmenu: true,
    defaultDetailId: DEFAULT_DETAIL_IDS.subscriptions,
    children: [
      {
        key: 'subscription-list',
        label: 'Subscription List',
        path: '/sales/subscriptions'
      },
      {
        key: 'billing-detail',
        label: 'Billing Detail',
        paramKey: ':subscriptionId',
        pathTemplate: '/sales/subscriptions/:subscriptionId'
      }
    ]
  },
  {
    key: 'invoices',
    label: 'Invoices',
    path: '/sales/invoices',
    hasSubmenu: true,
    defaultDetailId: DEFAULT_DETAIL_IDS.invoices,
    children: [
      {
        key: 'invoice-list',
        label: 'Invoice List',
        path: '/sales/invoices'
      },
      {
        key: 'invoice-detail',
        label: 'Invoice Detail',
        paramKey: ':invoiceId',
        pathTemplate: '/sales/invoices/:invoiceId'
      }
    ]
  },
  {
    key: 'dealHealth',
    label: 'Deal Health',
    path: '/sales/deal-health',
    hasSubmenu: false
  },
  {
    key: 'reports',
    label: 'Reports',
    path: '/sales/reports',
    hasSubmenu: true,
    defaultDetailId: DEFAULT_DETAIL_IDS.reports,
    children: [
      {
        key: 'report-list',
        label: 'Report List',
        path: '/sales/reports'
      },
      {
        key: 'report-detail',
        label: 'Report Detail',
        paramKey: ':reportId',
        pathTemplate: '/sales/reports/:reportId'
      }
    ]
  },
  {
    key: 'products',
    label: 'Products',
    path: '/sales/products',
    hasSubmenu: true,
    defaultDetailId: DEFAULT_DETAIL_IDS.products,
    children: [
      {
        key: 'product-list',
        label: 'Product List',
        path: '/sales/products'
      },
      {
        key: 'product-detail',
        label: 'Product Detail',
        paramKey: ':productId',
        pathTemplate: '/sales/products/:productId'
      }
    ]
  }
];

/**
 * Resolves the concrete link for a child item (avoiding literal :id strings)
 */
export const resolveChildPath = (child, activeId, defaultDetailId) => {
  if (child.path) return child.path;
  if (child.pathTemplate && child.paramKey) {
    const id = activeId || defaultDetailId || '1';
    return child.pathTemplate.replace(child.paramKey, id);
  }
  return child.pathTemplate || '/';
};
