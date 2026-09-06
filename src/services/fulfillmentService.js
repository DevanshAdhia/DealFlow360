/**
 * DealFlow360 - Fulfillment Service
 * Handles multi-warehouse allocation engine, suggested split logic,
 * manual overrides, and backorder consolidation.
 */

import { createAuditEvent } from './auditService.js';

/**
 * Calculate the optimal warehouse split for order items
 * - Fulfills requested quantity when possible
 * - Prefers fewer warehouses (greedy packing)
 * - Considers shipping cost
 * - Respects available stock (onHandQty - reservedQty)
 * - Creates backorders when total stock is insufficient
 * 
 * @param {Array} orderItems 
 * @param {Array} inventory 
 * @param {Array} warehouses 
 * @returns {Object} Suggested split result
 */
export const calculateSuggestedSplit = (orderItems = [], inventory = [], warehouses = []) => {
  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));
  const itemSplits = [];
  const allAllocations = [];

  let totalShipmentsCount = 0;
  let totalShippingCost = 0;
  let grandFulfilledQty = 0;
  let grandPendingQty = 0;
  let grandBackorderQty = 0;
  const involvedWarehouseIds = new Set();

  orderItems.forEach(item => {
    const requestedQty = Number(item.quantity) || 0;
    let remainingToAllocate = requestedQty;

    // Find all inventory entries for this product with available stock
    const candidateStock = inventory
      .filter(inv => inv.productId === item.productId)
      .map(inv => {
        const wh = warehouseMap.get(inv.warehouseId) || {
          id: inv.warehouseId,
          name: inv.warehouseId,
          shippingCostBase: 150
        };
        const onHand = Number(inv.onHandQty) || 0;
        const reserved = Number(inv.reservedQty) || 0;
        const available = Math.max(0, onHand - reserved);
        return {
          inventoryId: inv.id,
          warehouseId: inv.warehouseId,
          warehouseName: wh.name,
          shippingCostBase: Number(wh.shippingCostBase) || 150,
          onHandQty: onHand,
          reservedQty: reserved,
          available
        };
      })
      .filter(s => s.available > 0);

    // Sorting strategy:
    // 1. If any single warehouse has enough available stock to fulfill 100%, prefer the one with lowest shipping cost
    // 2. Otherwise sort descending by available quantity to minimize total warehouse split count, then by shipping cost
    const singleFulfillOption = candidateStock
      .filter(s => s.available >= requestedQty)
      .sort((a, b) => a.shippingCostBase - b.shippingCostBase)[0];

    let sortedCandidates = [];
    if (singleFulfillOption) {
      sortedCandidates = [singleFulfillOption];
    } else {
      sortedCandidates = [...candidateStock].sort((a, b) => {
        if (b.available !== a.available) {
          return b.available - a.available; // More stock first
        }
        return a.shippingCostBase - b.shippingCostBase; // Cheaper shipping first
      });
    }

    const itemAllocations = [];
    for (const candidate of sortedCandidates) {
      if (remainingToAllocate <= 0) break;
      const allocateQty = Math.min(candidate.available, remainingToAllocate);
      if (allocateQty > 0) {
        remainingToAllocate -= allocateQty;
        involvedWarehouseIds.add(candidate.warehouseId);

        const allocObj = {
          orderItemId: item.id,
          productId: item.productId,
          productName: item.productName || item.name || 'Product',
          warehouseId: candidate.warehouseId,
          warehouseName: candidate.warehouseName,
          allocatedQty: allocateQty,
          fulfilledQty: allocateQty,
          pendingQty: 0,
          shippingCost: candidate.shippingCostBase,
          unitCost: candidate.unitCost || 85000,
          status: 'ALLOCATED'
        };

        itemAllocations.push(allocObj);
        allAllocations.push(allocObj);
      }
    }

    const fulfilledQty = requestedQty - remainingToAllocate;
    const backorderQty = Math.max(0, remainingToAllocate);

    grandFulfilledQty += fulfilledQty;
    grandPendingQty += remainingToAllocate;
    grandBackorderQty += backorderQty;

    itemSplits.push({
      orderItemId: item.id,
      productId: item.productId,
      productName: item.productName || item.name || 'Product',
      requestedQty,
      fulfilledQty,
      backorderQty,
      allocations: itemAllocations
    });
  });

  totalShipmentsCount = involvedWarehouseIds.size;
  totalShippingCost = Array.from(involvedWarehouseIds).reduce((acc, whId) => {
    const wh = warehouseMap.get(whId);
    return acc + (wh?.shippingCostBase || 150);
  }, 0);

  const canFullyFulfill = grandBackorderQty === 0;
  const isSplit = totalShipmentsCount > 1;

  return {
    itemSplits,
    allocations: allAllocations,
    involvedWarehouseIds: Array.from(involvedWarehouseIds),
    totalShipments: totalShipmentsCount,
    totalShippingCost,
    fulfilledQty: grandFulfilledQty,
    pendingQty: grandPendingQty,
    backorderQty: grandBackorderQty,
    canFullyFulfill,
    isSplit,
    suggestedStatus: grandBackorderQty > 0 ? 'BACKORDER' : (isSplit ? 'SPLIT_PENDING' : 'ALLOCATED')
  };
};

