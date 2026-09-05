/**
 * DealFlow360 - Payment Service
 * Payment recording validation, overpayment prevention, and transaction creation.
 */

/**
 * Validates a payment attempt
 * - Amount must be positive
 * - Amount cannot exceed outstanding balance
 * 
 * @param {number} amount 
 * @param {number} balanceAmount 
 * @returns {{ valid: boolean, error?: string }}
 */
export const validatePayment = (amount, balanceAmount) => {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Payment amount must be greater than zero.' };
  }

  const maxPayable = Number(balanceAmount) || 0;
  if (num > maxPayable) {
    return {
      valid: false,
      error: `Payment amount (₹${num.toLocaleString('en-IN')}) cannot exceed remaining balance of ₹${maxPayable.toLocaleString('en-IN')}.`
    };
  }

  return { valid: true };
};

/**
 * Creates a new runtime payment transaction record
 * @param {Object} data 
 * @returns {Object}
 */
export const createPaymentRecord = ({
  invoiceId,
  amount,
  paymentMethod = 'Bank Transfer',
  transactionReference = '',
  paymentDate = new Date().toISOString(),
  notes = ''
}) => {
  return {
    id: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    invoiceId,
    amount: Number(amount),
    paymentMethod,
    transactionReference: transactionReference || `TXN-${Date.now().toString().slice(-6)}`,
    paymentDate: new Date(paymentDate).toISOString(),
    status: 'SUCCESS',
    notes
  };
};
