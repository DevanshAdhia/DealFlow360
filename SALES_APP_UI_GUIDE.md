# DealFlow360 — UI/UX Design System & Architecture Guide

This guide contains everything you need to know to replicate the exact "Premium Enterprise" look and feel of the Admin Panel for the new **Internal Sales App**. 

By following these rules, both apps will look like they belong to the same multi-million dollar software suite.

---

## 1. The Design Philosophy

The DealFlow360 design language is built on three core pillars:
1. **Zero External Frameworks**: No Tailwind, no Bootstrap, no Material UI. Everything is built with vanilla CSS variables for absolute control and high performance.
2. **Strict 8-Point Grid System**: All margins, paddings, and sizing are multiples of 4px or 8px. This creates perfect visual harmony.
3. **Subtle Depth & Micro-interactions**: Flat design is boring. We use soft shadows, smooth 0.2s transitions, and micro-animations (like hover scaling) to make the app feel alive and premium.

---

## 2. Core CSS Variables (`variables.css`)

Copy this exactly into the root of the Sales App. This is the DNA of the design.

```css
:root {
  /* Premium Indigo Palette */
  --primary: #4F46E5;        /* Primary Brand Color */
  --primary-hover: #4338CA;
  --primary-light: #EEF2FF;  
  
  /* Slate Grayscale */
  --secondary: #0F172A;      
  --secondary-hover: #1E293B;
  
  /* Semantic Colors (Use these strictly for status) */
  --success: #10B981;        --success-bg: #D1FAE5;     --success-text: #064E3B;
  --warning: #F59E0B;        --warning-bg: #FEF3C7;     --warning-text: #78350F;
  --danger: #EF4444;         --danger-bg: #FEE2E2;      --danger-text: #7F1D1D;
  --info: #3B82F6;           --info-bg: #DBEAFE;        --info-text: #1E3A8A;

  /* Surfaces & Backgrounds */
  --background: #F8FAFC;     /* The main app background */
  --surface: #FFFFFF;        /* Card backgrounds */
  --surface-secondary: #F1F5F9; /* Subtle gray areas inside cards */
  
  /* Borders */
  --border: #E2E8F0;         
  
  /* Typography Hierarchy */
  --text-primary: #0F172A;   /* Headings and primary text */
  --text-secondary: #64748B; /* Subtitles and table headers */
  --text-tertiary: #94A3B8;  /* Very subtle helper text */
  
  /* Font Stack */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  
  /* Modern SaaS Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -1px rgba(15, 23, 42, 0.03);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.025);
  
  /* Radii (Rounded Corners) */
  --radius-sm: 0.25rem;  /* 4px - Checkboxes */
  --radius-md: 0.375rem; /* 6px - Buttons/Inputs */
  --radius-lg: 0.5rem;   /* 8px - Small Cards */
  --radius-xl: 0.75rem;  /* 12px - Main Layout Cards */
  
  /* The strict spacing system (USE THESE, NEVER HARDCODE PIXELS) */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
}
```

---

## 3. UI Component Library (`UI.jsx`)

To ensure the Sales App looks identical, port over `src/components/common/UI.jsx` completely.

### The Button
- **Variant `primary`**: Indigo background, white text. Used for primary actions (Save, Submit, + New). Includes a subtle shadow and scale-up on hover.
- **Variant `secondary`**: White background, gray border, gray text. Used for everything else (Cancel, Edit, Close). Changes border/text color on hover.
- **Variant `danger`**: Red background. Only used for destructive actions (Delete).

### The Input & Select
- Label is small, uppercase, bold, and gray (`--text-secondary`).
- Input border is `--border`.
- **Focus State**: The input border must glow indigo (`--primary`) when clicked. *This is a key premium interaction.*

### The Badge & QuickStatusBadge
- Badges must *always* use the semantic color pairs (e.g., `--success-text` on `--success-bg`).
- The `QuickStatusBadge` component handles inline status changes via hover dropdowns, which makes the app feel extremely fast.

### The DataTable
- Table headers (`th`) must be uppercase, small font (`0.75rem`), and `--text-secondary`.
- Table rows (`tr`) must have a subtle hover effect (`background: var(--surface-secondary)`).
- Borders only between rows, not columns.

### The Modal & ConfirmDialog
- **Overlay**: Dark, semi-transparent background with backdrop blur (`backdrop-filter: blur(4px)`).
- **Animation**: The modal card itself must slide up slightly (`translateY(20px)` to `0`) and fade in when opened.

---

## 4. Page Layout Structure

Every single page in the Sales App should follow this exact DOM structure:

```html
<div>
  <!-- 1. Page Header Area -->
  <div className="page-header">
    <div className="page-title-group">
      <h1 className="page-title">Quotations</h1>
      <p className="page-subtitle">Manage customer quotes and approvals.</p>
    </div>
    <!-- Primary Page Actions go here (Buttons) -->
  </div>

  <!-- 2. KPI / Metric Cards (Optional but recommended) -->
  <div className="metric-grid">
    <!-- metric-card elements -->
  </div>

  <!-- 3. Main Content Card -->
  <div className="card">
    
    <!-- 3a. Toolbar (Search, Filters, Add Button) -->
    <div className="toolbar">
       <Input type="search" ... />
       <!-- Filter Selects -->
    </div>

    <!-- 3b. The Data -->
    <DataTable ... />
  </div>

  <!-- 4. Hidden Overlays (Modals) -->
  <Modal isOpen={...}> ... </Modal>
</div>
```

---

## 5. CSS Classes to Port Over (`layout.css` & `global.css`)

Make sure you copy these structural classes to the new app:

1. `.page-header`, `.page-title`, `.page-subtitle`: Creates the clean header with the bottom border.
2. `.card`: The fundamental building block. Must have `--surface` background, `--border`, `--radius-xl`, and `--shadow-sm`.
3. `.metric-grid` & `.metric-card`: The layout for top-of-page statistics.
4. `.form-group`, `.form-label`, `.form-input`: The layout for all forms.

---

## 6. The Golden Rules of the Sales App UI

1. **No Pure Black or Pure White (mostly)**. Text should be `--text-primary` (Slate 900, dark gray blue), not `#000000`. Backgrounds are `--background` (Slate 50), not `#FFFFFF`.
2. **Never hardcode hex colors in inline styles**. If you need a color in a React component, use `var(--color-name)`.
3. **Use Flexbox/Grid with `gap`**. Avoid using `margin` to separate items. Create a container with `display: flex; gap: var(--space-4);`. It is cleaner and more predictable.
4. **Everything must transition**. Buttons, inputs, table rows, and hover states should all have `transition: all 0.2s ease;`.
5. **Defensive Rendering**. If data might be missing, handle it gracefully. `(user.name || 'Unknown')` rather than letting the app crash.

---

By adhering to these design tokens and structural patterns, the Sales App will look exactly like a native extension of the Admin Panel.