/**
 * Accept the suggested split and produce updated runtime state
 */
export const acceptSuggestedSplitAction = ({
  orderId,
  suggestedSplit,
  currentInventory,
  currentFulfillmentOrders,
  currentFulfillmentItems,
  currentBackorders,
  warehouses,
  actor = 'Operations Team'
}) => {
  // 1. Update inventory reserved quantities
  const updatedInventory = currentInventory.map(inv => {
    const matchingAlloc = suggestedSplit.allocations.find(
      a => a.productId === inv.productId && a.warehouseId === inv.warehouseId
    );
    if (matchingAlloc) {
      return {
        ...inv,
        reservedQty: inv.reservedQty + matchingAlloc.allocatedQty
      };
    }
    return inv;
  });

  // 2. Generate new fulfillment items
  const newFulfillmentItems = [
    ...currentFulfillmentItems.filter(fi => fi.fulfillmentOrderId !== `FO-${orderId.replace('SO-', '')}` && fi.orderId !== orderId),
    ...suggestedSplit.allocations.map((alloc, idx) => ({
      id: `FI-${orderId.replace('SO-', '')}-${idx + 1}`,
      fulfillmentOrderId: `FO-${orderId.replace('SO-', '')}`,
      orderId,
      orderItemId: alloc.orderItemId,
      productId: alloc.productId,
      productName: alloc.productName,
      warehouseId: alloc.warehouseId,
      warehouseName: alloc.warehouseName,
      allocatedQty: alloc.allocatedQty,
      fulfilledQty: alloc.allocatedQty,
      pendingQty: 0,
      shippingCost: alloc.shippingCost,
      status: 'ALLOCATED'
    }))
  ];

  // 3. Update or create backorder if stock insufficient
  let updatedBackorders = [...currentBackorders.filter(bo => bo.orderId !== orderId)];
  if (suggestedSplit.backorderQty > 0) {
    suggestedSplit.itemSplits.forEach((is, idx) => {
      if (is.backorderQty > 0) {
        updatedBackorders.push({
          id: `BO-${orderId.replace('SO-', '')}-${idx + 1}`,
          orderId,
          orderItemId: is.orderItemId,
          productId: is.productId,
          productName: is.productName,
          quantityRequired: is.requestedQty,
          quantityPending: is.backorderQty,
          status: 'OPEN',
          expectedDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          notes: `Automatic backorder created for ${is.backorderQty} units due to warehouse stock constraints.`
        });
      }
    });
  }

  // 4. Update fulfillment order status
  const foId = `FO-${orderId.replace('SO-', '')}`;
  const newStatus = suggestedSplit.backorderQty > 0 
    ? 'BACKORDER' 
    : (suggestedSplit.totalShipments > 1 ? 'IN_FULFILLMENT' : 'ALLOCATED');

  const updatedFulfillmentOrders = currentFulfillmentOrders.map(fo => {
    if (fo.orderId === orderId || fo.id === foId) {
      return {
        ...fo,
        status: newStatus,
        totalShipments: suggestedSplit.totalShipments,
        shippingCost: suggestedSplit.totalShippingCost,
        fulfilledQty: suggestedSplit.fulfilledQty,
        pendingQty: suggestedSplit.pendingQty,
        backorderQty: suggestedSplit.backorderQty,
        updatedAt: new Date().toISOString()
      };
    }
    return fo;
  });

  // 5. Create audit event
  const whNames = suggestedSplit.allocations.map(a => `${a.warehouseName} (${a.allocatedQty})`).join(', ');
  const auditEvent = createAuditEvent(
    'Fulfillment',
    orderId,
    'ACCEPT_SPLIT',
    `Accepted multi-warehouse suggested split across: ${whNames}. Total Shipments: ${suggestedSplit.totalShipments}, Shipping Cost: $${suggestedSplit.totalShippingCost}.`,
    actor
  );

  return {
    inventory: updatedInventory,
    fulfillmentOrders: updatedFulfillmentOrders,
    fulfillmentItems: newFulfillmentItems,
    backorders: updatedBackorders,
    auditEvent
  };
};

