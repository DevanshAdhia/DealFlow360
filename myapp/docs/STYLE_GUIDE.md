# DealFlow360 — UI Design System & Style Guide

> **Purpose:** This document is a complete reference for any developer or designer who wants to build new pages, components, or features that look and feel identical to the existing DealFlow360 application. Follow this guide exactly and your additions will be visually consistent with the rest of the product.

---

## 📁 Project Structure

```
myapp/
├── src/
│   ├── data/                    ← JSON seed files (read-only browser data)
│   │   ├── quotations.json
│   │   ├── customers.json
│   │   └── products.json
│   ├── context/                 ← Global state (React Context + localStorage)
│   │   ├── AuthContext.jsx
│   │   ├── QuotationContext.jsx
│   │   └── ToastContext.jsx
│   ├── utils/                   ← Pure utility functions (no React)
│   │   ├── quotationCalculations.js
│   │   └── formatters.js
│   ├── components/              ← Reusable UI building blocks
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── pipeline/
│   │   ├── quotations/
│   │   └── ui/
│   ├── pages/                   ← Route-level page components
│   ├── routes/                  ← React Router config + guards
│   ├── hooks/                   ← Custom React hooks
│   └── styles/                  ← All CSS lives here
│       ├── variables.css        ← Design tokens (the single source of truth)
│       ├── global.css           ← Resets, buttons, badges, inputs
│       ├── dashboard.css        ← Dashboard-specific classes
│       ├── quotations.css       ← Quotation wizard and table classes
│       ├── pipeline.css         ← Kanban board classes
│       └── responsive.css       ← Breakpoints for mobile/tablet
├── docs/                        ← All markdown documentation
└── public/
```

---

## 🎨 Design Language

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Light Enterprise** | White cards on a soft `#f8fafc` background — professional, not sterile |
| **One Brand Color** | Primary Blue `#2563eb` is the only accent. Use it consistently. |
| **Layered Depth** | Three surface levels: page bg → card → input. Never skip levels. |
| **Micro-motion** | Subtle hover lifts and transitions. Nothing flashy. |
| **Typography Contrast** | `#0f172a` headings, `#475569` body, `#64748b` muted — always use these three. |

---

## 🎨 Color Tokens

All colors are CSS custom properties defined in `src/styles/variables.css`. **Never use raw hex values in component CSS** — always reference the token.

### Backgrounds (Layer System)

```css
/* Page background (outermost layer) */
background: var(--bg-dark);           /* #f8fafc — soft slate white */

/* Card / Panel surface (2nd layer) */
background: var(--bg-surface-1);      /* #ffffff — pure white */

/* Input / nested panel (3rd layer) */
background: var(--bg-surface-2);      /* #f1f5f9 — off-white */

/* Hover states on inputs */
background: var(--bg-surface-3);      /* #e2e8f0 — light grey */

/* Glassmorphism panels */
background: var(--bg-glass);          /* rgba(255,255,255,0.92) */
border: 1px solid var(--bg-glass-border); /* rgba(0,0,0,0.08) */
```

### Brand Colors

```css
--primary-50:   #eff6ff   /* Tinted backgrounds, KPI card fills */
--primary-100:  #dbeafe   /* Highlighted row backgrounds */
--primary-500:  #2563eb   /* Links, active icons, focus rings */
--primary-600:  #1d4ed8   /* Button background */
--primary-700:  #1e40af   /* Button hover, pressed states */
--primary-glow: rgba(37, 99, 235, 0.15)  /* Focus box-shadow, glow effects */
```

### Text Colors

```css
--text-primary:   #0f172a   /* Headings, important labels */
--text-secondary: #475569   /* Body copy, descriptions */
--text-muted:     #64748b   /* Placeholders, hints, metadata */
--text-inverse:   #ffffff   /* Text on dark/colored backgrounds */
```

### Status Colors

