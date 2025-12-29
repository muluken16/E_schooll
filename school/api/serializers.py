from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from .models import School, StaffProfile, StudentProfile, User, Wereda, Teacher, Subject, Grade, Attendance, Section, Schedule
from django.contrib.auth.hashers import make_password

User = get_user_model()


# ------------------------- LOGIN -------------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        data['user'] = user
        return data


# ------------------------- USER SERIALIZER -------------------------
class UserSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()
    national_id = serializers.CharField(allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'national_id', 'profile_photo']

    def get_profile_photo(self, obj):
        request = self.context.get('request')
        if obj.profile_photo:
            url = obj.profile_photo.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


# ------------------------- STUDENT SERIALIZER -------------------------
class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    national_id = serializers.CharField(source="user.national_id", read_only=True)

    class Meta:
        model = StudentProfile
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        national_id = validated_data.pop('national_id')
        email = validated_data.pop('email', '')

        if User.objects.filter(national_id=national_id).exists():
            raise serializers.ValidationError({"national_id": "A user with this National ID already exists."})

        # Generate username: last_name + first 4 chars of national_id
        nat_part = national_id[:4]
        base_username = f"{last_name.lower()}{nat_part}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        with transaction.atomic():
            user = User.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                role='student',
                national_id=national_id
            )
            raw_password = f"{last_name.capitalize()}#123"
            user.set_password(raw_password)
            user.save()

            student_profile = StudentProfile.objects.create(user=user, **validated_data)
            student_profile.password = raw_password  # attach password for response

        return student_profile

    def update(self, instance, validated_data):
        user = instance.user

        # Update User fields
        user.first_name = validated_data.get('first_name', user.first_name)
        user.last_name = validated_data.get('last_name', user.last_name)
        user.email = validated_data.get('email', user.email)
        national_id = validated_data.get('national_id', user.national_id)
        user.national_id = national_id

        # Update username if name or national_id changed
        nat_part = national_id[:4]
        base_username = f"{user.last_name.lower()}{nat_part}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exclude(pk=user.pk).exists():
            username = f"{base_username}{counter}"
            counter += 1
        user.username = username
        user.save()

        # Update StudentProfile fields
        for attr, value in validated_data.items():
            if attr not in ['first_name', 'last_name', 'email', 'national_id']:
                setattr(instance, attr, value)
        instance.save()
        return instance


# ------------------------- STAFF SERIALIZER -------------------------
class StaffSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    national_id = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(read_only=True)

    class Meta:
        model = StaffProfile
        fields = "__all__"
        extra_kwargs = {"user": {"read_only": True}}

    def create(self, validated_data):
        first_name = validated_data.pop("first_name")
        last_name = validated_data.pop("last_name")
        email = validated_data.pop("email", "")
        phone = validated_data.pop("phone")
        national_id = validated_data.pop("national_id")

        # Generate username: first_name + last_name + first 4 chars of national_id
        nat_part = national_id[:4]
        base_username = f"{first_name.lower()}{last_name.lower()}{nat_part}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        with transaction.atomic():
            user = User.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                role='staff',
                national_id=national_id
            )
            raw_password = f"{last_name.capitalize()}#123"
            user.set_password(raw_password)
            user.save()

            staff_profile = StaffProfile.objects.create(
                user=user,
                phone=phone,
                national_id=national_id,
                **validated_data
            )
            staff_profile.password = raw_password  # attach password for response

        return staff_profile

    def update(self, instance, validated_data):
        user = instance.user

        # Update User fields
        user.first_name = validated_data.get('first_name', user.first_name)
        user.last_name = validated_data.get('last_name', user.last_name)
        user.email = validated_data.get('email', user.email)
        national_id = validated_data.get('national_id', user.national_id)
        user.national_id = national_id

        # Update username if name or national_id changed
        nat_part = national_id[:4]
        base_username = f"{user.first_name.lower()}{user.last_name.lower()}{nat_part}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exclude(pk=user.pk).exists():
            username = f"{base_username}{counter}"
            counter += 1
        user.username = username
        user.save()

        # Update StaffProfile fields
        for attr, value in validated_data.items():
            if attr not in ['first_name', 'last_name', 'email', 'national_id']:
                setattr(instance, attr, value)
        instance.save()
        return instance
