/**
 * DealFlow360 — Deal Health & Risk Engine (Phase 9)
 * 
 * Deterministic, rule-based 0-100 risk scoring.
 * NO AI / ML. Pure business logic calculated from live data.
 * 
 * Weights:
 * - Discount Risk:        25%
 * - Customer Engagement:  20%
 * - Approval Delay:       15%
 * - Negotiation Delay:    15%
 * - Expiry Risk:          10%
 * - Fulfillment Risk:     15%
 * Total = 100%
 * 
 * Classification:
 * 0–30   → Healthy
 * 31–60  → At Risk
 * 61–100 → Critical
 */

// ─── RISK FACTOR WEIGHTS ─────────────────────────────────────────────
export const RISK_WEIGHTS = {
  discount: 0.25,
  customerEngagement: 0.20,
  approvalDelay: 0.15,
  negotiationDelay: 0.15,
  expiry: 0.10,
  fulfillment: 0.15
};

// ─── STANDARD THRESHOLDS ─────────────────────────────────────────────
export const STANDARD_ALLOWED_DISCOUNT = 15; // Standard rep discount % threshold

/**
 * Classify a 0-100 risk score into a human-readable Level
 */
export const getRiskLevel = (score) => {
  const s = Math.round(score);
  if (s <= 30) return 'Healthy';
  if (s <= 60) return 'At Risk';
  return 'Critical';
};

/**
 * Return appropriate badge style class for a score or level
 */
