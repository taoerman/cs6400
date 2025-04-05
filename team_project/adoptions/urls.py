
from django.urls import path
from . import views  # Or from adoptions import views

urlpatterns = [
    path('adoptions/update_application_status/', views.update_application_status),
    path('adoptions/add_adoption_application/', views.add_adoption_application),
    path('adoptions/review_pending_applications/', views.review_pending_applications),
    path('adoptions/finalize_adoption/', views.finalize_adoption),
    path('adoptions/get_all_adoptions/', views.get_all_adoptions),
    path('adoptions/is_adopted/', views.is_adopted),
]