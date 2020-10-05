from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserExtension(models.Model):
    user = models.OneToOneField(to=User, related_name='user_extension',
                                parent_link=True,
                                on_delete=models.deletion.CASCADE)
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return "Is admin"


class UserSubscriberData(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    subscriber = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE, related_name='user_data')


class UserSavedImage(models.Model):
    image = models.ImageField(upload_to='images')
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE, related_name='images')
    date = models.DateTimeField(default=timezone.now)
    is_avatar = models.BooleanField(default=False)


class Post(models.Model):
    user = models.ForeignKey(to=User, related_name='posts', on_delete=models.deletion.CASCADE)
    text = models.TextField()
    images = models.TextField()
    date = models.DateTimeField(default=timezone.now)


class PostSavedImage(models.Model):
    image = models.ImageField(upload_to='posts_images')
    user = models.ForeignKey(to=User, on_delete=models.deletion.CASCADE)
    date = models.DateTimeField(default=timezone.now)


class Comment(models.Model):
    text = models.TextField()
    post = models.ForeignKey(to=Post, related_name='comments', on_delete=models.deletion.CASCADE)
    user = models.ForeignKey(to=User, related_name='comments', on_delete=models.deletion.CASCADE)


class Group(models.Model):
    user = models.ManyToManyField(to=User, related_name='sc_groups')
    name = models.CharField(max_length=255)


class GroupSavedImage(models.Model):
    image = models.ImageField(upload_to='groups_images')
    post = models.ForeignKey(to=Group, on_delete=models.deletion.CASCADE, related_name='images')
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



