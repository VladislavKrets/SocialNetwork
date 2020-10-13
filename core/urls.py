from django.urls import path
from core import views
from rest_framework.routers import SimpleRouter

router = SimpleRouter()
router.register(r'tests', views.TestViewSet, basename='tests')
router.register(r'users', views.UserViewSet, basename='users')
router.register(r'posts', views.UserPostModelViewSet, basename='posts')
router.register(r'groups', views.GroupsViewSet, basename='groups')

urlpatterns = router.urls
urlpatterns += [
    path('me/', views.CurrentUserMixin.as_view()),
    path('upload/<int:pk>/', views.UserImageUploadView.as_view()),
    path('upload/', views.UserImageUploadView.as_view()),
    path('upload_post_image/<int:pk>/', views.PostImageUploadView.as_view()),
    path('upload_post_image/', views.PostImageUploadView.as_view()),
    path('friends/<int:pk>/', views.FriendsApiView.as_view()),
    path('friends/', views.FriendsApiView.as_view()),
    path('people/<int:pk>/', views.PeopleApiView.as_view()),
    path('people/', views.PeopleApiView.as_view()),
    path('auth/', views.Auth.as_view()),
    path('my_groups/', views.MyGroupsMixin.as_view())
]
