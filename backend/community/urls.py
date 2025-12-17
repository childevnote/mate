from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)      # posts/ 주소로 게시글 기능 연결
router.register(r'comments', CommentViewSet) # comments/ 주소로 댓글 기능 연결

urlpatterns = [
    path('', include(router.urls)),
]