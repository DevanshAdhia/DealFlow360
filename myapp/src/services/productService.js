import { MOCK_PRODUCTS } from '../data/products.js';

const PRODUCTS_SEED = MOCK_PRODUCTS || [];
const CATEGORIES_SEED = [
  { id: 'CAT-001', name: 'Software Subscription', code: 'SW_SUB', defaultGSTRate: 18 },
  { id: 'CAT-002', name: 'Hardware Infrastructure', code: 'HW_INF', defaultGSTRate: 18 },
  { id: 'CAT-003', name: 'Professional Services', code: 'PRO_SVC', defaultGSTRate: 18 },
];
const VARIANTS_SEED = [];
const PRICELISTS_SEED = [];
const PRICELIST_ITEMS_SEED = [];
const CUSTOMER_TIERS_SEED = [];
const INVENTORY_SEED = [];

/**
 * Retrieves all products enriched with category details, variant count, and stock quantity
 */
export const getAllProducts = () => {
  return PRODUCTS_SEED.map(prod => {
    const category = CATEGORIES_SEED.find(c => c.id === prod.categoryId) || {
      id: prod.categoryId,
      name: 'General',
      code: 'GEN'
    };

    const variants = VARIANTS_SEED.filter(v => v.productId === prod.id);
    
    // Sum stock across warehouses
    const stockItems = INVENTORY_SEED.filter(inv => inv.productId === prod.id);
    const quantityOnHand = stockItems.reduce((sum, inv) => sum + (inv.quantityOnHand || inv.inStock || 0), 0);
    const availableQuantity = stockItems.reduce((sum, inv) => sum + (inv.available || 0), 0);

    // Determine type (ONE_TIME, RECURRING, BOTH)
    let productType = 'ONE_TIME';
    if (prod.isSubscription) {
      productType = 'RECURRING';
    } else if (category.code === 'SW_SUB' || category.code === 'PLAT_CORE') {
      productType = 'BOTH';
    }

    return {
      ...prod,
      categoryName: category.name,
      categoryCode: category.code,
      variantsCount: variants.length,
      quantityOnHand: quantityOnHand || prod.defaultQty || 25,
      availableQuantity: availableQuantity || prod.defaultQty || 25,
      productType,
      status: 'ACTIVE'
    };
  });
};

/**
 * Resolves full relational detail for a single product by ID
 */
export const getProductById = (productId) => {
  if (!productId) return null;

  const product = PRODUCTS_SEED.find(p => p.id === productId || p.productCode === productId);
  if (!product) return null;

  const category = CATEGORIES_SEED.find(c => c.id === product.categoryId) || {
    id: product.categoryId,
    name: 'General Commercial',
    code: 'GEN'
  };

  const variants = VARIANTS_SEED.filter(v => v.productId === product.id);

  // Price List items matching this product
  const matchingPriceListItems = PRICELIST_ITEMS_SEED.filter(pli => pli.productId === product.id);
  const priceRules = PRICELISTS_SEED.map(pl => {
    const tier = CUSTOMER_TIERS_SEED.find(t => t.id === pl.customerTierId) || {
      name: pl.name,
      tierCode: 'STANDARD'
    };

    const specificItem = matchingPriceListItems.find(pli => pli.priceListId === pl.id);
    const calculatedPrice = specificItem?.customPrice ?? Math.round(product.unitPrice * (pl.multiplier || 1));
    const minQty = specificItem?.minQuantity ?? 1;

    return {
      priceListId: pl.id,
      priceListName: pl.name,
      tier: tier.name,
      tierCode: tier.tierCode,
      currency: pl.currency || 'INR',
      multiplier: pl.multiplier,
      unitPrice: calculatedPrice,
      priceRule: specificItem ? `Custom Fixed (Min Qty: ${minQty})` : `${Math.round((pl.multiplier || 1) * 100)}% of Base MSRP`,
      minQuantity: minQty
    };
  });

  // Calculate stock on hand
  const stockItems = INVENTORY_SEED.filter(inv => inv.productId === product.id);
  const quantityOnHand = stockItems.reduce((sum, inv) => sum + (inv.quantityOnHand || inv.inStock || 0), 0) || product.defaultQty || 50;

  return {
    ...product,
    categoryName: category.name,
    categoryCode: category.code,
    variants,
    priceRules,
    quantityOnHand,
    gstRate: product.gstRate || category.defaultGSTRate || 18,
    recurringCycle: product.isSubscription ? (product.unit?.includes('Month') ? 'Monthly' : 'Annual') : 'N/A',
    status: 'ACTIVE'
  };
};

export const getProductCategories = () => CATEGORIES_SEED;
export const getProductPriceLists = () => PRICELISTS_SEED;
