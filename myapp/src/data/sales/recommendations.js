// DealFlow360 — Recommendation Rules (Upsell & Cross-Sell Config)

export const RECOMMENDATION_RULES = [
  {
    id: "REC-001",
    ruleType: "UPSELL",
    title: "Upgrade to 24/7 Priority SLA",
    triggerProductId: "PROD-001", // Cloud DealFlow Enterprise
    recommendedProductId: "PROD-004", // 24/7 Dedicated SLA Support
    reason: "Enterprise SaaS deployment requires 15-min emergency SLA and dedicated TAM.",
    priceImpact: "+₹1,40,000 / yr",
    marginImpact: "+50% margin",
    discountAllowance: 5,
    autoApplyEligible: false
  },
  {
    id: "REC-002",
    ruleType: "CROSS_SELL",
    title: "Security Gateway Hardware Appliance",
    triggerProductId: "PROD-001",
    recommendedProductId: "PROD-002", // Security Gateway Appliance Pro
    reason: "Protect hybrid cloud data transmission with hardware crypto acceleration.",
    priceImpact: "+₹1,85,000 unit",
    marginImpact: "+28% margin",
    discountAllowance: 10,
    autoApplyEligible: false
  },
  {
    id: "REC-003",
    ruleType: "CROSS_SELL",
    title: "Custom ERP Connector & Solutions Pack",
    triggerProductId: "PROD-003", // Global Data Pipeline
    recommendedProductId: "PROD-005", // ERP Connector
    reason: "Integrate ERP & CPQ sync pipelines seamlessly with 40-hr engineering pack.",
    priceImpact: "+₹2,40,000 project",
    marginImpact: "+45% margin",
    discountAllowance: 8,
    autoApplyEligible: false
  },
  {
    id: "REC-004",
    ruleType: "UPSELL",
    title: "Multi-Region Data Pipeline Core Cluster",
    triggerProductId: "PROD-002", // Security Gateway
    recommendedProductId: "PROD-003", // Data Pipeline
    reason: "Pair security hardware with high-throughput event streaming cluster.",
    priceImpact: "+₹7,50,000 cluster",
    marginImpact: "+40% margin",
    discountAllowance: 12,
    autoApplyEligible: false
  }
];

export const getRecommendationsForCart = (cartItems = [], allProducts = []) => {
  if (!cartItems.length) return [];
  const cartProductIds = new Set(cartItems.map(item => item.productId || item.id));

  const matches = [];
  for (const rule of RECOMMENDATION_RULES) {
    // If cart has trigger product, and doesn't already have recommended product
    if (cartProductIds.has(rule.triggerProductId) && !cartProductIds.has(rule.recommendedProductId)) {
      const recProduct = allProducts.find(p => p.id === rule.recommendedProductId);
      if (recProduct) {
        matches.push({
          ...rule,
          product: recProduct
        });
      }
    }
  }
  return matches;
};
