# DealFlow360 — Backend Reference Guide
**Django + DRF | PostgreSQL | JWT Auth**

> **How to use this document:**
> This MD is built section-by-section. When you say "make section `login`", open that section and build it. When you say "make section `sales`", open that section and build it. Every section is self-contained and can be implemented independently, but the dependency order is respected.

> **The 7 Main Architecture Corrections Applied:**
> 1. **FK Correction (`Quotation.customer`)**: `customer_id` (CharField) → `ForeignKey → Customer`.
> 2. **FK Correction (`Quotation.sales_rep`)**: `sales_rep_id` (CharField) → `ForeignKey → User`.
> 3. **FK Correction (`QuotationItem.product`)**: `product_id` (CharField) → `ForeignKey → Product`.
> 4. **FK Correction (`QuotationVersion.changed_by`)**: `changed_by` (CharField) → `ForeignKey → User`.
> 5. **Risk Engine Calculation**: Multi-factor discount risk engine (`RiskEngine`) evaluating line-level excess, tier violations, multiple discounts, and margin thresholds (replacing plain blended discount %).
> 6. **Approval Architecture**: Formal approval chain engine (`ApprovalLevel`, `ApprovalRule`, `ApprovalRuleStep`, `QuotationApproval`) mapping risk scores to multi-level review sequences.
> 7. **Negotiation, Deal Health & Reporting**: Full modules for `negotiations` (customer portal counter-offers & automatic re-approval flow), `deal_health` (stalled deal & anomaly alerts), and `reports` (PDF via ReportLab & XLSX via openpyxl).

---

## Table of Contents

