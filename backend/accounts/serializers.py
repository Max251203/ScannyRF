import base64
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id','username','email','avatar_url')
    def get_avatar_url(self, obj):
        if obj.avatar_bin and obj.avatar_mime:
            b64 = base64.b64encode(obj.avatar_bin).decode('ascii')
            return f"data:{obj.avatar_mime};base64,{b64}"
        return None

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(allow_blank=True, required=False)
    password = serializers.CharField(min_length=6)

class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField()

class ProfileUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    username = serializers.CharField(allow_blank=True, required=False)
    remove_avatar = serializers.BooleanField(required=False)
    avatar = serializers.ImageField(required=False)

class PasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)