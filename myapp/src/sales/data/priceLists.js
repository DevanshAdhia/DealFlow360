// DealFlow360 — Price Lists & Price List Items (Admin-Configured Mock Data)

export const PRICE_LISTS = [
  {
    id: "PL-ENT",
    code: "PL_ENTERPRISE_GLOBAL",
    name: "Enterprise Global Strategic Book",
    currency: "INR",
    type: "Tier-Based",
    customerTierId: "TIER-001",
    status: "ACTIVE",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    multiplier: 0.85, // 15% wholesale discount
    description: "Preferred corporate pricing for strategic enterprise tier accounts."
  },
  {
    id: "PL-MID",
    code: "PL_MIDMARKET_REGIONAL",
    name: "Mid-Market Growth Book",
    currency: "INR",
    type: "Tier-Based",
    customerTierId: "TIER-002",
    status: "ACTIVE",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    multiplier: 0.92, // 8% wholesale discount
    description: "Standard mid-market volume pricing across all service packages."
  },
  {
    id: "PL-STD",
    code: "PL_STANDARD_COMMERCIAL",
    name: "Standard Commercial MSRP Book",
    currency: "INR",
    type: "Standard",
    customerTierId: "TIER-003",
    status: "ACTIVE",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    multiplier: 1.00, // standard MSRP
    description: "Standard published commercial price list without pre-negotiated tier concession."
  }
];

// Price list items with custom overrides or volume break rules
export const PRICE_LIST_ITEMS = [
  // Enterprise Book overrides
  {
    id: "PLI-001",
    priceListId: "PL-ENT",
    productId: "PROD-001",
    customPrice: 2720, // Base 3200 * 0.85
    minQuantity: 10,
    volumeDiscountRate: 15
  },
  {
    id: "PLI-002",
    priceListId: "PL-ENT",
    productId: "PROD-002",
    customPrice: 157250, // Base 185000 * 0.85
    minQuantity: 2,
    volumeDiscountRate: 10
  },
  {
    id: "PLI-003",
    priceListId: "PL-ENT",
    productId: "PROD-003",
    customPrice: 637500, // Base 750000 * 0.85
    minQuantity: 1,
    volumeDiscountRate: 12
  },
  // Mid-Market Book overrides
  {
    id: "PLI-004",
    priceListId: "PL-MID",
    productId: "PROD-001",
    customPrice: 2944, // Base 3200 * 0.92
    minQuantity: 5,
    volumeDiscountRate: 8
  },
  {
    id: "PLI-005",
    priceListId: "PL-MID",
    productId: "PROD-002",
    customPrice: 170200, // Base 185000 * 0.92
    minQuantity: 1,
    volumeDiscountRate: 5
  },
  // Standard Book (MSRP)
  {
    id: "PLI-006",
    priceListId: "PL-STD",
    productId: "PROD-001",
    customPrice: 3200,
    minQuantity: 1,
    volumeDiscountRate: 0
  }
];

export const getPriceListById = (id) => {
  return PRICE_LISTS.find(pl => pl.id === id) || PRICE_LISTS[2];
};

export const getPriceForProductInTier = (productId, basePrice, tierId) => {
  const priceList = PRICE_LISTS.find(pl => pl.customerTierId === tierId) || PRICE_LISTS[2];
  const itemOverride = PRICE_LIST_ITEMS.find(
    pli => pli.priceListId === priceList.id && pli.productId === productId
  );
  if (itemOverride && itemOverride.customPrice) {
    return Math.round(itemOverride.customPrice);
  }
  return Math.round(basePrice * priceList.multiplier);
};