1. [App Map & Dependency Order](#1-app-map--dependency-order)
2. [Folder Structure Convention](#2-folder-structure-convention)
3. [App Interconnections (FK Map)](#3-app-interconnections-fk-map)
4. [Section: login](#4-section-login)
5. [Section: signup](#5-section-signup)
6. [Section: customer](#6-section-customer)
7. [Section: product](#7-section-product)
8. [Section: discount & risk](#8-section-discount--risk)
9. [Section: sales](#9-section-sales)
10. [Section: warehouse](#10-section-warehouse)
11. [Section: subscription](#11-section-subscription)
12. [Section: negotiations](#12-section-negotiations)
13. [Section: deal_health](#13-section-deal_health)
14. [Section: reports](#14-section-reports)
15. [Global Rules](#15-global-rules)

---

## 1. App Map & Dependency Order

These are the Django apps inside `apps/`. Build them in this order — later apps have FKs that point to earlier ones.

```
Phase 1 — Foundation
  login       → users table, JWT tokens
  signup      → writes to users table (same model as login)

Phase 2 — Master Data
  customer    → depends on login (customer_tier, customer)
  product     → depends on login + customer (category, product, variant, price_list)
  discount    → depends on customer + product (discount_rules, approval_rules)

Phase 3 — Transactions & Advanced Workspaces
  sales        → depends on customer + product + discount + login
                 (quotation, quotation_item, quotation_version)
  warehouse    → depends on product + sales + login
                 (warehouse, inventory, order, order_item, fulfillment, backorder)
  subscription → depends on sales + warehouse + customer
                 (subscription_plan, subscription, billing_schedule, invoice, payment, credit_note)
  negotiations → depends on sales + customer + login
                 (quotation_negotiation, negotiation_item_change)
  deal_health  → depends on sales + warehouse + login
                 (deal_health_alert)
  reports      → depends on all modules
                 (backend financial aggregations, PDF/XLSX export engine)
```

| App | Primary Tables | Depends On |
|---|---|---|
| `login` | `users`, `roles` | — |
| `signup` | `users` (same model) | `login` |
| `customer` | `customer_tiers`, `customers` | `login` |
| `product` | `categories`, `products`, `product_variants`, `price_lists`, `price_list_items` | `login`, `customer` |
| `discount` | `discount_rules`, `approval_rules`, `approval_rule_steps`, `approval_levels`, `quotation_approvals` | `customer`, `product`, `login` |
| `sales` | `quotations`, `quotation_items`, `quotation_versions` | `customer`, `product`, `discount`, `login` |
| `warehouse` | `warehouses`, `inventory`, `orders`, `order_items`, `fulfillment_orders`, `fulfillment_items`, `backorders` | `product`, `sales`, `login`, `customer` |
| `subscription` | `subscription_plans`, `subscriptions`, `subscription_items`, `billing_schedules`, `invoices`, `invoice_items`, `payments`, `credit_notes` | `sales`, `warehouse`, `customer`, `product` |
| `negotiations` | `quotation_negotiations`, `negotiation_item_changes` | `sales`, `customer`, `login` |
| `deal_health` | `deal_health_alerts` | `sales`, `warehouse`, `login` |
| `reports` | Reporting Engine (ReportLab PDF, openpyxl XLSX) | All modules |

---

## 2. Folder Structure Convention

Every app follows the same structure as the `sales` app:

```
apps/
└── <app_name>/
    ├── __init__.py
    ├── admin.py
    ├── apps.py
    ├── permissions.py
    ├── tests.py
    ├── urls.py
    ├── views.py
    ├── migrations/
    │   ├── __init__.py
    │   └── 0001_initial.py
    ├── models/
    │   ├── __init__.py          ← re-exports all models
    │   └── <app_name>.py        ← all models for this app
    ├── serializers/
    │   ├── __init__.py
    │   └── <app_name>_serializer.py
    └── services/
        ├── __init__.py
        └── <app_name>_service.py
```

**Rules:**
- `models/<app_name>.py` — all Django models for this app
- `serializers/<app_name>_serializer.py` — Create / Update / List serializers per model
- `services/<app_name>_service.py` — all business logic; use `@transaction.atomic` on every write method
- `views.py` — ViewSets only, no business logic inside views
- `permissions.py` — custom `BasePermission` subclasses for this app
- `urls.py` — `DefaultRouter` registrations only

---

## 3. App Interconnections (FK Map)

```
roles ──────────────────────────────► users
                                         │
                    ┌────────────────────┼──────────────────────┐
                    ▼                    ▼                       ▼
          customer_tiers           (sales_rep)            (approver)
                    │
                    ▼
                customers ──────────────────────────────────────┐
                    │                                            │
                    ├──► price_lists                            │
                    │         │                                  │
                    │         └──► price_list_items              │
                    │                                            ▼
              categories                                   quotations ──────────────────────┐
                    │                                            │                           │
                    └──► products                               ├──► quotation_items         │
                              │                                 │         │                  │
                              ├──► product_variants             │         └──► (product FK)  │
                              │                                 └──► quotation_versions      │
                    discount_rules                                                           │
                    (tier + category)                                                        ▼
                    approval_rules                                                        orders
                    approval_rule_steps                                                      │
                    quotation_approvals                                           ┌──────────┤
                                                                                 │          │
                                                                    fulfillment_orders  subscriptions
                                                                                 │          │
                                                                    fulfillment_items  billing_schedules
                                                                                 │          │
                                                                            backorders    invoices
                                                                                           │
                                                                                       payments
                                                                                           │
                                                                                      credit_notes
```

### Full FK Reference Table

> ✅ All references are proper Django ForeignKey — no loose CharField references anywhere.

| Model | Field (Django name) | Points To | on_delete |
|---|---|---|---|
| `User` | `role` | `Role.id` | `SET_NULL` |
| `Customer` | `customer_tier` | `CustomerTier.id` | `PROTECT` |
| `Product` | `category` | `Category.id` | `PROTECT` |
| `ProductVariant` | `product` | `Product.id` | `CASCADE` |
| `PriceList` | `customer_tier` | `CustomerTier.id` | `PROTECT` |
| `PriceListItem` | `price_list` | `PriceList.id` | `CASCADE` |
| `PriceListItem` | `product` | `Product.id` | `PROTECT` |
| `DiscountRule` | `customer_tier` | `CustomerTier.id` | `CASCADE` |
| `DiscountRule` | `category` *(nullable)* | `Category.id` | `SET_NULL` |
| `ApprovalRuleStep` | `approval_rule` | `ApprovalRule.id` | `CASCADE` |
| `ApprovalRuleStep` | `approval_level` | `ApprovalLevel.id` | `PROTECT` |
| `QuotationApproval` | `quotation` | `Quotation.id` | `CASCADE` |
| `QuotationApproval` | `approval_level` | `ApprovalLevel.id` | `PROTECT` |
| `QuotationApproval` | `approver` | `User.id` | `PROTECT` |
| `Quotation` | `customer` | `Customer.id` | `PROTECT` |
| `Quotation` | `sales_rep` | `User.id` | `PROTECT` |
| `QuotationItem` | `quotation` | `Quotation.id` | `CASCADE` |
| `QuotationItem` | `product` | `Product.id` | `PROTECT` |
| `QuotationItem` | `variant` *(nullable)* | `ProductVariant.id` | `SET_NULL` |
| `QuotationVersion` | `quotation` | `Quotation.id` | `CASCADE` |
| `QuotationVersion` | `changed_by` | `User.id` | `SET_NULL` |
| `Order` | `quotation` | `Quotation.id` | `PROTECT` |
| `Order` | `customer` | `Customer.id` | `PROTECT` |
| `Order` | `sales_rep` | `User.id` | `PROTECT` |
| `OrderItem` | `order` | `Order.id` | `CASCADE` |
| `OrderItem` | `product` | `Product.id` | `PROTECT` |
| `OrderItem` | `variant` *(nullable)* | `ProductVariant.id` | `SET_NULL` |
| `Inventory` | `warehouse` | `Warehouse.id` | `CASCADE` |
| `Inventory` | `product` | `Product.id` | `PROTECT` |
| `Inventory` | `variant` *(nullable)* | `ProductVariant.id` | `SET_NULL` |
| `FulfillmentOrder` | `order` | `Order.id` | `CASCADE` |
| `FulfillmentItem` | `fulfillment_order` | `FulfillmentOrder.id` | `CASCADE` |
| `FulfillmentItem` | `warehouse` | `Warehouse.id` | `PROTECT` |
| `FulfillmentItem` | `order_item` | `OrderItem.id` | `PROTECT` |
| `Backorder` | `order` | `Order.id` | `CASCADE` |
| `Backorder` | `order_item` | `OrderItem.id` | `CASCADE` |
| `Backorder` | `product` | `Product.id` | `PROTECT` |
| `Subscription` | `order` | `Order.id` | `PROTECT` |
| `Subscription` | `customer` | `Customer.id` | `PROTECT` |
| `Subscription` | `subscription_plan` | `SubscriptionPlan.id` | `PROTECT` |
| `SubscriptionItem` | `subscription` | `Subscription.id` | `CASCADE` |
| `SubscriptionItem` | `product` | `Product.id` | `PROTECT` |
| `BillingSchedule` | `subscription` | `Subscription.id` | `CASCADE` |
| `BillingSchedule` | `invoice` *(nullable)* | `Invoice.id` | `SET_NULL` |
| `Invoice` | `customer` | `Customer.id` | `PROTECT` |
| `Invoice` | `order` *(nullable)* | `Order.id` | `SET_NULL` |
| `Invoice` | `subscription` *(nullable)* | `Subscription.id` | `SET_NULL` |
| `InvoiceItem` | `invoice` | `Invoice.id` | `CASCADE` |
| `InvoiceItem` | `product` *(nullable)* | `Product.id` | `SET_NULL` |
| `Payment` | `invoice` | `Invoice.id` | `PROTECT` |
| `CreditNote` | `invoice` | `Invoice.id` | `PROTECT` |
| `CreditNote` | `customer` | `Customer.id` | `PROTECT` |

---

## 4. Section: login

### Purpose
Authenticate users, issue JWT tokens, expose the current user profile.
This is the **foundation** — every other app depends on the `User` and `Role` models defined here.

### Models — `apps/login/models/login.py`

```python
Role
  PK:  id           UUID, primary_key=True, default=uuid.uuid4
       name         CharField(50), unique=True
                    # Allowed values: SALES_REP | SALES_MANAGER | FINANCE | ADMIN | CUSTOMER
       description  TextField, blank=True
       is_active    BooleanField, default=True
       created_at   DateTimeField, auto_now_add=True
       updated_at   DateTimeField, auto_now=True

User  (extends AbstractBaseUser + PermissionsMixin)
  PK:  id           UUID, primary_key=True, default=uuid.uuid4
  FK:  role         ForeignKey → Role, on_delete=SET_NULL, null=True, blank=True
       full_name    CharField(255)
       email        EmailField, unique=True, db_index=True   # USERNAME_FIELD
       password     # hashed by AbstractBaseUser
       is_active    BooleanField, default=True
       is_staff     BooleanField, default=False
       created_at   DateTimeField, auto_now_add=True
       updated_at   DateTimeField, auto_now=True

  Meta:
    indexes: [email]
```

**Why `SET_NULL` on role?**
If a role is deleted (edge case), the user record should survive — it just loses its role assignment and can be reassigned by admin.

**Constraints & Indexes:**
- `email` UNIQUE + db_index (used as `USERNAME_FIELD`)
- `role` FK nullable — users can exist without a role temporarily (admin assigns role)

### Serializers

| Serializer | Used For |
|---|---|
| `LoginSerializer` | Validates `email` + `password`, returns access + refresh tokens |
| `UserProfileSerializer` | Read-only output for `GET /auth/me` (id, email, fullName, role) |
| `UserListSerializer` | Admin list view (id, email, role name, is_active, createdAt) |
| `UserUpdateSerializer` | `PATCH /users/{userId}` — admin updates role or is_active |

### Service — `LoginService`

| Method | Atomic? | What it does |
|---|---|---|
| `authenticate(email, password)` | No | Calls Django `authenticate()`, raises `ValidationError` if inactive or wrong creds |
| `get_tokens(user)` | No | Returns `{access, refresh}` via `SimpleJWT.RefreshToken.for_user()` |
| `blacklist_refresh_token(refresh_token_str)` | No | Calls `RefreshToken(token).blacklist()` on logout |

### Views & URLs

```
POST   /api/v1/auth/login           → LoginView           (AllowAny)
POST   /api/v1/auth/logout          → LogoutView          (IsAuthenticated)
GET    /api/v1/auth/me              → UserProfileView      (IsAuthenticated)

GET    /api/v1/users                → UserListView         (IsAdmin)
PATCH  /api/v1/users/{userId}       → UserUpdateView       (IsAdmin)
```

### Permissions — `apps/login/permissions.py`

```python
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role is not None
            and request.user.role.name == "ADMIN"
        )

class IsSalesRep(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role is not None
            and request.user.role.name == "SALES_REP"
        )

class IsSalesManager(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role is not None
            and request.user.role.name == "SALES_MANAGER"
        )

class IsFinance(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role is not None
            and request.user.role.name == "FINANCE"
        )

class IsCustomerPortalUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role is not None
            and request.user.role.name == "CUSTOMER"
        )

class IsInternalUser(BasePermission):
    """Blocks customer portal users from internal endpoints."""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role is not None
            and request.user.role.name != "CUSTOMER"
        )
```

### Validation Rules

- `email` — valid format, must be unique across all users
- `password` — minimum 8 characters (enforced in SignupSerializer, not LoginSerializer)
- Inactive user (`is_active=False`) → `401 Unauthorized` on login
- Role must exist in the `roles` table
- Customer JWT (`role.name == "CUSTOMER"`) must never access internal `/api/v1/` endpoints — enforced via `IsInternalUser` on all internal ViewSets

---

## 5. Section: signup

### Purpose
Register new internal users. Uses the **same `User` model** from `apps.login.models`.
No separate table — `signup` only writes to the `users` table.

### Note on App Separation
`signup` is a separate Django app for URL/view isolation only.
It imports `User` and `Role` from `apps.login.models` — it does **not** define its own models.

### Serializers

| Serializer | Used For |
|---|---|
| `SignupSerializer` | Validates `fullName`, `email`, `password`, `roleName` — creates User |

**`SignupSerializer` validation logic:**
- `email` — check uniqueness before creation (`User.objects.filter(email=email).exists()`)
- `password` — min 8 chars; hashed via `user.set_password()` before save — never stored plain
- `roleName` — must match an existing `Role.name`; if not provided, defaults to `SALES_REP`
- `ADMIN` and `FINANCE` roles cannot be self-assigned — only an existing `ADMIN` user can create those roles (enforce in `has_permission`)

### Service — `SignupService`

| Method | Atomic? | What it does |
|---|---|---|
| `create_user(full_name, email, password, role_name)` | ✅ | Validates uniqueness, fetches Role object by name, hashes password, creates User |

```python
# Example service method pattern
@classmethod
@transaction.atomic
def create_user(cls, full_name, email, password, role_name="SALES_REP"):
    if User.objects.filter(email=email).exists():
        raise ValidationError({"email": "A user with this email already exists."})
    role = Role.objects.filter(name=role_name, is_active=True).first()
    if not role:
        raise ValidationError({"roleName": f"Role '{role_name}' does not exist."})
    user = User(full_name=full_name, email=email, role=role)
    user.set_password(password)
    user.save()
    return user
```

### Views & URLs

```
POST  /api/v1/auth/signup   → SignupView (AllowAny for SALES_REP; IsAdmin for higher roles)
```

### Validation Rules

- Open signup creates `SALES_REP` only
- `ADMIN` user can POST with any `roleName` to create higher-privilege users
- Duplicate email → `400 Bad Request` with `fieldErrors.email`
- Invalid role name → `400 Bad Request` with `fieldErrors.roleName`

---

## 6. Section: customer

### Purpose
Manage B2B customers and pricing tiers.
The `CustomerTier` determines the **maximum discount** a customer is allowed — the discount engine (Section 8) reads this to compute risk scores.

### Models — `apps/customer/models/customer.py`

```python
CustomerTier
  PK:  id                   UUID, primary_key=True, default=uuid.uuid4
       name                 CharField(100), unique=True
                            # Examples: Bronze | Silver | Gold
       max_discount_percent DecimalField(max_digits=5, decimal_places=2)
                            # CheckConstraint: 0.00 <= max_discount_percent <= 100.00
       description          TextField, blank=True
       is_active            BooleanField, default=True
       created_at           DateTimeField, auto_now_add=True
       updated_at           DateTimeField, auto_now=True

Customer
  PK:  id              UUID, primary_key=True, default=uuid.uuid4
  FK:  customer_tier   ForeignKey → CustomerTier, on_delete=PROTECT
                       # PROTECT: cannot delete a tier that has active customers
       customer_code   CharField(64), unique=True, db_index=True
                       # Auto-generated if blank: CUST-{uuid4.hex[:6].upper()}
       name            CharField(255)
       email           EmailField
       phone           CharField(32), blank=True
       address_line1   CharField(255), blank=True
       city            CharField(100), blank=True
       state           CharField(100), blank=True
       postal_code     CharField(20), blank=True
       country         CharField(100), default="India"
       is_active       BooleanField, default=True, db_index=True
       created_at      DateTimeField, auto_now_add=True
       updated_at      DateTimeField, auto_now=True

  Meta:
    indexes: [customer_tier, is_active]
```

**Why `PROTECT` on customer_tier?**
Deleting a tier that has customers would orphan their discount rules and break risk calculations. Force admin to reassign customers first.

### Serializers

| Serializer | Used For |
|---|---|
| `CustomerTierSerializer` | CRUD for tiers — used by Admin |
| `CustomerCreateSerializer` | `POST /customers` — validates + creates |
| `CustomerSerializer` | Full detail output including nested tier data |
| `CustomerUpdateSerializer` | `PUT /customers/{id}` — partial update |
| `CustomerListSerializer` | Compact list (id, name, customerCode, tier name, isActive) |

### Service — `CustomerService`

| Method | Atomic? | What it does |
|---|---|---|
| `create_customer(name, email, customer_tier_id, ...)` | ✅ | Validates tier exists and is active, auto-generates customer_code if blank, creates record |
| `update_customer(instance, **kwargs)` | ✅ | Updates allowed fields, re-validates customer_code uniqueness if changed |
| `deactivate_customer(instance)` | ✅ | Sets `is_active=False`; blocks new quotation creation for this customer |
| `get_tier_discount_limit(customer)` | No | Returns `customer.customer_tier.max_discount_percent` |

### Views & URLs

```
GET    /api/v1/customers                        → list   (IsInternalUser)
POST   /api/v1/customers                        → create (IsSalesManager | IsAdmin)
GET    /api/v1/customers/{customerId}           → retrieve (IsInternalUser)
PUT    /api/v1/customers/{customerId}           → update (IsSalesManager | IsAdmin)

GET    /api/v1/customer-tiers                   → list   (IsInternalUser)
POST   /api/v1/customer-tiers                   → create (IsAdmin)
PUT    /api/v1/customer-tiers/{tierId}          → update (IsAdmin)
```

### Validation Rules

- `customer_code` — unique; auto-generate if blank: `CUST-{uuid4.hex[:6].upper()}`
- `customer_tier` FK — must exist and be `is_active=True`
- `is_active=False` on customer → reject new quotation creation in `SalesService`
- Cannot delete a tier that has customers — Django `PROTECT` enforces this at DB level
- `max_discount_percent` — CheckConstraint: value between `0.00` and `100.00`

---

## 7. Section: product

### Purpose
Manage product catalog, variants, categories, and tier-based price lists.
Price resolution order: Customer Tier PriceList → Product base `sales_price`.
`cost_price` is always sourced from `Product` — never overridden per price list.

### Models — `apps/product/models/product.py`

```python
Category
  PK:  id           UUID, primary_key=True, default=uuid.uuid4
       name         CharField(255), unique=True
       description  TextField, blank=True
       is_active    BooleanField, default=True
       created_at   DateTimeField, auto_now_add=True
       updated_at   DateTimeField, auto_now=True

Product
  PK:  id                    UUID, primary_key=True, default=uuid.uuid4
  FK:  category              ForeignKey → Category, on_delete=PROTECT
                             # PROTECT: cannot delete a category with active products
       name                  CharField(255)
       sku                   CharField(128), unique=True, db_index=True
       product_type          CharField, choices: HARDWARE | SERVICE | SUBSCRIPTION
       unit                  CharField(32)   # e.g. PCS, HR, MONTH
       description           TextField, blank=True
       sales_price           DecimalField(14, 2)   # base selling price
       cost_price            DecimalField(14, 2)   # required for margin calculation
                             # CheckConstraint: cost_price >= 0
       tax_percent           DecimalField(6, 2), default=Decimal("18.00")
                             # CheckConstraint: 0.00 <= tax_percent <= 100.00
       is_recurring_eligible BooleanField, default=False
                             # Must be True if product_type == SUBSCRIPTION
       is_active             BooleanField, default=True, db_index=True
       created_at            DateTimeField, auto_now_add=True
       updated_at            DateTimeField, auto_now=True

  Meta:
    indexes: [category, product_type, is_active]

ProductVariant
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  product          ForeignKey → Product, on_delete=CASCADE
                        # CASCADE: variants deleted when product is deleted
       sku              CharField(128), unique=True
       attribute_name   CharField(100)   # e.g. Color, Size, Storage
       attribute_value  CharField(100)   # e.g. Black, 16GB, 512GB
       extra_price      DecimalField(14, 2), default=Decimal("0.00")
                        # Added on top of Product.sales_price
       is_active        BooleanField, default=True
       created_at       DateTimeField, auto_now_add=True
       updated_at       DateTimeField, auto_now=True

PriceList
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  customer_tier    ForeignKey → CustomerTier, on_delete=PROTECT
                        # One price list per tier
       name             CharField(255)
       currency         CharField(10), default="INR"
       is_active        BooleanField, default=True
       created_at       DateTimeField, auto_now_add=True
       updated_at       DateTimeField, auto_now=True

PriceListItem
  PK:  id              UUID, primary_key=True, default=uuid.uuid4
  FK:  price_list      ForeignKey → PriceList, on_delete=CASCADE
  FK:  product         ForeignKey → Product, on_delete=PROTECT
       price           DecimalField(14, 2)   # override price for this tier
       min_quantity    PositiveIntegerField, default=1
       max_quantity    PositiveIntegerField, null=True, blank=True
       created_at      DateTimeField, auto_now_add=True
       updated_at      DateTimeField, auto_now=True

  UniqueConstraint: (price_list, product)
  # One price per product per price list — no duplicates
```

### Service — `ProductService`

| Method | Atomic? | What it does |
|---|---|---|
| `resolve_price(product, customer)` | No | Finds PriceListItem for customer's tier → returns override price; falls back to `product.sales_price` |
| `create_product(name, sku, category_id, ...)` | ✅ | Validates SKU uniqueness, validates category FK, creates product |
| `update_product(instance, **kwargs)` | ✅ | Updates fields, re-validates SKU uniqueness if changed |
| `deactivate_product(instance)` | ✅ | Sets `is_active=False`; validates product not on active quotation/subscription |

**Pricing Priority Logic:**
```
resolve_price(product, customer):
  tier = customer.customer_tier
  price_list = PriceList.objects.filter(customer_tier=tier, is_active=True).first()
  if price_list:
      item = PriceListItem.objects.filter(price_list=price_list, product=product).first()
      if item:
          return item.price          ← tier-specific override price
  return product.sales_price         ← fallback to base price

cost_price always = product.cost_price  ← never overridden
```

### Views & URLs

```
GET    /api/v1/products                         → list   (IsInternalUser)
POST   /api/v1/products                         → create (IsAdmin)
GET    /api/v1/products/{productId}             → retrieve (IsInternalUser)
PUT    /api/v1/products/{productId}             → update (IsAdmin)

GET    /api/v1/categories                       → list   (IsInternalUser)
POST   /api/v1/categories                       → create (IsAdmin)
PUT    /api/v1/categories/{categoryId}          → update (IsAdmin)

GET    /api/v1/price-lists                      → list   (IsInternalUser)
POST   /api/v1/price-lists                      → create (IsAdmin)
PUT    /api/v1/price-lists/{priceListId}        → update (IsAdmin)

POST   /api/v1/pricing/resolve                  → resolve price for (productId + customerId)
```

### Validation Rules

- `sku` — unique across `Product` and `ProductVariant` tables
- `cost_price` — must be ≥ 0; warn if 0 (margin will show 0% but is not blocked)
- `product_type == SUBSCRIPTION` → `is_recurring_eligible` must be `True`
- Cannot deactivate a product that has open quotation items or active subscriptions
- `(price_list, product)` UNIQUE on `PriceListItem` — one price per product per list

---

## 8. Section: discount

### Purpose
Define discount ceilings per tier and category, configure multi-level approval chains,
and evaluate blended risk scores on quotations. This is the **governance and risk engine**.

The blended risk score decides:
- Whether a quotation needs approval at all
- Which approval levels are required (Sales Manager only, or Sales Manager + Finance)

### Models — `apps/discount/models/discount.py`

```python
DiscountRule
  PK:  id                          UUID, primary_key=True, default=uuid.uuid4
  FK:  customer_tier               ForeignKey → CustomerTier, on_delete=CASCADE
  FK:  category                    ForeignKey → Category, on_delete=SET_NULL,
                                   null=True, blank=True
                                   # null = tier-level fallback rule (no category restriction)
       name                        CharField(255)
       max_discount_percent        DecimalField(6, 2)
                                   # Absolute ceiling — no line may exceed this
       manager_threshold_percent   DecimalField(6, 2)
                                   # Discount % that triggers Sales Manager approval
       finance_threshold_percent   DecimalField(6, 2)
                                   # Discount % that additionally triggers Finance approval
       min_margin_percent          DecimalField(6, 2)
                                   # If margin_percent drops below this → adds risk points
       is_active                   BooleanField, default=True
       created_at                  DateTimeField, auto_now_add=True
       updated_at                  DateTimeField, auto_now=True

  Rule priority:
    Category-specific rule (tier + category) takes priority over tier-level rule (tier only).

ApprovalLevel
  PK:  id         UUID, primary_key=True, default=uuid.uuid4
       name       CharField(100)
                  # Examples: "Sales Manager", "Finance"
       sequence   PositiveIntegerField
                  # 1 = first reviewer, 2 = second reviewer, etc.
       created_at DateTimeField, auto_now_add=True

  # Seed data:
  #   sequence=1, name="Sales Manager"
  #   sequence=2, name="Finance"

ApprovalRule
  PK:  id             UUID, primary_key=True, default=uuid.uuid4
       min_risk_score  DecimalField(6, 2)
       max_risk_score  DecimalField(6, 2)
       is_active       BooleanField, default=True
       created_at      DateTimeField, auto_now_add=True
       updated_at      DateTimeField, auto_now=True

  # Seed data (ranges must not overlap):
  #   0.00  – 20.00  → no approval steps
  #   20.01 – 50.00  → Sales Manager only
  #   50.01 – 100.00 → Sales Manager + Finance

ApprovalRuleStep
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  approval_rule    ForeignKey → ApprovalRule, on_delete=CASCADE
  FK:  approval_level   ForeignKey → ApprovalLevel, on_delete=PROTECT
       sequence         PositiveIntegerField
       created_at       DateTimeField, auto_now_add=True

  UniqueConstraint: (approval_rule, sequence)

QuotationApproval
  # One record per required approval step per quotation
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  quotation        ForeignKey → Quotation, on_delete=CASCADE
  FK:  approval_level   ForeignKey → ApprovalLevel, on_delete=PROTECT
  FK:  approver         ForeignKey → User, on_delete=PROTECT,
                        null=True, blank=True
                        # null until a specific approver acts on it
       sequence         PositiveIntegerField
       status           CharField, choices: PENDING | APPROVED | REJECTED | RETURNED
       action           CharField, choices: APPROVE | REJECT | RETURN, blank=True
       risk_score       DecimalField(6, 2)   # snapshot of score at time of request
       reason           TextField, blank=True
       acted_at         DateTimeField, null=True
       created_at       DateTimeField, auto_now_add=True
       updated_at       DateTimeField, auto_now=True
```

### Blended Risk Score Formula

```
Per quotation line:
  applicable_rule   = most specific DiscountRule (tier+category > tier-only)
  allowed_discount  = applicable_rule.max_discount_percent
  line_excess       = MAX(0, applied_discount_percent - allowed_discount)
  line_net_value    = line subtotal after discount
  weighted_line_risk = line_excess × (line_net_value / quotation_net_value)

Base score:
  blended_risk_score = MIN(100, SUM(weighted_line_risk) × scaling_factor)

Additional risk points (additive):
  +20  if customer tier max_discount_percent is violated on any line
  +15  if more than one line has a non-zero discount
  +17  if quotation.margin_percent < any applicable rule's min_margin_percent

Final score capped at 100.
```

### Service — `DiscountService`

| Method | Atomic? | What it does |
|---|---|---|
| `get_applicable_rule(customer_tier, category)` | No | Returns most specific `DiscountRule` — category-level first, tier-level fallback |
| `evaluate_risk(quotation)` | No | Calculates blended score + list of reason strings; does NOT save to DB |
| `get_approval_chain(risk_score)` | No | Queries `ApprovalRule` ranges, returns ordered list of `ApprovalLevel` objects |
| `create_approval_requests(quotation, approval_levels)` | ✅ | Creates `QuotationApproval` records in sequence order; updates `quotation.approval_status = PENDING` |
| `process_decision(quotation_approval, decision, reason, approver)` | ✅ | Sets status on `QuotationApproval`; if all steps APPROVED → quotation approval_status = APPROVED; if REJECTED or RETURNED → updates quotation accordingly; writes audit log |

### Views & URLs

```
GET    /api/v1/discount-rules                            → list   (IsAdmin | IsSalesManager)
POST   /api/v1/discount-rules                            → create (IsAdmin)
PUT    /api/v1/discount-rules/{discountRuleId}           → update (IsAdmin)

GET    /api/v1/approval-rules                            → list   (IsAdmin)
POST   /api/v1/approval-rules                            → create (IsAdmin)
PUT    /api/v1/approval-rules/{approvalRuleId}           → update (IsAdmin)

GET    /api/v1/approvals                                 → list pending approvals (IsSalesManager | IsFinance | IsAdmin)
GET    /api/v1/approvals/{approvalRequestId}             → detail (IsSalesManager | IsFinance | IsAdmin)
POST   /api/v1/approvals/{approvalRequestId}/decision    → act: APPROVE | REJECT | RETURN

POST   /api/v1/quotations/{quotationId}/evaluate-risk    → trigger risk evaluation
GET    /api/v1/quotations/{quotationId}/risk             → get current risk result
```

### Validation Rules

- `max_discount_percent` ≥ `manager_threshold_percent` ≥ `finance_threshold_percent` (ordering enforced)
- `ApprovalRule` ranges must not overlap — validate in service before save
- `min_risk_score` < `max_risk_score` on every `ApprovalRule`
- Category-specific `DiscountRule` always overrides tier-level rule for that category's lines
- Decision `RETURN` → quotation status reverts to `DRAFT` for rep to revise
- Decision `REJECT` → quotation status set to `REJECTED`; cannot be resubmitted
- Decision `APPROVE` on last step → quotation `approval_status = APPROVED`
- All decisions written to `audit_logs` with approver, timestamp, reason

---

## 9. Section: sales

### Purpose
Core quotation workspace — the primary module for Sales Reps.
Handles quotation lifecycle, line items, backend financial calculations, version snapshots, submission, and approval routing trigger.

### Models — `apps/sales/models/sales.py`

```python
QuotationStatus (TextChoices):
    DRAFT | SUBMITTED | SENT | ACCEPTED | REJECTED | EXPIRED

ApprovalStatus (TextChoices):
    NOT_REQUIRED | PENDING | APPROVED | REJECTED

Quotation
  PK:  id                  UUID, primary_key=True, default=uuid.uuid4
  FK:  customer            ForeignKey → Customer, on_delete=PROTECT
                           # PROTECT: financial record must not be lost if customer deactivated
  FK:  sales_rep           ForeignKey → User, on_delete=PROTECT
                           # PROTECT: rep assignment must remain for audit and reporting
       quotation_number    CharField(64), unique=True, db_index=True
                           # Auto-generated: QT-{YYYYMMDD}-{uuid4.hex[:6].upper()}
       status              CharField, choices=QuotationStatus, default=DRAFT, db_index=True
       approval_status     CharField, choices=ApprovalStatus, default=NOT_REQUIRED, db_index=True
       valid_until         DateField, null=True, blank=True
       currency            CharField(10), default="INR"
       notes               TextField, blank=True

       # All fields below are BACKEND CALCULATED — never accepted from frontend
       subtotal            DecimalField(14, 2), default=0
       discount_amount     DecimalField(14, 2), default=0
       tax_amount          DecimalField(14, 2), default=0
       total_amount        DecimalField(14, 2), default=0
       cost_amount         DecimalField(14, 2), default=0
       margin_amount       DecimalField(14, 2), default=0
       margin_percent      DecimalField(6, 2), default=0
       blended_risk_score  DecimalField(6, 2), default=0

       is_active           BooleanField, default=True, db_index=True
       created_at          DateTimeField, auto_now_add=True
       updated_at          DateTimeField, auto_now=True

  CheckConstraints:
    subtotal >= 0
    total_amount >= 0

  Meta indexes:
    (status, -created_at)
    (customer, -created_at)
    (sales_rep, -created_at)

QuotationItem
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  quotation        ForeignKey → Quotation, on_delete=CASCADE, related_name="items"
  FK:  product          ForeignKey → Product, on_delete=PROTECT
                        # PROTECT: product data must be traceable even after deactivation
  FK:  variant          ForeignKey → ProductVariant, on_delete=SET_NULL,
                        null=True, blank=True
       quantity         PositiveIntegerField, default=1
       unit_price       DecimalField(14, 2)        # resolved from PriceList or product base
       discount_percent DecimalField(6, 2), default=0

       # All fields below are BACKEND CALCULATED
       subtotal         DecimalField(14, 2), default=0
       discount_amount  DecimalField(14, 2), default=0
       tax_percent      DecimalField(6, 2)          # snapshotted from product.tax_percent
       tax_amount       DecimalField(14, 2), default=0
       total_amount     DecimalField(14, 2), default=0
       cost_price       DecimalField(14, 2)         # snapshotted from product.cost_price
       cost_amount      DecimalField(14, 2), default=0
       margin_amount    DecimalField(14, 2), default=0
       margin_percent   DecimalField(6, 2), default=0

       created_at       DateTimeField, auto_now_add=True
       updated_at       DateTimeField, auto_now=True

  CheckConstraints:
    quantity > 0
    0.00 <= discount_percent <= 100.00

QuotationVersion
  PK:  id              UUID, primary_key=True, default=uuid.uuid4
  FK:  quotation       ForeignKey → Quotation, on_delete=CASCADE, related_name="versions"
  FK:  changed_by      ForeignKey → User, on_delete=SET_NULL, null=True, blank=True
                       # SET_NULL: version record survives if user is later deactivated
       version_number  PositiveIntegerField
       snapshot_data   JSONField    # full immutable state snapshot of the quotation + items
       changed_at      DateTimeField, auto_now_add=True
       change_reason   TextField, blank=True

  UniqueConstraint: (quotation, version_number)
```

### Serializers

| Serializer | Used For |
|---|---|
| `QuotationCreateSerializer` | `POST /quotations` — plain Serializer, accepts nested items |
| `QuotationUpdateSerializer` | `PUT /quotations/{id}` — metadata only (currency, valid_until, notes) |
| `QuotationSerializer` | All GET responses — ModelSerializer with nested items + versions_count |
| `QuotationItemCreateSerializer` | `POST /quotations/{id}/items` |
| `QuotationItemUpdateSerializer` | `PUT /quotations/{id}/items/{itemId}` |
| `QuotationItemSerializer` | Read output for line items |
| `QuotationVersionSerializer` | Read-only version history |

**Key rule:** `QuotationSerializer` must expose `customer` as nested object (id + name), not just the FK id. Use `select_related('customer', 'sales_rep')` in `get_queryset`.

### Service — `SalesService`

| Method | Atomic? | What it does |
|---|---|---|
| `create_quotation(customer, sales_rep, currency, valid_until, notes, items)` | ✅ | Validates customer is active, creates Quotation + items + initial version snapshot |
| `update_quotation(quotation, changed_by, **kwargs)` | ✅ | Updates metadata, recalculates, creates version snapshot |
| `add_item(quotation, product, variant, quantity, discount_percent, changed_by)` | ✅ | Resolves price from PriceList, snapshots cost_price + tax_percent, creates item, recalculates, snapshots version |
| `update_item(item, item_data, changed_by)` | ✅ | Updates item fields, recalculates parent quotation, version snapshot |
| `delete_item(item, changed_by)` | ✅ | Deletes line, recalculates parent, version snapshot |
| `submit_quotation(quotation, changed_by)` | ✅ | Status → SUBMITTED, calls `DiscountService.evaluate_risk()`, calls `DiscountService.create_approval_requests()` if needed, version snapshot |
| `send_quotation(quotation, changed_by)` | ✅ | Status → SENT (only if approval_status == APPROVED or NOT_REQUIRED), version snapshot |
| `recalculate_quotation(quotation)` | No | Recalculates all line financials + header totals (authoritative — always called after any item mutation) |
| `create_version_snapshot(quotation, changed_by, change_reason)` | No | Writes immutable JSON snapshot of current quotation + all items |

**Recalculation Formula (per line):**
```python
subtotal         = unit_price * quantity
discount_amount  = subtotal * (discount_percent / 100)
taxable          = subtotal - discount_amount
tax_amount       = taxable * (tax_percent / 100)
total_amount     = taxable + tax_amount
cost_amount      = cost_price * quantity
margin_amount    = taxable - cost_amount
margin_percent   = (margin_amount / taxable * 100) if taxable > 0 else 0

# Quotation header totals = SUM of all lines
# blended_risk_score updated after DiscountService.evaluate_risk() on submit
```

### Views & URLs

```
GET    /api/v1/quotations                                       → list
POST   /api/v1/quotations                                       → create
GET    /api/v1/quotations/{quotationId}                         → retrieve
PUT    /api/v1/quotations/{quotationId}                         → update
DELETE /api/v1/quotations/{quotationId}                         → destroy (soft delete)

POST   /api/v1/quotations/{quotationId}/items                   → add_item
PUT    /api/v1/quotations/{quotationId}/items/{itemId}          → update item
DELETE /api/v1/quotations/{quotationId}/items/{itemId}          → delete item

POST   /api/v1/quotations/{quotationId}/submit                  → submit for approval
POST   /api/v1/quotations/{quotationId}/send                    → send to customer

GET    /api/v1/quotations/{quotationId}/versions                → version history
GET    /api/v1/quotations/{quotationId}/recommendations         → upsell/cross-sell panel
```

**Query Filters on list:**
- `?status=DRAFT`
- `?approvalStatus=PENDING`
- `?salesRepId={uuid}`
- `?customerId={uuid}`
- `?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`

### Permissions

| Permission Class | Rule |
|---|---|
| `IsQuotationOwner` | `request.user == quotation.sales_rep` OR `request.user.is_staff` |
| `IsSalesAdminOrReadOnly` | Read: any `IsInternalUser`; Write/Delete: `IsSalesManager` or `IsAdmin` |

### Validation Rules

- `valid_until` — cannot be a past date
- `quantity` — must be > 0 (enforced by CheckConstraint + serializer)
- `discount_percent` — 0 to 100 inclusive
- `unit_price` — must be ≥ 0
- Cannot add/edit items on a `SUBMITTED` or `SENT` quotation without first returning it to DRAFT
- Inactive customer (`customer.is_active=False`) → reject quotation creation
- `send_quotation` — blocked if `approval_status == PENDING` or `REJECTED`
- Frontend-submitted totals are silently ignored; backend always recalculates

### Status Transition Rules

```
DRAFT      → SUBMITTED   (via /submit — triggers risk evaluation + approval routing)
SUBMITTED  → DRAFT       (if approval RETURN decision)
SUBMITTED  → SENT        (via /send — only if approval_status is APPROVED or NOT_REQUIRED)
SENT       → ACCEPTED    (customer confirms via portal)
SENT       → REJECTED    (customer rejects via portal)
SENT       → DRAFT       (negotiation change request → new version → re-evaluation)
Any active → EXPIRED     (background job when valid_until date passes)
```

---

## 10. Section: warehouse

### Purpose
Manage warehouses, inventory, order creation from approved quotations,
fulfillment planning with multi-warehouse splitting, and backorder tracking.

Orders are **immutable commercial snapshots** — if the quotation changes after order creation, the order is not updated.

### Models — `apps/warehouse/models/warehouse.py`

```python
Warehouse
  PK:  id                     UUID, primary_key=True, default=uuid.uuid4
       name                   CharField(255)
       code                   CharField(64), unique=True
       address                TextField
       shipping_cost_weight   DecimalField(10, 4), default=0
                              # Cost per kg — used in split cost estimation
       is_active              BooleanField, default=True
       created_at             DateTimeField, auto_now_add=True
       updated_at             DateTimeField, auto_now=True

Inventory
  PK:  id                  UUID, primary_key=True, default=uuid.uuid4
  FK:  warehouse           ForeignKey → Warehouse, on_delete=CASCADE
  FK:  product             ForeignKey → Product, on_delete=PROTECT
  FK:  variant             ForeignKey → ProductVariant, on_delete=SET_NULL,
                           null=True, blank=True
       available_quantity  IntegerField, default=0
                           # CheckConstraint: available_quantity >= 0
       reserved_quantity   IntegerField, default=0
                           # Stock allocated to confirmed fulfillment orders
       reorder_level       IntegerField, default=0
       reorder_quantity    IntegerField, default=0
       updated_at          DateTimeField, auto_now=True

  UniqueConstraint: (warehouse, product)
  # One inventory record per product per warehouse

Order
  PK:  id              UUID, primary_key=True, default=uuid.uuid4
  FK:  quotation       ForeignKey → Quotation, on_delete=PROTECT
                       # PROTECT: quotation must remain traceable
  FK:  customer        ForeignKey → Customer, on_delete=PROTECT
  FK:  sales_rep       ForeignKey → User, on_delete=PROTECT
       order_number    CharField(64), unique=True
                       # Auto-generated: ORD-{YYYYMMDD}-{uuid4.hex[:6].upper()}
       status          CharField, choices: PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED

       # Financial snapshot — copied from approved quotation; NEVER recalculated
       subtotal        DecimalField(14, 2)
       discount_total  DecimalField(14, 2)
       tax_total       DecimalField(14, 2)
       grand_total     DecimalField(14, 2)

       order_date      DateField, auto_now_add=True
       created_at      DateTimeField, auto_now_add=True
       updated_at      DateTimeField, auto_now=True

OrderItem
  PK:  id              UUID, primary_key=True, default=uuid.uuid4
  FK:  order           ForeignKey → Order, on_delete=CASCADE
  FK:  product         ForeignKey → Product, on_delete=PROTECT
  FK:  variant         ForeignKey → ProductVariant, on_delete=SET_NULL,
                       null=True, blank=True
       quantity        PositiveIntegerField
       unit_price      DecimalField(14, 2)    # snapshot — not recalculated
       discount_amount DecimalField(14, 2)    # snapshot
       tax_amount      DecimalField(14, 2)    # snapshot
       line_total      DecimalField(14, 2)    # snapshot
       product_type    CharField, choices: HARDWARE | SERVICE | SUBSCRIPTION
                       # Snapshotted from product at time of order creation
       created_at      DateTimeField, auto_now_add=True

FulfillmentOrder
  PK:  id                       UUID, primary_key=True, default=uuid.uuid4
  FK:  order                    ForeignKey → Order, on_delete=CASCADE
       status                   CharField, choices: PLANNED | CONFIRMED | SHIPPED | DELIVERED
       total_shipments          PositiveIntegerField, default=0
       estimated_shipping_cost  DecimalField(10, 2), default=0
       created_at               DateTimeField, auto_now_add=True
       updated_at               DateTimeField, auto_now=True

FulfillmentItem
  PK:  id                   UUID, primary_key=True, default=uuid.uuid4
  FK:  fulfillment_order    ForeignKey → FulfillmentOrder, on_delete=CASCADE
  FK:  warehouse            ForeignKey → Warehouse, on_delete=PROTECT
  FK:  order_item           ForeignKey → OrderItem, on_delete=PROTECT
       allocated_quantity   PositiveIntegerField
       fulfilled_quantity   PositiveIntegerField, default=0
       status               CharField, choices: ALLOCATED | SHIPPED | DELIVERED
       created_at           DateTimeField, auto_now_add=True
       updated_at           DateTimeField, auto_now=True

Backorder
  PK:  id                  UUID, primary_key=True, default=uuid.uuid4
  FK:  order               ForeignKey → Order, on_delete=CASCADE
  FK:  order_item          ForeignKey → OrderItem, on_delete=CASCADE
  FK:  product             ForeignKey → Product, on_delete=PROTECT
       quantity_required   PositiveIntegerField
       quantity_pending    PositiveIntegerField
       expected_date       DateField, null=True, blank=True
       status              CharField, choices: OPEN | PARTIALLY_FILLED | FULFILLED | CANCELLED
       created_at          DateTimeField, auto_now_add=True
       updated_at          DateTimeField, auto_now=True
```

### Service — `WarehouseService`

| Method | Atomic? | What it does |
|---|---|---|
| `create_order_from_quotation(quotation)` | ✅ | Validates `quotation.approval_status == APPROVED` (or `NOT_REQUIRED`), copies all financial data as snapshot into `Order` + `OrderItem` records |
| `plan_fulfillment(order)` | ✅ | Reads inventory across warehouses, greedy-allocates stock, creates `FulfillmentOrder` + `FulfillmentItems`, creates `Backorder` for any shortfall |
| `confirm_fulfillment(fulfillment_order)` | ✅ | Increments `reserved_quantity` on each `Inventory` record, sets status `CONFIRMED` |
| `override_fulfillment(fulfillment_order, allocations, reason, user)` | ✅ | Replaces auto-planned allocations with manual ones, writes audit log |
| `allocate_inventory(product, quantity_required)` | No | Returns dict `{warehouse_id: quantity}` — greedy sort by `available_quantity DESC` |

**Fulfillment Allocation Logic:**
```
1. Query Inventory WHERE product = X AND warehouse.is_active = True
2. Order by available_quantity DESC (fill largest warehouse first → fewer shipments)
3. Greedily fill each warehouse until quantity_required is satisfied
4. If total_available < quantity_required:
     allocate all available → create FulfillmentItems
     remainder → create Backorder record
5. total_shipments = COUNT of distinct warehouse allocations
6. estimated_shipping_cost = SUM(allocated_qty × warehouse.shipping_cost_weight)

Only HARDWARE product_type goes through warehouse fulfillment.
SERVICE and SUBSCRIPTION lines are skipped in fulfillment planning.
```

### Views & URLs

```
GET    /api/v1/warehouses                                         → list   (IsInternalUser)
POST   /api/v1/warehouses                                         → create (IsAdmin)
PUT    /api/v1/warehouses/{warehouseId}                           → update (IsAdmin)

GET    /api/v1/inventory                                          → list   (IsInternalUser)
PUT    /api/v1/inventory/{inventoryId}                            → update stock (IsFinance | IsAdmin)

POST   /api/v1/quotations/{quotationId}/confirm                   → create_order_from_quotation
GET    /api/v1/orders                                             → list   (IsInternalUser)
GET    /api/v1/orders/{orderId}                                   → retrieve
PUT    /api/v1/orders/{orderId}/status                            → update status (IsFinance | IsAdmin)

POST   /api/v1/orders/{orderId}/fulfillment/plan                  → plan_fulfillment
POST   /api/v1/orders/{orderId}/fulfillment/confirm               → confirm_fulfillment
POST   /api/v1/orders/{orderId}/fulfillment/override              → override_fulfillment (IsFinance | IsAdmin)
```

### Validation Rules

- Only `approval_status == APPROVED` OR `approval_status == NOT_REQUIRED` quotations can be confirmed into orders
- Order financial data is a snapshot — any subsequent quotation change does NOT affect the order
- `available_quantity` cannot go below 0 (CheckConstraint + service validation before confirm)
- `reserved_quantity` must always ≤ `available_quantity`
- Manual fulfillment override requires `reason` field — written to `audit_logs`
- `SERVICE` and `SUBSCRIPTION` product lines are excluded from warehouse fulfillment planning

---

## 11. Section: subscription

### Purpose
Hybrid billing — one-time invoices for HARDWARE/SERVICE lines, recurring subscriptions for SUBSCRIPTION lines.
Handles proration for mid-cycle changes, cancellations, and credit notes.
Both billing types can exist on the same order.

### Models — `apps/subscription/models/subscription.py`

```python
SubscriptionPlan
  PK:  id                          UUID, primary_key=True, default=uuid.uuid4
       name                        CharField(255)
       interval                    CharField, choices: MONTHLY | QUARTERLY | YEARLY
       price                       DecimalField(14, 2)
       proration_enabled           BooleanField, default=True
       cancellation_refund_enabled BooleanField, default=False
       is_active                   BooleanField, default=True
       created_at                  DateTimeField, auto_now_add=True
       updated_at                  DateTimeField, auto_now=True

Subscription
  PK:  id                  UUID, primary_key=True, default=uuid.uuid4
  FK:  order               ForeignKey → Order, on_delete=PROTECT
  FK:  customer            ForeignKey → Customer, on_delete=PROTECT
  FK:  subscription_plan   ForeignKey → SubscriptionPlan, on_delete=PROTECT
       subscription_number CharField(64), unique=True
                           # Auto-generated: SUB-{YYYYMMDD}-{uuid4.hex[:6].upper()}
       start_date          DateField
       end_date            DateField, null=True, blank=True
       quantity            PositiveIntegerField, default=1
       current_price       DecimalField(14, 2)
       next_billing_date   DateField
       status              CharField, choices: ACTIVE | PAUSED | CANCELLED | EXPIRED
       created_at          DateTimeField, auto_now_add=True
       updated_at          DateTimeField, auto_now=True

SubscriptionItem
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  subscription     ForeignKey → Subscription, on_delete=CASCADE
  FK:  product          ForeignKey → Product, on_delete=PROTECT
       quantity         PositiveIntegerField
       unit_price       DecimalField(14, 2)
       discount_percent DecimalField(6, 2), default=0
       line_total       DecimalField(14, 2)
       start_date       DateField
       end_date         DateField, null=True, blank=True
       created_at       DateTimeField, auto_now_add=True

BillingSchedule
  PK:  id              UUID, primary_key=True, default=uuid.uuid4
  FK:  subscription    ForeignKey → Subscription, on_delete=CASCADE
  FK:  invoice         ForeignKey → Invoice, on_delete=SET_NULL,
                       null=True, blank=True
                       # SET_NULL: schedule record survives if invoice is cancelled
       billing_date    DateField
       period_start    DateField
       period_end      DateField
       amount          DecimalField(14, 2)
       status          CharField, choices: PENDING | INVOICED | PAID | FAILED
       created_at      DateTimeField, auto_now_add=True
       updated_at      DateTimeField, auto_now=True

Invoice
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  customer         ForeignKey → Customer, on_delete=PROTECT
  FK:  order            ForeignKey → Order, on_delete=SET_NULL,
                        null=True, blank=True
                        # SET_NULL: invoice stays if order is modified post-confirmation
  FK:  subscription     ForeignKey → Subscription, on_delete=SET_NULL,
                        null=True, blank=True
       invoice_number   CharField(64), unique=True
       invoice_type     CharField, choices: ONE_TIME | RECURRING | CREDIT
       subtotal         DecimalField(14, 2)
       tax_amount       DecimalField(14, 2)
       total_amount     DecimalField(14, 2)
       currency         CharField(10), default="INR"
       status           CharField, choices: DRAFT | ISSUED | PAID | OVERDUE | CANCELLED
       issue_date       DateField
       due_date         DateField
       created_at       DateTimeField, auto_now_add=True
       updated_at       DateTimeField, auto_now=True

InvoiceItem
  PK:  id              UUID, primary_key=True, default=uuid.uuid4
  FK:  invoice         ForeignKey → Invoice, on_delete=CASCADE
  FK:  product         ForeignKey → Product, on_delete=SET_NULL,
                       null=True, blank=True
                       # SET_NULL: line description preserved even if product deactivated
       description     CharField(255)
       quantity        PositiveIntegerField
       unit_price      DecimalField(14, 2)
       discount_amount DecimalField(14, 2), default=0
       tax_amount      DecimalField(14, 2), default=0
       line_total      DecimalField(14, 2)
       billing_type    CharField, choices: ONE_TIME | RECURRING
       created_at      DateTimeField, auto_now_add=True

Payment
  PK:  id                    UUID, primary_key=True, default=uuid.uuid4
  FK:  invoice               ForeignKey → Invoice, on_delete=PROTECT
                             # PROTECT: payment record must be traceable to invoice
       amount                DecimalField(14, 2)
                             # CheckConstraint: amount > 0
       payment_method        CharField, choices: BANK_TRANSFER | CHEQUE | CASH | ONLINE
       transaction_reference CharField(255), blank=True
       status                CharField, choices: PENDING | CONFIRMED | FAILED
       paid_at               DateTimeField, null=True, blank=True
       created_at            DateTimeField, auto_now_add=True
       updated_at            DateTimeField, auto_now=True

CreditNote
  PK:  id                 UUID, primary_key=True, default=uuid.uuid4
  FK:  invoice            ForeignKey → Invoice, on_delete=PROTECT
  FK:  customer           ForeignKey → Customer, on_delete=PROTECT
       credit_note_number CharField(64), unique=True
       reason             TextField
       amount             DecimalField(14, 2)
                          # CheckConstraint: amount > 0
       status             CharField, choices: ISSUED | APPLIED | CANCELLED
       issued_at          DateField
       created_at         DateTimeField, auto_now_add=True
       updated_at         DateTimeField, auto_now=True
```

### Service — `SubscriptionService`

| Method | Atomic? | What it does |
|---|---|---|
| `create_billing_from_order(order)` | ✅ | Iterates `OrderItem` records: `HARDWARE`/`SERVICE` → one-time `Invoice`; `SUBSCRIPTION` → `Subscription` + `BillingSchedule` |
| `create_subscription(order, plan, product_items)` | ✅ | Creates `Subscription` + `SubscriptionItems` + future `BillingSchedule` rows up to 12 months |
| `generate_invoice(customer, order, items, invoice_type)` | ✅ | Creates `Invoice` + `InvoiceItem` records; status starts as `DRAFT` |
| `record_payment(invoice, amount, method, reference, user)` | ✅ | Creates `Payment` record; recalculates outstanding; sets `invoice.status = PAID` if outstanding = 0; writes audit log |
| `cancel_subscription(subscription, reason, user)` | ✅ | Sets status `CANCELLED`; if `cancellation_refund_enabled` → calls `calculate_proration()` → creates `CreditNote`; writes audit log |
| `calculate_proration(subscription, change_date)` | No | `remaining_days / total_days_in_period × period_amount` — returns Decimal amount |

**Hybrid Billing Logic:**
```
On create_billing_from_order(order):
  one_time_items = [i for i in order.items if i.product_type in (HARDWARE, SERVICE)]
  subscription_items = [i for i in order.items if i.product_type == SUBSCRIPTION]

  if one_time_items:
      generate_invoice(customer, order, one_time_items, invoice_type=ONE_TIME)

  for item in subscription_items:
      plan = item.product.subscription_plan  # resolved from SubscriptionPlan
      create_subscription(order, plan, [item])

Invoice status flow:
  DRAFT   → ISSUED   (finance sends invoice to customer)
  ISSUED  → PAID     (when SUM(confirmed payments) >= invoice.total_amount)
  ISSUED  → OVERDUE  (background job: due_date < today and status still ISSUED)
  Any     → CANCELLED (admin action only)

Payment outstanding:
  outstanding = invoice.total_amount - SUM(payment.amount WHERE status=CONFIRMED)
  if outstanding <= 0 → invoice.status = PAID
```

### Views & URLs

```
GET    /api/v1/subscription-plans                           → list   (IsInternalUser)
POST   /api/v1/subscription-plans                           → create (IsAdmin)
PUT    /api/v1/subscription-plans/{planId}                  → update (IsAdmin)

POST   /api/v1/subscriptions                                → create (IsFinance | IsAdmin)
PUT    /api/v1/subscriptions/{subscriptionId}               → update (IsFinance | IsAdmin)
POST   /api/v1/subscriptions/{subscriptionId}/cancel        → cancel (IsFinance | IsAdmin)

GET    /api/v1/orders/{orderId}/billing                     → get billing summary for order
POST   /api/v1/invoices/{invoiceId}/payments                → record_payment (IsFinance | IsAdmin)

GET    /api/v1/invoices                                     → list   (IsFinance | IsAdmin)
GET    /api/v1/invoices/{invoiceId}                         → retrieve
```

### Validation Rules

- `Payment.amount` must be > 0 and ≤ outstanding balance (not total_amount — partial payments allowed)
- Cannot cancel a `CANCELLED` or `EXPIRED` subscription
- `due_date` must be ≥ `issue_date`
- Proration only calculated if `SubscriptionPlan.proration_enabled=True`
- `CreditNote.amount` must not exceed original `Invoice.total_amount`
- `invoice_type=CREDIT` invoices are credit notes — never use negative-amount invoices
- All subscription cancellations, payment records, and credit note issuances written to `audit_logs`

---

## 12. Section: negotiations

### Purpose
Customer Portal negotiation workspace. Allows authenticated customer portal users to view quotations, propose line-item counter-offers, and submit negotiation requests.
When material changes (quantity, discount, product, unit price) occur during negotiation, the system automatically creates a new quotation version, recalculates financials, evaluates risk, and triggers re-approval if necessary.

### Models — `apps/negotiations/models/negotiation.py`

```python
QuotationNegotiation
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  quotation        ForeignKey → Quotation, on_delete=CASCADE
  FK:  version          ForeignKey → QuotationVersion, on_delete=CASCADE
  FK:  customer_user    ForeignKey → User, on_delete=PROTECT
       status           CharField, choices: PENDING_REVIEW | ACCEPTED_BY_REP | REJECTED_BY_REP | RE_APPROVAL_REQUIRED
       customer_notes   TextField, blank=True
       rep_notes        TextField, blank=True
       created_at       DateTimeField, auto_now_add=True
       updated_at       DateTimeField, auto_now=True

NegotiationItemChange
  PK:  id                           UUID, primary_key=True, default=uuid.uuid4
  FK:  negotiation                  ForeignKey → QuotationNegotiation, on_delete=CASCADE
  FK:  item                         ForeignKey → QuotationItem, on_delete=CASCADE
       requested_quantity           PositiveIntegerField
       requested_discount_percent   DecimalField(6, 2)
       requested_notes              TextField, blank=True
```

### Service — `NegotiationService`

| Method | Atomic? | What it does |
|---|---|---|
| `submit_negotiation_request(quotation, item_changes, customer_notes, customer_user)` | ✅ | Validates customer ownership, creates `QuotationNegotiation` & `NegotiationItemChange` records, creates new `QuotationVersion` snapshot, recalculates quotation, evaluates risk, and triggers re-approval if risk threshold is exceeded |
| `respond_to_negotiation(negotiation, status, rep_notes, rep_user)` | ✅ | Updates negotiation status, updates quotation state, and records audit trail |

---

## 13. Section: deal_health

### Purpose
Automated deal health monitoring engine. Detects commercial risk indicators such as stalled deals (quotes stuck in DRAFT/SUBMITTED > X days), discount anomalies, and delivery promise slippages.

### Models — `apps/deal_health/models/deal_health.py`

```python
DealHealthAlert
  PK:  id               UUID, primary_key=True, default=uuid.uuid4
  FK:  quotation        ForeignKey → Quotation, on_delete=SET_NULL, null=True, blank=True
  FK:  order            ForeignKey → Order, on_delete=SET_NULL, null=True, blank=True
       alert_type       CharField, choices: STALLED_DEAL | DISCOUNT_ANOMALY | DELIVERY_SLIPPAGE
       severity         CharField, choices: LOW | MEDIUM | HIGH | CRITICAL
       title            CharField(255)
       description      TextField
       is_resolved      BooleanField, default=False
  FK:  resolved_by      ForeignKey → User, on_delete=SET_NULL, null=True, blank=True
       created_at       DateTimeField, auto_now_add=True
       updated_at       DateTimeField, auto_now=True
```

### Service — `DealHealthService`

| Method | Atomic? | What it does |
|---|---|---|
| `scan_stalled_deals(days_threshold=7)` | No | Flags quotations stuck in DRAFT or SUBMITTED state without activity |
| `detect_discount_anomalies()` | No | Flags deals with excessive discounts relative to customer tier averages |
| `check_delivery_slippage()` | No | Flags orders with unfulfilled items or backorders past committed fulfillment date |
| `resolve_alert(alert, user)` | ✅ | Marks alert as resolved and records audit trail |

---

## 14. Section: reports

### Purpose
Reporting and analytics engine. Generates backend-calculated financial reports, sales rep performance summaries, and deal pipeline analytics with PDF (ReportLab) and XLSX (openpyxl) export capabilities.

### Service — `ReportService`

| Method | Atomic? | What it does |
|---|---|---|
| `generate_sales_summary_report(date_from, date_to, sales_rep, status)` | No | Returns backend-calculated metrics (total revenue, total margin, average margin %, total discount amount) |
| `export_report_pdf(report_data)` | No | Generates structured binary PDF document using ReportLab |
| `export_report_xlsx(report_data)` | No | Generates formatted spreadsheet workbook using openpyxl |

---

## 15. Global Rules

These rules apply across **every app** in the project.

### ID Convention
All PKs are UUID. Never use auto-increment integers.

```python
import uuid
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
```

### FK Convention — No Loose References

> ✅ Every model relationship uses a proper Django `ForeignKey`.
> ❌ `CharField` loose references (like storing `customer_id` as a string) are not used anywhere.

```python
# CORRECT
customer = models.ForeignKey('customer.Customer', on_delete=models.PROTECT)

# WRONG — never do this in this project
customer_id = models.CharField(max_length=128)
```

**Choosing `on_delete` correctly:**

| Scenario | on_delete |
|---|---|
| Child must survive if parent is deleted (audit, financial records) | `SET_NULL` |
| Child is meaningless without parent (line items, steps) | `CASCADE` |
| Parent cannot be deleted while children exist (financial safety) | `PROTECT` |

### JSON Naming Contract
All API request/response JSON uses `camelCase`. DRF serializers must use exactly these field names:

| Concept | Canonical Field Name |
|---|---|
| Customer FK | `customerId` |
| Sales rep FK | `salesRepId` |
| Product FK | `productId` |
| Discount | `discountPercent` |
| Unit price | `unitPrice` |
| Subtotal | `subtotal` |
| Discount value | `discountAmount` |
| Tax value | `taxAmount` |
| Final total | `totalAmount` |
| Cost value | `costAmount` |
| Margin value | `marginAmount` |
| Margin % | `marginPercent` |
| Risk score | `blendedRiskScore` |
| Quote status | `status` |
| Approval status | `approvalStatus` |
| Created | `createdAt` |
| Updated | `updatedAt` |

### Standard API Response Envelope

**Success:**
```json
{
  "data": {},
  "meta": { "requestId": "uuid" }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid quotation",
    "fieldErrors": { "discountPercent": "Discount exceeds allowed limit" }
  },
  "meta": { "requestId": "uuid" }
}
```

### Transaction Rules

Use `@transaction.atomic` on every service method that writes more than one table:

```
ViewSet.action()
    → Serializer.is_valid(raise_exception=True)
    → Service.method()          ← @transaction.atomic HERE
        → Validate business rules
        → FK object fetches (get actual model instances, not IDs)
        → Model writes
        → Recalculate if financial
        → Audit log / version snapshot
        → Commit (or rollback on any exception)
```

Never catch generic `Exception` and silently continue. Let transactions roll back cleanly.

### Audit Logging
Every approval action, discount override, manual fulfillment override, payment state change, subscription cancellation, and negotiation change must write a record to `audit_logs`:

| Field | Value |
|---|---|
| `entity_type` | Table name string e.g. `"quotation"` |
| `entity_id` | UUID of the affected record |
| `action` | Verb e.g. `"APPROVED"`, `"PAYMENT_RECORDED"`, `"OVERRIDE"` |
| `actor` | FK → `User` (the user who performed the action) |
| `old_value` | JSONField snapshot before change |
| `new_value` | JSONField snapshot after change |
| `created_at` | Auto timestamp |

### Permission Matrix

| Action | SALES_REP | SALES_MANAGER | FINANCE | ADMIN | CUSTOMER |
|---|---|---|---|---|---|
| Create quotation | ✅ | ✅ | ❌ | ✅ | ❌ |
| View own quotations | ✅ | ✅ | ✅ | ✅ | ❌ |
| Submit quotation | ✅ | ✅ | ❌ | ✅ | ❌ |
| Approve (manager level) | ❌ | ✅ | ❌ | ✅ | ❌ |
| Approve (finance level) | ❌ | ❌ | ✅ | ✅ | ❌ |
| Manage customers | ❌ | ✅ | ❌ | ✅ | ❌ |
| Manage products & pricing | ❌ | ❌ | ❌ | ✅ | ❌ |
| Manage discount rules | ❌ | ❌ | ❌ | ✅ | ❌ |
| View inventory | ❌ | ✅ | ✅ | ✅ | ❌ |
| Update inventory | ❌ | ❌ | ✅ | ✅ | ❌ |
| Fulfillment override | ❌ | ❌ | ✅ | ✅ | ❌ |
| Record payment | ❌ | ❌ | ✅ | ✅ | ❌ |
| Cancel subscription | ❌ | ❌ | ✅ | ✅ | ❌ |
| View own quotes (portal) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Submit negotiation request | ❌ | ❌ | ❌ | ❌ | ✅ |
| Confirm quotation (portal) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Access any internal API | ✅ | ✅ | ✅ | ✅ | ❌ |

### Never Trust the Frontend

- Never accept `subtotal`, `totalAmount`, `marginPercent`, `blendedRiskScore`, or `approvalStatus` from request bodies
- Always recalculate on the backend after any write operation
- Validate all money values as Python `Decimal` — never `float`

```python
# CORRECT
unit_price = Decimal(str(request.data.get("unitPrice", 0)))

# WRONG
unit_price = float(request.data.get("unitPrice", 0))
```

### Soft Delete Convention

- Use `is_active=False` for logical deactivation — never hard-delete business records
- Hard delete only for: migrations, test fixtures, truly orphaned draft records with no downstream references
- All `list` endpoints filter `is_active=True` by default
- Deactivated records remain queryable by ID for audit purposes
