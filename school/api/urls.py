from django.urls import path
from .views import LoginAPIView, UserDetailAPIView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginAPIView, StaffViewSet, UserDetailAPIView, StudentViewSet

router = DefaultRouter()
router.register("students", StudentViewSet, basename="students")
router.register("employees", StaffViewSet, basename="employees")  # 👈
urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('user/', UserDetailAPIView.as_view(), name='user-detail'),
    path("", include(router.urls)),

]
