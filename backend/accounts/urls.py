from django.urls import path
from .views import (
    RegisterView, LoginView, MeView, ProfileUpdateView,
    RequestResetCodeView, ConfirmResetCodeView,
    GoogleAuthView, FacebookAuthView, VkAuthView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/me/', MeView.as_view()),
    path('auth/profile/', ProfileUpdateView.as_view()),
    path('auth/password/request-code/', RequestResetCodeView.as_view()),
    path('auth/password/confirm/', ConfirmResetCodeView.as_view()),
    path('auth/google/', GoogleAuthView.as_view()),
    path('auth/facebook/', FacebookAuthView.as_view()),
    path('auth/vk/', VkAuthView.as_view()),
]