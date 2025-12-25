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
            comment_count=Count('comments', distinct=True), # distinct=True: 중복 계산 방지
            like_count=Count('likes', distinct=True)
        ).order_by('-created_at')

    # 필터 및 검색 설정
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_fields = ['category']
    search_fields = ['title', 'content', 'author__nickname']
    # 정렬 기준에 댓글 수와 좋아요 수 추가
    ordering_fields = ['created_at', 'view_count', 'like_count', 'comment_count']

    # 목록 조회와 상세 조회 시 다른 시리얼라이저 사용
    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostDetailSerializer

    # 글 작성 시 작성자 자동 저장
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    # 상세 조회 시 조회수 증가 로직
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # 좋아요 토글 기능
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
            
        # 변경된 최신 좋아요 수를 반환 (post.likes.count() 사용)
        return Response({'message': message, 'like_count': post.likes.count()})

    # 스크랩 토글 기능
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

# 댓글 관련 뷰셋
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('created_at') # 댓글은 작성순 정렬
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    pagination_class = None
    filter_backends = [DjangoFilterBackend] 
    

    filterset_fields = ['post']
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)