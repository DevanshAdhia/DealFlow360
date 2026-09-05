/**
 * DealFlow360 - Backorder Service
 * Handles backorder tracking and restock detection.
 */

/**
 * Get all backorders for a specific order
 */
export const getBackordersForOrder = (orderId, backorders = []) => {
  return backorders.filter(bo => bo.orderId === orderId);
};

/**
 * Restock Detection:
 * Checks open backorders against current warehouse inventory.
 * If available stock >= pending backorder, detects match for consolidation prompt.
 */
export const checkRestockMatch = (orderId, backorders = [], inventory = [], warehouses = []) => {
  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));
  const openBackorders = backorders.filter(bo => 
    (!orderId || bo.orderId === orderId) && bo.status === 'OPEN' && bo.quantityPending > 0
  );

  for (const bo of openBackorders) {
    const requiredQty = Number(bo.quantityPending);

    // Look for a warehouse where available stock >= requiredQty
    const matchingInventory = inventory.find(inv => {
      if (inv.productId !== bo.productId) return false;
      const available = (Number(inv.onHandQty) || 0) - (Number(inv.reservedQty) || 0);
      return available >= requiredQty;
    });

    if (matchingInventory) {
      const wh = warehouseMap.get(matchingInventory.warehouseId);
      const available = matchingInventory.onHandQty - matchingInventory.reservedQty;
      return {
        hasMatch: true,
        backorder: bo,
        warehouseId: matchingInventory.warehouseId,
        warehouseName: wh?.name || matchingInventory.warehouseId,
        availableStock: available,
        pendingBackorder: requiredQty,
        productName: bo.productName || 'Product',
        message: `${requiredQty} units are now available at ${wh?.name || matchingInventory.warehouseId}.`
      };
    }
  }

  return {
    hasMatch: false,
    backorder: null,
    message: null
  };
};
