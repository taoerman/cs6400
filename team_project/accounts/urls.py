from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.get_users),
    path('register/', views.register_user),
    path('login/', views.login_user),
]