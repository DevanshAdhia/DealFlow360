import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

// Seed data initialized for fulfillment operations
const WAREHOUSES_DATA = [
  { id: 'WH-BOM-01', name: 'Mumbai Central Logistics Hub', location_code: 'WH-BOM-01', city: 'Mumbai', is_active: true },
  { id: 'WH-DEL-01', name: 'Delhi National Capital Depot', location_code: 'WH-DEL-01', city: 'Delhi', is_active: true },
  { id: 'WH-BLR-01', name: 'Bangalore Silicon Valley Hub', location_code: 'WH-BLR-01', city: 'Bangalore', is_active: true }
];

const CUSTOMERS_DATA = [
  { id: 'CUST-0001', companyName: 'Acme Global Ltd', name: 'Acme Global Ltd', contactPerson: 'John Carter', email: 'contact@acmeglobal.com' },
  { id: 'CUST-0002', companyName: 'Nexus Tech Systems', name: 'Nexus Tech Systems', contactPerson: 'Priya Patel', email: 'contact@nexustech.com' },
  { id: 'CUST-0003', companyName: 'Stark Enterprises', name: 'Stark Enterprises', contactPerson: 'Tony Stark', email: 'contact@stark.com' }
];

const ORDERS_DATA = [
  { id: 'SO-1042', orderNumber: 'ORD-2026-1042', customerId: 'CUST-0001', quotationId: 'Q-1042', status: 'ALLOCATED', totalAmount: 4850000, createdAt: '2026-09-01T10:00:00Z' },
  { id: 'SO-1041', orderNumber: 'ORD-2026-1041', customerId: 'CUST-0002', quotationId: 'Q-1041', status: 'FULFILLED', totalAmount: 2400000, createdAt: '2026-08-28T14:30:00Z' },
  { id: 'SO-1040', orderNumber: 'ORD-2026-1040', customerId: 'CUST-0003', quotationId: 'Q-1040', status: 'PARTIAL', totalAmount: 8900000, createdAt: '2026-08-25T11:15:00Z' },
  { id: 'SO-101',  orderNumber: 'ORD-2026-101',  customerId: 'CUST-0001', quotationId: 'Q-101',  status: 'ALLOCATED', totalAmount: 1750000, createdAt: '2026-08-20T09:00:00Z' }
];

const ORDER_ITEMS_DATA = [
  { id: 'OI-1', orderId: 'SO-1042', productId: 'SKU-SYS-001', productName: 'Dell PowerEdge R750 Server', quantity: 5, unitPrice: 7925, total: 39625 },
  { id: 'OI-2', orderId: 'SO-1042', productId: 'SKU-SYS-002', productName: 'Cisco Catalyst 9300 Switch', quantity: 2, unitPrice: 7425, total: 14850 }
];

const FULFILLMENT_ORDERS_DATA = [
  { id: 'FO-1042', orderId: 'SO-1042', status: 'ALLOCATED', totalShipments: 2, shippingCost: 2500, fulfilledQty: 7, pendingQty: 0, backorderQty: 0 },
  { id: 'FO-1041', orderId: 'SO-1041', status: 'FULFILLED', totalShipments: 1, shippingCost: 1200, fulfilledQty: 2, pendingQty: 0, backorderQty: 0 },
  { id: 'FO-1040', orderId: 'SO-1040', status: 'PARTIAL', totalShipments: 1, shippingCost: 3400, fulfilledQty: 10, pendingQty: 5, backorderQty: 5 }
];

const FULFILLMENT_ITEMS_DATA = [];
const BACKORDERS_DATA = [];
const PRODUCTS_DATA = [];
const INVENTORY_DATA = [];

import {
  calculateSuggestedSplit,
  acceptSuggestedSplitAction,
  applyManualOverride,
  consolidateBackorderAction
} from '../services/fulfillmentService.js';
import { simulateRestock as simulateRestockService } from '../services/inventoryService.js';
import { checkRestockMatch } from '../services/backorderService.js';
import { getOrdersAwaitingFulfillment } from '../services/orderService.js';

const FulfillmentContext = createContext();

const getOrSeed = (key, seedData) => {
  const lsKey = `dealflow_${key}`;
  const existing = localStorage.getItem(lsKey);
  if (existing) {
    try { return JSON.parse(existing); } catch(e) {}
  }
  localStorage.setItem(lsKey, JSON.stringify(seedData));
  return JSON.parse(JSON.stringify(seedData));
};

