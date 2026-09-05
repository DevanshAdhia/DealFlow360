import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealsync.settings')
django.setup()

from apps.discount.models import DiscountRule, ApprovalRule

DiscountRule.objects.all().update(is_active=True)
ApprovalRule.objects.all().update(is_active=True)

for r in DiscountRule.objects.all():
    if not r.name:
        t_name = r.customer_tier.name if r.customer_tier else "All"
        c_name = r.category.name if r.category else "All"
        r.name = f"{t_name} - {c_name} Discount Rule"
        r.save()

print("Discount rules count:", DiscountRule.objects.count())
print("Approval rules count:", ApprovalRule.objects.count())
for dr in DiscountRule.objects.all()[:5]:
    print(" - ", dr.id, dr.name, dr.is_active, dr.customer_tier, dr.category)
for ar in ApprovalRule.objects.all()[:5]:
    print(" - ", ar.id, ar.name, ar.is_active)
