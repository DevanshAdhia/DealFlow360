// Toast — auto-dismiss notification
import { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="assertive">
      {type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
      <span style={{flex:1}}>{message}</span>
      <button
        onClick={onClose}
        style={{background:'none',border:'none',cursor:'pointer',display:'flex',padding:'2px',marginLeft:'4px',color:'inherit',opacity:0.7}}
        aria-label="Dismiss"
      >
        <X size={14}/>
      </button>
    </div>
  )
}
