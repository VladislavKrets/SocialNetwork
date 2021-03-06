from django.urls import path
from core import views
from rest_framework.routers import SimpleRouter

router = SimpleRouter()
router.register(r'users', views.UserViewSet, basename='users')
router.register(r'posts', views.UserPostModelViewSet, basename='posts')
router.register(r'groups', views.GroupsViewSet, basename='groups')
router.register(r'group_posts', views.GroupPostsViewSet, basename='group_posts')
router.register(r'comments', views.CommentViewSet, basename='comments')
router.register(r'dialogs', views.DialogViewSet, basename='dialogs')
router.register(r'messages', views.MessageViewSet, basename='messages')

urlpatterns = router.urls
urlpatterns += [
    path('me/', views.CurrentUserMixin.as_view()),
    path('upload_post_image/<int:pk>/', views.ImageUploadView.as_view()),
    path('upload_post_image/', views.ImageUploadView.as_view()),
    path('friends/<int:pk>/', views.FriendsApiView.as_view()),
    path('friends/', views.FriendsApiView.as_view()),
    path('people/<int:pk>/', views.PeopleApiView.as_view()),
    path('people/', views.PeopleApiView.as_view()),
    path('auth/', views.Auth.as_view()),
    path('my_groups/<int:pk>/', views.MyGroupsMixin.as_view()),
    path('my_groups/', views.MyGroupsMixin.as_view())
]
