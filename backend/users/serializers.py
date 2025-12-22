# users/serializers.py (전체 코드)

from rest_framework import serializers
from .models import User, EmailVerification
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'nickname', 'email', 'university')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {
                'required': False,  
                'allow_null': True, 
                'allow_blank': True 
            },
            'university': {
                'required': False, 
                'allow_null': True
            }
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            nickname=validated_data['nickname'],
            email=validated_data.get('email', ''), 
            university=validated_data.get('university', None) 
        )
        return user

class CheckCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

class EmailVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailVerification
        fields = ('email', 'code')

class CheckCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'nickname': self.user.nickname,
            'email': self.user.email,
            'university': self.user.university.name if self.user.university else None,
        }
        return data