class WeredaSerializer(serializers.ModelSerializer):
    # Display username of the creator instead of just ID
    created_by_username = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Wereda
        fields = [
            'id',
            'name',
            'population',
            'area',
            'number_of_schools',
            'number_of_students',
            'number_of_teachers',
            'literacy_rate',
            'status',
            'created_by',          # user ID (optional, read-only if you prefer)
            'created_by_username', # username of creator
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']



class WeredaManagerSerializer(serializers.ModelSerializer):
    wereda = serializers.PrimaryKeyRelatedField(
        queryset=Wereda.objects.all(),
        write_only=True,
        required=True
    )
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)

    class Meta:
        model = StaffProfile
        fields = [
            "id", "user", "staff_id", "department", "phone",
            "status", "wereda", "first_name", "last_name", "email"
        ]
        read_only_fields = ["id", "user", "staff_id", "status"]

    def create(self, validated_data):
        wereda = validated_data.pop("wereda")
        first_name = validated_data.pop("first_name")
        last_name = validated_data.pop("last_name")
        email = validated_data.pop("email")
        phone = validated_data.get("phone", "")

        # Generate staff_id
        last_staff = StaffProfile.objects.order_by("-id").first()
        number = 1
        if last_staff and last_staff.staff_id and last_staff.staff_id[3:].isdigit():
            number = int(last_staff.staff_id[3:]) + 1
        staff_id = f"STF{str(number).zfill(4)}"

        # Generate unique username
        last5 = phone[-5:] if len(phone) >= 5 else str(number)
        username = f"{first_name.lower()}{last5}"
        counter = 1
        base_username = username
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        # Default password
        raw_password = (last_name or "Manager").capitalize() + "#123"

        with transaction.atomic():
            # Create User
            user = User.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                role="wereda_office",
            )
            user.set_password(raw_password)
            user.save()

            # Create StaffProfile
            staff_profile = StaffProfile.objects.create(
                user=user,
                staff_id=staff_id,
                department=validated_data.get("department", "Wereda Management"),
                phone=phone,
                status="active",
            )

            # Assign Wereda manager
            wereda.manager = user
            wereda.save()

        return staff_profile

    def to_representation(self, instance):
        # Customize the output to include user info
        return {
            "id": instance.id,
            "staff_id": instance.staff_id,
            "department": instance.department,
            "phone": instance.phone,
            "status": instance.status,
            "wereda": instance.user.managed_weredas.first().id if instance.user.managed_weredas.exists() else None,
            "user": {
                "first_name": instance.user.first_name,
                "last_name": instance.user.last_name,
                "email": instance.user.email,
                "phone": instance.phone,
            },
            "created_at": instance.user.date_joined
        }
    
from rest_framework import serializers
from django.db import transaction
from .models import User, StaffProfile, School

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = "__all__"



