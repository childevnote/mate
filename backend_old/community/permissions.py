from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    작성자(author)만 글을 수정(PUT, PATCH)하거나 삭제(DELETE)할 수 있게 하는 권한
    """
    def has_object_permission(self, request, view, obj):
        # 읽기 요청(GET, HEAD, OPTIONS)은 누구나 허용
        if request.method in permissions.SAFE_METHODS:
            return True

        # 쓰기 요청(PUT, DELETE 등)은 작성자(obj.author)와 요청자(request.user)가 같을 때만 허용
        return obj.author == request.user