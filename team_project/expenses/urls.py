from django.urls import path
from . import views

urlpatterns = [
    path('expenses/get_all_expenses/', views.get_all_expenses),
    path('expenses/add_expense/', views.add_expense),
]