from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserSubscriberData(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    subscriber = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE, related_name='user_data')

    class Meta:
        unique_together = [['user', 'subscriber']]


class SavedImage(models.Model):
    image = models.ImageField(upload_to='posts_images')
    date = models.DateTimeField(default=timezone.now)


class Comment(models.Model):
    text = models.TextField(blank=True)
    images = models.ManyToManyField(to=SavedImage, related_name='comment_images', blank=True)
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    date = models.DateTimeField(default=timezone.now)


class Post(models.Model):
    user = models.ForeignKey(to=User, related_name='posts', on_delete=models.deletion.CASCADE)
    receiver = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    text = models.TextField(blank=True)
    images = models.ManyToManyField(to=SavedImage, blank=True)
    date = models.DateTimeField(default=timezone.now)
    comments = models.ManyToManyField(to=Comment, related_name='user_posts', blank=True)


class UserImage(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    image = models.ForeignKey(to=SavedImage, on_delete=models.deletion.CASCADE)


class Group(models.Model):
    user = models.ManyToManyField(to=User, related_name='sc_groups')
    creator = models.ForeignKey(to=User, related_name='created_groups', on_delete=models.deletion.CASCADE)
    name = models.CharField(max_length=255)
    avatar_image = models.ForeignKey(to=SavedImage, null=True, on_delete=models.deletion.SET(None))
    are_posts_opened = models.BooleanField(default=True)


class GroupPost(models.Model):
    group = models.ForeignKey(to=Group, on_delete=models.deletion.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE, null=True)
    text = models.TextField(blank=True)
    images = models.ManyToManyField(to=SavedImage)
    date = models.DateTimeField(default=timezone.now)
    is_from_group_name = models.BooleanField(default=False)
    comments = models.ManyToManyField(to=Comment, related_name='group_posts', blank=True)


class Message(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    text = models.TextField(blank=True)
    images = models.ManyToManyField(to=SavedImage)
    date = models.DateTimeField(default=timezone.now)


class Dialog(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE, related_name='dialogs')
    user_to = models.ForeignKey(to=User, on_delete=models.deletion.SET(None))
    is_read = models.BooleanField(default=True)
    messages = models.ManyToManyField(to=Message, blank=True, related_name='dialogs')
    date = models.DateTimeField(null=True)

    class Meta:
        unique_together = [['user', 'user_to']]


class UserExtension(models.Model):
    user = models.OneToOneField(to=User, related_name='user_extension',
                                parent_link=True,
                                on_delete=models.deletion.CASCADE)
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    are_posts_opened = models.BooleanField(default=True)
    avatar = models.ForeignKey(to=SavedImage, on_delete=models.deletion.SET(None), null=True, related_name='user')
    country = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    birthday_date = models.DateField(null=True)

    def __str__(self):
        return "Is admin"



