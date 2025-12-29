from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.db import transaction, models
from django.http import HttpResponse
from datetime import datetime
import csv
import io

from .models import (
    School, StaffProfile, StudentProfile, Wereda, Grade, Attendance, 
    Subject, Semester, BorrowRecord, Book, Teacher, Section, Schedule, 
    Announcement, AnnouncementRead
)
from .serializers import (
    SchoolManagerRegistrationSerializer, SchoolSerializer, StaffSerializer, 
    StudentSerializer, SupervisorRegistrationSerializer, UserSerializer, 
    WeredaManagerSerializer, WeredaSerializer, TeacherSerializer, 
    TeacherGradeSerializer, TeacherAttendanceSerializer
)
from .record_serializers import GradeSerializer, AttendanceSerializer

User = get_user_model()


# Custom Permission Classes
class IsStudentOwner(BasePermission):
    """Students can only access their own data"""
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'student':
            if hasattr(obj, 'user'):
                return obj.user == request.user
            elif hasattr(obj, 'student'):
                return obj.student == request.user
        return True


class IsStudentOrReadOnly(BasePermission):
    """Students can only read their own data"""
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'student':
            return request.method in ['GET', 'HEAD', 'OPTIONS']
        return True


# -----------------------------
# LOGIN API
# -----------------------------
class LoginAPIView(APIView):
    """
    User login API with detailed error responses.
    Public endpoint: anyone can access to get JWT tokens.
    """
    permission_classes = [AllowAny]  # Allow anonymous access

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        # 1️⃣ Validate input
        if not email and not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        elif not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        elif not password:
            return Response({"error": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 2️⃣ Check if user exists and verify password
        try:
            user = User.objects.get(email=email)
            if not check_password(password, user.password):
                return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        # 3️⃣ Check if user is active
        if not user.is_active:
            return Response({"error": "User account is disabled."}, status=status.HTTP_403_FORBIDDEN)

        # 4️⃣ Generate JWT tokens
        try:
            refresh = RefreshToken.for_user(user)
        except Exception as e:
            return Response({"error": "Failed to generate token.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 5️⃣ Return user data + tokens
        return Response({
            "user": UserSerializer(user).data,
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh)
        }, status=status.HTTP_200_OK)
# USER DETAIL API
# -----------------------------
class UserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# -----------------------------
# STUDENT CRUD
class StudentViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.select_related('user').order_by("-id")
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Students can only see their own profile"""
        if self.request.user.role == 'student':
            return StudentProfile.objects.filter(user=self.request.user)
        return StudentProfile.objects.all().order_by("-id")

    def create(self, request, *args, **kwargs):
        data = request.data
        required_fields = ["admission_no", "class_section", "first_name", "last_name"]
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"{field} is required"}, status=400)

        with transaction.atomic():
            # Auto-generate student_id
            last_student = StudentProfile.objects.order_by("-id").first()
            number = 1
            if last_student and last_student.student_id and last_student.student_id[4:].isdigit():
                number = int(last_student.student_id[4:]) + 1
            student_id = f"STUD{str(number).zfill(4)}"

            # Auto-generate username
            first_name = data.get("first_name") or "student"
            last_name = data.get("last_name") or ""
            nat_part = student_id[-4:]
            username = f"{first_name.lower()}{nat_part}"
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # Create User
            user = User.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=data.get("email", ""),
                role="student",
            )
            raw_password = (last_name or "Student").capitalize() + "#123"
            user.set_password(raw_password)
            user.save()

            # Create StudentProfile
            valid_fields = {f.name for f in StudentProfile._meta.fields} - {"user", "student_id"}
            student_data = {k: v for k, v in data.items() if k in valid_fields}
            student_data["student_id"] = student_id

            # Parse date fields
            for date_field in ["dob", "enrollment_date"]:
                if student_data.get(date_field):
                    student_data[date_field] = self.parse_date(student_data[date_field])

            student_profile = StudentProfile.objects.create(user=user, **student_data)

        serializer = self.get_serializer(student_profile)
        serializer_data = serializer.data
        serializer_data.update({
            "username": username,
            "password": raw_password,
            "student_id": student_id
        })
        return Response(serializer_data, status=201)

    @staticmethod
    def parse_date(date_str):
        """Parse date string to YYYY-MM-DD format."""
        for fmt in ("%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(date_str, fmt).date()
            except (ValueError, TypeError):
                continue
        return None

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="students.csv"'
        writer = csv.writer(response)

        fields = [f.name for f in StudentProfile._meta.fields]
        writer.writerow(fields)
        for student in StudentProfile.objects.all():
            writer.writerow([getattr(student, f) for f in fields])
        return response

    @action(detail=False, methods=["post"])
    def import_csv(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        decoded_file = file.read().decode("utf-8")
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)

        created_count = 0
        imported_users = []

        valid_fields = {f.name for f in StudentProfile._meta.fields} - {"user"}
        user_fields = ["first_name", "last_name", "email", "role", "profile_photo"]

        for row in reader:
            if row.get("admission_no") and row.get("class_section"):
                # Clean first_name / last_name
                first_name = (row.get("first_name") or "").strip()
                last_name = (row.get("last_name") or "").strip()

                # fallback if first_name missing
                first_name_clean = first_name.lower() if first_name else "student"

                # Auto-generate student_id if missing
                student_id = row.get("student_id") or f"STUD{str(created_count+1).zfill(4)}"
                nat_part = student_id[-4:]

                # Auto-generate username
                username = f"{first_name_clean}{nat_part}"
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                # Create user
                user_data = {k: row[k] for k in user_fields if k in row}
                user = User.objects.create(username=username, **user_data)
                user.role = "student"
                raw_password = (last_name or "Student").capitalize() + "#123"
                user.set_password(raw_password)
                user.save()

                # Create student profile
                student_data = {k: v for k, v in row.items() if k in valid_fields}
                student_data["student_id"] = student_id

                for date_field in ["dob", "enrollment_date"]:
                    if student_data.get(date_field):
                        student_data[date_field] = self.parse_date(student_data[date_field])

                StudentProfile.objects.create(user=user, **student_data)
                created_count += 1
                imported_users.append({"username": username, "password": raw_password})

        return Response({
            "message": f"Imported {created_count} students successfully",
            "users": imported_users,
        })

    @action(detail=True, methods=["get"])
    def academic_record(self, request, pk=None):
        """
        Fetch academic records (Grades, Attendance) for a specific student.
        """
        student_profile = self.get_object()
        user = student_profile.user
        
        grades = Grade.objects.filter(student=user).select_related('subject', 'semester').order_by('-date_recorded')
        attendance = Attendance.objects.filter(student=user).select_related('subject').order_by('-date')

        return Response({
            "student": f"{user.first_name} {user.last_name}",
            "grades": GradeSerializer(grades, many=True).data,
            "attendance": AttendanceSerializer(attendance, many=True).data,
            "extra_activities": student_profile.extra_activities,
            "remarks": student_profile.remarks
        })


# Student Self-Service ViewSet
class StudentSelfViewSet(viewsets.ReadOnlyModelViewSet):
    """Students can only view their own data"""
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsStudentOwner]
    
    def get_queryset(self):
        if self.request.user.role == 'student':
            return StudentProfile.objects.filter(user=self.request.user)
        return StudentProfile.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current student's complete profile"""
        try:
            profile = StudentProfile.objects.get(user=request.user)
            serializer = StudentSerializer(profile)
            return Response(serializer.data)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Student profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_grades(self, request):
        """Get current student's grades with filtering - OPTIMIZED"""
        semester = request.query_params.get('semester')
        subject = request.query_params.get('subject')
        academic_year = request.query_params.get('academic_year')
        
        # Use select_related to reduce database queries
        grades = Grade.objects.filter(student=request.user).select_related('subject', 'semester')
        
        if semester:
            grades = grades.filter(semester_id=semester)
        if subject:
            grades = grades.filter(subject_id=subject)
        if academic_year:
            grades = grades.filter(academic_year=academic_year)
            
        grades = grades.order_by('-date_recorded')[:50]  # Limit to 50 most recent
        
        # Calculate statistics efficiently
        total_grades = grades.count()
        avg_score = grades.aggregate(avg=models.Avg('score'))['avg'] or 0
        
        return Response({
            "grades": GradeSerializer(grades, many=True).data,
            "statistics": {
                "total_grades": total_grades,
                "average_score": round(avg_score, 2),
                "subjects_count": grades.values('subject').distinct().count()
            }
        })
    
    @action(detail=False, methods=['get'])
    def my_attendance(self, request):
        """Get current student's attendance with statistics - OPTIMIZED"""
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        subject = request.query_params.get('subject')
        
        # Use select_related and limit results
        attendance = Attendance.objects.filter(student=request.user).select_related('subject')
        
        if date_from:
            attendance = attendance.filter(date__gte=date_from)
        if date_to:
            attendance = attendance.filter(date__lte=date_to)
        if subject:
            attendance = attendance.filter(subject_id=subject)
            
        attendance = attendance.order_by('-date')[:100]  # Limit to 100 most recent
        
        # Calculate statistics efficiently using aggregation
        stats = attendance.aggregate(
            total_days=models.Count('id'),
            present_days=models.Count('id', filter=models.Q(status='present')),
            absent_days=models.Count('id', filter=models.Q(status='absent'))
        )
        
        attendance_percentage = (stats['present_days'] / stats['total_days'] * 100) if stats['total_days'] > 0 else 0
        
        return Response({
            "attendance": AttendanceSerializer(attendance, many=True).data,
            "statistics": {
                "total_days": stats['total_days'],
                "present_days": stats['present_days'],
                "absent_days": stats['absent_days'],
                "attendance_percentage": round(attendance_percentage, 2)
            }
        })
    
    @action(detail=False, methods=['get'])
    def my_subjects(self, request):
        """Get subjects for current student - OPTIMIZED"""
        try:
            profile = StudentProfile.objects.get(user=request.user)
            
            # Get subjects efficiently with aggregated data
            subjects_data = Subject.objects.filter(
                grade__student=request.user
            ).annotate(
                average_score=models.Avg('grade__score'),
                total_grades=models.Count('grade')
            ).distinct()
            
            subjects_list = []
            for subject in subjects_data:
                subjects_list.append({
                    "id": subject.id,
                    "name": subject.name,
                    "code": subject.code,
                    "credit_hours": subject.credit_hours,
                    "average_score": round(subject.average_score or 0, 2),
                    "total_grades": subject.total_grades
                })
            
            return Response(subjects_list)
        except StudentProfile.DoesNotExist:
            return Response({"error": "Student profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_library_records(self, request):
        """Get current student's library borrowing records"""
        records = BorrowRecord.objects.filter(
            borrower_student=request.user,
            borrower_type='student'
        ).order_by('-borrow_date')
        
        records_data = []
        for record in records:
            records_data.append({
                "id": record.id,
                "book_title": record.book.title,
                "book_author": record.book.author,
                "book_isbn": record.book.isbn,
                "borrow_date": record.borrow_date,
                "expected_return_date": record.expected_return_date,
                "actual_return_date": record.actual_return_date,
                "returned": record.returned,
                "overdue": record.expected_return_date < datetime.now().date() and not record.returned
            })
        
        return Response(records_data)
    
    @action(detail=False, methods=['get'])
    def academic_summary(self, request):
        """Get comprehensive academic summary - OPTIMIZED"""
        try:
            profile = StudentProfile.objects.select_related('user').get(user=request.user)
            
            # Get aggregated data efficiently
            grade_stats = Grade.objects.filter(student=request.user).aggregate(
                total_grades=models.Count('id'),
                avg_score=models.Avg('score'),
                subjects_count=models.Count('subject', distinct=True)
            )
            
            attendance_stats = Attendance.objects.filter(student=request.user).aggregate(
                total_days=models.Count('id'),
                present_days=models.Count('id', filter=models.Q(status='present'))
            )
            
            attendance_percentage = (attendance_stats['present_days'] / attendance_stats['total_days'] * 100) if attendance_stats['total_days'] > 0 else 0
            
            # Get top 5 subject performances efficiently
            subjects_performance = Subject.objects.filter(
                grade__student=request.user
            ).annotate(
                average_score=models.Avg('grade__score'),
                total_assessments=models.Count('grade')
            ).distinct().order_by('-average_score')[:5]
            
            subjects_list = []
            for subject in subjects_performance:
                subjects_list.append({
                    "subject_name": subject.name,
                    "subject_code": subject.code,
                    "average_score": round(subject.average_score or 0, 2),
                    "total_assessments": subject.total_assessments
                })
            
            return Response({
                "student_info": {
                    "name": f"{profile.user.first_name} {profile.user.last_name}",
                    "admission_no": profile.admission_no,
                    "student_id": profile.student_id,
                    "class_section": profile.class_section,
                    "department": profile.department,
                    "academic_status": profile.academic_status
                },
                "academic_performance": {
                    "overall_average": round(grade_stats['avg_score'] or 0, 2),
                    "total_assessments": grade_stats['total_grades'] or 0,
                    "subjects_count": grade_stats['subjects_count'] or 0,
                    "subjects_performance": subjects_list
                },
                "attendance_summary": {
                    "attendance_percentage": round(attendance_percentage, 2),
                    "total_days": attendance_stats['total_days'] or 0,
                    "present_days": attendance_stats['present_days'] or 0,
                    "absent_days": (attendance_stats['total_days'] or 0) - (attendance_stats['present_days'] or 0)
                }
            })
        except StudentProfile.DoesNotExist:
            return Response({"error": "Student profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def announcements(self, request):
        """Get announcements for students"""
        try:
            # Get announcements for students or all
            announcements = Announcement.objects.filter(
                is_active=True,
                target_audience__in=['all', 'students']
            ).order_by('-created_at')
            
            # Get read status for current user
            read_announcements = AnnouncementRead.objects.filter(
                user=request.user
            ).values_list('announcement_id', flat=True)
            
            announcement_data = []
            for announcement in announcements:
                announcement_data.append({
                    'id': announcement.id,
                    'title': announcement.title,
                    'content': announcement.content,
                    'type': announcement.type,
                    'priority': announcement.priority,
                    'date': announcement.created_at.strftime('%Y-%m-%d'),
                    'author': announcement.author.get_full_name() or announcement.author.username,
                    'read': announcement.id in read_announcements
                })
            
            return Response(announcement_data)
            
        except Exception as e:
            return Response(
                {'error': f'Error fetching announcements: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], url_path='announcements/(?P<announcement_id>[^/.]+)/read')
    def mark_announcement_read(self, request, announcement_id=None):
        """Mark an announcement as read"""
        try:
            announcement = Announcement.objects.get(id=announcement_id)
            
            # Create or get the read record
            read_record, created = AnnouncementRead.objects.get_or_create(
                announcement=announcement,
                user=request.user
            )
            
            return Response(
                {'message': 'Announcement marked as read', 'created': created}
            )
            
        except Announcement.DoesNotExist:
            return Response(
                {'error': 'Announcement not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error marking announcement as read: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# -----------------------------
# STAFF CRUD
# -----------------------------

ROLE_CHOICES = [
    ('vice_director', 'Vice Director'),
    ('department_head', 'Department Head'),
    ('teacher', 'Teacher'),
    ('librarian', 'Librarian'),
    ('record_officer', 'Record Officer'),
    ('inventorian', 'Inventorian'),
    ('store_man', 'Store Manager'),
    ('dormitory_manager', 'Dormitory Manager'),
]

class StaffViewSet(viewsets.ModelViewSet):
    """
    ViewSet for StaffProfile with restricted roles.
    Supports list, retrieve, create, update, delete.
    """
    serializer_class = StaffSerializer

    def get_queryset(self):
        # Only show staff with roles in ROLE_CHOICES
        allowed_roles = [role[0] for role in ROLE_CHOICES]
        return StaffProfile.objects.filter(user__role__in=allowed_roles).select_related('user').order_by("-id")

    def create(self, request, *args, **kwargs):
        data = request.data
        required_fields = ["department", "role", "first_name", "last_name", "phone"]
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Restrict role to ROLE_CHOICES
        role = data.get("role")
        if role not in [r[0] for r in ROLE_CHOICES]:
            return Response({"error": f"Invalid role. Allowed roles: {[r[0] for r in ROLE_CHOICES]}"}, status=400)

        with transaction.atomic():
            # Auto-generate staff_id
            last_staff = StaffProfile.objects.order_by("-id").first()
            number = 1
            if last_staff and last_staff.staff_id and last_staff.staff_id[3:].isdigit():
                number = int(last_staff.staff_id[3:]) + 1
            staff_id = f"STF{str(number).zfill(4)}"

            # Auto-generate username: first_name + last 5 digits of phone
            first_name = data.get("first_name")
            phone = data.get("phone", "")
            last5 = phone[-5:] if len(phone) >= 5 else phone
            username = f"{first_name.lower()}{last5}"
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # Create User
            user_fields = ["first_name", "last_name", "email", "profile_photo"]
            user_data = {k: data[k] for k in user_fields if k in data}
            user = User.objects.create(username=username, **user_data)
            user.role = role
            raw_password = (data.get("last_name") or "Staff").capitalize() + "#123"
            user.set_password(raw_password)
            user.save()

            # Create StaffProfile
            valid_fields = {f.name for f in StaffProfile._meta.fields} - {"user", "staff_id"}
            staff_data = {k: v for k, v in data.items() if k in valid_fields}
            staff_data["staff_id"] = staff_id
            staff_profile = StaffProfile.objects.create(user=user, **staff_data)

        serializer = self.get_serializer(staff_profile)
        serializer_data = serializer.data
        serializer_data.update({
            "username": username,
            "password": raw_password,
            "staff_id": staff_id
        })
        return Response(serializer_data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        staff_instance = self.get_object()
        data = request.data
        role = data.get("role")
        if role and role not in [r[0] for r in ROLE_CHOICES]:
            return Response({"error": f"Invalid role. Allowed roles: {[r[0] for r in ROLE_CHOICES]}"}, status=400)

        serializer = self.get_serializer(staff_instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class WeredaViewSet(viewsets.ModelViewSet):
    queryset = Wereda.objects.all().order_by('id')
    serializer_class = WeredaSerializer
    # Automatically set the logged-in user when creating a new Wereda
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # Optional: restrict updates/deletes to the creator only
    def get_queryset(self):
        queryset = super().get_queryset()
        # Uncomment the next line if you want users to only see their own entries
        # queryset = queryset.filter(created_by=self.request.user)
        return queryset
    


class WeredaManagerViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.filter(user__role="wereda_office").select_related('user').order_by("-id")
    serializer_class = WeredaManagerSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            staff_profile = serializer.save()

        return Response(self.get_serializer(staff_profile).data, status=status.HTTP_201_CREATED)
    

class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all().order_by('-created_at')
    serializer_class = SchoolSerializer
    # permission_classes = [permissions.IsAuthenticated]  # require login

class SchoolManagerRegistrationViewSet(viewsets.ModelViewSet):
    # Fetch staff profiles where user role is 'school'
    queryset = StaffProfile.objects.filter(user__role="school")
    serializer_class = SchoolManagerRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff_profile = serializer.save()
        return Response(self.get_serializer(staff_profile).data, status=status.HTTP_201_CREATED)
    

class SupervisorRegistrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage Supervisors (role='senate')
    Provides list, retrieve, create, update, and delete.
    """
    queryset = User.objects.filter(role='senate')
    serializer_class = SupervisorRegistrationSerializer

    # Override list to include schools
    def list(self, request, *args, **kwargs):
        supervisors = self.get_queryset()
        serializer = self.get_serializer(supervisors, many=True)

        # Fetch all schools
        schools = School.objects.all().values('id', 'name')
        return Response({
            "supervisors": serializer.data,
            "schools": list(schools)
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(self.get_serializer(user).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(self.get_serializer(user).data, status=status.HTTP_200_OK)

# Student Announcements API

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_announcements(request):
    """Get announcements for students"""
    try:
        # Get announcements for students or all
        announcements = Announcement.objects.filter(
            is_active=True,
            target_audience__in=['all', 'students']
        ).order_by('-created_at')
        
        # Get read status for current user
        read_announcements = AnnouncementRead.objects.filter(
            user=request.user
        ).values_list('announcement_id', flat=True)
        
        announcement_data = []
        for announcement in announcements:
            announcement_data.append({
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content,
                'type': announcement.type,
                'priority': announcement.priority,
                'date': announcement.created_at.strftime('%Y-%m-%d'),
                'author': announcement.author.get_full_name() or announcement.author.username,
                'read': announcement.id in read_announcements
            })
        
        return Response(announcement_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error fetching announcements: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_announcement_read(request, announcement_id):
    """Mark an announcement as read"""
    try:
        announcement = Announcement.objects.get(id=announcement_id)
        
        # Create or get the read record
        read_record, created = AnnouncementRead.objects.get_or_create(
            announcement=announcement,
            user=request.user
        )
        
        return Response(
            {'message': 'Announcement marked as read', 'created': created}, 
            status=status.HTTP_200_OK
        )
        
    except Announcement.DoesNotExist:
        return Response(
            {'error': 'Announcement not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error marking announcement as read: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# -----------------------------
# TEACHER CRUD & SELF-SERVICE
# -----------------------------
class TeacherViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Teacher management.
    Supports list, retrieve, create, update, delete.
    """
    queryset = Teacher.objects.all().order_by("-id")
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        required_fields = ["department", "academic_rank", "first_name", "last_name", "national_id"]
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TeacherSelfViewSet(viewsets.ReadOnlyModelViewSet):
    """Teachers can view their own data and manage their classes"""
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'teacher':
            return Teacher.objects.filter(user=self.request.user)
        return Teacher.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current teacher's complete profile"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            serializer = TeacherSerializer(teacher)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_subjects(self, request):
        """Get subjects taught by current teacher"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            subjects = teacher.subjects.all()
            
            subjects_data = []
            for subject in subjects:
                # Get sections for this subject
                sections = Section.objects.filter(
                    schedule__subject=subject,
                    schedule__teacher=request.user
                ).distinct()
                
                subjects_data.append({
                    "id": subject.id,
                    "name": subject.name,
                    "code": subject.code,
                    "credit_hours": subject.credit_hours,
                    "department": subject.department,
                    "sections": [
                        {
                            "id": section.id,
                            "name": f"{section.class_group.name} - Section {section.name}",
                            "class_group": section.class_group.name
                        } for section in sections
                    ]
                })
            
            return Response(subjects_data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_classes(self, request):
        """Get classes/sections taught by current teacher"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            # Get schedules for this teacher
            schedules = Schedule.objects.filter(teacher=request.user).select_related(
                'section', 'subject', 'room'
            )
            
            classes_data = []
            for schedule in schedules:
                # Get student count for this section
                student_count = User.objects.filter(
                    role='student',
                    studentprofile__class_section__icontains=schedule.section.class_group.name
                ).count()
                
                classes_data.append({
                    "id": schedule.id,
                    "section": f"{schedule.section.class_group.name} - Section {schedule.section.name}",
                    "subject": schedule.subject.name,
                    "subject_code": schedule.subject.code,
                    "room": schedule.room.name if schedule.room else "TBA",
                    "day_of_week": schedule.day_of_week,
                    "start_time": schedule.start_time.strftime('%H:%M'),
                    "end_time": schedule.end_time.strftime('%H:%M'),
                    "student_count": student_count
                })
            
            return Response(classes_data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get', 'post'])
    def grades(self, request):
        """Get or create grades for teacher's students"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            if request.method == 'GET':
                # Get filters
                subject_id = request.query_params.get('subject')
                section_id = request.query_params.get('section')
                grade_type = request.query_params.get('grade_type')
                
                # Get grades for teacher's subjects
                grades = Grade.objects.filter(
                    teacher=teacher,
                    subject__in=teacher.subjects.all()
                ).select_related('student', 'subject', 'section')
                
                if subject_id:
                    grades = grades.filter(subject_id=subject_id)
                if section_id:
                    grades = grades.filter(section_id=section_id)
                if grade_type:
                    grades = grades.filter(grade_type=grade_type)
                
                grades = grades.order_by('-date_recorded')[:100]
                
                serializer = TeacherGradeSerializer(grades, many=True)
                return Response(serializer.data)
            
            elif request.method == 'POST':
                # Create new grade
                serializer = TeacherGradeSerializer(
                    data=request.data, 
                    context={'request': request}
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get', 'post'])
    def attendance(self, request):
        """Get or record attendance for teacher's students"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            if request.method == 'GET':
                # Get filters
                subject_id = request.query_params.get('subject')
                section_id = request.query_params.get('section')
                date = request.query_params.get('date')
                
                # Get attendance records for teacher's subjects
                attendance = Attendance.objects.filter(
                    taken_by=teacher,
                    subject__in=teacher.subjects.all()
                ).select_related('student', 'subject', 'section')
                
                if subject_id:
                    attendance = attendance.filter(subject_id=subject_id)
                if section_id:
                    attendance = attendance.filter(section_id=section_id)
                if date:
                    attendance = attendance.filter(date=date)
                
                attendance = attendance.order_by('-date')[:100]
                
                serializer = TeacherAttendanceSerializer(attendance, many=True)
                return Response(serializer.data)
            
            elif request.method == 'POST':
                # Record attendance
                serializer = TeacherAttendanceSerializer(
                    data=request.data, 
                    context={'request': request}
                )
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_students(self, request):
        """Get students in teacher's classes"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            # Get sections taught by this teacher
            sections = Section.objects.filter(
                schedule__teacher=request.user
            ).distinct()
            
            students_data = []
            for section in sections:
                # Get students in this section
                students = User.objects.filter(
                    role='student',
                    studentprofile__class_section__icontains=section.class_group.name
                ).select_related('studentprofile')
                
                for student in students:
                    # Get recent grades for this student in teacher's subjects
                    recent_grades = Grade.objects.filter(
                        student=student,
                        teacher=teacher,
                        subject__in=teacher.subjects.all()
                    ).order_by('-date_recorded')[:3]
                    
                    # Get attendance percentage
                    total_attendance = Attendance.objects.filter(
                        student=student,
                        taken_by=teacher
                    ).count()
                    present_attendance = Attendance.objects.filter(
                        student=student,
                        taken_by=teacher,
                        status='present'
                    ).count()
                    
                    attendance_percentage = (present_attendance / total_attendance * 100) if total_attendance > 0 else 0
                    
                    students_data.append({
                        "id": student.id,
                        "name": student.get_full_name(),
                        "student_id": student.studentprofile.student_id,
                        "class_section": student.studentprofile.class_section,
                        "email": student.email,
                        "recent_grades": [
                            {
                                "subject": grade.subject.name,
                                "score": grade.score,
                                "full_mark": grade.full_mark,
                                "grade_type": grade.grade_type,
                                "date": grade.date_recorded.strftime('%Y-%m-%d')
                            } for grade in recent_grades
                        ],
                        "attendance_percentage": round(attendance_percentage, 1)
                    })
            
            return Response(students_data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for teacher"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            # Get basic counts
            total_subjects = teacher.subjects.count()
            total_classes = Schedule.objects.filter(teacher=request.user).count()
            
            # Get total students across all classes
            sections = Section.objects.filter(
                schedule__teacher=request.user
            ).distinct()
            
            total_students = 0
            for section in sections:
                students_count = User.objects.filter(
                    role='student',
                    studentprofile__class_section__icontains=section.class_group.name
                ).count()
                total_students += students_count
            
            # Get recent grades count
            recent_grades = Grade.objects.filter(
                teacher=teacher,
                date_recorded__gte=datetime.now().date() - timedelta(days=30)
            ).count()
            
            # Get attendance records count
            recent_attendance = Attendance.objects.filter(
                taken_by=teacher,
                date__gte=datetime.now().date() - timedelta(days=30)
            ).count()
            
            return Response({
                "total_subjects": total_subjects,
                "total_classes": total_classes,
                "total_students": total_students,
                "recent_grades": recent_grades,
                "recent_attendance": recent_attendance,
                "teacher_info": {
                    "name": teacher.user.get_full_name(),
                    "employee_id": teacher.employee_id,
                    "department": teacher.department,
                    "academic_rank": teacher.academic_rank
                }
            })
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)

# -----------------------------
# TEACHER CRUD & MANAGEMENT
# -----------------------------
class TeacherViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Teacher management.
    Supports list, retrieve, create, update, delete.
    """
    queryset = Teacher.objects.all().order_by("-id")
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        required_fields = ["department", "academic_rank", "first_name", "last_name", "national_id"]
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)