```css
/* Success / Confirmed / Healthy */
--color-success:    #059669
--color-success-bg: rgba(5, 150, 105, 0.1)

/* Warning / Pending / At Risk */
--color-warning:    #d97706
--color-warning-bg: rgba(217, 119, 6, 0.1)

/* Error / Critical / Danger */
--color-error:      #dc2626
--color-error-bg:   rgba(220, 38, 38, 0.1)

/* Info / Draft / Neutral */
--color-info:       #0284c7
--color-info-bg:    rgba(2, 132, 199, 0.1)
```

### Borders

```css
--border-subtle:  #e2e8f0   /* Default card border */
--border-medium:  #cbd5e1   /* Input border, dividers */
--border-focus:   #2563eb   /* Focused input border */
```

---

## 📐 Spacing & Layout Tokens

```css
/* Border Radii */
--radius-xs:   4px
--radius-sm:   6px
--radius-md:   10px    /* Buttons, inputs */
--radius-lg:   14px    /* Cards, panels */
--radius-xl:   20px    /* Large modals */
--radius-full: 9999px  /* Badges, pills, avatars */

/* Shadows */
--shadow-sm:   0 1px 3px rgba(0,0,0,0.05)         /* Resting cards */
--shadow-md:   0 4px 12px rgba(0,0,0,0.08)         /* Elevated cards on hover */
--shadow-lg:   0 12px 28px rgba(0,0,0,0.10)        /* Modals, dropdowns */
--shadow-glow: 0 0 20px rgba(37,99,235,0.12)       /* CTA buttons, active state */

/* Layout */
--sidebar-width:           260px
--sidebar-collapsed-width:  76px
--header-height:            68px

/* Transitions */
--transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1)  /* Hover colors */
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1)  /* Panel slides */
--transition-slow:   350ms cubic-bezier(0.4, 0, 0.2, 1)  /* Page enters */
```

---

## 🔤 Typography

### Font Families

```css
/* Body / UI text */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;

/* Headings / Display text */
--font-display: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
```

> Both fonts are loaded from Google Fonts. Add them to `index.html`:
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
> ```

### Type Scale

| Usage | Size | Weight | Color Token | Example |
|-------|------|--------|-------------|---------|
| Page title (h1) | `1.75rem` | `800` | `--text-primary` | "Quotations & CPQ Ledger" |
| Section heading (h2) | `1.25rem` | `700` | `--text-primary` | "Deal Health Breakdown" |
| Card title | `0.95rem` | `700` | `--text-primary` | "Q-1045" |
| Body text | `0.875rem` | `400` | `--text-secondary` | Descriptions, notes |
| Label / meta | `0.8125rem` | `600` | `--text-primary` | Form labels |
| Small / muted | `0.775rem` | `400` | `--text-muted` | Timestamps, hints |
| Tiny / table header | `0.75rem` | `600` | `--text-muted` | Uppercase column headers |

---

## 🧱 Component Classes Reference

### Cards

```jsx
{/* Standard card — use for every card/panel */}
<div className="card-surface">
  content here
</div>

{/* Glassmorphism card — sidebar overlays, header panels */}
<div className="glass-panel">
  content here
</div>
```

**CSS rules:**
```css
.card-surface {
  background-color: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);   /* 14px */
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.card-surface:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-md);
}
```

---

### Buttons

```jsx
{/* Primary action — submit, confirm, create */}
<button className="btn btn-primary">
  <Plus size={16} />
  <span>Create Quotation</span>
</button>

{/* Secondary action — export, less important */}
<button className="btn btn-secondary">Export</button>

{/* Outline — ghost style, filters, back buttons */}
<button className="btn btn-outline">
  <ArrowLeft size={16} />
  <span>Back</span>
</button>

{/* Danger — delete, destructive actions */}
<button className="btn btn-danger">Delete</button>

{/* Icon-only button */}
<button className="btn-icon">
  <Edit3 size={16} />
</button>
```

> Always pair `.btn` with a variant class: `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger`.

---

### Badges / Status Pills

```jsx
{/* Healthy / Confirmed / Success */}
<span className="badge badge-success">Confirmed</span>

{/* At Risk / Pending */}
<span className="badge badge-warning">Pending Approval</span>

