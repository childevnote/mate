# users/urls.py

from django.urls import path
from .views import RegisterView, SendEmailVerificationView, VerifyCodeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('email/send/', SendEmailVerificationView.as_view(), name='email_send'),
    path('email/verify/', VerifyCodeView.as_view(), name='email_verify'),
]