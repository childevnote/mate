from rest_framework import serializers
from .models import Post, Comment
from users.serializers import UserSerializer # 유저 정보 보여주기 위해

# 댓글 시리얼라이저
class CommentSerializer(serializers.ModelSerializer):
    author_nickname = serializers.ReadOnlyField(source='author.nickname') # 작성자 닉네임 표시
    author_university = serializers.ReadOnlyField(source='author.university.name') # 작성자 학교 표시
    reply_count = serializers.SerializerMethodField() # 대댓글 개수

    class Meta:
        model = Comment
        fields = ('id', 'post', 'parent', 'author_nickname', 'author_university', 'content', 'created_at', 'reply_count')
        read_only_fields = ('author', 'created_at')

    def get_reply_count(self, obj):
        return obj.replies.count()

# 게시글 리스트용
class PostListSerializer(serializers.ModelSerializer):
    author_nickname = serializers.ReadOnlyField(source='author.nickname')
    author_university = serializers.ReadOnlyField(source='author.university.name')
    comment_count = serializers.IntegerField(read_only=True)
    like_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Post
        fields = (
            'id', 'category', 'title', 'image', 'author_nickname', 'author_university',
            'view_count', 'like_count', 'comment_count', 'created_at'
        )

# 게시글 상세용
class PostDetailSerializer(serializers.ModelSerializer):
    author_nickname = serializers.ReadOnlyField(source='author.nickname')
    author_university = serializers.ReadOnlyField(source='author.university.name')
    like_count = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True) 
    comment_count = serializers.IntegerField(read_only=True)


    class Meta:
        model = Post
        fields = (
            'id', 'category', 'title', 'image', 'content', 'author_nickname', 'author_university',
            'view_count', 'like_count', 'comments', 'comment_count', 'created_at', 'updated_at'
        )
        read_only_fields = ('author', 'view_count', 'likes', 'scraps')
    
    def create(self, validated_data):
        # 글 생성 시 작성자는 현재 로그인한 유저로 자동 설정
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)