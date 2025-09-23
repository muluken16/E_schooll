from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from django.db import transaction
from django.http import HttpResponse
import csv, io
from rest_framework.permissions import AllowAny

from datetime import datetime
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import School, StaffProfile, StudentProfile, Wereda
from .serializers import SchoolManagerRegistrationSerializer, SchoolSerializer, StaffSerializer, StudentSerializer, SupervisorRegistrationSerializer, UserSerializer, WeredaManagerSerializer, WeredaSerializer

User = get_user_model()


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

        # 2️⃣ Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Email is incorrect."}, status=status.HTTP_404_NOT_FOUND)

        # 3️⃣ Verify password
        if not check_password(password, user.password):
            return Response({"error": "Password is incorrect."}, status=status.HTTP_401_UNAUTHORIZED)

        # 4️⃣ Check if user is active
        if not user.is_active:
            return Response({"error": "User account is disabled."}, status=status.HTTP_403_FORBIDDEN)

        # 5️⃣ Generate JWT tokens
        try:
            refresh = RefreshToken.for_user(user)
        except Exception as e:
            return Response({"error": "Failed to generate token.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 6️⃣ Return user data + tokens
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
    queryset = StudentProfile.objects.all().order_by("-id")
    serializer_class = StudentSerializer

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

# -----------------------------
# STAFF CRUD
# -----------------------------
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from .models import StaffProfile, User
from .serializers import StaffSerializer

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
        return StaffProfile.objects.filter(user__role__in=allowed_roles).order_by("-id")

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
    queryset = StaffProfile.objects.filter(user__role="wereda_office").order_by("-id")
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