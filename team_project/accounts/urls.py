from django.urls import path
from . import views

urlpatterns = [
    path('accounts/users/', views.get_users),
    path('accounts/register/', views.register_user),
    path('accounts/login/', views.login),
    path('accounts/login_status/', views.login_status),
    path('accounts/logout/', views.logout_user),
    path('accounts/volunteers/', views.volunteers),
    path('accounts/volunteer_birthdays/', views.volunteer_birthdays),
]