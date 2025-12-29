from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LoginAPIView, StaffViewSet, UserDetailAPIView, SchoolViewSet, StudentViewSet,
    SchoolManagerRegistrationViewSet, SupervisorRegistrationViewSet, WeredaManagerViewSet, 
    WeredaViewSet, StudentSelfViewSet, TeacherViewSet, student_announcements, mark_announcement_read
)
from .teacher_views import TeacherSelfViewSet, TeacherUtilityViewSet

router = DefaultRouter()
router.register("students", StudentViewSet, basename="students")
router.register("student-self", StudentSelfViewSet, basename="student-self")
router.register("teachers", TeacherViewSet, basename="teachers")
router.register("teacher-self", TeacherSelfViewSet, basename="teacher-self")
router.register("teacher-utils", TeacherUtilityViewSet, basename="teacher-utils")
router.register("employees", StaffViewSet, basename="employees")
router.register(r'weredas', WeredaViewSet, basename='wereda')
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'register_schools_supervisor', SupervisorRegistrationViewSet, basename='register_schools_supervisor')
router.register(r'register_school_manager', SchoolManagerRegistrationViewSet, basename='register_school_manager')
router.register(r'wereda/officer', WeredaManagerViewSet, basename='wereda_office')

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('user/', UserDetailAPIView.as_view(), name='user-detail'),
    path('announcements/', student_announcements, name='student-announcements'),
    path('announcements/<int:announcement_id>/read/', mark_announcement_read, name='mark-announcement-read'),
    path("", include(router.urls)),
]
