from django.urls import path
from . import views

urlpatterns = [
    path('report/animal_control_report/', views.animal_control_report),
    path('report/monthly_adoption_report/', views.monthly_adoption_report),
    path('report/expense_analysis/', views.expense_analysis),
]