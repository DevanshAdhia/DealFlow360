/**
 * fulfillmentUtils.js
 * Contains the automatic multi-warehouse allocation logic.
 */

export const allocateStockAcrossWarehouses = (productId, requestedQuantity, inventoryData, activeWarehouses) => {
  // Find inventory records for this product
  const productInventory = inventoryData.filter(inv => 
    inv.productId === productId && 
    activeWarehouses.includes(inv.warehouseId)
  );

  // Sort warehouses (e.g. WH-A first since it's primary, then others)
  // For simplicity, sort by available quantity descending (greedy from largest stock)
  productInventory.sort((a, b) => b.availableQuantity - a.availableQuantity);

  let remainingToFulfill = requestedQuantity;
  const allocations = [];
  const inventoryUpdates = [];

  for (const inv of productInventory) {
    if (remainingToFulfill <= 0) break;
    if (inv.availableQuantity <= 0) continue;

    const allocQty = Math.min(remainingToFulfill, inv.availableQuantity);
    
    allocations.push({
      warehouseId: inv.warehouseId,
      quantity: allocQty
    });

    inventoryUpdates.push({
      inventoryId: inv.id,
      quantityDeducted: allocQty
    });

    remainingToFulfill -= allocQty;
  }

  return {
    allocatedQuantity: requestedQuantity - remainingToFulfill,
    backorderQuantity: remainingToFulfill,
    allocations,
    inventoryUpdates
  };
};
