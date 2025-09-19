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
from datetime import datetime

from .models import StaffProfile, StudentProfile
from .serializers import StaffSerializer, StudentSerializer, UserSerializer

User = get_user_model()


# -----------------------------
# LOGIN API
# -----------------------------
class LoginAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=404)

        if not check_password(password, user.password):
            return Response({"detail": "Incorrect password."}, status=401)

        if not user.is_active:
            return Response({"detail": "User account is disabled."}, status=403)

        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


# -----------------------------
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
class StaffViewSet(viewsets.ModelViewSet):
    queryset = StaffProfile.objects.all().order_by("-id")
    serializer_class = StaffSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        required_fields = ["department", "role", "first_name", "last_name", "phone"]
        for field in required_fields:
            if not data.get(field):
                return Response({"error": f"{field} is required"}, status=400)

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
            user.role = data.get("role")
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
        return Response(serializer_data, status=201)
