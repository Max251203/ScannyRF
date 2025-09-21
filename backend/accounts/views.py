import os, random, requests
from django.db.models import Q
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as greq

from .models import User, PasswordResetCode
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ProfileUpdateSerializer, PasswordRequestSerializer, PasswordConfirmSerializer
)

def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}

def ensure_username(base):
    base = (base or 'user').split('@')[0]
    u, i = base, 0
    while User.objects.filter(username=u).exists():
        i += 1; u = f"{base}{i}"
    return u

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = RegisterSerializer(data=request.data); s.is_valid(raise_exception=True)
        email = s.validated_data['email'].lower()
        username = s.validated_data.get('username') or ensure_username(email)
        password = s.validated_data['password']
        if User.objects.filter(Q(email=email)|Q(username=username)).exists():
            return Response({'detail':'Пользователь с такими данными уже существует'}, status=400)
        user = User.objects.create(username=username, email=email)
        user.set_password(password); user.save()
        return Response({'user': UserSerializer(user).data, **tokens_for_user(user)}, status=201)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = LoginSerializer(data=request.data); s.is_valid(raise_exception=True)
        ident = s.validated_data['identifier']; password = s.validated_data['password']
        user = User.objects.filter(email__iexact=ident).first() if '@' in ident else None
        if not user: user = User.objects.filter(username__iexact=ident).first()
        if not user or not user.check_password(password):
            return Response({'detail':'Неверные учетные данные'}, status=400)
        return Response({'user': UserSerializer(user).data, **tokens_for_user(user)})

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(UserSerializer(request.user).data)

class ProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        s = ProfileUpdateSerializer(data=request.data); s.is_valid(raise_exception=True)
        user = request.user
        if s.validated_data.get('email'): user.email = s.validated_data['email'].lower()
        if 'username' in s.validated_data: user.username = s.validated_data['username'] or user.username
        if s.validated_data.get('remove_avatar'): user.avatar_bin = None; user.avatar_mime = None
        if 'avatar' in request.FILES:
            f = request.FILES['avatar']; user.avatar_bin = f.read(); user.avatar_mime = f.content_type or 'image/png'
        user.save()
        return Response(UserSerializer(user).data)

class RequestResetCodeView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = PasswordRequestSerializer(data=request.data); s.is_valid(raise_exception=True)
        email = s.validated_data['email'].lower()
        user = User.objects.filter(email__iexact=email).first()
        if not user: return Response({'detail':'Пользователь не найден'}, status=404)
        code = f"{random.randint(0,999999):06d}"
        PasswordResetCode.objects.create(user=user, code=code)
        send_mail('Код для смены пароля', f'Ваш код: {code}', 'no-reply@scannyrf', [email], fail_silently=True)
        return Response({'ok':True})

class ConfirmResetCodeView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        s = PasswordConfirmSerializer(data=request.data); s.is_valid(raise_exception=True)
        email = s.validated_data['email'].lower(); code = s.validated_data['code']; new_password = s.validated_data['new_password']
        user = User.objects.filter(email__iexact=email).first()
        if not user: return Response({'detail':'Пользователь не найден'}, status=404)
        rec = PasswordResetCode.objects.filter(user=user, code=code, used=False).order_by('-created_at').first()
        if not rec or not rec.is_valid(): return Response({'detail':'Код недействителен'}, status=400)
        rec.used = True; rec.save(); user.set_password(new_password); user.save()
        return Response({'ok':True})

# --- Быстрый вход: Google (id_token)
class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        token = request.data.get('id_token'); client_id = os.getenv('GOOGLE_CLIENT_ID','')
        if not token or not client_id: return Response({'detail':'Отсутствуют данные Google'}, status=400)
        try:
            info = id_token.verify_oauth2_token(token, greq.Request(), client_id)
            email = (info.get('email') or '').lower(); name = info.get('name') or ''
            if not email: return Response({'detail':'Не удалось подтвердить email Google'}, status=400)
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                user = User.objects.create(username=ensure_username(email or name), email=email)
                user.set_unusable_password(); user.save()
            return Response({'user': UserSerializer(user).data, **tokens_for_user(user)})
        except Exception:
            return Response({'detail':'Идентификатор Google недействителен'}, status=400)

# --- Быстрый вход: Facebook (access_token)
class FacebookAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        token = request.data.get('access_token')
        app_id = os.getenv('FACEBOOK_APP_ID',''); app_secret = os.getenv('FACEBOOK_APP_SECRET','')
        if not token or not app_id or not app_secret:
            return Response({'detail':'Отсутствуют параметры Facebook'}, status=400)
        try:
            dbg = requests.get("https://graph.facebook.com/debug_token",
                               params={'input_token':token, 'access_token':f"{app_id}|{app_secret}"}, timeout=10).json()
            if not dbg.get('data',{}).get('is_valid'): return Response({'detail':'Токен Facebook недействителен'}, status=400)
            me = requests.get("https://graph.facebook.com/me",
                              params={'fields':'id,name,email','access_token':token}, timeout=10).json()
            fid = me.get('id'); name = me.get('name') or ''; email = (me.get('email') or f'fb_{fid}@facebook.local').lower()
            if not fid: return Response({'detail':'Не удалось получить профиль Facebook'}, status=400)
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                user = User.objects.create(username=ensure_username(name or email), email=email)
                user.set_unusable_password(); user.save()
            return Response({'user': UserSerializer(user).data, **tokens_for_user(user)})
        except Exception:
            return Response({'detail':'Ошибка Facebook'}, status=400)

# --- Быстрый вход: VK (access_token + опционально email)
class VkAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        token = request.data.get('access_token'); email = (request.data.get('email') or '').lower()
        if not token: return Response({'detail':'Нет access_token VK'}, status=400)
        try:
            resp = requests.get('https://api.vk.com/method/users.get',
                                params={'access_token':token,'v':'5.131','fields':'first_name,last_name'}, timeout=10).json()
            if 'error' in resp: return Response({'detail':'Токен VK недействителен'}, status=400)
            info = (resp.get('response') or [{}])[0]
            vid = info.get('id'); first = info.get('first_name',''); last = info.get('last_name','')
            if not vid: return Response({'detail':'Не удалось получить профиль VK'}, status=400)
            if not email: email = f'vk_{vid}@vk.local'
            name = f"{first} {last}".strip()
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                user = User.objects.create(username=ensure_username(name or email), email=email)
                user.set_unusable_password(); user.save()
            return Response({'user': UserSerializer(user).data, **tokens_for_user(user)})
        except Exception:
            return Response({'detail':'Ошибка VK'}, status=400)