from rest_framework import views
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin, ListModelMixin, DestroyModelMixin
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from core import serializers
from core import permissions, models
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from functools import partial
from django.http import Http404


class FriendsApiView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        followers = models.UserSubscriberData.objects.filter(subscriber=request.user) \
            .values_list('user', flat=True)
        followers = models.UserSubscriberData.objects.filter(subscriber__in=followers,
                                                             user=request.user) \
            .values_list('subscriber', flat=True)
        followers = models.User.objects.filter(pk__in=followers).order_by('-id')
        serializer = serializers.ReducedUserSerializer(user=request.user, instance=followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        data = models.UserSubscriberData.objects.create(user_id=pk, subscriber=request.user)
        return Response(status=status.HTTP_200_OK)

    def put(self, request):
        followers = models.UserSubscriberData.objects.filter(subscriber=request.user) \
            .values_list('user', flat=True)
        followers = models.UserSubscriberData.objects.filter(user=request.user) \
            .exclude(subscriber__in=followers) \
            .values_list('subscriber', flat=True)
        followers = models.User.objects.filter(pk__in=followers).order_by('-id')
        serializer = serializers.ReducedUserSerializer(user=request.user, instance=followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        followers = models.UserSubscriberData.objects.filter(user=request.user) \
            .values_list('subscriber', flat=True)
        followers = models.UserSubscriberData.objects.filter(subscriber=request.user) \
            .exclude(user__in=followers) \
            .values_list('user', flat=True)
        followers = models.User.objects.filter(pk__in=followers).order_by('-id')
        serializer = serializers.ReducedUserSerializer(user=request.user, instance=followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        serializer = serializers.SearchUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        followers = models.User.objects.filter(user_extension__isnull=False)

        return self.search_people(data, followers, request)

    def search_people(self, data, followers, request):
        words = data['name'].split()
        if len(words) == 0:
            result = followers.filter().distinct()
        else:
            result = followers.filter(user_extension__name__icontains=data['name']).distinct()
        for word in words:
            result |= followers.filter(user_extension__name__icontains=word).distinct()
            result |= followers.filter(user_extension__surname__icontains=word).distinct()
        result = result.order_by('-id')
        serializer = serializers.ReducedUserSerializer(user=request.user, instance=result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PeopleApiView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        followers = models.User.objects.filter(user_extension__isnull=False).order_by('-id')
        serializer = serializers.ReducedUserSerializer(user=request.user, instance=followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = serializers.SearchUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data

        followers = models.UserSubscriberData.objects.filter(subscriber=request.user) \
            .values('user')
        followers = models.UserSubscriberData.objects.filter(subscriber__in=followers,
                                                             user=request.user) \
            .values('subscriber')
        followers = models.User.objects.filter(pk__in=followers)

        return self.search_people(data, followers, request)

    def search_people(self, data, followers, request):
        words = data['name'].split()
        if len(words) == 0:
            result = followers.filter().distinct()
        else:
            result = followers.filter(user_extension__name__icontains=data['name']).distinct()
        for word in words:
            result |= followers.filter(user_extension__name__icontains=word).distinct()
            result |= followers.filter(user_extension__surname__icontains=word).distinct()
        result = result.order_by('-id')
        serializer = serializers.ReducedUserSerializer(user=request.user, instance=result, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = serializers.SearchUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data

        followers = models.UserSubscriberData.objects.filter(subscriber=request.user) \
            .values('user')
        followers = models.UserSubscriberData.objects.filter(user=request.user) \
            .exclude(subscriber__in=followers) \
            .values('subscriber')
        followers = models.User.objects.filter(pk__in=followers)
        return self.search_people(data, followers, request)

    def patch(self, request):
        serializer = serializers.SearchUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data

        followers = models.UserSubscriberData.objects.filter(user=request.user) \
            .values('subscriber')
        followers = models.UserSubscriberData.objects.filter(subscriber=request.user) \
            .exclude(user__in=followers) \
            .values('user')
        followers = models.User.objects.filter(pk__in=followers)

        return self.search_people(data, followers, request)

    def delete(self, request, pk):
        models.UserSubscriberData.objects.filter(subscriber=request.user, user_id=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class Auth(views.APIView):

    def put(self, request):
        data = request.data
        if 'username' not in request.data and 'password' not in request.data:
            return Response(data={'error': 'Invalid fields'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            user = User.objects \
                .get(username=data['username'])
        except User.DoesNotExist:
            user = None
        if not user:
            return Response(data={'error': 'Такой пользователь не найден'},
                            status=status.HTTP_401_UNAUTHORIZED)
        if user.password != data['password']:
            return Response(data={'error': 'Неверный пароль'},
                            status=status.HTTP_401_UNAUTHORIZED)
        token = Token.objects.get_or_create(user=user)[0]
        user_serializer = serializers.AuthUserSerializer(instance=user)
        return Response({'token': token.key, 'user': user_serializer.data},
                        status=status.HTTP_200_OK)

    def post(self, request):
        user_serializer = serializers.AuthUserSerializer(data=request.data)
        if not user_serializer.is_valid():
            return Response(data=user_serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
        data = user_serializer.validated_data
        if User.objects.filter(username=data['username']).exists():
            return Response(data={'error': 'User with such email already exists'},
                            status=status.HTTP_401_UNAUTHORIZED)
        user = user_serializer.save()
        token = Token.objects.get_or_create(user=user)[0]
        user_serializer = serializers.AuthUserSerializer(instance=user)
        return Response({'token': token.key, 'user': user_serializer.data}, status=status.HTTP_200_OK)


class UserViewSet(ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated,
                          partial(permissions.UserPermission, ['PUT', 'PATCH', 'DELETE'])]
    serializer_class = serializers.AuthUserSerializer
    queryset = User.objects.all()

    def get_serializer_context(self):
        return {'user': self.request.user}


class CurrentUserMixin(RetrieveModelMixin, GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.AuthUserSerializer
    queryset = User.objects.all()

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def get_object(self):
        return self.request.user


class UserPostModelViewSet(ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, permissions.UserPostPermission]
    serializer_class = serializers.UserPostSerializer
    queryset = models.Post.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.FullUserPostSerializer
        return super().get_serializer_class()

    def get_serializer_context(self):
        return {'user': self.request.user}


class ImageUploadView(CreateModelMixin, DestroyModelMixin, GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = serializers.SavedImageSerializer
    queryset = models.SavedImage.objects.all()

    def post(self, request, *args, **kwargs):
        data = request.data
        is_photo = False if data['photo'] == 'false' else True
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        if bool(is_photo):
            models.UserImage.objects.create(user=request.user, image=instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class MyGroupsMixin(ListModelMixin, GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.ReducedGroupSerializer

    def get_queryset(self):
        return models.Group.objects.filter(user=self.request.user).order_by('-id')

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def post(self, request, pk):
        try:
            group = models.Group.objects.get(pk=pk)
        except models.Group.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        group.user.add(request.user)
        return Response(status=status.HTTP_200_OK)

    def put(self, request):
        groups = models.Group.objects.filter(creator=request.user).order_by('-id')
        serializer = self.get_serializer(many=True, instance=groups)
        return Response(status=status.HTTP_200_OK, data=serializer.data)

    def patch(self, request):
        serializer = serializers.SearchGroupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        instance = None
        data_name = {}
        if data['name']:
            data_name['name__icontains'] = data['name']
        if data['chooser'] == 'my groups':
            instance = models.Group.objects.filter(user=self.request.user, **data_name).order_by('-id')
        elif data['chooser'] == 'admin':
            instance = models.Group.objects.filter(creator=self.request.user, **data_name).order_by('-id')
        elif data['chooser'] == 'groups':
            instance = models.Group.objects.filter(**data_name).order_by('-id')

        serializer = serializers.ReducedGroupSerializer(instance=instance, many=True)
        return Response(status=status.HTTP_200_OK, data=serializer.data)

    def delete(self, request, pk):
        try:
            group = models.Group.objects.get(pk=pk)
        except models.Group.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        group.user.remove(request.user)
        return Response(status=status.HTTP_200_OK)


class GroupsViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, permissions.IsGroupOwnerOrReadOnly]
    serializer_class = serializers.GroupSerializer
    queryset = models.Group.objects.all().order_by('-id')

    def get_serializer_class(self):
        if self.action == 'list':
            return serializers.ReducedGroupSerializer
        return super().get_serializer_class()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context


class GroupPostsViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, permissions.GroupPostPermission
                          ]
    serializer_class = serializers.GroupPostSerializer
    queryset = models.GroupPost.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.FullGroupPostSerializer
        return super().get_serializer_class()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context


class CommentViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, permissions.CommentPermission]
    serializer_class = serializers.CommentSerializer
    queryset = models.Comment.objects.all().order_by('-date')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context


class DialogViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.DialogSerializer

    def get_queryset(self):
        return models.Dialog.objects.exclude(messages=None).filter(user=self.request.user).order_by('-date')

    def get_object(self):
        try:
            obj = models.Dialog.objects.get(pk=self.kwargs['pk'], user=self.request.user)
            obj.is_read = True
            obj.save()
            return obj
        except models.Dialog.DoesNotExist:
            raise Http404

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return serializers.FullDialogSerializer
        return super().get_serializer_class()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context


class MessageViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, permissions.IsOwnerOrReadOnly]
    serializer_class = serializers.MessageSerializer

    def get_queryset(self):
        dialog = self.request.data['dialog']
        dialog = models.Dialog.objects.get(id=dialog)
        if self.request.user.id == dialog.user.id:
            return models.Message.objects.filter(dialog=self.request.data['dialog']).order_by('-date')
        return None

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

