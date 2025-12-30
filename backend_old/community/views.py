from rest_framework import viewsets, permissions, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Count
from .models import Post, Comment
from .serializers import PostListSerializer, PostDetailSerializer, CommentSerializer
from .permissions import IsOwnerOrReadOnly

# 게시글 관련 뷰셋
class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    # get_queryset에서 annotate를 사용하여 댓글/좋아요 수를 미리 계산
    def get_queryset(self):
        return Post.objects.annotate(
            comment_count=Count('comments', distinct=True),
            like_count=Count('likes', distinct=True)
        ).order_by('-created_at')

    # 필터 및 검색 설정
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_fields = ['category', 'author']
    
    search_fields = ['title', 'content', 'author__nickname']
    ordering_fields = ['created_at', 'view_count', 'like_count', 'comment_count']

    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostDetailSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # 좋아요 토글
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            message = '좋아요 취소'
        else:
            post.likes.add(user)
            message = '좋아요!'
            
        return Response({'message': message, 'like_count': post.likes.count()})

    # 스크랩 토글
    @action(detail=True, methods=['post'])
    def scrap(self, request, pk=None):
        post = self.get_object()
        user = request.user
        
        if post.scraps.filter(id=user.id).exists():
            post.scraps.remove(user)
            message = '스크랩 취소'
        else:
            post.scraps.add(user)
            message = '스크랩 완료'

        return Response({'message': message})

    # 내가 스크랩한 글 목록 가져오기 (GET /api/community/posts/scrapped/)
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def scrapped(self, request):
        posts = self.get_queryset().filter(scraps=request.user)
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)


# 댓글 관련 뷰셋
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('created_at')
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    pagination_class = None # 대댓글 구조를 위해 페이지네이션 끔
    
    filter_backends = [DjangoFilterBackend] 

    filterset_fields = ['post', 'author']
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)