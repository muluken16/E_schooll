from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from .models import StaffProfile, StudentProfile, User

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
