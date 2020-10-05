from rest_framework import views
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import RetrieveModelMixin, CreateModelMixin
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from core import serializers
from core import permissions, models
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


class FriendsApiView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        followers = models.UserSubscriberData.objects.filter(subscriber=request.user)\
            .values_list('user', flat=True)
        followers = models.UserSubscriberData.objects.filter(subscriber__in=followers,
                                                           user=request.user)\
            .values_list('subscriber', flat=True)
        followers = models.User.objects.filter(pk__in=followers)
        serializer = serializers.ReducedUserSerializer(user=request.user, instance=followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        data = models.UserSubscriberData.objects.create(user_id=pk, subscriber=request.user)
        return Response(status=status.HTTP_200_OK)


class PeopleApiView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        followers = models.User.objects.filter(user_extension__isnull=False).order_by('-id')
        serializer = serializers.ReducedUserSerializer(user=request.user, instance=followers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserImageUploadView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        posts_serializer = serializers.UserSavedImageSerializer(data=request.data, user=request.user)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            image = models.UserSavedImage.objects.get(pk=pk, user=request.user)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except models.UserSavedImage.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


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
            return Response(data={'error': 'No such user found'},
                            status=status.HTTP_401_UNAUTHORIZED)
        if user.password != data['password']:
            return Response(data={'error': 'Wrong password'},
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
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.AuthUserSerializer
    queryset = User.objects.all()


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
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.UserPostSerializer
    queryset = User.objects.all()

    def get_serializer_context(self):
        return {'user': self.request.user}


class PostImageUploadView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        posts_serializer = serializers.PostSavedImageSerializer(data=request.data, user=request.user)
        if posts_serializer.is_valid():
            posts_serializer.save()
            return Response(posts_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(posts_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            image = models.PostSavedImage.objects.get(pk=pk, user=request.user)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except models.UserSavedImage.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class TestViewSet(viewsets.ModelViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated, permissions.TestPermission]
    serializer_class = serializers.TestQuestionSerializer
    queryset = models.TestQuestion.objects.all()
