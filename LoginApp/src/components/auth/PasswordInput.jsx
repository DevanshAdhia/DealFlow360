// PasswordInput — password field with show/hide toggle + status icon
import { useState } from 'react'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function PasswordInput({
  id, name, label, placeholder, value, onChange, onBlur,
  error, touched, autoComplete, disabled,
  showSuccessIcon = false,
}) {
  const [visible, setVisible] = useState(false)

  const showError   = touched && !!error
  const showSuccess = touched && !error && !!value && showSuccessIcon

  let cls = 'auth-input'
  if (showError)   cls += ' is-error'
  if (showSuccess) cls += ' is-success'

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <span className="input-icon-left" aria-hidden="true">
          <Lock size={15} strokeWidth={2} />
        </span>

        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          className={cls}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-err` : undefined}
        />

        <span className="input-icon-right">
          {/* Status icon */}
          {showError   && <span className="icon-error"   aria-hidden="true" style={{marginRight:4}}><AlertCircle size={15} strokeWidth={2}/></span>}
          {showSuccess && <span className="icon-success" aria-hidden="true" style={{marginRight:4}}><CheckCircle  size={15} strokeWidth={2}/></span>}

          {/* Eye toggle */}
          <button
            type="button"
            className="eye-btn"
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {visible ? <EyeOff size={15} strokeWidth={2}/> : <Eye size={15} strokeWidth={2}/>}
          </button>
        </span>
      </div>

      {showError && (
        <span id={`${id}-err`} className="field-msg field-msg-error" role="alert">
          <AlertCircle size={12} strokeWidth={2.5}/> {error}
        </span>
      )}
    </div>
  )
}
