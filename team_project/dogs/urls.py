from django.urls import path
from . import views

urlpatterns = [
    path('dogs/get_all_dogs/', views.get_all_dogs),
    path('dogs/add_dog/', views.add_dog),
    path("dogs/get_dog/<int:dog_id>/", views.get_dog_by_id),

]