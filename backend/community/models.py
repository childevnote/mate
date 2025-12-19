from django.db import models
from django.conf import settings

class Post(models.Model):
    # 카테고리 (자유 / 정보 / 모임)
    CATEGORY_CHOICES = [
        ('FREE', '자유게시판'),
        ('INFO', '정보게시판'),
        ('GATHERING', '모임게시판'),
    ]

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='FREE')
    title = models.CharField(max_length=100)
    content = models.TextField()
    
    view_count = models.PositiveIntegerField(default=0)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)
    scraps = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='scrapped_posts', blank=True)
    image = models.ImageField(upload_to='posts/%Y/%m/%d/', null=True, blank=True)
    title = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"
    
    @property
    def like_count(self):
        return self.likes.count()


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    
    # 대댓글을 위한 '부모 댓글' 필드
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.parent:
            return f"Reply by {self.author} on {self.parent}" # 대댓글인 경우
        return f"Comment by {self.author} on {self.post}"     # 일반 댓글인 경우