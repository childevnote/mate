# users/views.py

import random
from django.core.mail import send_mail
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from community.models import Post
from community.serializers import PostListSerializer
from .serializers import UserSerializer, CheckCodeSerializer
from .models import User, University, EmailVerification
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

User = get_user_model()

class CheckUsernameView(APIView):
    """
    GET /api/users/check-username/?username=...
    아이디 중복 확인 API
    """
    def get(self, request):
        username = request.query_params.get('username', None)

        if not username:
            return Response(
                {"message": "검사할 아이디가 전달되지 않았습니다."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response({
                "isAvailable": False, 
                "message": "이미 사용 중인 아이디입니다."
            }, status=status.HTTP_200_OK)
        
        return Response({
            "isAvailable": True, 
            "message": "사용 가능한 아이디입니다."
        }, status=status.HTTP_200_OK)
    

# 회원가입 뷰
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
                "message": "회원가입 성공! 이제 이메일 인증을 진행해주세요.",
            },
            status=status.HTTP_201_CREATED,
        )
# 이메일 인증 코드 전송 뷰
class SendEmailVerificationView(APIView):
    def post(self, request):
        email = request.data.get('email')
        
        try:
            domain = email.split('@')[1]
        except (IndexError, AttributeError):
            return Response({"error": "이메일 형식이 올바르지 않습니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            university = University.objects.get(domain=domain)
        except University.DoesNotExist:
            return Response({"error": "서비스를 지원하지 않는 대학교 도메인입니다."}, status=status.HTTP_404_NOT_FOUND)

        code = str(random.randint(100000, 999999))
        
        EmailVerification.objects.update_or_create(
            email=email,
            defaults={'code': code, 'is_verified': False}
        )

        try:
            send_mail(
                subject=f"[Mate] {university.name} 인증 코드 안내",
                message=f"안녕하세요!\n\n[{university.name}] 학생 인증 코드는 [{code}] 입니다.\n앱에 입력하여 인증을 완료해주세요.",
                from_email=None,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"메일 전송 실패: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": f"{email}로 인증 코드를 전송했습니다."}, status=status.HTTP_200_OK)

# 이메일 인증 코드 검증 및 학생 인증 처리 뷰
class VerifyCodeView(APIView):
    def post(self, request):
        serializer = CheckCodeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']

            try:
                verification = EmailVerification.objects.get(email=email, code=code)
            except EmailVerification.DoesNotExist:
                return Response({"error": "인증 코드가 틀렸거나 요청한 이력이 없습니다."}, status=status.HTTP_400_BAD_REQUEST)
            
            verification.is_verified = True
            verification.save()

            try:
                user = User.objects.get(email=email)
                
                domain = email.split('@')[1]
                university = University.objects.get(domain=domain)
                
                user.university = university
                user.is_student_verified = True
                user.save()
                
                return Response({
                    "message": "인증 성공! 정회원 권한이 부여되었습니다.",
                    "university": university.name
                }, status=status.HTTP_200_OK)

            except User.DoesNotExist:
                return Response({"message": "인증은 성공했으나, 해당 이메일로 가입된 유저를 찾을 수 없습니다."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# 내 프로필 조회 및 수정 (GET, PATCH)
class MyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True) 
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# 내가 쓴 글 목록 (GET)
class MyPostListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostListSerializer

    def get_queryset(self):
        return Post.objects.filter(author=self.request.user).order_by('-created_at')

# 내가 스크랩한 글 목록 (GET)
class MyScrapListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostListSerializer

    def get_queryset(self):
        return self.request.user.scrapped_posts.all().order_by('-created_at')
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer