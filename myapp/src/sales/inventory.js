import PRODUCTS_DATA from './products.json';

// Generate inventory randomly across WH-A, WH-B, WH-C
const WAREHOUSE_IDS = ["WH-A", "WH-B", "WH-C"];

export const INITIAL_INVENTORY = PRODUCTS_DATA.flatMap(product => {
  return WAREHOUSE_IDS.map(whId => {
    // Generate some random stock levels for demo purposes
    // WH-A has more stock typically
    const baseStock = whId === 'WH-A' ? 20 : 10;
    const randomOffset = Math.floor(Math.random() * 15);
    
    return {
      id: `INV-${product.id}-${whId}`,
      productId: product.id,
      productName: product.name,
      warehouseId: whId,
      availableQuantity: baseStock + randomOffset,
      reservedQuantity: Math.floor(Math.random() * 5),
      incomingQuantity: Math.floor(Math.random() * 10),
      reorderLevel: 5
    };
  });
});
