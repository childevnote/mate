# users/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

class University(models.Model):
    """
    대학교 정보 테이블
    (관리자가 미리 DB에 넣어두는 데이터)
    """
    name = models.CharField(max_length=50, unique=True, verbose_name="학교명")
    domain = models.CharField(max_length=50, unique=True, verbose_name="메일 도메인") # 예: snu.ac.kr

    def __str__(self):
        return self.name

class User(AbstractUser):
    """
    커스텀 사용자 모델
    """
    nickname = models.CharField(max_length=20, unique=True, verbose_name="닉네임")
    
    # 학교 인증 정보 (가입 시점엔 비어있음)
    university = models.ForeignKey(University, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="소속 학교")
    school_email = models.EmailField(unique=True, null=True, blank=True, verbose_name="학교 이메일")
    
    # 핵심: 이 값이 True여야 글쓰기 가능
    is_student_verified = models.BooleanField(default=False, verbose_name="학생 인증 여부")

    def __str__(self):
        return self.username  # 아이디 반환

class EmailVerification(models.Model):
    """
    이메일 인증 코드 관리 테이블
    """
    email = models.EmailField(verbose_name="인증 요청 이메일")
    code = models.CharField(max_length=6, verbose_name="인증 코드")
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.email} - {self.code}"