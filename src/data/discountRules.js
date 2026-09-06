/**
 * DealFlow360 — Discount Governance Rules
 * Defines per-tier and per-category discount limits.
 * Phase 5 will layer in manager approval thresholds on top.
 */

// ─── Customer Tier Limits ──────────────────────────────────────────
export const TIER_DISCOUNT_LIMITS = {
  Standard:  5,
  Silver:   10,
  Gold:     15,
  Platinum: 20,
};

// ─── Category Discount Limits ──────────────────────────────────────
export const CATEGORY_DISCOUNT_LIMITS = {
  Hardware:     15,
  Software:     12,
  Services:     10,
  Accessories:  15,
  Support:      10,
  Cloud:        12,
  Security:     12,
  Infrastructure: 10,
};

// ─── Risk thresholds ──────────────────────────────────────────────
export const RISK_THRESHOLDS = {
  LOW:    { max: 30, label: 'Low Risk',    color: '#059669' },
  MEDIUM: { max: 60, label: 'Medium Risk', color: '#d97706' },
  HIGH:   { max: 100, label: 'High Risk',  color: '#dc2626' },
};

/**
 * Return the effective maximum discount for a given customer tier + product category.
 * Uses the STRICTER (lower) of the two limits.
 */
export const getEffectiveLimit = (tier = 'Standard', category = 'Hardware') => {
  const tierLimit = TIER_DISCOUNT_LIMITS[tier] ?? 5;
  const catLimit  = CATEGORY_DISCOUNT_LIMITS[category] ?? 10;
  return Math.min(tierLimit, catLimit);
};

/**
 * Evaluate a single line item's discount against governance rules.
 * Returns enriched governance metadata for the line.
 */
export const evaluateLineDiscount = (item, customerTier = 'Standard') => {
  const requestedDiscount = Number(item.discount) || 0;
  const category = item.category || 'Hardware';
  const tierLimit = TIER_DISCOUNT_LIMITS[customerTier] ?? 5;
  const catLimit  = CATEGORY_DISCOUNT_LIMITS[category] ?? 10;
  const effectiveLimit = Math.min(tierLimit, catLimit);
  const exceeded = requestedDiscount - effectiveLimit;
  const isExceeded = exceeded > 0;

  return {
    productId: item.id || item.productId,
    productName: item.name || item.productName || '',
    category,
    tierLimit,
    catLimit,
    effectiveLimit,
    requestedDiscount,
    exceeded: isExceeded ? Math.round(exceeded * 100) / 100 : 0,
    isExceeded,
    status: isExceeded
      ? requestedDiscount > effectiveLimit + 10
        ? 'critical'
        : 'approval_required'
      : requestedDiscount > effectiveLimit * 0.8
        ? 'warning'
        : 'allowed',
  };
};

/**
 * Calculate a blended risk score for the entire quotation (0–100).
 *
 * Factors:
 *  - Number of lines exceeding their limit (weighted 40%)
 *  - Average % deviation across exceeded lines (weighted 40%)
 *  - Margin compression: if margin < 20% add penalty (weighted 20%)
 */
export const calculateRiskScore = (lineEvaluations = [], overallMargin = 50) => {
  if (!lineEvaluations.length) return 0;

  const exceededLines = lineEvaluations.filter(e => e.isExceeded);
  const exceededRatio = exceededLines.length / lineEvaluations.length; // 0–1

  const avgDeviation = exceededLines.length
    ? exceededLines.reduce((sum, e) => sum + e.exceeded, 0) / exceededLines.length
    : 0;

  // Normalize deviation (assume 20% overage = full penalty)
  const deviationScore = Math.min(avgDeviation / 20, 1);

  // Margin penalty: under 20% margin → pressure
  const marginScore = overallMargin < 20 ? (20 - overallMargin) / 20 : 0;

  const raw = (exceededRatio * 40) + (deviationScore * 40) + (marginScore * 20);
  return Math.round(Math.min(raw, 100));
};

/**
 * Return the risk label and color for a given score.
 */
export const getRiskLevel = (score) => {
  if (score <= 30) return { ...RISK_THRESHOLDS.LOW,    score };
  if (score <= 60) return { ...RISK_THRESHOLDS.MEDIUM, score };
  return { ...RISK_THRESHOLDS.HIGH, score };
};

/**
 * Full governance evaluation for an entire quotation.
 * Returns per-line evaluations + blended score + overall status.
 */
export const evaluateQuotationGovernance = (items = [], customerTier = 'Standard', overallMargin = 50) => {
  const lineEvaluations = items.map(item => evaluateLineDiscount(item, customerTier));
  const riskScore = calculateRiskScore(lineEvaluations, overallMargin);
  const riskLevel = getRiskLevel(riskScore);
  const hasExceeded = lineEvaluations.some(e => e.isExceeded);
  const approvalRequired = hasExceeded || riskScore > 60;

  return {
    lineEvaluations,
    riskScore,
    riskLevel,
    approvalRequired,
    discountStatus: !hasExceeded
      ? 'within_limit'
      : approvalRequired
        ? 'approval_required'
        : 'approved',
    tierLimit: TIER_DISCOUNT_LIMITS[customerTier] ?? 5,
    customerTier,
  };
};
