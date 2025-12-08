# users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, University, EmailVerification

# 커스텀 User 모델 등록
admin.site.register(User, UserAdmin)
admin.site.register(University)
admin.site.register(EmailVerification)