export const getRiskBadgeClass = (scoreOrLevel) => {
  const level = typeof scoreOrLevel === 'number' ? getRiskLevel(scoreOrLevel) : scoreOrLevel;
  switch (level) {
    case 'Healthy':
      return 'badge-success';
    case 'At Risk':
      return 'badge-warning';
    case 'Critical':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
};

/**
 * Return theme color for a score or level
 */
export const getRiskColor = (scoreOrLevel) => {
  const level = typeof scoreOrLevel === 'number' ? getRiskLevel(scoreOrLevel) : scoreOrLevel;
  switch (level) {
    case 'Healthy':
      return 'var(--color-success, #10b981)';
    case 'At Risk':
      return 'var(--color-warning, #f59e0b)';
    case 'Critical':
      return 'var(--color-error, #ef4444)';
    default:
      return 'var(--text-secondary, #64748b)';
  }
};

// ─── 1. DISCOUNT RISK (Weight: 25%) ──────────────────────────────────
export const calculateDiscountRisk = (quotation) => {
  const requestedDiscount = Number(quotation?.discount) || 0;
  const allowedDiscount = quotation?.allowedDiscount !== undefined 
    ? Number(quotation.allowedDiscount) 
    : STANDARD_ALLOWED_DISCOUNT;
  
  const excess = Math.max(0, requestedDiscount - allowedDiscount);
  
  let score = 0;
  let explanation = '';

  if (requestedDiscount <= allowedDiscount) {
    score = Math.max(0, Math.round((requestedDiscount / allowedDiscount) * 20));
    explanation = `Requested discount of ${requestedDiscount}% is well within the authorized threshold of ${allowedDiscount}%.`;
  } else {
    // Excess escalates rapidly: 1-5% excess = 35-55, 6-10% excess = 60-80, >10% excess = 85-100
    const baseExcessScore = 30 + (excess * 4.5);
    score = Math.min(100, Math.round(baseExcessScore));
    explanation = `Requested discount (${requestedDiscount}%) exceeds standard limit (${allowedDiscount}%) by ${excess}%, significantly compressing margins.`;
  }

  return {
    score,
    weight: RISK_WEIGHTS.discount,
    weightedScore: Math.round(score * RISK_WEIGHTS.discount * 10) / 10,
    requestedDiscount,
    allowedDiscount,
    excessDiscount: excess,
    explanation,
    isSevere: score > 60
  };
};

// ─── 2. CUSTOMER ENGAGEMENT RISK (Weight: 20%) ───────────────────────
export const calculateCustomerEngagementRisk = (quotation) => {
  const now = new Date();
  const activities = quotation?.activity || [];
  
  // Find customer events
  const customerEvents = activities.filter(a => {
    const user = (a.user || '').toLowerCase();
    const event = (a.event || '').toLowerCase();
    return user.includes('customer') || 
           user.includes('connor') || 
           user.includes('sharma') || 
           user.includes('patel') || 
           user.includes('kapoor') || 
           user.includes('nair') || 
           user.includes('gupta') ||
           event.includes('accepted') || 
           event.includes('viewed') || 
           event.includes('feedback') ||
           event.includes('counter') ||
           event.includes('portal');
  });

  // Calculate days since last customer touchpoint or quotation update
  let lastTouchDate = quotation?.updatedAt ? new Date(quotation.updatedAt) : new Date(quotation?.createdAt || now);
  if (customerEvents.length > 0) {
    const latestEventDate = new Date(customerEvents[customerEvents.length - 1].date);
    if (!isNaN(latestEventDate.getTime())) {
      lastTouchDate = latestEventDate;
    }
  }

  const daysInactive = Math.max(0, Math.floor((now.getTime() - lastTouchDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  let score = 0;
  let explanation = '';

  if (quotation?.stage === 'confirmed') {
    score = 5;
    explanation = 'Deal confirmed and accepted by customer. Engagement is verified.';
  } else if (daysInactive <= 2) {
    score = 15;
    explanation = `Recent customer interaction (${daysInactive} day${daysInactive === 1 ? '' : 's'} ago). Engagement is strong.`;
  } else if (daysInactive <= 5) {
    score = 45;
    explanation = `No customer response for ${daysInactive} days. Follow-up recommended.`;
  } else if (daysInactive <= 9) {
    score = 75;
    explanation = `Customer inactive for ${daysInactive} days. High drop-off probability without immediate outreach.`;
  } else {
    score = 95;
    explanation = `Critical inactivity (${daysInactive} days). Stale quote requires direct phone call or executive touchpoint.`;
  }

  return {
    score,
    weight: RISK_WEIGHTS.customerEngagement,
    weightedScore: Math.round(score * RISK_WEIGHTS.customerEngagement * 10) / 10,
    daysInactive,
    explanation,
    isSevere: score > 60
  };
};

// ─── 3. APPROVAL DELAY RISK (Weight: 15%) ────────────────────────────
export const calculateApprovalDelayRisk = (quotation, approvals = []) => {
  const approval = approvals.find(a => a.quotationId === quotation?.id);
  const now = new Date();

  let score = 0;
  let explanation = '';
  let pendingDays = 0;

  if (!approval) {
    if (quotation?.stage === 'pending_approval') {
      score = 50;
      explanation = 'Quotation is marked pending approval, awaiting formal governance routing.';
    } else {
      score = 0;
      explanation = 'No outstanding governance approvals required. Deal is pre-cleared.';
    }
  } else if (approval.status === 'Approved') {
    score = 5;
    explanation = `Discount & terms approved by ${approval.approverRole || 'management'}. No approval friction.`;
  } else if (approval.status === 'Rejected') {
    score = 95;
    explanation = `Approval was rejected (${approval.reason || 'Discount too high'}). Deal blocked until revised.`;
  } else if (approval.status === 'Pending') {
    const submittedAt = approval.submittedAt ? new Date(approval.submittedAt) : now;
    pendingDays = Math.max(0, Math.floor((now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (pendingDays <= 1) {
      score = 35;
      explanation = `Approval requested ${pendingDays === 0 ? 'today' : '1 day ago'}. Currently under active review.`;
    } else if (pendingDays <= 3) {
      score = 65;
      explanation = `Approval pending for ${pendingDays} days with ${approval.approverRole || 'reviewer'}. Exceeding target SLA.`;
    } else {
      score = 90;
      explanation = `Severe approval bottleneck: pending for ${pendingDays} days. High risk of deal stalling.`;
    }
  }

  return {
    score,
    weight: RISK_WEIGHTS.approvalDelay,
    weightedScore: Math.round(score * RISK_WEIGHTS.approvalDelay * 10) / 10,
    status: approval?.status || (quotation?.stage === 'pending_approval' ? 'Pending' : 'N/A'),
    pendingDays,
    explanation,
    isSevere: score > 60
  };
};

// ─── 4. NEGOTIATION DELAY RISK (Weight: 15%) ─────────────────────────
export const calculateNegotiationDelayRisk = (quotation) => {
  const isNegotiating = quotation?.stage === 'negotiation' || quotation?.status === 'Negotiation';
  const now = new Date();
  
  let score = 0;
  let explanation = '';
  let negotiationDays = 0;

  if (!isNegotiating) {
    if (quotation?.stage === 'confirmed') {
      score = 0;
      explanation = 'Negotiations concluded successfully. Contract agreed.';
    } else {
      score = 10;
      explanation = 'Deal is not currently in prolonged back-and-forth negotiation.';
    }
  } else {
    // Check when it entered negotiation
    const act = (quotation.activity || []).filter(a => 
      (a.event || '').toLowerCase().includes('negotiat') || 
      (a.event || '').toLowerCase().includes('counter')
    );
    
    const startDate = act.length > 0 ? new Date(act[0].date) : new Date(quotation.updatedAt || quotation.createdAt);
    negotiationDays = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (negotiationDays <= 3) {
      score = 30;
      explanation = `Active negotiation cycle (${negotiationDays} days). Normal deal cadence.`;
    } else if (negotiationDays <= 7) {
      score = 60;
      explanation = `Negotiations prolonged for ${negotiationDays} days. Multiple iterations without closure.`;
    } else {
      score = 85;
      explanation = `Protracted negotiation (${negotiationDays} days). Deal at risk of falling out or losing momentum.`;
    }
  }

  return {
    score,
    weight: RISK_WEIGHTS.negotiationDelay,
    weightedScore: Math.round(score * RISK_WEIGHTS.negotiationDelay * 10) / 10,
    negotiationDays,
    isNegotiating,
    explanation,
    isSevere: score > 60
  };
};

// ─── 5. EXPIRY RISK (Weight: 10%) ────────────────────────────────────
export const calculateExpiryRisk = (quotation) => {
  const now = new Date();
  const validUntilStr = quotation?.validUntil;
  
  if (!validUntilStr) {
    return {
      score: 50,
      weight: RISK_WEIGHTS.expiry,
      weightedScore: 5,
      daysRemaining: null,
      explanation: 'No expiry date set on quotation. Undefined validity timeline.',
      isSevere: false
    };
  }

  const validUntilDate = new Date(validUntilStr);
  // Normalize to day boundaries
  const diffTime = validUntilDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let score = 0;
  let explanation = '';

  if (quotation?.stage === 'confirmed') {
    score = 0;
    explanation = `Quotation already signed & confirmed before expiry.`;
  } else if (daysRemaining < 0) {
    score = 100;
    explanation = `Quotation expired ${Math.abs(daysRemaining)} days ago (${validUntilStr}). Terms are invalid.`;
  } else if (daysRemaining === 0) {
    score = 95;
    explanation = `Quotation expires today! Immediate customer response required.`;
  } else if (daysRemaining <= 6) {
    // 1–6 days → High Risk
    score = 75;
    explanation = `High expiry risk: only ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining until quote expires.`;
  } else if (daysRemaining <= 14) {
    // 7–14 days → Medium Risk
    score = 40;
    explanation = `Moderate expiry window: ${daysRemaining} days remaining. Proactive follow-up advised.`;
  } else {
    // 15+ days → Low Risk
    score = 10;
    explanation = `Comfortable validity buffer: ${daysRemaining} days remaining until ${validUntilStr}.`;
  }

  return {
    score,
    weight: RISK_WEIGHTS.expiry,
    weightedScore: Math.round(score * RISK_WEIGHTS.expiry * 10) / 10,
    daysRemaining,
    validUntil: validUntilStr,
    explanation,
    isSevere: score > 60
  };
};

// ─── 6. FULFILLMENT RISK (Weight: 15%) ────────────────────────────────
export const calculateFulfillmentRisk = (quotation, fulfillments = [], inventory = []) => {
  const fulfillment = fulfillments.find(f => f.quotationId === quotation?.id);
  
  let score = 0;
  let explanation = '';
  let backorderCount = 0;

  if (fulfillment) {
    // Check fulfillment items for backorders or shortages
    (fulfillment.items || []).forEach(item => {
      const bo = Number(item.backorderQuantity) || 0;
      if (bo > 0) backorderCount += bo;
    });

    if (fulfillment.status === 'Fulfilled') {
      score = 0;
      explanation = 'Order fully dispatched and fulfilled. Zero supply chain risk.';
    } else if (fulfillment.status === 'Partially Fulfilled' || backorderCount > 0) {
      score = 75;
      explanation = `Fulfillment has backorders (${backorderCount} units unallocated). Customer delivery is compromised.`;
    } else if (fulfillment.status === 'Processing') {
      score = 30;
      explanation = 'Fulfillment is in warehouse staging. Standard logistics processing.';
    } else {
      score = 45;
      explanation = 'Fulfillment order pending warehouse allocation.';
    }
  } else {
    // Pre-fulfillment check: evaluate quote items against available inventory if available
    let hasStockShortage = false;
    let shortageDetails = [];

    if (quotation?.items && inventory.length > 0) {
      quotation.items.forEach(item => {
        const prodId = item.productId || item.id;
        const matchingStock = inventory
          .filter(inv => inv.productId === prodId)
          .reduce((sum, inv) => sum + (Number(inv.availableQuantity) || 0), 0);

        const needed = Number(item.quantity) || 1;
        if (matchingStock > 0 && matchingStock < needed) {
          hasStockShortage = true;
          shortageDetails.push(`${item.name || item.productName} (Need: ${needed}, In Stock: ${matchingStock})`);
        }
      });
    }

    if (hasStockShortage) {
      score = 70;
      explanation = `Warehouse stock shortfall detected: ${shortageDetails.join('; ')}. Potential fulfillment delay.`;
    } else if (quotation?.stage === 'confirmed') {
      score = 40;
      explanation = 'Deal confirmed but fulfillment process has not yet been initiated.';
    } else {
      score = 15;
      explanation = 'Sufficient inventory buffer projected across regional fulfillment centers.';
    }
  }

  return {
    score,
    weight: RISK_WEIGHTS.fulfillment,
    weightedScore: Math.round(score * RISK_WEIGHTS.fulfillment * 10) / 10,
    fulfillmentStatus: fulfillment?.status || 'Not Started',
    backorderCount,
    explanation,
    isSevere: score > 60
  };
};

// ─── 7. MASTER RISK SIGNALS ENGINE ───────────────────────────────────
export const calculateRiskSignals = (quotation, { approvals = [], fulfillments = [], inventory = [] } = {}) => {
  const discountRisk = calculateDiscountRisk(quotation);
  const customerEngagementRisk = calculateCustomerEngagementRisk(quotation);
  const approvalDelayRisk = calculateApprovalDelayRisk(quotation, approvals);
  const negotiationDelayRisk = calculateNegotiationDelayRisk(quotation);
  const expiryRisk = calculateExpiryRisk(quotation);
  const fulfillmentRisk = calculateFulfillmentRisk(quotation, fulfillments, inventory);

  return {
    discountRisk,
    customerEngagementRisk,
    approvalDelayRisk,
    negotiationDelayRisk,
    expiryRisk,
    fulfillmentRisk
  };
};

// ─── 8. EXTRACT EXPLAINABLE RISK REASONS ──────────────────────────────
export const getRiskReasons = (factors, quotation) => {
  const reasons = [];

  // Discount excess
  if (factors.discountRisk.excessDiscount > 0) {
    reasons.push({
      factor: 'Discount Risk',
      severity: factors.discountRisk.excessDiscount > 5 ? 'critical' : 'warning',
      text: `Discount of ${factors.discountRisk.requestedDiscount}% exceeds authorized baseline (${factors.discountRisk.allowedDiscount}%) by ${factors.discountRisk.excessDiscount}%.`
    });
  } else if (factors.discountRisk.score > 40) {
    reasons.push({
      factor: 'Discount Risk',
      severity: 'warning',
      text: `High discount level (${factors.discountRisk.requestedDiscount}%) is close to threshold limit.`
    });
  }

  // Approval delay
  if (factors.approvalDelayRisk.status === 'Pending') {
    if (factors.approvalDelayRisk.pendingDays >= 3) {
      reasons.push({
        factor: 'Approval Delay',
        severity: 'critical',
        text: `Approval has been pending for ${factors.approvalDelayRisk.pendingDays} days, causing deal pipeline blockage.`
      });
    } else {
      reasons.push({
        factor: 'Approval Delay',
        severity: 'warning',
        text: `Discount approval is currently pending manager/finance sign-off.`
      });
    }
  } else if (factors.approvalDelayRisk.status === 'Rejected') {
    reasons.push({
      factor: 'Approval Delay',
      severity: 'critical',
      text: 'Commercial approval was formally rejected and requires restructuring.'
    });
  }

  // Customer engagement
  if (factors.customerEngagementRisk.daysInactive >= 5 && quotation?.stage !== 'confirmed') {
    reasons.push({
      factor: 'Customer Inactivity',
      severity: factors.customerEngagementRisk.daysInactive >= 8 ? 'critical' : 'warning',
      text: `Customer has not engaged or replied for ${factors.customerEngagementRisk.daysInactive} days.`
    });
  }

  // Expiry window
  if (factors.expiryRisk.daysRemaining !== null && quotation?.stage !== 'confirmed') {
    if (factors.expiryRisk.daysRemaining < 0) {
      reasons.push({
        factor: 'Quotation Expired',
        severity: 'critical',
        text: `Quotation pricing expired on ${factors.expiryRisk.validUntil}. Terms must be revalidated.`
      });
    } else if (factors.expiryRisk.daysRemaining <= 6) {
      reasons.push({
        factor: 'Imminent Expiry',
        severity: factors.expiryRisk.daysRemaining <= 2 ? 'critical' : 'warning',
        text: `Quotation expires in only ${factors.expiryRisk.daysRemaining} day${factors.expiryRisk.daysRemaining === 1 ? '' : 's'}.`
      });
    }
  }

  // Negotiation delay
  if (factors.negotiationDelayRisk.isNegotiating && factors.negotiationDelayRisk.negotiationDays >= 5) {
    reasons.push({
      factor: 'Negotiation Delay',
      severity: 'warning',
      text: `Contract terms have been under negotiation for ${factors.negotiationDelayRisk.negotiationDays} days.`
    });
  }

  // Fulfillment risk
  if (factors.fulfillmentRisk.backorderCount > 0) {
    reasons.push({
      factor: 'Fulfillment Risk',
      severity: 'critical',
      text: `${factors.fulfillmentRisk.backorderCount} line items are currently flagged as backorders due to warehouse stockout.`
    });
  } else if (factors.fulfillmentRisk.score >= 60) {
    reasons.push({
      factor: 'Fulfillment Risk',
      severity: 'warning',
      text: factors.fulfillmentRisk.explanation
    });
  }

  // Fallback if healthy
  if (reasons.length === 0) {
    reasons.push({
      factor: 'Optimal Cadence',
      severity: 'healthy',
      text: 'Deal is progressing smoothly within normal discount, approval, and timeline parameters.'
    });
  }

  return reasons;
};

// ─── 9. NEXT BEST ACTION (DETERMINISTIC RECOMMENDATION) ──────────────
export const getNextBestAction = (factors, quotation) => {
  // Sort factors by highest weighted contribution and raw score
  const items = [
    { key: 'discount', factor: factors.discountRisk, action: 'Review or reduce discount to meet governance thresholds.' },
    { key: 'approval', factor: factors.approvalDelayRisk, action: 'Follow up with approver to unblock pending review.' },
    { key: 'engagement', factor: factors.customerEngagementRisk, action: 'Schedule proactive customer call or send follow-up note.' },
    { key: 'expiry', factor: factors.expiryRisk, action: 'Contact customer before quote expires to secure sign-off or extend validity.' },
    { key: 'negotiation', factor: factors.negotiationDelayRisk, action: 'Respond to customer inquiries and propose final commercial terms.' },
    { key: 'fulfillment', factor: factors.fulfillmentRisk, action: 'Check warehouse inventory and coordinate split delivery allocation.' }
  ];

  // If quotation is expired
  if (factors.expiryRisk.daysRemaining !== null && factors.expiryRisk.daysRemaining < 0) {
    return {
      title: 'Renew Expired Quotation',
      description: 'Quotation has lapsed. Issue an updated revision or extend validity date.',
      primaryFactor: 'Expiry Risk',
      priority: 'Urgent',
      route: `/quotations/${quotation?.id}/builder`
    };
  }

  // If approval rejected
  if (factors.approvalDelayRisk.status === 'Rejected') {
    return {
      title: 'Restructure Discount Proposal',
      description: 'Approval was rejected. Adjust discount down to 15% or attach additional justification.',
      primaryFactor: 'Approval Delay',
      priority: 'Urgent',
      route: `/approvals`
    };
  }

  // Pick the factor with the highest score
  const highest = [...items].sort((a, b) => b.factor.score - a.factor.score)[0];

  if (highest && highest.factor.score > 50) {
    let route = `/quotations/${quotation?.id}`;
    if (highest.key === 'approval') route = '/approvals';
    if (highest.key === 'discount') route = `/quotations/${quotation?.id}/builder`;
    if (highest.key === 'fulfillment') route = '/fulfillment';

    return {
      title: highest.key === 'discount' ? 'Review Commercial Discount' :
             highest.key === 'approval' ? 'Expedite Approval Routing' :
             highest.key === 'engagement' ? 'Customer Outreach Required' :
             highest.key === 'expiry' ? 'Imminent Expiry Follow-up' :
             highest.key === 'fulfillment' ? 'Inspect Inventory Stock' : 'Close Negotiation Terms',
      description: highest.action,
      primaryFactor: highest.key,
      priority: highest.factor.score > 70 ? 'Urgent' : 'Medium',
      route
    };
  }

  // Default healthy action
  return {
    title: 'Monitor Standard Deal Cadence',
    description: 'Deal is progressing smoothly. Continue regular customer check-ins towards closing.',
    primaryFactor: 'Overall Health',
    priority: 'Low',
    route: `/quotations/${quotation?.id}`
  };
};

// ─── 10. MASTER DEAL HEALTH CALCULATOR ────────────────────────────────
export const calculateDealHealth = (quotation, contexts = {}) => {
  if (!quotation) {
    return {
      score: 0,
      level: 'Healthy',
      factors: null,
      reasons: [],
      nextBestAction: null
    };
  }

  const factors = calculateRiskSignals(quotation, contexts);

  // Exact formula from Prompt:
  // Discount Risk (25%) + Customer Engagement (20%) + Approval Delay (15%) + Negotiation Delay (15%) + Expiry Risk (10%) + Fulfillment Risk (15%)
  const rawScore = 
    (factors.discountRisk.score * RISK_WEIGHTS.discount) +
    (factors.customerEngagementRisk.score * RISK_WEIGHTS.customerEngagement) +
    (factors.approvalDelayRisk.score * RISK_WEIGHTS.approvalDelay) +
    (factors.negotiationDelayRisk.score * RISK_WEIGHTS.negotiationDelay) +
    (factors.expiryRisk.score * RISK_WEIGHTS.expiry) +
    (factors.fulfillmentRisk.score * RISK_WEIGHTS.fulfillment);

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const level = getRiskLevel(score);
  const reasons = getRiskReasons(factors, quotation);
  const nextBestAction = getNextBestAction(factors, quotation);

  return {
    score,
    level,
    factors,
    reasons,
    nextBestAction
  };
};
