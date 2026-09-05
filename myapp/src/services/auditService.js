/**
 * DealFlow360 - Audit Service
 * Generates audit events for fulfillment, inventory, and order transitions
 */

export const createAuditEvent = (
  entityType = 'Fulfillment',
  entityId = '',
  action = '',
  comment = '',
  actor = 'System'
) => {
  return {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    entityType,
    entityId,
    action,
    comment,
    actor,
    timestamp: new Date().toISOString()
  };
};
