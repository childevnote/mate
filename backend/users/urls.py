# users/urls.py

from django.urls import path
from .views import (
    RegisterView, SendEmailVerificationView, VerifyCodeView, 
    MyProfileView, MyPostListView, MyScrapListView, CheckUsernameView,CustomTokenObtainPairView, ChangePasswordView, DeleteAccountView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 회원가입 & 이메일 인증
    path('signup/', RegisterView.as_view(), name='signup'),    path('email/send/', SendEmailVerificationView.as_view(), name='email_send'),
    path('email/verify/', VerifyCodeView.as_view(), name='email_verify'),
    
    # 로그인 (JWT 토큰 발급)
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('check-username/', CheckUsernameView.as_view(), name='check-username'), 
    # 토큰 재발급 (로그인 연장)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 내 정보 수
    path('me/', MyProfileView.as_view(), name='my_profile'),
    # 내가 쓴 글
    path('me/posts/', MyPostListView.as_view(), name='my_posts'), 
    # 내가 스크랩한 글
    path('me/scraps/', MyScrapListView.as_view(), name='my_scraps'),

    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
]