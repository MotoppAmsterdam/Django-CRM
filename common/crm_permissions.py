from rest_framework.permissions import IsAuthenticated, BasePermission


class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return bool(super().has_permission(request, view) and (request.user.role.name == "ADMIN" or request.user.is_superuser))


class CrmRoles(BasePermission):
    def __init__(self, role):
        self.role = role

    def has_permission(self, request, view):
        is_admin = request.user.role.name == "ADMIN" or request.user.is_superuser
        return is_admin or request.user.role.name == self.role


class CrmPermissions(BasePermission):
    def __init__(self,
                 get: str = None,
                 post: str = None,
                 patch: str = None,
                 put: str = None,
                 delete: str = None
                 ):
        self.get = get
        self.post = post
        self.patch = patch
        self.put = put
        self.delete = delete


    def has_permission(self, request, view):
        user_permissions = set(map(lambda x: x.name, request.user.role.permissions))
        if self.get and request.method == 'GET':
            return self.get in user_permissions

        elif self.post and request.method == 'POST':
            return self.post in user_permissions

        elif self.patch and request.method == 'PATCH':
            return self.patch in user_permissions

        elif self.put and request.method == 'PUT':
            return self.put in user_permissions

        elif self.delete and request.method == 'DELETE':
            return self.delete in user_permissions
        
        else:
            return False

