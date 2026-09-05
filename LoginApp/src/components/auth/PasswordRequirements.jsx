// PasswordRequirements — compact 2-column grid, show only when password has input
import { CheckCircle, Shield } from 'lucide-react'
import { getPasswordStrength } from '../../utils/validation'

export default function PasswordRequirements({ password }) {
  if (!password) return null
  const reqs = getPasswordStrength(password)

  return (
    <div className="pw-reqs" aria-label="Password requirements" role="status">
      {reqs.map(r => (
        <div key={r.label} className={`pw-req ${r.valid ? 'valid' : 'invalid'}`}>
          {r.valid
            ? <CheckCircle size={11} strokeWidth={2.5}/>
            : <Shield      size={11} strokeWidth={2}/>
          }
          {r.label}
        </div>
      ))}
    </div>
  )
}