export const FulfillmentProvider = ({ children }) => {
  // Pure React state for all fulfillment entities, synced to localStorage
  const [warehouses, setWarehouses] = useState(() => getOrSeed('warehouses_state', WAREHOUSES_DATA));
  const [inventory, setInventory] = useState(() => getOrSeed('inventory_state', INVENTORY_DATA));
  const [orders, setOrders] = useState(() => getOrSeed('orders_state', ORDERS_DATA));
  const [orderItems, setOrderItems] = useState(() => getOrSeed('orderItems_state', ORDER_ITEMS_DATA));
  const [fulfillmentOrders, setFulfillmentOrders] = useState(() => getOrSeed('fulfillmentOrders_state', FULFILLMENT_ORDERS_DATA));
  const [fulfillmentItems, setFulfillmentItems] = useState(() => getOrSeed('fulfillmentItems_state', FULFILLMENT_ITEMS_DATA));
  const [backorders, setBackorders] = useState(() => getOrSeed('backorders_state', BACKORDERS_DATA));
  const [products, setProducts] = useState(() => getOrSeed('products_state', PRODUCTS_DATA));
  const [customers, setCustomers] = useState(() => getOrSeed('customers_state', CUSTOMERS_DATA));
  const [auditLogs, setAuditLogs] = useState(() => getOrSeed('auditLogs_state', [
    {
      id: 'AUD-INIT-1',
      entityType: 'Fulfillment',
      entityId: 'SO-1042',
      action: 'SYSTEM_INIT',
      comment: 'Fulfillment system initialized from master catalog and seed orders.',
      actor: 'System',
      timestamp: '2026-09-05T09:30:00Z'
    }
  ]));

  // Sync to localStorage
  React.useEffect(() => { localStorage.setItem('dealflow_warehouses_state', JSON.stringify(warehouses)); }, [warehouses]);
  React.useEffect(() => { localStorage.setItem('dealflow_inventory_state', JSON.stringify(inventory)); }, [inventory]);
  React.useEffect(() => { localStorage.setItem('dealflow_orders_state', JSON.stringify(orders)); }, [orders]);
  React.useEffect(() => { localStorage.setItem('dealflow_orderItems_state', JSON.stringify(orderItems)); }, [orderItems]);
  React.useEffect(() => { localStorage.setItem('dealflow_fulfillmentOrders_state', JSON.stringify(fulfillmentOrders)); }, [fulfillmentOrders]);
  React.useEffect(() => { localStorage.setItem('dealflow_fulfillmentItems_state', JSON.stringify(fulfillmentItems)); }, [fulfillmentItems]);
  React.useEffect(() => { localStorage.setItem('dealflow_backorders_state', JSON.stringify(backorders)); }, [backorders]);
  React.useEffect(() => { localStorage.setItem('dealflow_products_state', JSON.stringify(products)); }, [products]);
  React.useEffect(() => { localStorage.setItem('dealflow_customers_state', JSON.stringify(customers)); }, [customers]);
  React.useEffect(() => { localStorage.setItem('dealflow_auditLogs_state', JSON.stringify(auditLogs)); }, [auditLogs]);

  // Backward compatibility fulfillments array for DealHealth, Dashboard, Reports
  const fulfillments = useMemo(() => {
    return orders.map(order => {
      const fo = fulfillmentOrders.find(f => f.orderId === order.id);
      const items = orderItems.filter(oi => oi.orderId === order.id);
      const customer = customers.find(c => c.id === order.customerId);

      let legacyStatus = 'Pending';
      const status = fo?.status || order.status;
      if (status === 'FULFILLED') legacyStatus = 'Fulfilled';
      else if (status === 'BACKORDER') legacyStatus = 'Backordered';
      else if (status === 'PARTIAL' || status === 'PARTIALLY_FULFILLED') legacyStatus = 'Partially Fulfilled';
      else if (status === 'IN_FULFILLMENT' || status === 'ALLOCATED') legacyStatus = 'Processing';

      return {
        id: fo?.id || `FO-${order.id.replace('SO-', '')}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        quotationId: order.quotationId,
        customerName: customer?.companyName || 'Acme Corp',
        status: legacyStatus,
        rawStatus: status,
        totalShipments: fo?.totalShipments || 0,
        shippingCost: fo?.shippingCost || 0,
        fulfilledQty: fo?.fulfilledQty || 0,
        pendingQty: fo?.pendingQty || 0,
        backorderQty: fo?.backorderQty || 0,
        items: items.map(it => ({
          productId: it.productId,
          productName: it.productName,
          requestedQuantity: it.quantity,
          fulfilledQuantity: fo?.fulfilledQty || 0,
          backorderQuantity: fo?.backorderQty || 0,
          allocations: fulfillmentItems.filter(fi => fi.orderItemId === it.id)
        })),
        shipments: []
      };
    });
  }, [orders, fulfillmentOrders, orderItems, customers, fulfillmentItems]);

  // Resolved list for Screen 7
  const awaitingOrders = useMemo(() => {
    return getOrdersAwaitingFulfillment({
      orders,
      fulfillmentOrders,
      fulfillmentItems,
      customers,
      warehouses
    });
  }, [orders, fulfillmentOrders, fulfillmentItems, customers, warehouses]);

  // Compute suggested split for an order
  const getSuggestedSplitForOrder = useCallback((orderId) => {
    const items = orderItems.filter(oi => oi.orderId === orderId);
    return calculateSuggestedSplit(items, inventory, warehouses);
  }, [orderItems, inventory, warehouses]);

  // Accept suggested split
  const acceptSplit = useCallback((orderId, actor = 'Operations Team') => {
    const items = orderItems.filter(oi => oi.orderId === orderId);
    const suggested = calculateSuggestedSplit(items, inventory, warehouses);

    const result = acceptSuggestedSplitAction({
      orderId,
      suggestedSplit: suggested,
      currentInventory: inventory,
      currentFulfillmentOrders: fulfillmentOrders,
      currentFulfillmentItems: fulfillmentItems,
      currentBackorders: backorders,
      warehouses,
      actor
    });

    setInventory(result.inventory);
    setFulfillmentOrders(result.fulfillmentOrders);
    setFulfillmentItems(result.fulfillmentItems);
    setBackorders(result.backorders);
    
    // Sync order status with fulfillment order
    const updatedFO = result.fulfillmentOrders.find(fo => fo.orderId === orderId);
    if (updatedFO) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updatedFO.status } : o));
    }

    if (result.auditEvent) {
      setAuditLogs(prev => [result.auditEvent, ...prev]);
    }

    return result;
  }, [orderItems, inventory, warehouses, fulfillmentOrders, fulfillmentItems, backorders]);

  // Manual Override
  const manualOverride = useCallback((orderId, manualAllocations, actor = 'Operations Team') => {
    const items = orderItems.filter(oi => oi.orderId === orderId);
    const result = applyManualOverride({
      orderId,
      orderItems: items,
      manualAllocations,
      currentInventory: inventory,
      currentFulfillmentOrders: fulfillmentOrders,
      currentFulfillmentItems: fulfillmentItems,
      currentBackorders: backorders,
      warehouses,
      actor
    });

    setInventory(result.inventory);
    setFulfillmentOrders(result.fulfillmentOrders);
    setFulfillmentItems(result.fulfillmentItems);
    setBackorders(result.backorders);

    // Sync order status with fulfillment order
    const updatedFO = result.fulfillmentOrders.find(fo => fo.orderId === orderId);
    if (updatedFO) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updatedFO.status } : o));
    }

    if (result.auditEvent) {
      setAuditLogs(prev => [result.auditEvent, ...prev]);
    }

    return result;
  }, [orderItems, inventory, warehouses, fulfillmentOrders, fulfillmentItems, backorders]);

  // Consolidate Remaining Backorder
  const consolidateRemainingBackorder = useCallback((orderId, actor = 'Operations Team') => {
    const result = consolidateBackorderAction({
      orderId,
      currentInventory: inventory,
      currentFulfillmentOrders: fulfillmentOrders,
      currentFulfillmentItems: fulfillmentItems,
      currentBackorders: backorders,
      warehouses,
      actor
    });

    setInventory(result.inventory);
    setFulfillmentOrders(result.fulfillmentOrders);
    setFulfillmentItems(result.fulfillmentItems);
    setBackorders(result.backorders);

    // Sync order status with fulfillment order
    const updatedFO = result.fulfillmentOrders.find(fo => fo.orderId === orderId);
    if (updatedFO) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updatedFO.status } : o));
    }

    if (result.auditEvent) {
      setAuditLogs(prev => [result.auditEvent, ...prev]);
    }

    return result;
  }, [inventory, fulfillmentOrders, fulfillmentItems, backorders, warehouses]);

  // Restock simulation
  const simulateRestock = useCallback((productId, warehouseId, quantity = 4) => {
    const updated = simulateRestockService(productId, warehouseId, quantity, inventory);
    setInventory(updated);

    const wh = warehouses.find(w => w.id === warehouseId);
    const prod = products.find(p => p.id === productId);
    setAuditLogs(prev => [
      {
        id: `AUD-RESTOCK-${Date.now()}`,
        entityType: 'Inventory',
        entityId: warehouseId,
        action: 'SIMULATE_RESTOCK',
        comment: `Inbound restock of +${quantity} units for ${prod?.name || productId} at ${wh?.name || warehouseId}.`,
        actor: 'Logistics Simulation',
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  }, [inventory, warehouses, products]);

  // Quick scenario switch for SO-1042 (24 vs 30 units) to demonstrate Section 21 & 22
  const setOrderQuantityScenario = useCallback((orderId, newQty) => {
    setOrderItems(prev => prev.map(item => {
      if (item.orderId === orderId && item.productId === 'PROD-007') {
        return {
          ...item,
          quantity: newQty,
          totalPrice: newQty * (item.unitPrice || 125000)
        };
      }
      return item;
    }));

    // Reset fulfillment order to pending state for fresh demo run
    const foId = `FO-${orderId.replace('SO-', '')}`;
    setFulfillmentOrders(prev => prev.map(fo => {
      if (fo.orderId === orderId || fo.id === foId) {
        return {
          ...fo,
          status: 'SPLIT_PENDING',
          totalShipments: 0,
          shippingCost: 0,
          fulfilledQty: 0,
          pendingQty: newQty,
          backorderQty: 0,
          updatedAt: new Date().toISOString()
        };
      }
      return fo;
    }));

    // Reset order status
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SPLIT_PENDING' } : o));

    // Reset backorders for this order
    setBackorders(prev => prev.filter(bo => bo.orderId !== orderId));

    // Reset inventory reserved quantities for PROD-007
    setInventory(prev => prev.map(inv => {
      if (inv.productId === 'PROD-007') {
        return {
          ...inv,
          reservedQty: inv.warehouseId === 'WH-MAIN' ? 3 : 0
        };
      }
      return inv;
    }));

    setAuditLogs(prev => [
      {
        id: `AUD-SCENARIO-${Date.now()}`,
        entityType: 'Order',
        entityId: orderId,
        action: 'SWITCH_SCENARIO',
        comment: `Demo scenario updated: Required quantity set to ${newQty} units.`,
        actor: 'Demo Orchestrator',
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  }, []);

  // Backward compatibility methods
  const getFulfillmentById = useCallback((id) => {
    return fulfillments.find(f => f.id === id || f.orderId === id);
  }, [fulfillments]);

  const getFulfillmentByQuotationId = useCallback((quotationId) => {
    return fulfillments.find(f => f.quotationId === quotationId);
  }, [fulfillments]);

  const createFulfillment = useCallback((quotation) => {
    // When an approved quotation is sent to fulfillment, create an order if not exists
    const orderId = `SO-${quotation.id.replace('QID-', '').padStart(4, '0')}`;
    const existing = orders.find(o => o.id === orderId || o.quotationId === quotation.id);
    if (existing) return getFulfillmentById(existing.id);

    const newOrder = {
      id: orderId,
      orderNumber: orderId,
      quotationId: quotation.id,
      customerId: quotation.customerId || 'CUS-001',
      orderDate: new Date().toISOString(),
      status: 'SPLIT_PENDING',
      totalAmount: quotation.total || 1000000,
      notes: `Order created automatically from Approved Quotation ${quotation.quotationNumber || quotation.id}.`
    };

    const newItems = (quotation.items || []).map((item, idx) => ({
      id: `OI-${orderId.replace('SO-', '')}-${idx + 1}`,
      orderId,
      productId: item.productId || 'PROD-007',
      productName: item.name || 'Laptop Pro 14',
      quantity: item.quantity || 24,
      unitPrice: item.unitPrice || 125000,
      totalPrice: (item.quantity || 24) * (item.unitPrice || 125000)
    }));

    const newFO = {
      id: `FO-${orderId.replace('SO-', '')}`,
      orderId,
      status: 'SPLIT_PENDING',
      totalShipments: 0,
      shippingCost: 0,
      fulfilledQty: 0,
      pendingQty: newItems.reduce((s, it) => s + it.quantity, 0),
      backorderQty: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setOrderItems(prev => [...prev, ...newItems]);
    setFulfillmentOrders(prev => [newFO, ...prev]);

    return {
      id: newFO.id,
      orderId: newOrder.id,
      quotationId: quotation.id,
      status: 'Pending'
    };
  }, [orders, getFulfillmentById]);

  return (
    <FulfillmentContext.Provider value={{
      warehouses,
      inventory,
      orders,
      orderItems,
      fulfillmentOrders,
      fulfillmentItems,
      backorders,
      products,
      customers,
      auditLogs,
      fulfillments,
      awaitingOrders,
      getSuggestedSplitForOrder,
      acceptSplit,
      manualOverride,
      consolidateRemainingBackorder,
      simulateRestock,
      setOrderQuantityScenario,
      getFulfillmentById,
      getFulfillmentByQuotationId,
      createFulfillment
    }}>
      {children}
    </FulfillmentContext.Provider>
  );
};

export const useFulfillment = () => useContext(FulfillmentContext);
