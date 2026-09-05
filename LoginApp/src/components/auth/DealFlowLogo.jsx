// DealFlow360 — Compact inline SVG logo
export default function DealFlowLogo() {
  return (
    <div className="auth-logo" aria-label="DealFlow360">
      {/* Analytics icon */}
      <svg className="auth-logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" stroke="#2563EB" strokeWidth="2" fill="#EFF6FF"/>
        {/* Bar chart */}
        <rect x="10" y="28" width="5" height="10" rx="1.5" fill="#2563EB" opacity="0.3"/>
        <rect x="17" y="22" width="5" height="16" rx="1.5" fill="#2563EB" opacity="0.55"/>
        <rect x="24" y="16" width="5" height="22" rx="1.5" fill="#2563EB" opacity="0.8"/>
        <rect x="31" y="11" width="5" height="27" rx="1.5" fill="#2563EB"/>
        {/* Trend line */}
        <polyline points="12.5,30 19.5,24 26.5,18 33.5,13"
          stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Arrow head */}
        <polyline points="29.5,11 33.5,13 31.5,17"
          stroke="#1D4ED8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      <div className="auth-brand">
        <span className="deal">DealFlow</span><span className="num">360</span>
      </div>
      <p className="auth-tagline">Intelligent. Governed. Growth.</p>
    </div>
  )
}
