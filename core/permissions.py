from rest_framework import permissions


class TestPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        blocked_methods = ('PUT', 'PATCH', 'POST')
        if not request.user.user_extension.is_admin and request.method in blocked_methods:
            return False
        return True


class UserPermission(permissions.BasePermission):

    def __init__(self, blocked_methods):
        self.blocked_methods = blocked_methods

    def has_object_permission(self, request, view, obj):
        if request.method not in self.blocked_methods:
            return True
        return obj == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class IsGroupOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.creator == request.user


class DialogPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
