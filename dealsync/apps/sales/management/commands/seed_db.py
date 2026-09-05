import random
import uuid
from decimal import Decimal
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from apps.login.models import Role, UserProfile as LoginProfile, UserLoginHistory
from apps.signup.models import UserProfile as SignupProfile, UserRole
from apps.customer.models import CustomerTier, Customer
from apps.product.models import Category, Product, ProductVariant, PriceList, PriceListItem
from apps.discount.models import DiscountRule, ApprovalLevel, ApprovalRule, ApprovalRuleStep, QuotationApproval
from apps.warehouse.models import Warehouse, Inventory, Order, OrderItem, FulfillmentOrder, FulfillmentItem, Backorder
from apps.sales.models import Quotation, QuotationItem, QuotationVersion, QuotationStatus, ApprovalStatus
from apps.subscription.models import SubscriptionPlan, Subscription, SubscriptionItem, BillingSchedule, Invoice, InvoiceItem, Payment, CreditNote
from apps.deal_health.models import DealAlert


class Command(BaseCommand):
    help = "Seeds the PostgreSQL database with 500+ Users and thousands of enterprise records across all domain models."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Purge existing data before seeding new records.",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Starting DealFlow360 Database Seeding Process (500+ Users & Records)..."))

        with transaction.atomic():
            if options.get("reset") or User.objects.count() < 500:
                self.stdout.write(self.style.WARNING("Clearing existing database records for a fresh 500-User dataset..."))
                DealAlert.objects.all().delete()
                Payment.objects.all().delete()
                InvoiceItem.objects.all().delete()
                Invoice.objects.all().delete()
                BillingSchedule.objects.all().delete()
                SubscriptionItem.objects.all().delete()
                Subscription.objects.all().delete()
                SubscriptionPlan.objects.all().delete()
                FulfillmentItem.objects.all().delete()
                FulfillmentOrder.objects.all().delete()
                OrderItem.objects.all().delete()
                Order.objects.all().delete()
                Inventory.objects.all().delete()
                Warehouse.objects.all().delete()
                QuotationApproval.objects.all().delete()
                QuotationVersion.objects.all().delete()
                QuotationItem.objects.all().delete()
                Quotation.objects.all().delete()
                ApprovalRuleStep.objects.all().delete()
                ApprovalRule.objects.all().delete()
                ApprovalLevel.objects.all().delete()
                DiscountRule.objects.all().delete()
                PriceListItem.objects.all().delete()
                PriceList.objects.all().delete()
                ProductVariant.objects.all().delete()
                Product.objects.all().delete()
                Category.objects.all().delete()
                Customer.objects.all().delete()
                CustomerTier.objects.all().delete()
                LoginProfile.objects.all().delete()
                SignupProfile.objects.all().delete()
                User.objects.exclude(is_superuser=True, username="admin_system_root").delete()
                self.stdout.write(self.style.SUCCESS("Existing records purged successfully."))

            # 1. Roles & 500 Users
            self.stdout.write("1/10 Seeding Roles & 500 System Users...")
            roles_data = [
                (Role.ADMIN, "System Administrator"),
                (Role.SALES_REP, "Sales Representative"),
                (Role.SALES_MANAGER, "Sales Manager / Approver"),
                (Role.FINANCE, "Finance & Operations"),
                (Role.CUSTOMER_PORTAL_USER, "Customer Portal Client"),
            ]
            role_objs = {}
            for r_name, desc in roles_data:
                r, _ = Role.objects.get_or_create(name=r_name, defaults={"description": desc})
                role_objs[r_name] = r

            # Pre-hash default password for ultra-fast creation
            hashed_pw = make_password("Password123!")

            first_names = [
                "Aarav", "Ananya", "Rohan", "Sneha", "Vikram", "Kavya", "Arjun", "Ishaan", "Meera", "Rajesh",
                "Sanjay", "Divya", "Pooja", "Aditya", "Nikhil", "Tarun", "Suresh", "Ramesh", "Alok", "Priya",
                "Sunita", "Ritu", "Neha", "Varun", "Manish", "Karan", "Simran", "Deepak", "Aakash", "Preeti",
                "Amit", "Rahul", "Pankaj", "Vikas", "Siddharth", "Gaurav", "Swati", "Shweta", "Anjali", "Rachna"
            ]

            last_names = [
                "Sharma", "Patel", "Verma", "Gupta", "Singh", "Mehta", "Kumar", "Joshi", "Rao", "Nair",
                "Shah", "Reddy", "Agarwal", "Bhat", "Das", "Sen", "Roy", "Iyer", "Menon", "Kulkarni",
                "Chawla", "Deshmukh", "Malhotra", "Kapoor", "Bhasin", "Trivedi", "Saxena", "Choudhury", "Pande", "Dubey"
            ]

            companies_sample = [
                "DealFlow360 Enterprise", "Reliance Systems", "Tata Digital", "Infosys Tech", "Wipro Cloud",
                "HDFC Financial", "ICICI Solutions", "Mahindra Mobility", "L&T Defense", "Adani Power"
            ]

            role_pairs = [
                (Role.SALES_REP, UserRole.SALES_REP),
                (Role.SALES_MANAGER, UserRole.SALES_MANAGER),
                (Role.FINANCE, UserRole.FINANCE),
                (Role.ADMIN, UserRole.ADMIN),
                (Role.CUSTOMER_PORTAL_USER, UserRole.CUSTOMER),
            ]

            # 5 Core Accounts
            core_credentials = [
                ("admin", "admin@dealflow360.io", "Admin", "User", Role.ADMIN, UserRole.ADMIN),
                ("sales_rep1", "rahul.sharma@dealflow360.io", "Rahul", "Sharma", Role.SALES_REP, UserRole.SALES_REP),
                ("sales_rep2", "priya.patel@dealflow360.io", "Priya", "Patel", Role.SALES_REP, UserRole.SALES_REP),
                ("sales_mgr", "amit.verma@dealflow360.io", "Amit", "Verma", Role.SALES_MANAGER, UserRole.SALES_MANAGER),
                ("finance_user", "neha.gupta@dealflow360.io", "Neha", "Gupta", Role.FINANCE, UserRole.FINANCE),
            ]

            users = []
            for username, email, first, last, r_name, s_role in core_credentials:
                u, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        "email": email,
                        "first_name": first,
                        "last_name": last,
                        "password": hashed_pw,
                        "is_staff": (r_name == Role.ADMIN),
                        "is_superuser": (r_name == Role.ADMIN),
                    }
                )
                if not created:
                    u.password = hashed_pw
                    u.save()

                LoginProfile.objects.get_or_create(user=u, defaults={"role": role_objs[r_name]})
                SignupProfile.objects.get_or_create(user=u, defaults={"role": s_role, "company": "DealFlow360 Inc", "phone": "+91 98765 00000"})
                users.append(u)

            # Generate remaining users up to 500
            users_to_create = []
            login_profiles_to_create = []
            signup_profiles_to_create = []

            existing_usernames = set(User.objects.values_list("username", flat=True))

            target_count = 500
            current_count = len(users)

            for i in range(current_count + 1, target_count + 1):
                fn = first_names[(i - 1) % len(first_names)]
                ln = last_names[((i - 1) // len(first_names)) % len(last_names)]
                uname = f"{fn.lower()}_{ln.lower()}_{i}"
                if uname in existing_usernames:
                    uname = f"user_{i:04d}"
                
                email = f"{fn.lower()}.{ln.lower()}{i}@dealflow360.io"
                r_name, s_role = role_pairs[i % len(role_pairs)]
                comp = companies_sample[i % len(companies_sample)]
                phone_num = f"+91 98765 {i:05d}"

                u = User(
                    username=uname,
                    email=email,
                    first_name=fn,
                    last_name=ln,
                    password=hashed_pw,
                    is_active=True,
                    is_staff=(r_name == Role.ADMIN),
                )
                users_to_create.append((u, r_name, s_role, comp, phone_num))

            created_user_objs = User.objects.bulk_create([x[0] for x in users_to_create])
            
            for (u_obj, r_name, s_role, comp, phone_num) in zip(created_user_objs, [x[1] for x in users_to_create], [x[2] for x in users_to_create], [x[3] for x in users_to_create], [x[4] for x in users_to_create]):
                login_profiles_to_create.append(LoginProfile(user=u_obj, role=role_objs[r_name]))
                signup_profiles_to_create.append(SignupProfile(user=u_obj, role=s_role, company=comp, phone=phone_num))

            LoginProfile.objects.bulk_create(login_profiles_to_create)
            SignupProfile.objects.bulk_create(signup_profiles_to_create)

            all_users = list(User.objects.all())
            self.stdout.write(self.style.SUCCESS(f"Successfully generated {len(all_users)} system users!"))

            # 2. Customer Tiers & 500 Customers
            self.stdout.write("2/10 Seeding Customer Tiers & 500 B2B Customers...")
            tiers_data = [
                ("Standard", Decimal("5.00")),
                ("Silver", Decimal("10.00")),
                ("Gold", Decimal("15.00")),
                ("Platinum", Decimal("20.00")),
                ("Enterprise", Decimal("25.00")),
            ]
            tiers = []
            for name, max_disc in tiers_data:
                t, _ = CustomerTier.objects.get_or_create(name=name, defaults={"max_discount_percent": max_disc})
                tiers.append(t)

            company_prefixes = [
                "Reliance", "Tata", "Infosys", "Wipro", "HDFC", "ICICI", "Bharti", "Mahindra", "Larsen & Toubro",
                "Adani", "Sun Pharma", "Asian Paints", "Bajaj Auto", "Titan", "UltraTech", "Godrej", "Cipla",
                "Dr Reddys", "Hindalco", "JSW Steel", "Maruti Suzuki", "Eicher Motors", "Hero MotoCorp", "TVS Mobility",
                "Apollo Hospitals", "Max Healthcare", "Biocon", "Zomato", "Swiggy", "Paytm", "Razorpay", "PhonePe",
                "Flipkart", "Meesho", "Nykaa", "Delhivery", "Shadowfax", "Rivigo", "Zoho", "Freshworks", "Postman",
                "Hasura", "InMobi", "Oyo", "MakeMyTrip", "PolicyBazaar", "Cred", "Groww", "Upstox", "Nvidia India"
            ]

            company_suffixes = ["Digital", "Technologies", "Infra", "Solutions", "Cloud Labs", "Enterprise", "Systems", "Networks", "Global", "Services"]

            customers_to_create = []
            for i in range(1, 501):
                pref = company_prefixes[(i - 1) % len(company_prefixes)]
                suff = company_suffixes[(i - 1) % len(company_suffixes)]
                comp_name = f"{pref} {suff} #{i}"
                tier = tiers[i % len(tiers)]
                c_code = f"CUST-{i:04d}"

                c = Customer(
                    customer_code=c_code,
                    name=comp_name,
                    customer_tier=tier,
                    email=f"contact@cust{i}.com",
                    phone=f"+91 98765 {i:05d}",
                    address=f"Building {i}, Tech Park Sector {random.randint(1, 99)}, City",
                    description=f"Enterprise account registered under {tier.name} tier.",
                    is_active=True,
                )
                customers_to_create.append(c)

            Customer.objects.bulk_create(customers_to_create, ignore_conflicts=True)
            all_customers = list(Customer.objects.all())
            self.stdout.write(self.style.SUCCESS(f"Successfully generated {len(all_customers)} B2B customers!"))

            # 3. Product Categories & 100 Products & 50 Variants
            self.stdout.write("3/10 Seeding Categories & 100 Products...")
            cat_names = [
                "Enterprise Software", "Cloud Infrastructure", "Cyber Security & Defense",
                "Hardware & Servers", "Networking & Telecom", "AI & Business Analytics",
                "Professional Consulting", "SaaS Subscriptions"
            ]
            categories = []
            for cname in cat_names:
                c, _ = Category.objects.get_or_create(name=cname, defaults={"description": f"Products under {cname}"})
                categories.append(c)

            product_templates = [
                ("Enterprise CRM Core", "SUBSCRIPTION", 1200.00, 700.00),
                ("Cloud Compute Node 64C", "HARDWARE", 4500.00, 3100.00),
                ("NextGen Firewall Pro", "HARDWARE", 3200.00, 2100.00),
                ("AI Predictive Insights Pack", "SOFTWARE", 2800.00, 1500.00),
                ("10GbE Core Managed Switch", "HARDWARE", 1900.00, 1200.00),
                ("SOC 24/7 Managed Security", "SERVICE", 5000.00, 3200.00),
                ("Data Lake Analytics Server", "HARDWARE", 8500.00, 5800.00),
                ("Zero Trust Endpoint Suite", "SUBSCRIPTION", 950.00, 500.00),
                ("Database Accelerator Appliance", "HARDWARE", 6200.00, 4200.00),
                ("DevOps CI/CD Automation Engine", "SUBSCRIPTION", 1500.00, 850.00),
            ]

            products_to_create = []
            for i in range(1, 101):
                tmpl_name, tmpl_type, base_sp, base_cp = product_templates[(i - 1) % len(product_templates)]
                category = categories[i % len(categories)]
                sp = Decimal(str(base_sp + (i * 25)))
                cp = Decimal(str(base_cp + (i * 15)))
                p = Product(
                    sku=f"PROD-{1000 + i}",
                    name=f"{tmpl_name} Model-{i:03d}",
                    category=category,
                    product_type="HARDWARE" if tmpl_type == "HARDWARE" else ("SERVICE" if tmpl_type == "SERVICE" else "SUBSCRIPTION"),
                    sales_price=sp,
                    cost_price=cp,
                    tax_percent=Decimal("18.00"),
                    description=f"Enterprise specification product SKU PROD-{1000+i}",
                    is_active=True,
                )
                products_to_create.append(p)

            Product.objects.bulk_create(products_to_create, ignore_conflicts=True)
            all_products = list(Product.objects.all())

            # Product Variants
            variants_to_create = []
            for i in range(1, 51):
                p = all_products[i % len(all_products)]
                v = ProductVariant(
                    sku=f"{p.sku}-V{i}",
                    product=p,
                    attributes={"color": "Rack-Black", "storage": f"{i*2}TB SSD", "ram": "128GB"},
                    sales_price=p.sales_price + Decimal("300.00"),
                    cost_price=p.cost_price + Decimal("180.00"),
                )
                variants_to_create.append(v)

            ProductVariant.objects.bulk_create(variants_to_create, ignore_conflicts=True)
            all_variants = list(ProductVariant.objects.all())

            # 4. Price Lists & Price List Items
            self.stdout.write("4/10 Seeding Price Lists & Price List Items...")
            price_lists = []
            for tier in tiers:
                pl, _ = PriceList.objects.get_or_create(
                    name=f"{tier.name} Standard Catalog",
                    defaults={"customer_tier": tier, "currency": "INR"}
                )
                price_lists.append(pl)

                pl_items_to_create = []
                for prod in all_products[:40]:
                    discount_factor = (Decimal("100.00") - tier.max_discount_percent) / Decimal("100.00")
                    tiered_price = (prod.sales_price * discount_factor).quantize(Decimal("0.01"))
                    pl_items_to_create.append(PriceListItem(price_list=pl, product=prod, unit_price=tiered_price))

                PriceListItem.objects.bulk_create(pl_items_to_create, ignore_conflicts=True)

            # 5. Discount Rules & Approval Rules
            self.stdout.write("5/10 Seeding Discount & Approval Rules...")
            for tier in tiers:
                for cat in categories[:4]:
                    DiscountRule.objects.get_or_create(
                        customer_tier=tier,
                        category=cat,
                        defaults={
                            "name": f"{tier.name} - {cat.name} Discount Rule",
                            "max_discount_percent": tier.max_discount_percent,
                            "manager_threshold_percent": tier.max_discount_percent + Decimal("5.00"),
                            "finance_threshold_percent": tier.max_discount_percent + Decimal("10.00"),
                            "min_margin_percent": Decimal("15.00"),
                            "is_active": True,
                        }
                    )

            level_mgr, _ = ApprovalLevel.objects.get_or_create(sequence=1, defaults={"name": "Sales Manager Level", "required_role": Role.SALES_MANAGER})
            level_fin, _ = ApprovalLevel.objects.get_or_create(sequence=2, defaults={"name": "Finance Director Level", "required_role": Role.FINANCE})
            level_vp, _ = ApprovalLevel.objects.get_or_create(sequence=3, defaults={"name": "VP Sales Level", "required_role": Role.ADMIN})

            rule_low, _ = ApprovalRule.objects.get_or_create(name="Standard Low Risk Flow", defaults={"min_risk_score": 0, "max_risk_score": 30, "is_active": True})
            rule_med, _ = ApprovalRule.objects.get_or_create(name="Medium Margin Risk Flow", defaults={"min_risk_score": 31, "max_risk_score": 70, "is_active": True})
            rule_high, _ = ApprovalRule.objects.get_or_create(name="High Discount Escalation", defaults={"min_risk_score": 71, "max_risk_score": 100, "is_active": True})

            ApprovalRuleStep.objects.get_or_create(approval_rule=rule_low, sequence=1, defaults={"approval_level": level_mgr})
            ApprovalRuleStep.objects.get_or_create(approval_rule=rule_med, sequence=1, defaults={"approval_level": level_mgr})
            ApprovalRuleStep.objects.get_or_create(approval_rule=rule_med, sequence=2, defaults={"approval_level": level_fin})
            ApprovalRuleStep.objects.get_or_create(approval_rule=rule_high, sequence=1, defaults={"approval_level": level_mgr})
            ApprovalRuleStep.objects.get_or_create(approval_rule=rule_high, sequence=2, defaults={"approval_level": level_fin})
            ApprovalRuleStep.objects.get_or_create(approval_rule=rule_high, sequence=3, defaults={"approval_level": level_vp})

            # 6. Warehouses & Inventories
            self.stdout.write("6/10 Seeding Warehouses & Inventory...")
            wh_locations = [
                ("Mumbai Central Logistics Hub", "WH-BOM-01", "Bandra Kurla Complex, Mumbai"),
                ("Delhi National Capital Depot", "WH-DEL-01", "Okhla Industrial Area, New Delhi"),
                ("Bangalore Silicon Valley Hub", "WH-BLR-01", "Electronic City Phase 1, Bangalore"),
                ("Hyderabad Tech Park Warehouse", "WH-HYD-01", "HITEC City, Hyderabad"),
                ("Chennai Port Logistics Depot", "WH-MAA-01", "Sriperumbudur Hub, Chennai"),
            ]
            warehouses = []
            for name, code, addr in wh_locations:
                wh, _ = Warehouse.objects.get_or_create(
                    location_code=code,
                    defaults={"name": name, "address": addr, "is_active": True}
                )
                warehouses.append(wh)

                inv_to_create = []
                for prod in all_products[:30]:
                    inv_to_create.append(Inventory(
                        warehouse=wh,
                        product=prod,
                        variant=None,
                        quantity_on_hand=random.randint(50, 500),
                        quantity_reserved=random.randint(5, 40),
                    ))
                Inventory.objects.bulk_create(inv_to_create, ignore_conflicts=True)

            # 7. 500 Quotations & Quotation Items
            self.stdout.write("7/10 Seeding 500 Quotations & Items...")
            statuses = [
                QuotationStatus.DRAFT, QuotationStatus.SUBMITTED, QuotationStatus.SENT,
                QuotationStatus.ACCEPTED, QuotationStatus.REJECTED, QuotationStatus.EXPIRED
            ]
            approval_statuses = [
                ApprovalStatus.NOT_REQUIRED, ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED
            ]

            quotations_to_create = []
            today = date.today()

            sales_reps = [u for u in all_users if hasattr(u, "profile") and u.profile.role == UserRole.SALES_REP] or all_users[:10]

            for i in range(1, 501):
                cust = all_customers[(i - 1) % len(all_customers)]
                s_rep = sales_reps[i % len(sales_reps)]
                q_status = statuses[i % len(statuses)]
                app_status = ApprovalStatus.APPROVED if q_status == QuotationStatus.ACCEPTED else approval_statuses[i % len(approval_statuses)]
                valid_date = today + timedelta(days=random.randint(15, 60))

                q = Quotation(
                    id=uuid.uuid4(),
                    quotation_number=f"QT-2026-{i:04d}",
                    customer=cust,
                    sales_rep=s_rep,
                    status=q_status,
                    approval_status=app_status,
                    valid_until=valid_date,
                    currency="INR",
                    notes=f"Commercial quote generated for {cust.name} enterprise infrastructure project.",
                    is_active=True,
                )
                quotations_to_create.append(q)

            created_quotations = Quotation.objects.bulk_create(quotations_to_create)

            q_items_to_create = []
            q_versions_to_create = []

            for q in created_quotations:
                # 2 items per quotation
                prod1 = all_products[random.randint(0, len(all_products) - 1)]
                prod2 = all_products[random.randint(0, len(all_products) - 1)]

                q_sub = Decimal("0.00")
                q_disc = Decimal("0.00")
                q_tax = Decimal("0.00")
                q_tot = Decimal("0.00")
                q_cost = Decimal("0.00")

                for p in [prod1, prod2]:
                    qty = random.randint(1, 5)
                    u_price = p.sales_price
                    c_price = p.cost_price
                    disc_pct = Decimal(str(random.choice([0, 5, 10, 15])))
                    tax_pct = Decimal("18.00")

                    sub = u_price * qty
                    disc_amt = (sub * (disc_pct / Decimal("100.00"))).quantize(Decimal("0.01"))
                    after_disc = sub - disc_amt
                    tax_amt = (after_disc * (tax_pct / Decimal("100.00"))).quantize(Decimal("0.01"))
                    tot_amt = after_disc + tax_amt
                    c_amt = c_price * qty
                    m_amt = after_disc - c_amt
                    m_pct = ((m_amt / after_disc) * Decimal("100.00")).quantize(Decimal("0.01")) if after_disc > 0 else Decimal("0.00")

                    q_items_to_create.append(QuotationItem(
                        id=uuid.uuid4(),
                        quotation=q,
                        product=p,
                        product_name=p.name,
                        quantity=qty,
                        unit_price=u_price,
                        discount_percent=disc_pct,
                        subtotal=sub,
                        discount_amount=disc_amt,
                        tax_percent=tax_pct,
                        tax_amount=tax_amt,
                        total_amount=tot_amt,
                        cost_price=c_price,
                        cost_amount=c_amt,
                        margin_amount=m_amt,
                        margin_percent=m_pct,
                    ))

                    q_sub += sub
                    q_disc += disc_amt
                    q_tax += tax_amt
                    q_tot += tot_amt
                    q_cost += c_amt

                q_margin_amt = (q_sub - q_disc) - q_cost
                net_rev = q_sub - q_disc
                q_margin_pct = ((q_margin_amt / net_rev) * Decimal("100.00")).quantize(Decimal("0.01")) if net_rev > 0 else Decimal("0.00")

                q.subtotal = q_sub
                q.discount_amount = q_disc
                q.tax_amount = q_tax
                q.total_amount = q_tot
                q.cost_amount = q_cost
                q.margin_amount = q_margin_amt
                q.margin_percent = q_margin_pct
                q.blended_risk_score = Decimal(str(random.randint(5, 75)))

                q_versions_to_create.append(QuotationVersion(
                    id=uuid.uuid4(),
                    quotation=q,
                    version_number=1,
                    snapshot_data={"quotation_number": q.quotation_number, "total_amount": str(q.total_amount)},
                    changed_by=q.sales_rep,
                    change_reason="Initial quote generation",
                ))

            QuotationItem.objects.bulk_create(q_items_to_create)
            QuotationVersion.objects.bulk_create(q_versions_to_create)
            Quotation.objects.bulk_update(
                created_quotations,
                ["subtotal", "discount_amount", "tax_amount", "total_amount", "cost_amount", "margin_amount", "margin_percent", "blended_risk_score"]
            )
            self.stdout.write(self.style.SUCCESS(f"Successfully generated {len(created_quotations)} quotations with line items!"))

            # 8. Orders & Fulfillment (100 Orders)
            self.stdout.write("8/10 Seeding 100 Orders & Fulfillment...")
            accepted_quotes = [q for q in created_quotations if q.status == QuotationStatus.ACCEPTED]
            if len(accepted_quotes) < 100:
                accepted_quotes = created_quotations[:100]

            orders_to_create = []
            for i, q in enumerate(accepted_quotes[:100], start=1):
                orders_to_create.append(Order(
                    order_number=f"ORD-2026-{i:04d}",
                    quotation=q,
                    customer=q.customer,
                    status=random.choice(["PENDING", "IN_FULFILLMENT", "COMPLETED"]),
                    total_amount=q.total_amount,
                ))

            created_orders = Order.objects.bulk_create(orders_to_create)

            fulfillments_to_create = []
            for i, ord_obj in enumerate(created_orders[:50], start=1):
                fulfillments_to_create.append(FulfillmentOrder(
                    order=ord_obj,
                    warehouse=warehouses[i % len(warehouses)],
                    status="SHIPPED",
                    tracking_number=f"TRACK-IN-{random.randint(100000, 999999)}",
                    shipped_at=timezone.now() - timedelta(days=random.randint(1, 10)),
                ))

            FulfillmentOrder.objects.bulk_create(fulfillments_to_create)

            # 9. Subscriptions, Invoices & Payments (100 Invoices & 50 Payments)
            self.stdout.write("9/10 Seeding Subscriptions, Invoices & Payments...")
            plan1, _ = SubscriptionPlan.objects.get_or_create(name="Enterprise Monthly Plan", defaults={"billing_interval": "MONTHLY", "price": Decimal("2500.00")})
            plan2, _ = SubscriptionPlan.objects.get_or_create(name="Global Annual Plan", defaults={"billing_interval": "ANNUALLY", "price": Decimal("25000.00")})

            subs_to_create = []
            for i in range(1, 51):
                c = all_customers[i % len(all_customers)]
                subs_to_create.append(Subscription(
                    customer=c,
                    plan=plan1 if i % 2 == 0 else plan2,
                    status="ACTIVE",
                    start_date=today - timedelta(days=30),
                    next_billing_date=today + timedelta(days=30),
                ))

            Subscription.objects.bulk_create(subs_to_create)

            invoices_to_create = []
            for i in range(1, 101):
                c = all_customers[i % len(all_customers)]
                q = created_quotations[i % len(created_quotations)]
                inv_status = random.choice(["PAID", "ISSUED", "OVERDUE", "DRAFT"])
                invoices_to_create.append(Invoice(
                    invoice_number=f"INV-2026-{i:04d}",
                    customer=c,
                    quotation=q,
                    invoice_type="ONE_TIME",
                    status=inv_status,
                    subtotal=q.subtotal,
                    tax_amount=q.tax_amount,
                    total_amount=q.total_amount,
                    due_date=today + timedelta(days=30),
                ))

            created_invoices = Invoice.objects.bulk_create(invoices_to_create)

            payments_to_create = []
            for inv in created_invoices:
                if inv.status == "PAID":
                    payments_to_create.append(Payment(
                        invoice=inv,
                        amount=inv.total_amount,
                        payment_method=random.choice(["BANK_TRANSFER", "CREDIT_CARD", "CHEQUE"]),
                        reference_number=f"PAY-REF-{random.randint(100000, 999999)}",
                    ))

            Payment.objects.bulk_create(payments_to_create)

            # 10. Deal Health Alerts (50 Deal Alerts)
            self.stdout.write("10/10 Seeding Deal Health Alerts...")
            alert_types = [
                ("STALLED_DEAL", "High value deal has had no status updates for >14 days", "HIGH"),
                ("HIGH_DISCOUNT_RISK", "Discount percentage exceeds recommended tier limit by 10%", "CRITICAL"),
                ("MARGIN_EROSION", "Calculated gross margin fell below 15% minimum threshold", "MEDIUM"),
                ("UNUSUAL_VOLUME", "Quotation order volume exceeds 300% of historical average", "LOW"),
            ]

            alerts_to_create = []
            for i in range(1, 51):
                q = created_quotations[i * 7 % len(created_quotations)]
                a_type, a_details, a_sev = alert_types[i % len(alert_types)]
                alerts_to_create.append(DealAlert(
                    quotation=q,
                    alert_type=a_type,
                    severity=a_sev,
                    title=f"{a_type.replace('_', ' ').title()} - Quote {q.quotation_number}",
                    details=f"{a_details} (Customer: {q.customer.name if q.customer else 'N/A'}).",
                    is_resolved=False,
                ))

            DealAlert.objects.bulk_create(alerts_to_create)

        self.stdout.write(self.style.SUCCESS("\nSuccessfully seeded real PostgreSQL Database!"))
        self.stdout.write(self.style.SUCCESS(f"- Users & Profiles: {User.objects.count()} (500 System Users)"))
        self.stdout.write(self.style.SUCCESS(f"- Customer Tiers: {CustomerTier.objects.count()}"))
        self.stdout.write(self.style.SUCCESS(f"- Customers: {Customer.objects.count()} (500 B2B Customers)"))
        self.stdout.write(self.style.SUCCESS(f"- Product Categories: {Category.objects.count()}"))
        self.stdout.write(self.style.SUCCESS(f"- Products & Variants: {Product.objects.count()} products, {ProductVariant.objects.count()} variants"))
        self.stdout.write(self.style.SUCCESS(f"- Price Lists & Items: {PriceList.objects.count()} lists, {PriceListItem.objects.count()} items"))
        self.stdout.write(self.style.SUCCESS(f"- Discount & Approval Rules: {DiscountRule.objects.count()} rules, {ApprovalRule.objects.count()} approval rules"))
        self.stdout.write(self.style.SUCCESS(f"- Warehouses & Inventories: {Warehouse.objects.count()} warehouses, {Inventory.objects.count()} inventory rows"))
        self.stdout.write(self.style.SUCCESS(f"- Quotations & Line Items: {Quotation.objects.count()} quotations, {QuotationItem.objects.count()} line items"))
        self.stdout.write(self.style.SUCCESS(f"- Orders & Fulfillments: {Order.objects.count()} orders, {FulfillmentOrder.objects.count()} fulfillments"))
        self.stdout.write(self.style.SUCCESS(f"- Invoices & Payments: {Invoice.objects.count()} invoices, {Payment.objects.count()} payments"))
        self.stdout.write(self.style.SUCCESS(f"- Deal Health Alerts: {DealAlert.objects.count()} active alerts"))
        self.stdout.write(self.style.SUCCESS(f"TOTAL REAL DB RECORDS SEEDED: >3,000+ entries across all tables!\n"))
