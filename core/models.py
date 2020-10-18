from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserSubscriberData(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    subscriber = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE, related_name='user_data')


class SavedImage(models.Model):
    image = models.ImageField(upload_to='posts_images')
    date = models.DateTimeField(default=timezone.now)


class Post(models.Model):
    user = models.ForeignKey(to=User, related_name='posts', on_delete=models.deletion.CASCADE)
    receiver = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    text = models.TextField()
    images = models.ManyToManyField(to=SavedImage, blank=True)
    date = models.DateTimeField(default=timezone.now)


class UserImage(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    image = models.ForeignKey(to=SavedImage, on_delete=models.deletion.CASCADE)


class Comment(models.Model):
    text = models.TextField()
    post = models.ForeignKey(to=Post, related_name='comments', on_delete=models.deletion.CASCADE)
    user = models.ForeignKey(to=User, related_name='comments', on_delete=models.deletion.CASCADE)


class Group(models.Model):
    user = models.ManyToManyField(to=User, related_name='sc_groups')
    creator = models.ForeignKey(to=User, related_name='created_groups', on_delete=models.deletion.CASCADE)
    name = models.CharField(max_length=255)
    avatar_image = models.ForeignKey(to=SavedImage, on_delete=models.deletion.CASCADE)


class GroupPost(models.Model):
    group = models.ForeignKey(to=Group, on_delete=models.deletion.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE, null=True)
    text = models.TextField()
    images = models.ManyToManyField(to=SavedImage)
    date = models.DateTimeField(default=timezone.now)


class GroupImages(models.Model):
    group = models.ManyToManyField(to=Group, related_name='groups')
    image = models.CharField(max_length=500)


class GroupSavedImage(models.Model):
    image = models.ImageField(upload_to='group_images')
    date = models.DateTimeField(default=timezone.now)


class TestQuestion(models.Model):
    text = models.TextField()
    type = models.CharField(max_length=50)

    def __str__(self):
        return self.text


class TestAnswer(models.Model):
    text = models.TextField()
    is_right = models.BooleanField()
    question = models.ForeignKey(to=TestQuestion, related_name='answers', on_delete=models.deletion.CASCADE)

    def __str__(self):
        return self.text


class UserExtension(models.Model):
    user = models.OneToOneField(to=User, related_name='user_extension',
                                parent_link=True,
                                on_delete=models.deletion.CASCADE)
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    are_posts_opened = models.BooleanField(default=True)
    avatar = models.ForeignKey(to=SavedImage, on_delete=models.deletion.CASCADE, null=True, related_name='user')

    def __str__(self):
        return "Is admin"



