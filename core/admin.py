from django.contrib import admin
from core.models import UserExtension, TestQuestion, TestAnswer
from django.contrib.auth.models import User
# Register your models here.


class UserExtensionInline(admin.StackedInline):
    model = UserExtension
    fields = ('is_admin',)


class UserAdmin(admin.ModelAdmin):
    inlines = (UserExtensionInline,)


class TestAnswerInline(admin.TabularInline):
    model = TestAnswer


class TestAnswerAdmin(admin.ModelAdmin):
    inlines = (TestAnswerInline, )

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(TestQuestion, TestAnswerAdmin)
