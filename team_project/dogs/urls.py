from django.urls import path
from . import views

urlpatterns = [
    path('dogs/', views.get_all_dogs),
]