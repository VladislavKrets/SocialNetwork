from rest_framework import permissions
from core import serializers
from django.contrib.auth.models import User


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


class UserPostPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        serializer = serializers.UserPostSerializer(data=request.data)
        if not serializer.is_valid():
            return False
        data = serializer.validated_data
        user = data.pop('receiver', None)

        if not user:
            return True

        if request.method == 'POST':
            return user == request.user or user.user_extension.are_posts_opened

        return user == request.user


class GroupPostPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        serializer = serializers.GroupPostSerializer(data=request.data)

        if not serializer.is_valid():
            return False

        data = serializer.validated_data
        group = data['group']

        if request.method == 'POST':
            return group.creator == request.user or group.are_posts_opened

        return data['user'] == request.user
