from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from core import models
from django.contrib.auth.models import User
from datetime import datetime


class SavedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.SavedImage
        fields = '__all__'
        read_only_fields = ('id', 'date')


class UserPostSerializer(serializers.ModelSerializer):
    images = serializers.PrimaryKeyRelatedField(required=False,
                                                many=True, queryset=models.SavedImage.objects.all())
    receiver = serializers.PrimaryKeyRelatedField(required=False, queryset=models.User.objects.all())

    def validate(self, attrs):
        user = self.context['user']
        post_receiver = user
        if 'receiver' in attrs:
            post_receiver = attrs['receiver']
        if user != post_receiver and not post_receiver.user_extension.are_posts_opened:
            raise ValidationError('You don\'t have permission to do this action')
        return attrs

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

    def update(self, instance, validated_data):
        images = validated_data.pop('images', None)
        images_id = instance.images.all()

        instance = super().update(instance, validated_data)
        if images:
            new_images = []
            for i in images:
                if i not in images_id:
                    new_images.append(i)
            deleted_images = []
            for i in images_id:
                if i not in images:
                    deleted_images.append(i)
            instance.images.filter(id__in=deleted_images).delete()
            [instance.images.add(i) for i in new_images]
        return instance

    def to_representation(self, instance):
        images = instance.images
        data = super().to_representation(instance)
        images_serializer = SavedImageSerializer(many=True, instance=images)
        data['images'] = images_serializer.data
        serializer = ReducedUserSerializer(instance=instance.user)
        data['user'] = serializer.data
        data['comments_count'] = instance.comments.all().count()
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
        serializer = CommentSerializer(instance=instance.comments.all().order_by('-date'), many=True)
        data['comments'] = serializer.data
        data['comments_count'] = instance.comments.all().count()
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
        fields = ('id', 'name', 'surname')
        read_only_fields = ('id',)


class CommentSerializer(serializers.ModelSerializer):
    images = serializers.PrimaryKeyRelatedField(required=False,
                                                many=True, queryset=models.SavedImage.objects.all())
    user = ReducedUserSerializer(read_only=True)
    post_id = serializers.IntegerField(write_only=True)
    is_user = serializers.BooleanField(write_only=True)

    def create(self, validated_data):
        post_id = validated_data.pop('post_id')
        is_user = validated_data.pop('is_user')
        images = validated_data.pop('images', None)
        comment = models.Comment.objects.create(user=self.context['user'], **validated_data)
        if is_user:
            comment.user_posts.add(models.Post.objects.get(pk=post_id))
        else:
            comment.group_posts.add(models.GroupPost.objects.get(pk=post_id))
        if images:
            [comment.images.add(i) for i in images]
        return comment

    def update(self, instance, validated_data):
        images = validated_data.pop('images', None)
        images_id = instance.images.all()

        instance = super().update(instance, validated_data)
        if images:
            new_images = []
            for i in images:
                if i not in images_id:
                    new_images.append(i)
            deleted_images = []
            for i in images_id:
                if i not in images:
                    deleted_images.append(i)
            instance.images.filter(id__in=deleted_images).delete()
            [instance.images.add(i) for i in new_images]
        return instance


    def to_representation(self, instance):
        data = super(CommentSerializer, self).to_representation(instance)
        serializer = SavedImageSerializer(instance=instance.images, many=True)
        data['images'] = serializer.data
        return data

    class Meta:
        model = models.Comment
        fields = '__all__'
        read_only_fields = ('id', 'user', 'date')