class SchoolManagerRegistrationSerializer(serializers.ModelSerializer):
    assigned_school_id = serializers.IntegerField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    department = serializers.CharField(write_only=True, required=False, default="School Management")
    hire_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "national_id",
            "role",
            "assigned_school_id",
            "phone",
            "department",
            "hire_date",
            "address",
        ]
        read_only_fields = ["id", "role"]

    # --------------------------
    # Username & Password helper
    # --------------------------
    def generate_username(self, first_name, last_name):
        import random
        random_number = random.randint(100, 999)
        return f"{first_name[0].lower()}{last_name.lower()}{random_number}"

    def generate_password(self, last_name):
        last_three = last_name[-3:] if len(last_name) >= 3 else last_name
        return f"{last_three}#123"

    # --------------------------
    # Create user + staff profile + assign school
    # --------------------------
    def create(self, validated_data):
        school_id = validated_data.pop("assigned_school_id")
        phone = validated_data.pop("phone", "")
        department = validated_data.pop("department", "School Management")
        hire_date = validated_data.pop("hire_date", None)
        address = validated_data.pop("address", "")

        first_name = validated_data.get("first_name")
        last_name = validated_data.get("last_name")
        username = self.generate_username(first_name, last_name)
        raw_password = self.generate_password(last_name)

        with transaction.atomic():
            # 1️⃣ Create User
            user = User.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=validated_data.get("email"),
                national_id=validated_data.get("national_id"),
                role="school",
            )
            user.set_password(raw_password)
            user.save()

            # 2️⃣ Create StaffProfile
            last_staff = StaffProfile.objects.order_by("-id").first()
            number = 1
            if last_staff and last_staff.staff_id and last_staff.staff_id[3:].isdigit():
                number = int(last_staff.staff_id[3:]) + 1
            staff_id = f"STF{str(number).zfill(4)}"

            staff_profile = StaffProfile.objects.create(
                user=user,
                staff_id=staff_id,
                department=department,
                phone=phone,
                status="active",
                hire_date=hire_date,
                address=address,
            )

            # 3️⃣ Assign as School Manager
            try:
                school = School.objects.get(id=school_id)
                school.manager = user
                school.save()
            except School.DoesNotExist:
                raise serializers.ValidationError(
                    {"assigned_school_id": "Selected school does not exist"}
                )

        # Attach plain password for frontend/email if needed
        user.plain_password = raw_password
        return staff_profile

    # --------------------------
    # Representation for frontend
    # --------------------------
    def to_representation(self, instance):
        user = instance.user
        school = user.managed_schools.first() if hasattr(user, "managed_schools") and user.managed_schools.exists() else None

        return {
            "id": instance.id,
            "staff_id": instance.staff_id,
            "department": instance.department,
            "phone": instance.phone,
            "status": instance.status,
            "hire_date": instance.hire_date,
            "address": instance.address,
            "school": {
                "id": school.id,
                "name": school.name,
            } if school else None,
            "user": {
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "username": user.username,
                "national_id": user.national_id,
                "role": user.role,
            },
            "created_at": user.date_joined,
        }



class SupervisorRegistrationSerializer(serializers.ModelSerializer):
    # Accept multiple school IDs for assignment
    assigned_school_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )

    class Meta:
        model = User
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'national_id',
            'role',
            'assigned_school_ids',
        ]
        read_only_fields = ['id', 'role']

    # --------------------------
    # Username & password helpers
    # --------------------------
    def generate_username(self, first_name, last_name):
        import random
        random_number = random.randint(100, 999)
        return f"{first_name[0].lower()}{last_name.lower()}{random_number}"

    def generate_password(self, last_name):
        last_three = last_name[-3:] if len(last_name) >= 3 else last_name
        return f"{last_three}#123"

    # --------------------------
    # Create supervisor user + assign schools
    # --------------------------
    def create(self, validated_data):
        school_ids = validated_data.pop('assigned_school_ids', [])
        validated_data['role'] = 'senate'  # force role to Supervisor

        first_name = validated_data.get('first_name')
        last_name = validated_data.get('last_name')

        # Generate username and password
        username = self.generate_username(first_name, last_name)
        password = self.generate_password(last_name)
        validated_data['username'] = username
        validated_data['password'] = make_password(password)

        # Create supervisor user
        user = User.objects.create(**validated_data)

        # Assign supervisor to multiple schools
        schools = School.objects.filter(id__in=school_ids)
        if not schools.exists():
            raise serializers.ValidationError(
                {'assigned_school_ids': 'No valid schools found'}
            )

        for school in schools:
            school.supervisor = user
            school.save()

        # Attach plain password for frontend/email
        user.plain_password = password
        return user

    # --------------------------
    # Representation for frontend
    # --------------------------
    def to_representation(self, instance):
        assigned_schools = School.objects.filter(supervisor=instance)
        return {
            "id": instance.id,
            "first_name": instance.first_name,
            "last_name": instance.last_name,
            "email": instance.email,
            "national_id": instance.national_id,
            "role": instance.role,
            "username": instance.username,
            "assigned_schools": [
                {"id": s.id, "name": s.name} for s in assigned_schools
            ],
            "created_at": instance.date_joined,
        }


