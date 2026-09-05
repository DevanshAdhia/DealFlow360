/**
 * DealFlow360 — Recommendation Rules Engine (Phase 4 — Rule-Based)
 *
 * Architecture is AI-ready: replace getRecommendations() with an API call to
 * a recommendation model without changing any consumer component.
 *
 * Rule types:
 *   UPSELL     → Suggest a better version of the same product in the cart
 *   CROSS_SELL → Suggest related/complementary products
 */

// ─── Upsell Rules ─────────────────────────────────────────────────
// "If cartContains sourceId, suggest targetId as an upgrade"
const UPSELL_RULES = [
  {
    sourceId:  'P-002',   // Business Laptop Basic
    targetId:  'P-001',   // Business Laptop Pro
    reason:    'Better performance, larger storage — ideal for power users',
    priceImpact: '+₹27,000',
    isReplace: true,      // replacing existing cart item
  },
  {
    sourceId:  'P-006',   // Cloud Storage Plan
    targetId:  'P-012',   // Backup & Disaster Recovery
    reason:    'Full disaster recovery adds geo-redundancy + guaranteed RTO',
    priceImpact: '+₹36,000',
    isReplace: false,
  },
];

// ─── Cross-sell Rules ─────────────────────────────────────────────
// "If cartContains any of triggerIds, recommend products in recommendIds"
const CROSS_SELL_RULES = [
  {
    triggerIds:     ['P-001', 'P-002'],    // Laptop (Pro or Basic)
    recommendIds:   ['P-003', 'P-004', 'P-008', 'P-007'],
    reasons: {
      'P-003': 'Pair with a 4K monitor for a dual-screen productivity setup',
      'P-004': 'Wireless keyboard & mouse to complete the workstation',
      'P-008': 'Extended warranty protects your hardware investment',
      'P-007': 'IT Support ensures maximum uptime for deployed laptops',
    },
  },
  {
    triggerIds:     ['P-005'],             // Enterprise CRM License
    recommendIds:   ['P-006', 'P-010', 'P-007', 'P-012'],
    reasons: {
      'P-006': 'Cloud storage for CRM attachments and customer documents',
      'P-010': 'Security suite protects sensitive CRM customer data',
      'P-007': 'IT support for CRM administration and user onboarding',
      'P-012': 'Backup & recovery for critical CRM data continuity',
    },
  },
  {
    triggerIds:     ['P-009'],             // Network Router
    recommendIds:   ['P-010', 'P-007', 'P-011'],
    reasons: {
      'P-010': 'Security software protects the enterprise network perimeter',
      'P-007': 'IT support for router management and monitoring',
      'P-011': 'Professional installation ensures optimal router configuration',
    },
  },
  {
    triggerIds:     ['P-005', 'P-010'],    // CRM or Security
    recommendIds:   ['P-012'],
    reasons: {
      'P-012': 'Disaster recovery ensures business continuity for critical software systems',
    },
  },
  {
    triggerIds:     ['P-003'],             // 4K Monitor
    recommendIds:   ['P-004', 'P-001'],
    reasons: {
      'P-004': 'Upgrade to wireless peripherals to match your premium monitor',
      'P-001': 'Pair with a Business Laptop Pro for a complete power workstation',
    },
  },
  {
    triggerIds:     ['P-011'],             // Installation Service
    recommendIds:   ['P-007', 'P-008'],
    reasons: {
      'P-007': 'Post-installation IT support to maintain your setup long-term',
      'P-008': 'Extended warranty gives coverage after installation is complete',
    },
  },
];

/**
 * Tier-based recommendation boost: Platinum/Gold customers get premium suggestions.
 */
const TIER_BOOST = {
  Platinum: ['P-001', 'P-005', 'P-010', 'P-012'],
  Gold:     ['P-001', 'P-007'],
  Silver:   ['P-008'],
  Standard: [],
};

/**
 * Main recommendation engine.
 *
 * @param {Array}  cartItems        - Current cart items (must have .id or .productId)
 * @param {string} customerTier     - 'Standard' | 'Silver' | 'Gold' | 'Platinum'
 * @param {string} customerIndustry - e.g. 'Technology', 'Manufacturing'
 * @returns {{ upsells: Array, crossSells: Array }}
 *
 * NOTE: Signature is AI-ready — future AI engine can accept same params.
 */
export const getRecommendations = (cartItems = [], customerTier = 'Standard', customerIndustry = '') => {
  const cartProductIds = cartItems.map(i => i.productId || i.id).filter(Boolean);

  // ── UPSELL ──────────────────────────────────────────────────────
  const upsells = [];
  for (const rule of UPSELL_RULES) {
    if (cartProductIds.includes(rule.sourceId) && !cartProductIds.includes(rule.targetId)) {
      upsells.push({
        type: 'upsell',
        sourceProductId: rule.sourceId,
        targetProductId: rule.targetId,
        reason: rule.reason,
        priceImpact: rule.priceImpact,
        isReplace: rule.isReplace,
      });
    }
  }

  // ── CROSS-SELL ───────────────────────────────────────────────────
  const crossSellMap = new Map(); // productId → { reason }
  for (const rule of CROSS_SELL_RULES) {
    const triggered = rule.triggerIds.some(tid => cartProductIds.includes(tid));
    if (!triggered) continue;
    for (const recId of rule.recommendIds) {
      if (!cartProductIds.includes(recId) && !crossSellMap.has(recId)) {
        const triggerName = rule.triggerIds.find(tid => cartProductIds.includes(tid));
        crossSellMap.set(recId, {
          type: 'cross_sell',
          targetProductId: recId,
          reason: rule.reasons[recId] || 'Frequently purchased together',
          triggeredBy: triggerName,
        });
      }
    }
  }

  // Tier boost — surface premium items for Gold/Platinum customers
  const tierBoost = TIER_BOOST[customerTier] || [];
  for (const boostedId of tierBoost) {
    if (!cartProductIds.includes(boostedId) && !crossSellMap.has(boostedId)) {
      crossSellMap.set(boostedId, {
        type: 'cross_sell',
        targetProductId: boostedId,
        reason: `Recommended for ${customerTier} tier customers in your industry`,
        triggeredBy: 'tier_boost',
      });
    }
  }

  const crossSells = Array.from(crossSellMap.values()).slice(0, 6); // max 6 cross-sell

  return { upsells, crossSells };
};

/**
 * Lookup recommendation product details from the full products list.
 * Merges rule metadata with product catalog data.
 */
export const hydrateRecommendations = (recommendations, allProducts = []) => {
  const productMap = Object.fromEntries(allProducts.map(p => [p.id, p]));

  const hydrate = (rec) => {
    const product = productMap[rec.targetProductId];
    if (!product) return null;
    return { ...rec, product };
  };

  return {
    upsells:    recommendations.upsells.map(hydrate).filter(Boolean),
    crossSells: recommendations.crossSells.map(hydrate).filter(Boolean),
  };
};
