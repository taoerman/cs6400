from django.urls import path
from . import views

urlpatterns = [
    path('accounts/users/', views.get_users),
    path('accounts/register/', views.register_user),
    path('accounts/login/', views.login_user),
    path('accounts/login_status/', views.login_status),
    path('accounts/logout/', views.logout_user),
]