from rest_framework import serializers
from core import models
from django.contrib.auth.models import User


class SavedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SavedImage
        fields = '__all__'
        read_only_fields = ('id', 'date')


class UserPostSerializer(serializers.ModelSerializer):
    images = serializers.PrimaryKeyRelatedField(required=False,
                                                many=True, queryset=models.SavedImage.objects.all())
    receiver = serializers.PrimaryKeyRelatedField(required=False, queryset=models.User.objects.all())

    def create(self, validated_data):
        images = validated_data.pop('images', None)
        user = self.context['user']
        if 'receiver' not in validated_data:
            post = models.Post.objects.create(user=user, receiver=user, **validated_data)
        else:
            post = models.Post.objects.create(user=user, **validated_data)
        if images:
            [post.images.add(i) for i in images]
        return post

    def to_representation(self, instance):
        images = instance.images
        data = super().to_representation(instance)
        images_serializer = SavedImageSerializer(many=True, instance=images)
        data['images'] = images_serializer.data
        serializer = ReducedUserSerializer(instance=instance.user)
        data['user'] = serializer.data
        return data

    class Meta:
        model = models.Post
        fields = ('id', 'text', 'images', 'date', 'receiver',)
        read_only_fields = ('id', 'date',)


class FullUserPostSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        images = instance.images
        data = super().to_representation(instance)
        images_serializer = SavedImageSerializer(many=True, instance=images)
        data['images'] = images_serializer.data
        serializer = ReducedUserSerializer(instance=instance.user)
        data['user'] = serializer.data
        serializer = CommentSerializer(instance=instance.comments, many=True)
        data['comments'] = serializer.data
        return data

    class Meta:
        model = models.Post
        fields = '__all__'


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

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

    def to_representation(self, instance):
        user = self.context['user'] if 'user' in self.context else self.user
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


class CommentSerializer(serializers.ModelSerializer):
    user = ReducedUserSerializer(read_only=True)

    class Meta:
        model = models.GroupPost
        fields = '__all__'
        read_only_fields = ('id', 'user', 'date')


class GroupPostSerializer(serializers.ModelSerializer):
    images = serializers.PrimaryKeyRelatedField(required=False,
                                                many=True, queryset=models.SavedImage.objects.all())

    def create(self, validated_data):
        images = validated_data.pop('images', None)
        group_post = models.GroupPost.objects.create(user=self.context['user'],
                                                     **validated_data)
        [group_post.images.add(i) for i in images]
        return group_post

    def to_representation(self, instance):
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
        fields = ('id', 'group', 'user', 'text', 'images', 'date', 'is_from_group_name')
        read_only_fields = ('id', 'user', 'date')


class FullGroupPostSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        user = instance.user
        images = instance.images
        data = super().to_representation(instance)
        serializer = ReducedUserSerializer(instance=user)
        data['user'] = serializer.data
        serializer = SavedImageSerializer(instance=images, many=True)
        data['images'] = serializer.data
        serializer = CommentSerializer(instance=instance.comments, many=True)
        data['comments'] = serializer.data
        return data

    class Meta:
        model = models.GroupPost
        fields = '__all__'


class ReducedGroupSerializer(serializers.ModelSerializer):
    avatar_image = serializers.PrimaryKeyRelatedField(required=False, allow_null=True,
                                                      queryset=models.SavedImage.objects.all())

    def create(self, validated_data):
        group = models.Group.objects.create(creator=self.context['user'], **validated_data)
        group.user.add(self.context['user'])
        return group

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar_image:
            serializer = SavedImageSerializer(instance=instance.avatar_image)
            data['avatar_image'] = serializer.data
        data['is_subscribed'] = instance.user.filter(id=self.context['user'].id).exists()
        return data

    class Meta:
        model = models.Group
        fields = ('id', 'avatar_image', 'name')
        read_only_fields = ('id', 'user', 'creator',)


class GroupSerializer(serializers.ModelSerializer):
    avatar_image = serializers.PrimaryKeyRelatedField(required=False, allow_null=True,
                                                      queryset=models.SavedImage.objects.all())

    def create(self, validated_data):
        group = models.Group.objects.create(creator=self.context['user'], **validated_data)
        group.user.add(self.context['user'])
        return group

    def to_representation(self, instance):
        data = super().to_representation(instance)
        posts = models.GroupPost.objects.filter(group=instance).order_by('-date')
        serializer = GroupPostSerializer(instance=posts, many=True)
        data['posts'] = serializer.data
        if instance.avatar_image:
            serializer = SavedImageSerializer(instance=instance.avatar_image)
            data['avatar_image'] = serializer.data
        data['is_subscribed'] = instance.user.filter(id=self.context['user'].id).exists()
        subscribers = instance.user.all().order_by('-id')
        serializer = ReducedUserSerializer(many=True, instance=subscribers)
        data['subscribers'] = serializer.data
        return data

    class Meta:
        model = models.Group
        fields = '__all__'
        read_only_fields = ('id', 'user', 'creator',)


class ExtendedUserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.UserExtension
        fields = '__all__'
        read_only_fields = ('id',)


class AuthUserSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(source='user_extension.is_admin', required=False)
    name = serializers.CharField(source='user_extension.name')
    surname = serializers.CharField(source='user_extension.surname')
    are_posts_opened = serializers.BooleanField(required=False, source='user_extension.are_posts_opened')
    avatar = serializers.PrimaryKeyRelatedField(required=False, source='user_extension.avatar',
                                                allow_null=True, queryset=models.SavedImage.objects.all())
    country = serializers.CharField(required=False, allow_null=True, source='user_extension.country')
    city = serializers.CharField(required=False, allow_null=True, source='user_extension.city')
    birthday_date = serializers.DateField(required=False, allow_null=True, source='user_extension.birthday_date')

    def create(self, validated_data):
        user_extension_data = validated_data.pop('user_extension')
        user = super().create(validated_data)
        user_extension = models.UserExtension.objects.create(user=user, **user_extension_data)
        return user

    def update(self, instance, validated_data):
        user_extension_data = validated_data.pop('user_extension')
        instance = super().update(instance, validated_data)
        user_extension = instance.user_extension
        serializer = ExtendedUserDataSerializer()
        serializer.update(user_extension, user_extension_data)
        return instance

    def to_representation(self, instance):
        user = self.context['user'] if 'user' in self.context else None
        data = super().to_representation(instance)
        data.pop('password')
        data.pop('username')
        photos = models.UserImage.objects.filter(user=instance).values_list('image', flat=True)
        photos = models.SavedImage.objects.filter(id__in=photos).order_by('-date')
        serializer = SavedImageSerializer(instance=photos, many=True)
        data['photos'] = serializer.data
        posts = models.Post.objects.filter(receiver=instance).order_by('-date')
        serializer = UserPostSerializer(instance=posts, many=True)
        data['posts'] = serializer.data
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
        fields = ('id', 'username', 'is_admin', 'name',
                  'surname', 'password', 'avatar', 'are_posts_opened',
                  'country', 'city', 'birthday_date')
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

