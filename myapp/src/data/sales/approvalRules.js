// DealFlow360 — Approval Governance Configuration (Admin-Configured Mock Data)

export const APPROVAL_LEVELS = [
  {
    level: 1,
    id: "AL-001",
    role: "sales_manager",
    title: "Sales Manager",
    slaHours: 24,
    description: "Reviews discounts exceeding sales representative tier limits or deals below 35% margin."
  },
  {
    level: 2,
    id: "AL-002",
    role: "finance",
    title: "Finance & RevOps Director",
    slaHours: 48,
    description: "Reviews high-risk escalations: discounts > 20%, low margins < 25%, or total values > ₹25,00,000."
  }
];

export const APPROVAL_RULES = [
  {
    id: "AR-001",
    code: "RULE_TIER_DISCOUNT_LIMIT",
    name: "Tier Discount Limit Exceeded",
    category: "Discount Governance",
    conditionType: "DISCOUNT_OVER_TIER",
    triggerDescription: "Discount exceeds customer tier allowed threshold.",
    approvalLevelRequired: 1,
    severity: "MEDIUM"
  },
  {
    id: "AR-002",
    code: "RULE_EXCESSIVE_DISCOUNT",
    name: "Executive Discount Escalation",
    category: "Executive Governance",
    conditionType: "DISCOUNT_OVER_20",
    triggerDescription: "Requested discount exceeds 20% absolute ceiling.",
    approvalLevelRequired: 2,
    severity: "HIGH"
  },
  {
    id: "AR-003",
    code: "RULE_LOW_MARGIN_GUARDRAIL",
    name: "Low Deal Margin Guardrail",
    category: "Profitability",
    conditionType: "MARGIN_BELOW_25",
    triggerDescription: "Overall deal gross margin drops below 25% minimum hurdle rate.",
    approvalLevelRequired: 2,
    severity: "CRITICAL"
  },
  {
    id: "AR-004",
    code: "RULE_HIGH_VALUE_TRANSACTION",
    name: "High Value Strategic Review",
    category: "Commercial Risk",
    conditionType: "VALUE_OVER_25L",
    triggerDescription: "Total quotation commitment exceeds ₹25,00,000.",
    approvalLevelRequired: 2,
    severity: "MEDIUM"
  }
];

/**
 * Evaluates whether a quotation requires approval based on discount %, margin %, and total amount.
 */
export const evaluateQuotationApproval = (quotation, customerTier = null) => {
  const discount = Number(quotation.discount) || 0;
  const margin = Number(quotation.margin) || 40;
  const total = Number(quotation.total) || 0;
  const maxAllowedDiscount = customerTier ? customerTier.maxRepDiscount : 15;

  const triggeredRules = [];

  if (discount > 20) {
    triggeredRules.push(APPROVAL_RULES[1]); // Excessive discount (Level 2)
  } else if (discount > maxAllowedDiscount) {
    triggeredRules.push(APPROVAL_RULES[0]); // Over Tier limit (Level 1)
  }

  if (margin < 25) {
    triggeredRules.push(APPROVAL_RULES[2]); // Margin below 25% (Level 2)
  }

  if (total > 2500000) {
    triggeredRules.push(APPROVAL_RULES[3]); // Value over 25L (Level 2)
  }

  const isRequired = triggeredRules.length > 0;
  const requiredLevel = isRequired
    ? Math.max(...triggeredRules.map(r => r.approvalLevelRequired))
    : 0;

  const routingRole = requiredLevel === 2 ? 'finance' : requiredLevel === 1 ? 'sales_manager' : null;

  return {
    isApprovalRequired: isRequired,
    requiredLevel,
    routingRole,
    triggeredRules,
    primaryReason: triggeredRules.length > 0 ? triggeredRules[0].triggerDescription : 'No approval required'
  };
};

// Backward-compatibility helpers
export const checkApprovalRequired = (requestedDiscount, allowedDiscount = 15) => {
  return requestedDiscount > allowedDiscount;
};

export const calculateApprovalRisk = (requestedDiscount, allowedDiscount = 15) => {
  if (requestedDiscount <= allowedDiscount) return 0;
  const excess = requestedDiscount - allowedDiscount;
  return Math.min(Math.round(15 + excess * 3), 99);
};

export const getRoutingRole = (riskScore) => {
  if (riskScore <= 30) return null;
  if (riskScore <= 60) return 'sales_manager';
  return 'finance';
};

export const roleLabels = {
  sales_manager: 'Sales Manager',
  finance: 'Finance Director',
  admin: 'System Administrator'
};

export const canReviewApproval = (userRole, targetRole) => {
  if (userRole === 'admin') return true;
  if (userRole === targetRole) return true;
  if (userRole === 'finance' && targetRole === 'sales_manager') return true;
  return false;
};
