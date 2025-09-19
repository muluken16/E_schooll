from django.contrib import admin
from .models import (
    User, StudentProfile, StaffProfile, Teacher, Student,
    Subject, Semester, ClassGroup, Section, Schedule, Attendance, Grade
)

# ----------------------------
# User Admin
# ----------------------------
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'first_name', 'last_name', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'national_id')
    ordering = ('id',)

# ----------------------------
# Student Profile Admin
# ----------------------------
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('admission_no', 'user', 'department', 'class_section', 'academic_status')
    search_fields = ('admission_no', 'student_id', 'user__username', 'user__first_name', 'user__last_name')
    list_filter = ('department', 'class_section', 'academic_status')
    ordering = ('-created_at',)

# ----------------------------
# Staff Profile Admin
# ----------------------------
@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'department', 'subject', 'status', 'staff_id')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'staff_id')
    list_filter = ('department', 'status')
    ordering = ('user__last_name',)

# ----------------------------
# Teacher Admin
# ----------------------------
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('user', 'employee_id', 'department', 'academic_rank')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'employee_id')
    list_filter = ('department', 'academic_rank')

# ----------------------------
# Student Admin (linked to User)
# ----------------------------
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'student_id', 'program', 'level', 'current_semester', 'gpa')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'student_id', 'program')
    list_filter = ('program', 'level', 'current_semester')
