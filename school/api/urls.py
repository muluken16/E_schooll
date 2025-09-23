from django.urls import path
from .views import LoginAPIView, SchoolManagerRegistrationViewSet, SupervisorRegistrationViewSet, UserDetailAPIView, WeredaManagerViewSet, WeredaViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginAPIView, StaffViewSet, UserDetailAPIView, SchoolViewSet,StudentViewSet

router = DefaultRouter()
router.register("students", StudentViewSet, basename="students")
router.register("employees", StaffViewSet, basename="employees")  # 👈
router.register(r'weredas', WeredaViewSet, basename='wereda')
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'register_schools_supervisor', SupervisorRegistrationViewSet, basename='register_schools_supervisor')
router.register(r'register_school_manager', SchoolManagerRegistrationViewSet, basename='register_school_manager')
router.register(r'wereda/officer', WeredaManagerViewSet, basename='wereda_office')  # 👈 your custom route
urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('user/', UserDetailAPIView.as_view(), name='user-detail'),
    path("", include(router.urls)),
    path('api/', include(router.urls)),

]
