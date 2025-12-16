# users/urls.py

from django.urls import path
from .views import RegisterView, SendEmailVerificationView, VerifyCodeView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 회원가입 & 이메일 인증
    path('register/', RegisterView.as_view(), name='register'),
    path('email/send/', SendEmailVerificationView.as_view(), name='email_send'),
    path('email/verify/', VerifyCodeView.as_view(), name='email_verify'),
    
    # 로그인 (JWT 토큰 발급)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # 토큰 재발급 (로그인 연장)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]