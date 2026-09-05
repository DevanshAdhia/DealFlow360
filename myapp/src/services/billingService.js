/**
 * DealFlow360 - Billing Lifecycle Service
 * Computes dynamic lifecycle stepper stages (ORDER_CONFIRMED -> SHIPPED -> INVOICED -> PAID)
 * with states COMPLETED, CURRENT, WAITING.
 */

export const BILLING_STAGES = [
  { key: 'ORDER_CONFIRMED', label: 'Order Confirmed', description: 'Commercial quotation approved and sales order created.' },
  { key: 'SHIPPED', label: 'Shipped', description: 'Warehouse stock allocated and dispatched to customer.' },
  { key: 'INVOICED', label: 'Invoiced', description: 'Tax invoice issued with payment terms applied.' },
  { key: 'PAID', label: 'Paid', description: 'Payment collected and settled in full.' }
];

/**
 * Calculates dynamic timeline state for an invoice
 * @param {Object} invoice 
 * @param {Object} fulfillmentOrder 
 * @param {Array} payments 
 * @returns {Array} Timeline steps with status (COMPLETED | CURRENT | WAITING)
 */
export const calculateBillingTimeline = (invoice, fulfillmentOrder = null, payments = []) => {
  const currentStage = invoice?.billingStage || 'INVOICED';
  const paymentStatus = invoice?.paymentStatus || 'UNPAID';

  const stageOrder = ['ORDER_CONFIRMED', 'SHIPPED', 'INVOICED', 'PAID'];
  
  // Resolve effective stage index
  let effectiveStageIndex = stageOrder.indexOf(currentStage);
  if (paymentStatus === 'PAID') {
    effectiveStageIndex = 3; // PAID
  } else if (effectiveStageIndex === -1) {
    effectiveStageIndex = 2; // default INVOICED
  }

  // If one-time hardware delivery is still pending fulfillment, Shipped might be waiting
  const isFulfillmentDone = fulfillmentOrder && (fulfillmentOrder.status === 'FULFILLED' || fulfillmentOrder.status === 'SHIPPED');

  return BILLING_STAGES.map((stage, idx) => {
    let status = 'WAITING';

    if (idx < effectiveStageIndex) {
      status = 'COMPLETED';
    } else if (idx === effectiveStageIndex) {
      status = (paymentStatus === 'PAID' && stage.key === 'PAID') ? 'COMPLETED' : 'CURRENT';
    } else {
      status = 'WAITING';
    }

    return {
      id: stage.key,
      key: stage.key,
      name: stage.label,
      label: stage.label,
      description: stage.description,
      status // COMPLETED | CURRENT | WAITING
    };
  });
};

/**
 * Stage icon color helper
 * @param {string} status 
 * @returns {string}
 */
export const getStageIconColor = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'text-emerald-600 bg-emerald-100';
    case 'CURRENT':
      return 'text-indigo-600 bg-indigo-100 ring-2 ring-indigo-400';
    case 'WAITING':
    default:
      return 'text-slate-400 bg-slate-100';
  }
};

/**
 * Stage badge class helper
 * @param {string} status 
 * @returns {string}
 */
export const getStageBadgeClass = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800';
    case 'CURRENT':
      return 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 animate-pulse';
    case 'WAITING':
    default:
      return 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500';
  }
};

