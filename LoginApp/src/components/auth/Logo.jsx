// DealFlow360 — Brand Logo (inline SVG, fully scalable)
export default function Logo() {
  return (
    <div className="auth-logo">
      {/* Icon */}
      <svg
        className="auth-logo-icon"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer ring */}
        <circle cx="32" cy="32" r="30" stroke="#2563EB" strokeWidth="2.5" fill="#EFF6FF" />

        {/* Bar chart upward */}
        <rect x="14" y="36" width="7" height="14" rx="2" fill="#2563EB" opacity="0.35" />
        <rect x="24" y="28" width="7" height="22" rx="2" fill="#2563EB" opacity="0.6" />
        <rect x="34" y="20" width="7" height="30" rx="2" fill="#2563EB" opacity="0.85" />
        <rect x="44" y="14" width="7" height="36" rx="2" fill="#2563EB" />

        {/* Trend arrow */}
        <polyline
          points="15,38 25,30 35,22 45,16"
          stroke="#1D4ED8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <polyline
          points="40,13 46,15 44,21"
          stroke="#1D4ED8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Brand name */}
      <div className="auth-brand-name" aria-label="DealFlow360">
        <span className="deal">DealFlow</span>
        <span className="num">360</span>
      </div>

      {/* Tagline */}
      <p className="auth-tagline">Intelligent. Governed. Growth.</p>
    </div>
  )
}