class GroupPostSerializer(serializers.ModelSerializer):
    images = serializers.PrimaryKeyRelatedField(required=False,
                                                many=True, queryset=models.SavedImage.objects.all())

    def validate(self, attrs):
        user = self.context['request'].user
        group = attrs['group']
        if user != group.creator and not group.are_posts_opened:
            raise ValidationError('You don\'t have permission to do this action')
        is_from_group_name = False
        if 'is_from_group_name' in attrs:
            is_from_group_name = attrs['is_from_group_name']
        if user != group.creator and is_from_group_name:
            raise ValidationError('You don\'t have permission to do this action')
        return attrs

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
        data['comments_count'] = instance.comments.all().count()
        return data

    def update(self, instance, validated_data):
        images = validated_data.pop('images', None)
        images_id = instance.images.all()

        instance = super().update(instance, validated_data)
        if images:
            new_images = []
            for i in images:
                if i not in images_id:
                    new_images.append(i)
            deleted_images = []
            for i in images_id:
                if i not in images:
                    deleted_images.append(i)
            instance.images.filter(id__in=deleted_images).delete()
            [instance.images.add(i) for i in new_images]
        return instance

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
        serializer = CommentSerializer(instance=instance.comments.all().order_by('-date'), many=True)
        data['comments'] = serializer.data
        serializer = ReducedGroupSerializer(instance=instance.group)
        data['group'] = serializer.data
        data['comments_count'] = instance.comments.all().count()
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
        if 'user' in self.context:
            data['is_subscribed'] = instance.user.filter(id=self.context['user'].id).exists()
        return data

    class Meta:
        model = models.Group
        fields = ('id', 'avatar_image', 'name', 'creator')
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
        data['subscribers_count'] = instance.user.all().count()
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


class MessageSerializer(serializers.ModelSerializer):
    images = serializers.PrimaryKeyRelatedField(required=False,
                                                many=True, queryset=models.SavedImage.objects.all())
    dialog = serializers.PrimaryKeyRelatedField(required=False,
                                                write_only=True,
                                                queryset=models.Dialog.objects.all())

    def create(self, validated_data):
        dialog = validated_data.pop('dialog')
        images = validated_data.pop('images')
        reversed_dialog = models.Dialog.objects.get(user=dialog.user_to, user_to=dialog.user)
        message = models.Message.objects.create(user=dialog.user, **validated_data)
        [message.images.add(i) for i in images]
        dialog.messages.add(message)
        reversed_dialog.messages.add(message)
        reversed_dialog.is_read = False
        dialog.date = message.date
        reversed_dialog.date = message.date
        dialog.save()
        reversed_dialog.save()
        return message

    def to_representation(self, instance):
        data = super().to_representation(instance)
        serializer = ReducedUserSerializer(instance=instance.user)
        data['user'] = serializer.data
        serializer = SavedImageSerializer(instance=instance.images, many=True)
        data['images'] = serializer.data
        return data

    class Meta:
        model = models.Message
        fields = '__all__'
        read_only_fields = ('id', 'user', 'date')


class DialogSerializer(serializers.ModelSerializer):
    user_to = serializers.PrimaryKeyRelatedField(required=False,
                                                 allow_null=True,
                                                 queryset=User.objects.all())

    def create(self, validated_data):
        user = self.context['user']
        dialog = models.Dialog.objects.get_or_create(user=user, **validated_data)[0]
        reversed_dialog = models.Dialog.objects.get_or_create(user=validated_data['user_to'],
                                                              user_to=user, is_read=False)[0]
        return dialog

    def to_representation(self, instance):
        data = super().to_representation(instance)
        serializer = ReducedUserSerializer(instance=instance.user_to, user=self.context['user'])
        data['user_to'] = serializer.data
        data.pop('messages', None)
        last_message = instance.messages.all().count()
        if last_message > 0:
            last_message = instance.messages.all().order_by('-date')[0]
            serializer = MessageSerializer(instance=last_message)
            data['last_message'] = serializer.data
        else:
            last_message = None
            data['last_message'] = None
        return data

    class Meta:
        model = models.Dialog
        fields = '__all__'
        read_only_fields = ('id', 'user', 'is_read', 'messages', 'date')


class FullDialogSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        data = super().to_representation(instance)
        serializer = ReducedUserSerializer(instance=instance.user_to)
        data['user_to'] = serializer.data
        data.pop('messages', None)
        serializer = MessageSerializer(instance=instance.messages.all().order_by('-date'), many=True)
        data['messages'] = serializer.data
        return data

    class Meta:
        model = models.Dialog
        fields = '__all__'
        read_only_fields = ('id', 'user', 'is_read', 'messages', 'date')


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
        dialog = models.Dialog.objects.filter(user=user, user_to=instance)
        if dialog.exists():
            data['dialog'] = dialog[0].id
        else:
            data['dialog'] = None
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
