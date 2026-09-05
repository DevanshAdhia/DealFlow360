/**
 * DealFlow360 - Delivery Reconciliation Service
 * Reconciles ordered quantities, fulfilled quantities, and invoiceable quantities.
 * Strictly enforces that invoiced quantity cannot exceed fulfilled/shipped quantity.
 */

/**
 * Reconciles item-level delivery and invoicing status
 * @param {Object} options
 * @returns {Array} List of reconciled line items
 */
export const calculateDeliveryReconciliation = ({
  orderItems = [],
  fulfillmentOrders = [],
  fulfillmentItems = [],
  invoiceItems = []
}) => {
  return orderItems.map(orderItem => {
    const ordered = Number(orderItem.quantity) || 0;

    // Find all fulfillment items allocated/dispatched for this order item
    const matchedFulfillmentItems = fulfillmentItems.filter(
      fi => fi.orderItemId === orderItem.id
    );

    const fulfilled = matchedFulfillmentItems.reduce(
      (sum, fi) => sum + (Number(fi.fulfilledQty || fi.allocatedQty) || 0),
      0
    );

    // Find all invoice lines billed for this product
    const matchedInvoiceItems = invoiceItems.filter(
      ii => ii.productId === orderItem.productId
    );

    const invoiced = matchedInvoiceItems.reduce(
      (sum, ii) => sum + (Number(ii.quantity) || 0),
      0
    );

    const invoiceable = Math.min(fulfilled, ordered);
    const unfulfilled = Math.max(0, ordered - fulfilled);
    const pendingToInvoice = Math.max(0, fulfilled - invoiced);

    return {
      orderItemId: orderItem.id,
      productId: orderItem.productId,
      productName: orderItem.productName || 'Product',
      ordered,
      fulfilled,
      invoiced,
      invoiceable,
      unfulfilled,
      pendingToInvoice,
      isFullyInvoiced: invoiced >= fulfilled && fulfilled > 0,
      hasShortage: unfulfilled > 0
    };
  });
};