{/* Critical / Danger */}
<span className="badge badge-error">Critical</span>

{/* Draft / Info */}
<span className="badge badge-primary">Draft</span>

{/* Archived / Inactive */}
<span className="badge badge-neutral">Archived</span>
```

**Standard mapping — use this everywhere, never pick ad hoc:**
```js
const STAGE_TO_BADGE = {
  draft:            'badge-primary',
  pending_approval: 'badge-warning',
  negotiation:      'badge-primary',
  confirmed:        'badge-success',
};

const HEALTH_TO_BADGE = {
  'healthy':  'badge-success',
  'at risk':  'badge-warning',
  'critical': 'badge-error',
};
```

---

### Form Inputs

```jsx
<div className="form-group">
  <label className="form-label" htmlFor="fieldId">
    Field Label
    <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>
  </label>
  <div className="form-input-container">
    <input
      id="fieldId"
      type="text"
      className="form-input"
      placeholder="Enter value..."
    />
  </div>
  {hasError && (
    <span className="form-error">
      This field is required.
    </span>
  )}
</div>
```

---

### Search Box

```jsx
<div className="dashboard-search-box">
  <Search size={15} color="var(--text-muted)" />
  <input
    type="text"
    placeholder="Search..."
    className="dashboard-search-input"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />
