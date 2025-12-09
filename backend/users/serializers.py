# users/serializers.py (전체 코드)

from rest_framework import serializers
from .models import User, EmailVerification

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'nickname', 'email')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            nickname=validated_data['nickname']
        )
        return user

class EmailVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailVerification
        fields = ('email', 'code')

class CheckCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)