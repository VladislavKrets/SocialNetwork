from rest_framework import permissions


class TestPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        blocked_methods = ('PUT', 'PATCH', 'POST')
        if not request.user.user_extension.is_admin and request.method in blocked_methods:
            return False
        return True