# ------------------------- TEACHER SERIALIZER -------------------------
class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    national_id = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    subjects = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), 
        many=True, 
        required=False
    )
    subject_names = serializers.SerializerMethodField(read_only=True)
    password = serializers.CharField(read_only=True)

    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'employee_id', 'department', 'hire_date', 
            'academic_rank', 'subjects', 'subject_names',
            'first_name', 'last_name', 'national_id', 'email', 'password'
        ]
        extra_kwargs = {"user": {"read_only": True}}

    def get_subject_names(self, obj):
        return [subject.name for subject in obj.subjects.all()]

    def create(self, validated_data):
        first_name = validated_data.pop("first_name")
        last_name = validated_data.pop("last_name")
        email = validated_data.pop("email", "")
        national_id = validated_data.pop("national_id")
        subjects = validated_data.pop("subjects", [])

        # Check if national_id already exists
        if User.objects.filter(national_id=national_id).exists():
            raise serializers.ValidationError({"national_id": "A user with this National ID already exists."})

        # Generate employee_id
        last_teacher = Teacher.objects.order_by("-id").first()
        number = 1
        if last_teacher and last_teacher.employee_id and last_teacher.employee_id[1:].isdigit():
            number = int(last_teacher.employee_id[1:]) + 1
        employee_id = f"T{str(number).zfill(4)}"

        # Generate username: first_name + last 4 chars of national_id
        nat_part = national_id[-4:]
        base_username = f"{first_name.lower()}{nat_part}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        with transaction.atomic():
            # Create User
            user = User.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                role='teacher',
                national_id=national_id
            )
            raw_password = f"{last_name.capitalize()}#123"
            user.set_password(raw_password)
            user.save()

            # Create Teacher profile
            teacher = Teacher.objects.create(
                user=user,
                employee_id=employee_id,
                **validated_data
            )
            
            # Add subjects
            if subjects:
                teacher.subjects.set(subjects)

            teacher.password = raw_password  # attach password for response

        return teacher

    def update(self, instance, validated_data):
        user = instance.user
        subjects = validated_data.pop("subjects", None)

        # Update User fields
        user.first_name = validated_data.get('first_name', user.first_name)
        user.last_name = validated_data.get('last_name', user.last_name)
        user.email = validated_data.get('email', user.email)
        national_id = validated_data.get('national_id', user.national_id)
        user.national_id = national_id

        # Update username if name or national_id changed
        nat_part = national_id[-4:]
        base_username = f"{user.first_name.lower()}{nat_part}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exclude(pk=user.pk).exists():
            username = f"{base_username}{counter}"
            counter += 1
        user.username = username
        user.save()

        # Update Teacher fields
        for attr, value in validated_data.items():
            if attr not in ['first_name', 'last_name', 'email', 'national_id']:
                setattr(instance, attr, value)
        
        # Update subjects
        if subjects is not None:
            instance.subjects.set(subjects)
            
        instance.save()
        return instance


# ------------------------- GRADE SERIALIZER FOR TEACHERS -------------------------
class TeacherGradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'student_name', 'subject', 'subject_name', 
            'section', 'section_name', 'grade_type', 'score', 'full_mark',
            'academic_year', 'date_recorded'
        ]

    def create(self, validated_data):
        # Set the teacher from the request context
        request = self.context.get('request')
        if request and hasattr(request.user, 'teacher'):
            validated_data['teacher'] = request.user.teacher
        return super().create(validated_data)


# ------------------------- ATTENDANCE SERIALIZER FOR TEACHERS -------------------------
class TeacherAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'section', 'section_name',
            'subject', 'subject_name', 'date', 'status'
        ]

    def create(self, validated_data):
        # Set the teacher from the request context
        request = self.context.get('request')
        if request and hasattr(request.user, 'teacher'):
            validated_data['taken_by'] = request.user.teacher
        return super().create(validated_data)