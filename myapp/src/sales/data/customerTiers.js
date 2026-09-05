// DealFlow360 — Customer Tiers Configuration (Admin-Configured Mock Data)

export const CUSTOMER_TIERS = [
  {
    id: "TIER-001",
    tierCode: "TIER_ENTERPRISE",
    name: "Enterprise Platinum",
    badgeColor: "#4F46E5",
    badgeBg: "#EEF2FF",
    priceListId: "PL-ENT",
    maxRepDiscount: 20, // Max discount a Sales Rep can offer without approval
    volumeDiscountRate: 15,
    minDealSize: 500000,
    paymentTermsAllowed: ["Net 15", "Net 30", "Net 45", "Net 60"],
    defaultPaymentTerms: "Net 45",
    slaLevel: "24/7 Dedicated Priority (15-min response)",
    creditLimit: 5000000,
    requiresApprovalAbove: 20, // Discount > 20% requires Manager approval
    pricingMultiplier: 0.85, // 15% automatic wholesale discount from base
    description: "Global corporate accounts with multi-year contract commitments and dedicated account management."
  },
  {
    id: "TIER-002",
    tierCode: "TIER_MIDMARKET",
    name: "Mid-Market Silver",
    badgeColor: "#0284C7",
    badgeBg: "#E0F2FE",
    priceListId: "PL-MID",
    maxRepDiscount: 12,
    volumeDiscountRate: 8,
    minDealSize: 150000,
    paymentTermsAllowed: ["Net 15", "Net 30"],
    defaultPaymentTerms: "Net 30",
    slaLevel: "Business Hours Priority (1-hour response)",
    creditLimit: 2000000,
    requiresApprovalAbove: 12,
    pricingMultiplier: 0.92, // 8% wholesale discount from base
    description: "Growing commercial enterprises scaling operations and multi-team software deployments."
  },
  {
    id: "TIER-003",
    tierCode: "TIER_STANDARD",
    name: "Commercial Standard",
    badgeColor: "#64748B",
    badgeBg: "#F1F5F9",
    priceListId: "PL-STD",
    maxRepDiscount: 5,
    volumeDiscountRate: 0,
    minDealSize: 0,
    paymentTermsAllowed: ["Immediate", "Net 15", "Net 30"],
    defaultPaymentTerms: "Net 30",
    slaLevel: "Standard Support SLA (24-hour response)",
    creditLimit: 500000,
    requiresApprovalAbove: 5,
    pricingMultiplier: 1.00, // Standard base catalog price
    description: "Standard business accounts with transactional or pilot software & hardware orders."
  }
];

export const getCustomerTierById = (tierId) => {
  return CUSTOMER_TIERS.find(t => t.id === tierId) || CUSTOMER_TIERS[2]; // Default to Standard
};
