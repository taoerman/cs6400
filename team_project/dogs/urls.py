from django.urls import path
from . import views

urlpatterns = [
    path('dogs/get_all_dogs/', views.get_all_dogs),
    path('dogs/add_dog/', views.add_dog),
    path("dogs/get_dog/<int:dog_id>/", views.get_dog_by_id),
    path("dogs/edit_dog/<int:dog_id>/", views.edit_dog),
    path("dogs/shelter_capacity/", views.shelter_capacity),
    path("dogs/get_vendors/", views.get_vendors),
    path("dogs/edit_vendor/", views.edit_vendor),
    path("dogs/get_breeds/", views.get_breeds),
    path("dogs/get_breeds_by_dogID/<int:dog_id>/", views.get_breeds_by_dogID),
    path("dogs/save_breed/", views.save_breed),
]