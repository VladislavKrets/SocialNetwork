from rest_framework import serializers
from core import models
from django.contrib.auth.models import User


class GroupSavedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.GroupSavedImage
        fields = ('id', 'image')
        read_only_fields = ('id',)


class SavedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SavedImage
        fields = '__all__'
        read_only_fields = ('id', 'date')


class UserPostSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        images = validated_data.pop('images', None)
        post = models.Post.objects.create(user=self.context['user'], **validated_data)
        if images:
            [post.images.add(i) for i in images]
        return post

    def to_representation(self, instance):
        images = instance.images
        data = super().to_representation(instance)
        images_serializer = SavedImageSerializer(many=True, instance=images)
        data['images'] = images_serializer.data
        return data

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
        if instance.user_extension.avatar:
            serializer = SavedImageSerializer(instance=instance.user_extension.avatar)
            data['avatar'] = serializer.data
        return data

    class Meta:
        model = User
        fields = ('id', 'name', 'surname',)
        read_only_fields = ('id',)


class GroupPostSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        images = validated_data.pop('images', None)
        group_post = models.GroupPost.objects.create(user=self.context['user'],
                                                     **validated_data)
        [group_post.images.add(i) for i in images]
        return group_post

    def to_representation(self, instance):
        print(instance)
        user = instance.user
        images = instance.images
        data = super().to_representation(instance)
        serializer = ReducedUserSerializer(instance=user)
        data['user'] = serializer.data
        serializer = SavedImageSerializer(instance=images, many=True)
        data['images'] = serializer.data
        return data

    class Meta:
        model = models.GroupPost
        fields = '__all__'
        read_only_fields = ('id', 'user', 'date')


class GroupSerializer(serializers.ModelSerializer):
    avatar_image = serializers.CharField(required=False)

    def create(self, validated_data):
        group = models.Group.objects.create(creator=self.context['user'], **validated_data)
        group.user.add(self.context['user'])
        return group

    def to_representation(self, instance):
        data = super().to_representation(instance)
        posts = models.GroupPost.objects.filter(group=instance)
        serializer = GroupPostSerializer(instance=posts, many=True)
        data['posts'] = serializer.data
        return data

    class Meta:
        model = models.Group
        fields = '__all__'
        read_only_fields = ('id', 'user', 'creator')


class ExtendedUserDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.UserExtension
        fields = '__all__'
        read_only_fields = ('id',)


class AuthUserSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(source='user_extension.is_admin', required=False)
    name = serializers.CharField(source='user_extension.name')
    surname = serializers.CharField(source='user_extension.surname')
    avatar = serializers.PrimaryKeyRelatedField(required=False, queryset=models.SavedImage.objects.all())

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create(username=username, password=password)
        user_extension = models.UserExtension.objects.create(user=user, **validated_data['user_extension'])
        return user

    def update(self, instance, validated_data):
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)
        if username:
            instance.username = username
        if password:
            instance.password = password
        instance.save()
        user_extension = instance.user_extension
        serializer = ExtendedUserDataSerializer()
        serializer.update(user_extension, validated_data)
        return instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('password')
        photos = models.UserImage.objects.filter(user=instance).values_list('image', flat=True)
        photos = models.SavedImage.objects.filter(id__in=photos).order_by('-date')
        serializer = SavedImageSerializer(instance=photos, many=True)
        data['photos'] = serializer.data
        posts = models.Post.objects.filter(user=instance).order_by('-date')
        serializer = UserPostSerializer(instance=posts, many=True)
        data['posts'] = serializer.data
        if instance.user_extension.avatar:
            serializer = SavedImageSerializer(instance=instance.user_extension.avatar)
            data['avatar'] = serializer.data
        return data

    class Meta:
        model = User
        fields = ('id', 'username', 'is_admin', 'name', 'surname', 'password', 'avatar')
        read_only_fields = ('id',)


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
