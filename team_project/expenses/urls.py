from django.urls import path
from . import views

urlpatterns = [
    path('expenses/', views.get_all_expenses),
]