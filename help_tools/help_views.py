from drf_spectacular.utils import extend_schema_view, extend_schema
from rest_framework import viewsets
from common.swagger_params1 import organization_params
from django.core.exceptions import PermissionDenied

@extend_schema_view(
    list=extend_schema(parameters=organization_params),
    retrieve=extend_schema(parameters=organization_params),
    create=extend_schema(parameters=organization_params),
    update=extend_schema(parameters=organization_params),
    destroy=extend_schema(parameters=organization_params),
    partial_update=extend_schema(parameters=organization_params)
)
class OrgViewSet(viewsets.ModelViewSet):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_superuser:
            org_header = request.headers.get("org")
            org_id = str(request.profile.org.id)
            if org_id != org_header:
                raise PermissionDenied("You don't have permissions to perform this action!")
        return super().dispatch(request, *args, **kwargs)
