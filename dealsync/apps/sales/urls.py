from rest_framework.routers import DefaultRouter
from apps.sales.views import QuotationViewSet

router = DefaultRouter()
router.register(r"quotations", QuotationViewSet, basename="quotation")

urlpatterns = router.urls
