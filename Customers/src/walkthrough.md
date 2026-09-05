# DealFlow360 Customer Portal — Complete Implementation Walkthrough

We have comprehensively built and polished the **DealFlow360 Customer Portal** strictly conforming to the 40-point enterprise SaaS specification. The customer experience is completely isolated from internal sales, admin, finance, or warehouse workspaces, and features a clean white/light aesthetic with intuitive decision workflows.

---

## 1. Core Customer Journey Implemented

```
QUOTATION RECEIVED (Sent)
        ↓
CUSTOMER REVIEWS QUOTATION (Line Items + Specs)
        ↓
 ┌───────────────────────┐
 │ Is customer satisfied?│
 └───────────────────────┘
       ↓             ↓
     YES             NO
      ↓               ↓
  CONFIRM         NEGOTIATE
  QUOTATION           ↓
      ↓          Counter Discount /
  CONFIRMED      Line-Level Question /
                 Change Request
                      ↓
               Sales Team Response
                      ↓
               Approval Required? (>15% threshold)
                  ↓          ↓
                 YES         NO
                  ↓           ↓
            Approval Flow   Revised Quote
                  ↓           ↓
            Approved/Rejected
                  ↓
            Customer Reviews
                  ↓
           ┌──────┴──────┐
           ↓             ↓
        ACCEPT        REJECT
           ↓             ↓
       CONFIRMED    Rejection Reason & Variance
                         ↓
                  Negotiate Again /
                  Request Changes /
                  Ask Sales Team
```

---

## 2. Customer Routes Implemented

| Route | Component | Purpose |
|---|---|---|
| `/customer/dashboard` | `CustomerDashboard.jsx` | Decision-oriented workspace with Welcome, Action Required, 5 Summary KPIs, Quotations table, Active Negotiations, and Activity Timeline |
| `/customer/quotations` | `CustomerQuotations.jsx` | Full quotations directory with 8 status filter tabs (`All`, `New`, `Under Negotiation`, `Revised`, `Approval Required`, `Approved`, `Rejected`, `Confirmed`), live search, and sorting |
| `/customer/quotations/:quotationId` | `CustomerQuotationDetail.jsx` | Interactive digital quotation document with status progress flow, line-item actions ("Ask Question", "Request Change"), Counter Discount modal, and Confirmation modal |
| `/customer/quotations/:quotationId/reject` | `CustomerQuotationReject.jsx` | Clear commercial rejection explanation, variance diff (20% vs 15% max approved), and multi-option renegotiation panel |
| `/customer/negotiations` | `CustomerNegotiations.jsx` | Dedicated negotiations cockpit tracking active counter offers, manager approval states, and sales responses |
| `/customer/profile` | `CustomerProfile.jsx` | Customer profile for **John Carter** (**Acme Corporation**, Gold Tier) with contact, billing, and address information |
| `/customer/help` | `CustomerHelp.jsx` | Comprehensive customer FAQ explaining negotiation statuses, governance thresholds, rejection recovery, and confirmation procedures |

---

## 3. Canonical Mock Data (6 Business Scenarios)

The local seed data initializes 6 realistic quotations for **John Carter** at **Acme Corporation**:
1. **Q-1024** (`SENT`): *Enterprise Laptop Bundle* (₹2,96,652) — New proposal waiting for customer review.
2. **Q-1021** (`UNDER_NEGOTIATION`): *Cloud Infrastructure Package* (₹5,52,240) — Active discount counter offer under review.
3. **Q-1018** (`APPROVED`): *Annual Support Package* (₹1,35,405) — Approved 15% discount ready for formal confirmation with ₹15,000 in customer savings.
4. **Q-1015** (`REJECTED`): *Server Upgrade* (₹3,78,780) — Transparent explanation: 20% discount requested vs 15% max approved (5% variance gap), with "Negotiate Again" options.
5. **Q-1010** (`CONFIRMED`): *Security Package* (₹1,06,200) — Confirmed order locked and proceeding to fulfillment & billing.
6. **Q-1008** (`REVISED`): *Managed IT Services* (₹3,14,588) — Side-by-side comparison table between previous and revised commercial terms with `Changed`, `Increased`, and `Approved` badges.

---

## 4. Key Interactive Capabilities

### A. Line-Level Negotiation (Section 11)
Every line item in the quotation details table includes:
- **Ask Question**: Inline question box sending questions on specifications, warranty, or delivery directly to the sales team.
- **Request Change**: Quantity adjustment modal allowing custom quantity inputs and justification.

### B. Counter Discount Proposal (Section 12 & 14)
- Current discount vs proposed discount slider and input.
- **Real-time recalculation** of expected grand total and projected savings.
- **Automated threshold rule**: Proposing terms exceeding the 15% Gold tier threshold automatically transitions the quotation status into **APPROVAL REQUIRED**.

### C. Rejection Recovery & Renegotiation (Section 18 & 19)
- Displays exact reason and numerical gap analysis.
- Multi-channel next actions: "Negotiate Again" (counter discount, quantity, payment terms), "Ask Sales Team", or "Close Negotiation".

### D. Confirmation Modal & Lock (Section 17)
- Displays final total, discount, line items, and mandatory terms agreement checkbox before finalizing.
- Sets status to `CONFIRMED` and renders the fulfillment notification.

### E. Hackathon Demo Toolbar
An interactive controller bar is anchored to the quotation details page, allowing presenters and judges to trigger:
- *Propose Counter (18%)*
- *Simulate Threshold Exceeded (Approval Required)*
- *Simulate Manager Rejection*
- *Simulate Manager Approval*
- *Simulate Revision*
- *Reset State*