/**
 * Validate and apply Manual Override from Operations
 */
export const applyManualOverride = ({
  orderId,
  orderItems,
  manualAllocations, // [{ warehouseId, allocatedQty }]
  currentInventory,
  currentFulfillmentOrders,
  currentFulfillmentItems,
  currentBackorders,
  warehouses,
  actor = 'Operations Team'
}) => {
  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));
  const primaryItem = orderItems[0];
  const requestedQty = primaryItem ? Number(primaryItem.quantity) : 0;

  // Validate allocations
  let totalAllocated = 0;
  for (const alloc of manualAllocations) {
    const qty = Number(alloc.allocatedQty) || 0;
    if (qty < 0) {
      throw new Error(`Allocated quantity cannot be negative for warehouse ${alloc.warehouseId}`);
    }

    const inv = currentInventory.find(i => i.productId === primaryItem.productId && i.warehouseId === alloc.warehouseId);
    const available = inv ? Math.max(0, inv.onHandQty - inv.reservedQty) : 0;
    if (qty > available) {
      throw new Error(`Allocation of ${qty} exceeds available stock of ${available} at ${alloc.warehouseName || alloc.warehouseId}`);
    }

    totalAllocated += qty;
  }

  if (totalAllocated > requestedQty) {
    throw new Error(`Total allocated quantity (${totalAllocated}) cannot exceed ordered quantity (${requestedQty})`);
  }

  const backorderQty = Math.max(0, requestedQty - totalAllocated);
  const activeAllocs = manualAllocations.filter(a => Number(a.allocatedQty) > 0);
  const totalShipments = activeAllocs.length;
  const totalShippingCost = activeAllocs.reduce((sum, a) => {
    const wh = warehouseMap.get(a.warehouseId);
    return sum + (wh?.shippingCostBase || 150);
  }, 0);

  // Update inventory
  const updatedInventory = currentInventory.map(inv => {
    const matchingAlloc = activeAllocs.find(
      a => a.warehouseId === inv.warehouseId && inv.productId === primaryItem.productId
    );
    if (matchingAlloc) {
      return {
        ...inv,
        reservedQty: inv.reservedQty + Number(matchingAlloc.allocatedQty)
      };
    }
    return inv;
  });

  // Generate fulfillment items
  const foId = `FO-${orderId.replace('SO-', '')}`;
  const newFulfillmentItems = [
    ...currentFulfillmentItems.filter(fi => fi.orderId !== orderId && fi.fulfillmentOrderId !== foId),
    ...activeAllocs.map((alloc, idx) => {
      const wh = warehouseMap.get(alloc.warehouseId);
      return {
        id: `FI-${orderId.replace('SO-', '')}-M${idx + 1}`,
        fulfillmentOrderId: foId,
        orderId,
        orderItemId: primaryItem.id,
        productId: primaryItem.productId,
        productName: primaryItem.productName || 'Product',
        warehouseId: alloc.warehouseId,
        warehouseName: wh?.name || alloc.warehouseId,
        allocatedQty: Number(alloc.allocatedQty),
        fulfilledQty: Number(alloc.allocatedQty),
        pendingQty: 0,
        shippingCost: wh?.shippingCostBase || 150,
        status: 'ALLOCATED'
      };
    })
  ];

  // Update Backorders
  let updatedBackorders = [...currentBackorders.filter(bo => bo.orderId !== orderId)];
  if (backorderQty > 0) {
    updatedBackorders.push({
      id: `BO-${orderId.replace('SO-', '')}-MANUAL`,
      orderId,
      orderItemId: primaryItem.id,
      productId: primaryItem.productId,
      productName: primaryItem.productName,
      quantityRequired: requestedQty,
      quantityPending: backorderQty,
      status: 'OPEN',
      expectedDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      notes: `Manual allocation override resulted in ${backorderQty} backordered units.`
    });
  }

  const newStatus = backorderQty > 0 ? 'BACKORDER' : (totalShipments > 1 ? 'IN_FULFILLMENT' : 'ALLOCATED');
  const updatedFulfillmentOrders = currentFulfillmentOrders.map(fo => {
    if (fo.orderId === orderId || fo.id === foId) {
      return {
        ...fo,
        status: newStatus,
        totalShipments,
        shippingCost: totalShippingCost,
        fulfilledQty: totalAllocated,
        pendingQty: backorderQty,
        backorderQty,
        updatedAt: new Date().toISOString()
      };
    }
    return fo;
  });

  const auditEvent = createAuditEvent(
    'Fulfillment',
    orderId,
    'MANUAL_OVERRIDE',
    `Manual override executed: ${activeAllocs.map(a => `${a.warehouseName}: ${a.allocatedQty}`).join(', ')}. Backorder: ${backorderQty}.`,
    actor
  );

  return {
    inventory: updatedInventory,
    fulfillmentOrders: updatedFulfillmentOrders,
    fulfillmentItems: newFulfillmentItems,
    backorders: updatedBackorders,
    auditEvent
  };
};

