// AuthInput — text/email input with left icon + optional right status icon
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthInput({
  id, name, type = 'text', label, placeholder,
  value, onChange, onBlur,
  icon: Icon, error, touched, success,
  autoComplete, disabled, hasRightIcon = false,
  ...rest
}) {
  const showError   = touched && !!error
  const showSuccess = touched && !error && !!value && success !== false

  let cls = 'auth-input'
  if (showError)   cls += ' is-error'
  if (showSuccess) cls += ' is-success'

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="input-wrap">
        {Icon && (
          <span className="input-icon-left" aria-hidden="true">
            <Icon size={15} strokeWidth={2} />
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          className={cls}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-err` : undefined}
          {...rest}
        />

        {/* Status icon on the right — only when no eye-btn */}
        {!hasRightIcon && (
          <span className="input-icon-right status-icon" aria-hidden="true">
            {showError   && <AlertCircle  size={15} strokeWidth={2} className="icon-error" />}
            {showSuccess && <CheckCircle  size={15} strokeWidth={2} className="icon-success" />}
          </span>
        )}
      </div>

      {showError && (
        <span id={`${id}-err`} className="field-msg field-msg-error" role="alert">
          <AlertCircle size={12} strokeWidth={2.5} /> {error}
        </span>
      )}
    </div>
  )
}
