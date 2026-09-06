/**
 * DealFlow360 - Inventory Service
 * Calculates dynamic warehouse stock levels and simulates restocks.
 */

/**
 * Calculates stock levels across all warehouses and products.
 * Available = onHandQty - reservedQty
 * Never hardcodes Available.
 */
export const getStockLevels = (inventory = [], warehouses = [], products = []) => {
  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));
  const productMap = new Map(products.map(p => [p.id, p]));

  return inventory.map(item => {
    const wh = warehouseMap.get(item.warehouseId) || {
      id: item.warehouseId,
      name: item.warehouseId,
      location: 'Regional Center',
      status: 'Active'
    };
    const prod = productMap.get(item.productId) || {
      id: item.productId,
      name: item.productId,
      productCode: item.productId,
      unitPrice: 0
    };

    const onHand = Number(item.onHandQty) || 0;
    const reserved = Number(item.reservedQty) || 0;
    const available = Math.max(0, onHand - reserved);
    const reorderLevel = Number(item.reorderLevel) || 5;

    let stockStatus = 'In Stock';
    if (available === 0) stockStatus = 'Out of Stock';
    else if (available <= reorderLevel) stockStatus = 'Low Stock';

    return {
      id: item.id,
      warehouseId: item.warehouseId,
      warehouseName: wh.name,
      warehouseLocation: wh.location,
      productId: item.productId,
      productName: prod.name,
      productCode: prod.productCode,
      unitPrice: prod.unitPrice,
      unitCost: item.unitCost || prod.costPrice || 0,
      onHandQty: onHand,
      reservedQty: reserved,
      availableQty: available,
      reorderLevel,
      stockStatus
    };
  });
};

/**
 * Simulates restock for a warehouse and product
 * Returns new inventory array
 */
export const simulateRestock = (productId, warehouseId, quantity, currentInventory = []) => {
  const qtyToAdd = Number(quantity) || 0;
  let found = false;

  const updatedInventory = currentInventory.map(inv => {
    if (inv.productId === productId && inv.warehouseId === warehouseId) {
      found = true;
      return {
        ...inv,
        onHandQty: inv.onHandQty + qtyToAdd
      };
    }
    return inv;
  });

  if (!found) {
    updatedInventory.push({
      id: `INV-MANUAL-${Date.now()}`,
      warehouseId,
      productId,
      onHandQty: qtyToAdd,
      reservedQty: 0,
      reorderLevel: 5,
      unitCost: 85000
    });
  }

  return updatedInventory;
};
