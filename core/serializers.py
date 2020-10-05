from rest_framework import serializers
from core import models
from django.contrib.auth.models import User


class PostSavedImageSerializer(serializers.ModelSerializer):

    def __init__(self, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(**kwargs)

    def create(self, validated_data):
        return models.PostSavedImage.objects.create(user=self.user, **validated_data)

    class Meta:
        model = models.PostSavedImage
        fields = ('id', 'image')
        read_only_fields = ('id', )


class UserPostSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        return models.Post.objects.create(user=self.context['user'], **validated_data)

    class Meta:
        model = models.Post
        fields = ('id', 'text', 'images', 'date')
        read_only_fields = ('id', 'date')


class UserSubscriberDataSerializer(serializers.ModelSerializer):

    def __init__(self, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(**kwargs)

    def create(self, validated_data):
        return models.Post.objects.create(user=self.user, **validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        subscriber = data.pop('subscriber')
        user = data.pop('user')
        subscriber = User.objects.get(pk=subscriber)
        user = User.objects.get(pk=user)
        serializer = ReducedUserSerializer(instance=subscriber)
        data['subscriber'] = serializer.data
        serializer = ReducedUserSerializer(instance=user)
        data['user'] = serializer.data
        if models.UserSubscriberData.objects.filter(user=self.user,
                                                    subscriber=subscriber).exists():
            data['type'] = 'friend'
        else:
            data['type'] = 'follower'
        return data

    class Meta:
        model = models.UserSubscriberData
        fields = ('id', 'subscriber', 'user')
        read_only_fields = ('id',)


class ReducedUserSerializer(serializers.ModelSerializer):

    name = serializers.CharField(source='user_extension.name')
    surname = serializers.CharField(source='user_extension.surname')

    def __init__(self, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(**kwargs)

    def to_representation(self, instance):
        user = self.user
        data = super().to_representation(instance)
        followed = models.UserSubscriberData.objects.filter(user=instance, subscriber=user).exists()
        followed_you = models.UserSubscriberData.objects.filter(user=user, subscriber=instance).exists()
        data['followed'] = followed
        data['followed_you'] = followed_you
        if models.UserSavedImage.objects.filter(user=instance, is_avatar=True).exists():
            image_obj = models.UserSavedImage.objects.filter(user=instance, is_avatar=True).order_by('-date')[0]
            serializer = UserSavedImageSerializer(instance=image_obj)
            data['avatar_image'] = serializer.data
        return data

    class Meta:
        model = User
        fields = ('id',  'name', 'surname',)
        read_only_fields = ('id',)


class UserSavedImageSerializer(serializers.ModelSerializer):
    is_avatar = serializers.BooleanField(required=False)

    def __init__(self, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(**kwargs)

    def create(self, validated_data):
        return models.UserSavedImage.objects.create(user=self.user, **validated_data)

    class Meta:
        model = models.UserSavedImage
        fields = ('id', 'image', 'is_avatar')
        read_only_fields = ('id', )


class AuthUserSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(source='user_extension.is_admin', required=False)
    name = serializers.CharField(source='user_extension.name')
    surname = serializers.CharField(source='user_extension.surname')

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create(username=username, password=password)
        user_extension = models.UserExtension.objects.create(user=user, **validated_data['user_extension'])
        return user

    def update(self, instance, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        instance.username = username
        instance.password = password
        instance.save()
        user_extension = instance.user_extension
        user_extension.name = validated_data['name']
        user_extension.surname = validated_data['surname']
        user_extension.save()
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('password')
        photos = models.UserSavedImage.objects.filter(user=instance).order_by('-date')
        serializer = UserSavedImageSerializer(instance=photos, many=True)
        data['photos'] = serializer.data
        posts = models.Post.objects.filter(user=instance).order_by('-date')
        serializer = UserPostSerializer(instance=posts, many=True)
        data['posts'] = serializer.data
        if models.UserSavedImage.objects.filter(user=instance, is_avatar=True).exists():
            image_obj = models.UserSavedImage.objects.filter(user=instance, is_avatar=True).order_by('-date')[0]
            serializer = UserSavedImageSerializer(instance=image_obj)
            data['avatar_image'] = serializer.data
        return data

    class Meta:
        model = User
        fields = ('id', 'username', 'is_admin', 'name', 'surname', 'password',)
        read_only_fields = ('id', )


class ExtendedUserDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.UserExtension
        fields = '__all__'
        read_only_fields = ('id', )


class TestAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TestAnswer
        fields = '__all__'
        read_only_fields = ('id', 'question')


class TestQuestionSerializer(serializers.ModelSerializer):
    answers = TestAnswerSerializer(many=True)

    def create(self, validated_data):
        answers = validated_data.pop('answers')
        question = super().create(validated_data)
        for answer in answers:
            models.TestAnswer.objects.create(question=question, **answer)
        return question

    def update(self, instance, validated_data):
        answers = validated_data.pop('answers')
        question = super().update(instance, validated_data)
        models.TestAnswer.objects.filter(question=question).delete()
        for answer in answers:
            models.TestAnswer.objects.create(question=question, **answer)
        return question

    class Meta:
        model = models.TestQuestion
        fields = '__all__'
        read_only_fields = ('id',)


class UserSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