/**
 * Consolidate remaining backorders when stock arrives
 */
export const consolidateBackorderAction = ({
  orderId,
  currentInventory,
  currentFulfillmentOrders,
  currentFulfillmentItems,
  currentBackorders,
  warehouses,
  actor = 'Operations Team'
}) => {
  const openBackorder = currentBackorders.find(bo => bo.orderId === orderId && bo.status === 'OPEN');
  if (!openBackorder) {
    throw new Error('No open backorder found for this order.');
  }

  const pendingQty = Number(openBackorder.quantityPending) || 0;
  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));

  // Find warehouse with stock available
  const availableInv = currentInventory.find(inv => {
    if (inv.productId !== openBackorder.productId) return false;
    const available = inv.onHandQty - inv.reservedQty;
    return available >= pendingQty;
  });

  if (!availableInv) {
    throw new Error(`Insufficient available stock to consolidate ${pendingQty} units.`);
  }

  const wh = warehouseMap.get(availableInv.warehouseId);

  // 1. Reserve inventory
  const updatedInventory = currentInventory.map(inv => {
    if (inv.id === availableInv.id) {
      return {
        ...inv,
        reservedQty: inv.reservedQty + pendingQty
      };
    }
    return inv;
  });

  // 2. Add new fulfillment item for consolidated portion
  const foId = `FO-${orderId.replace('SO-', '')}`;
  const newFulfillmentItem = {
    id: `FI-${orderId.replace('SO-', '')}-CONSOL`,
    fulfillmentOrderId: foId,
    orderId,
    orderItemId: openBackorder.orderItemId,
    productId: openBackorder.productId,
    productName: openBackorder.productName || 'Laptop Pro 14',
    warehouseId: availableInv.warehouseId,
    warehouseName: wh?.name || availableInv.warehouseId,
    allocatedQty: pendingQty,
    fulfilledQty: pendingQty,
    pendingQty: 0,
    shippingCost: wh?.shippingCostBase || 180,
    status: 'FULFILLED'
  };

  const updatedFulfillmentItems = [...currentFulfillmentItems, newFulfillmentItem];

  // 3. Mark backorder as FULFILLED
  const updatedBackorders = currentBackorders.map(bo => {
    if (bo.id === openBackorder.id) {
      return {
        ...bo,
        quantityPending: 0,
        status: 'FULFILLED',
        fulfilledAt: new Date().toISOString()
      };
    }
    return bo;
  });

  // 4. Update fulfillment order to FULFILLED
  const updatedFulfillmentOrders = currentFulfillmentOrders.map(fo => {
    if (fo.orderId === orderId || fo.id === foId) {
      const prevFulfilled = Number(fo.fulfilledQty) || 0;
      const prevShipments = Number(fo.totalShipments) || 0;
      const prevCost = Number(fo.shippingCost) || 0;
      return {
        ...fo,
        status: 'FULFILLED',
        totalShipments: prevShipments + 1,
        shippingCost: prevCost + (wh?.shippingCostBase || 180),
        fulfilledQty: prevFulfilled + pendingQty,
        pendingQty: 0,
        backorderQty: 0,
        updatedAt: new Date().toISOString()
      };
    }
    return fo;
  });

  const auditEvent = createAuditEvent(
    'Fulfillment',
    orderId,
    'CONSOLIDATE_BACKORDER',
    `Consolidated remaining backorder of ${pendingQty} units from ${wh?.name || availableInv.warehouseId}. Status marked FULFILLED.`,
    actor
  );

  return {
    inventory: updatedInventory,
    fulfillmentOrders: updatedFulfillmentOrders,
    fulfillmentItems: updatedFulfillmentItems,
    backorders: updatedBackorders,
    auditEvent
  };
};
