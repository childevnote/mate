from rest_framework import viewsets, permissions, status
from .permissions import IsOwnerOrReadOnly
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Post, Comment
from .serializers import PostListSerializer, PostDetailSerializer, CommentSerializer

# 게시글 관련 뷰셋 (목록, 상세, 생성, 수정, 삭제 한방에 해결)
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at') # 최신순 정렬
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly] # 조회는 누구나, 작성은 로그인한 사람만

    # 상황에 따라 다른 시리얼라이저 쓰기 (목록엔 짧게, 상세엔 길게)
    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostDetailSerializer

    # 글 저장할 때 작성자(author)를 현재 로그인한 유저로 자동 지정
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    # 글 상세 조회 시 조회수 1 증가시키기
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.view_count += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user
        
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user) # 이미 눌렀으면 취소
            return Response({'message': '좋아요 취소', 'like_count': post.like_count})
        else:
            post.likes.add(user) # 안 눌렀으면 추가
            return Response({'message': '좋아요!', 'like_count': post.like_count})

    # 스크랩 기능 추가 (POST /api/community/posts/{id}/scrap/)
    @action(detail=True, methods=['post'])
    def scrap(self, request, pk=None):
        post = self.get_object()
        user = request.user
        
        if post.scraps.filter(id=user.id).exists():
            post.scraps.remove(user)
            return Response({'message': '스크랩 취소'})
        else:
            post.scraps.add(user)
            return Response({'message': '스크랩 완료'})

# 댓글 관련 뷰셋
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