</div>
```

---

## 🖼️ KPI Card Pattern

```jsx
<div className="card-surface" style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  padding: '1.25rem 1.5rem',
}}>
  {/* Label row */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span style={{
      fontSize: '0.8rem',
      fontWeight: '600',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      Total Quotations
    </span>
    <div style={{
      padding: '0.4rem',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--primary-50)',
    }}>
      <FileText size={16} color="var(--primary-500)" />
    </div>
  </div>

  {/* Big number */}
  <div style={{
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: 1,
  }}>
    24
  </div>

  {/* Trend / subtitle */}
  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
    +3 this week
  </p>
</div>
```

**KPI grid CSS:**
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
gap: 1rem;
```

---

## 📋 Page Header Pattern

Every page starts with this exact block:

```jsx
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '1rem',
}}>
  {/* Left: Title + subtitle */}
  <div>
    <h1 style={{
      fontSize: '1.75rem',
      fontWeight: '800',
      color: 'var(--text-primary)',
      letterSpacing: '-0.02em',
    }}>
      Page Title
    </h1>
    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
      One line description of what this page does.
    </p>
  </div>

  {/* Right: Primary action */}
  <div style={{ display: 'flex', gap: '0.75rem' }}>
    <button className="btn btn-outline">Secondary</button>
    <button className="btn btn-primary">
      <Plus size={16} />
      <span>Primary Action</span>
    </button>
  </div>
</div>
```

---

## 📊 Table Pattern

```jsx
<div className="card-surface" style={{ padding: 0, overflow: 'hidden' }}>
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface-2)',
      }}>
        <th style={{
          padding: '0.75rem 1rem',
          textAlign: 'left',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Column Name
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr
          key={item.id}
          style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <td style={{
            padding: '0.875rem 1rem',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
          }}>
            {item.value}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 💬 Toast Notifications

Never use `alert()`. Always use the global toast system:

```jsx
import { useToast } from '../hooks/useToast.js';

const { success, error, info, warning } = useToast();

success('Quotation Created', 'Q-1046 has been added to your pipeline.');
error('Validation Failed', 'Please select a customer before continuing.');
info('Loading...', 'Opening the CPQ builder.');
warning('Discount Alert', 'Discount of 22% exceeds the 20% threshold.');
```

---

## 💰 Currency Formatting (INR)

Always use the central utility — never hardcode the rupee symbol manually:

```js
import { formatINR, formatINRCompact } from '../utils/formatters.js';

formatINR(1450000)         // "₹14,50,000"   (Indian lakh-comma system)
formatINRCompact(1450000)  // "₹14.5L"        (KPI cards, compact display)
formatINRCompact(12500000) // "₹1.25Cr"       (Crore shorthand)
```

---

## 📦 Icon System

Use **Lucide React** exclusively.

```jsx
import { Plus, Edit3, Trash2, FileText, Search } from 'lucide-react';

// Size rules:
// 14px → dense table cells, muted metadata
// 16px → buttons, sidebar nav items
// 18px → status indicators, card actions
// 20px → section headings
// 24px → empty state illustrations
```

**Standard icon–action mapping:**

| Action | Icon |
|--------|------|
| Create / Add | `Plus` |
| Edit | `Edit3` |
| Delete | `Trash2` |
| View | `Eye` |
| Duplicate | `Copy` |
| Archive | `Archive` |
| Search | `Search` |
| Filter | `Filter` |
| Refresh | `RotateCw` |
| Back | `ArrowLeft` |
| Next / Stage | `ArrowRight` |
| Money | `IndianRupee` |
| Pipeline | `TrendingUp` |
| Customer | `Building` |
| Person | `User` |
| Alert | `AlertTriangle` |
| Success | `CheckCircle2` |

---

## 🗂️ Context Usage Reference

```jsx
import { useQuotations } from '../context/QuotationContext.jsx';

const {
  quotations,               // active (non-archived) list
  archivedQuotations,       // archived list
  addQuotation,             // CREATE  — returns new quote
  getQuotationById,         // READ    — returns quote or null
  updateQuotation,          // UPDATE  — recalculates totals automatically
  deleteQuotation,          // DELETE  — permanent removal
  duplicateQuotation,       // CLONE   — new Draft, new ID
  archiveQuotation,         // SOFT DELETE
  restoreQuotation,         // UNARCHIVE
  moveQuotationStage,       // STAGE TRANSITION → { success, error, quote }
  getPipelineMetrics,       // METRICS → { counts, values, winRate }
  calculateQuoteTotals,     // MATH    → (items, discount, taxRate) => totals
  resetToDefaultQuotations, // RESET   → restores JSON seed data
} = useQuotations();
```

### Stage Transition Rules

| From | To | Allowed |
|------|----|---------|
| Draft | Pending Approval | ✅ |
| Draft | Negotiation | ✅ |
| **Draft** | **Confirmed** | ❌ Blocked |
| Pending Approval | Negotiation | ✅ |
| Pending Approval | Confirmed | ✅ |
| Negotiation | Confirmed | ✅ |
| Any | Draft (rollback) | ✅ |

---

## 🔄 Building a New CRUD Feature — Step by Step

```
1. Add JSON seed data
   └── src/data/myfeature.json

2. Create Context
   └── src/context/MyFeatureContext.jsx
       - Import JSON as SEED_DATA
       - Load from localStorage, fallback to SEED_DATA
       - Persist every dispatch to localStorage
       - Expose: list, add, update, delete functions

3. Register Provider in App.jsx
   └── <MyFeatureProvider><App /></MyFeatureProvider>

4. Build page component
   └── src/pages/MyFeature.jsx
       - Page Header Pattern
       - KPI cards
       - Search + filter bar
       - Table or card grid
       - Loading / empty / error states

5. Add route
   └── src/routes/AppRoutes.jsx

6. Add sidebar nav item
   └── src/components/layout/Sidebar.jsx
```

---

## ✅ Pre-Commit Checklist

Before submitting any new code, verify every item:

- [ ] Uses CSS token variables — no raw hex values
- [ ] Uses `card-surface` or `glass-panel` for containers
- [ ] Uses `btn btn-[variant]` for all buttons
- [ ] Uses `badge badge-[variant]` for all status indicators
- [ ] Uses `formatINR()` / `formatINRCompact()` for all currency
- [ ] Uses Lucide React for all icons (correct size per table above)
- [ ] Reads shared data from context (`useQuotations()`) not local state
- [ ] Shows loading, empty, and error states
- [ ] Uses `useToast()` for all user feedback — no `alert()`
- [ ] Page wrapper: `display: flex; flex-direction: column; gap: 1.5rem`
- [ ] Follows the Page Header Pattern at the top of every page
- [ ] Wraps correctly on mobile (below 768px)
- [ ] No console errors
