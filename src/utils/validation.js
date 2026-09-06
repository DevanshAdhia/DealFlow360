// ─────────────────────────────────────────────
// DealFlow360 — Validation Utilities
// ─────────────────────────────────────────────

export const validateName = (v) => {
  if (!v || !v.trim()) return 'Full name is required'
  if (v.trim().length < 2) return 'Name must be at least 2 characters'
  if (!/[a-zA-Z]/.test(v)) return 'Please enter a valid name'
  return ''
}

export const validateEmail = (v) => {
  if (!v || !v.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Please enter a valid email address'
  return ''
}

export const validatePassword = (v) => {
  if (!v) return 'Password is required'
  if (v.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(v)) return 'At least one uppercase letter required'
  if (!/\d/.test(v)) return 'At least one number required'
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v))
    return 'At least one special character required (!@#$%^&*...)'
  return ''
}

export const validateConfirmPassword = (pw, cpw) => {
  if (!cpw) return 'Please confirm your password'
  if (pw !== cpw) return 'Passwords do not match'
  return ''
}

export const getPasswordStrength = (v) => [
  { label: 'At least 8 characters',  valid: v.length >= 8 },
  { label: 'One uppercase (A–Z)',     valid: /[A-Z]/.test(v) },
  { label: 'One number (0–9)',        valid: /\d/.test(v) },
  { label: 'One special char (!@#…)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(v) },
]

export const getPasswordRequirements = getPasswordStrength
