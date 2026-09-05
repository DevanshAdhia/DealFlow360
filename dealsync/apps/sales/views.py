from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from apps.sales.models import Quotation
from apps.sales.serializers import (
    QuotationSerializer,
    QuotationCreateSerializer,
    QuotationUpdateSerializer,
    QuotationItemSerializer,
    QuotationItemCreateSerializer,
    QuotationItemUpdateSerializer,
    QuotationVersionSerializer,
)
from apps.sales.services import SalesService
from dealsync.pagination import StandardResultsPagination


@extend_schema(tags=["Quotation Workspace"])
class QuotationViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet is chosen because Quotation is a primary resource that exposes standard CRUD
    lifecycle operations (list, create, retrieve, update, destroy) along with domain-specific lifecycle actions.
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    search_fields = ["quotation_number", "customer_id", "sales_rep_id", "notes"]
    ordering_fields = ["created_at", "updated_at", "total_amount", "margin_percent"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        get_queryset() is used to restrict visible items to active records, apply user filters,
        and prefetch related items/versions to prevent N+1 database queries during serialization.
        """
        queryset = Quotation.objects.filter(is_active=True).prefetch_related("items", "versions")
        status_param = self.request.query_params.get("status")  # type: ignore[attr-defined]
        approval_param = self.request.query_params.get("approvalStatus") or self.request.query_params.get("approval_status")  # type: ignore[attr-defined]
        sales_rep_param = self.request.query_params.get("salesRepId") or self.request.query_params.get("sales_rep_id")  # type: ignore[attr-defined]
        customer_param = self.request.query_params.get("customerId") or self.request.query_params.get("customer_id")  # type: ignore[attr-defined]

        if status_param:
            queryset = queryset.filter(status=status_param)
        if approval_param:
            queryset = queryset.filter(approval_status=approval_param)
        if sales_rep_param:
            queryset = queryset.filter(sales_rep_id=sales_rep_param)
        if customer_param:
            queryset = queryset.filter(customer_id=customer_param)

        return queryset

    def get_serializer_class(self):
        """
        get_serializer_class() is used because creation and update payloads accept different
        field inputs compared to the detail response representation.
        """
        if self.action == "create":
            return QuotationCreateSerializer
        if self.action in ["update", "partial_update"]:
            return QuotationUpdateSerializer
        return QuotationSerializer

    @extend_schema(
        summary="List Quotations",
        description="Returns a paginated list of quotations with pre-fetched line items.",
        parameters=[
            OpenApiParameter(name="status", description="Filter by status (DRAFT, SUBMITTED, SENT, ACCEPTED, REJECTED)", required=False, type=str),
            OpenApiParameter(name="approvalStatus", description="Filter by approval status", required=False, type=str),
            OpenApiParameter(name="salesRepId", description="Filter by sales representative ID", required=False, type=str),
            OpenApiParameter(name="customerId", description="Filter by customer ID", required=False, type=str),
        ],
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create Quotation",
        description="Creates a new quotation and authoritatively calculates initial totals.",
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quotation = SalesService.create_quotation(**serializer.validated_data)
        return Response(
            QuotationSerializer(quotation).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Retrieve Quotation",
        description="Returns full quotation details including calculated line items and totals.",
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update Quotation",
        description="Updates quotation metadata.",
    )
    def update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        serializer = self.get_serializer(data=request.data, partial=kwargs.pop("partial", False))
        serializer.is_valid(raise_exception=True)
        
        user_id = str(getattr(request.user, "username", "api_user"))
        updated = SalesService.update_quotation(quotation=instance, changed_by=user_id, **serializer.validated_data)
        return Response(QuotationSerializer(updated).data)

    @extend_schema(
        summary="Delete Quotation",
        description="Deletes a quotation.",
    )
    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        SalesService.delete(instance=instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Add Item to Quotation",
        description="Adds a line item to quotation and recalculates backend totals.",
        request=QuotationItemCreateSerializer,
        responses={201: QuotationSerializer},
    )
    @action(detail=True, methods=["post"], url_path="items")
    def add_item(self, request: Request, pk=None) -> Response:
        """
        Custom resource action is used because adding a line item mutates child entities
        and triggers a parent financial recalculation and version snapshot.
        """
        quotation = self.get_object()
        serializer = QuotationItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_id = str(getattr(request.user, "username", "api_user"))
        SalesService.add_item(quotation=quotation, item_data=serializer.validated_data, changed_by=user_id)
        quotation = Quotation.objects.prefetch_related("items", "versions").get(pk=quotation.pk)
        return Response(QuotationSerializer(quotation).data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Update or Delete Quotation Item",
        description="Updates quantity/price or deletes a line item from quotation, recalculating backend totals.",
        parameters=[
            OpenApiParameter(
                name="item_id",
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.PATH,
                description="UUID of the quotation line item to update or delete.",
            ),
        ],
        request=QuotationItemUpdateSerializer,
        responses={200: QuotationSerializer},
    )
    @action(detail=True, methods=["put", "delete"], url_path="items/(?P<item_id>[^/.]+)")
    def manage_item(self, request: Request, pk=None, item_id=None) -> Response:
        """
        Custom resource action handling in-place update (PUT) or deletion (DELETE) of child line items.
        """
        quotation = self.get_object()
        item = quotation.items.get(pk=item_id)
        user_id = str(getattr(request.user, "username", "api_user"))

        if request.method.upper() == "DELETE":
            SalesService.delete_item(item=item, changed_by=user_id)
        else:
            serializer = QuotationItemUpdateSerializer(data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            SalesService.update_item(item=item, item_data=serializer.validated_data, changed_by=user_id)

        quotation = Quotation.objects.prefetch_related("items", "versions").get(pk=quotation.pk)
        return Response(QuotationSerializer(quotation).data)

    @extend_schema(
        summary="Submit Quotation",
        description="Submits quotation for approval and generates version snapshot.",
    )
    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request: Request, pk=None) -> Response:
        """
        Lifecycle action method used because submitting represents a state transition command
        rather than simple CRUD modification.
        """
        quotation = self.get_object()
        user_id = str(getattr(request.user, "username", "api_user"))
        submitted = SalesService.submit_quotation(quotation=quotation, changed_by=user_id)
        return Response(QuotationSerializer(submitted).data)

    @extend_schema(
        summary="Send Quotation to Customer",
        description="Marks quotation status as SENT.",
    )
    @action(detail=True, methods=["post"], url_path="send")
    def send_quotation(self, request: Request, pk=None) -> Response:
        """
        Lifecycle action method used because sending a quote transitions commercial lifecycle state.
        """
        quotation = self.get_object()
        user_id = str(getattr(request.user, "username", "api_user"))
        sent = SalesService.send_quotation(quotation=quotation, changed_by=user_id)
        return Response(QuotationSerializer(sent).data)

    @extend_schema(
        summary="List Version History",
        description="Returns version snapshot history for the quotation.",
        responses={200: QuotationVersionSerializer(many=True)},
    )
    @action(detail=True, methods=["get"], url_path="versions")
    def versions(self, request: Request, pk=None) -> Response:
        """
        Resource action used to fetch historical audit version snapshots for a specific quotation.
        """
        quotation = self.get_object()
        versions = quotation.versions.all()
        return Response(QuotationVersionSerializer(versions, many=True).data)


