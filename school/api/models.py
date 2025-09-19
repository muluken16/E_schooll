from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class User(AbstractUser):
    ROLE_CHOICES = [
        ('national_office', 'National Education Office'),
        ('regional_office', 'Regional Education Office'),
        ('zone_office', 'Zone Education Office'),
        ('wereda_office', 'Wereda Education Office'),
        ('university', 'University'),
        ('college', 'College'),
        ('senate', 'Senate'),
        ('school', 'School'),
        ('vice_director', 'Vice Director'),
        ('department_head', 'Department Head'),
        ('teacher', 'Teacher'),
        ('librarian', 'Librarian'),
        ('record_officer', 'Record Officer'),
        ('student', 'Student'),
        ('inventorian', 'Inventorian'),
        ('store_man', 'Store Manager'),
        ('dormitory_manager', 'Dormitory Manager'),
        ('hr_officer', 'Human Resource Officer'),
    ]

    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
    national_id = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\d{6,20}$', 'National ID must be 6-20 digits')],
        verbose_name="National ID"
    )
    profile_photo = models.ImageField(
        upload_to='user_photos/',
        null=True,
        blank=True,
        default="user_photos/default.png"
    )
    email = models.EmailField(unique=True)

    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    class Meta:
        ordering = ["id"]
        verbose_name = "User"
        verbose_name_plural = "Users"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile",
        limit_choices_to={'role': 'student'}
    )

    admission_no = models.CharField(max_length=20, unique=True)
    student_id = models.CharField(max_length=20, unique=True, blank=True, null=True)

    # Academic
    department = models.CharField(max_length=100, blank=True, null=True)
    year = models.CharField(max_length=20, blank=True, null=True)
    class_section = models.CharField(max_length=50)
    academic_status = models.CharField(max_length=20, default="Active")
    enrollment_date = models.DateField(blank=True, null=True)

    # Personal
    gender = models.CharField(max_length=20, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    medical_condition = models.TextField(blank=True, null=True)
    extra_activities = models.TextField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    # Guardian
    father_name = models.CharField(max_length=100, blank=True, null=True)
    mother_name = models.CharField(max_length=100, blank=True, null=True)
    guardian_contact = models.CharField(max_length=20, blank=True, null=True)
    guardian_email = models.EmailField(blank=True, null=True)
    guardian_relation = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.admission_no} - {self.user.get_full_name()}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"


class StaffProfile(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('on_leave', 'On Leave'),
        ('inactive', 'Inactive'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="staff_profile",
        limit_choices_to={'role__in': [
            'teacher', 'vice_director', 'department_head', 'record_officer',
            'librarian', 'store_man', 'inventorian', 'hr_officer'
        ]}
    )

    department = models.CharField(max_length=100)
    subject = models.CharField(max_length=100, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    qualifications = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    address = models.CharField(max_length=255, blank=True, null=True)
    emergency_contact = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    staff_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)  # Phone number field

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.get_status_display()})"

    class Meta:
        ordering = ["user__last_name"]
        verbose_name = "Staff Profile"
        verbose_name_plural = "Staff Profiles"


class Subject(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Mathematics", "Physics"
    code = models.CharField(max_length=10, unique=True)  # e.g., "MATH101"
    credit_hours = models.PositiveIntegerField()
    department = models.CharField(max_length=100)
    level = models.CharField(max_length=50)  # e.g., Grade 9, Year 1

    def __str__(self):
        return f"{self.code} - {self.name}"

class Semester(models.Model):
    name = models.CharField(max_length=50)  # e.g., "Semester 1", "Semester 2"
    academic_year = models.CharField(max_length=9)  # e.g., "2025/26"
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"{self.name} - {self.academic_year}"

class ClassGroup(models.Model):
    name = models.CharField(max_length=50)  # e.g., "Grade 10", "Year 2"
    level = models.CharField(max_length=50)  # e.g., Primary, Secondary, Undergraduate
    academic_program = models.CharField(max_length=100)  # e.g., Natural Science, Engineering

    def __str__(self):
        return self.name


class Room(models.Model):
    name = models.CharField(max_length=50)  # e.g., "Room 101", "Lab 2"
    building = models.CharField(max_length=100, null=True, blank=True)
    capacity = models.PositiveIntegerField()
    is_lab = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    student_id = models.CharField(max_length=20, unique=True)
    enrollment_year = models.PositiveIntegerField()
    program = models.CharField(max_length=100)
    level = models.CharField(max_length=50)  # e.g., 'Undergraduate', 'Graduate'
    current_semester = models.CharField(max_length=20)
    gpa = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    hire_date = models.DateField()
    academic_rank = models.CharField(max_length=50)  # e.g., Lecturer, Assistant Professor
    
    subjects = models.ManyToManyField('Subject', related_name='teachers', blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.academic_rank})"

class Section(models.Model):
    class_group = models.ForeignKey('ClassGroup', on_delete=models.CASCADE, related_name='sections')
    name = models.CharField(max_length=10)  # e.g., A, B, C
    advisor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'teacher'},
        related_name='advised_sections'
    )
    name_caller = models.ForeignKey(
        'Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='name_caller_sections',
        help_text='Teacher responsible for taking attendance and collecting grades'
    )

    def __str__(self):
        return f"{self.class_group.name} - Section {self.name}"

class Schedule(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True)
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'})
    day_of_week = models.CharField(max_length=10)  # e.g., "Monday"
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('section', 'subject', 'day_of_week', 'start_time')

    def __str__(self):
        return f"{self.subject.name} - {self.section} on {self.day_of_week}"


class Attendance(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    section = models.ForeignKey('Section', on_delete=models.CASCADE)
    subject = models.ForeignKey('Subject', on_delete=models.CASCADE, blank=True, null=True)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=[('present', 'Present'), ('absent', 'Absent')])

    taken_by = models.ForeignKey(
        'Teacher',
        on_delete=models.SET_NULL,
        null=True,
        related_name='taken_attendance'
    )
    class Meta:
        unique_together = ('student', 'section', 'subject', 'date')

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.date} - {self.status}"


class Grade(models.Model):
    GRADE_TYPE_CHOICES = [
        ('assignment', 'Assignment'),
        ('quiz', 'Quiz'),
        ('midterm', 'Midterm Exam'),
        ('final', 'Final Exam'),
        ('project', 'Project'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    subject = models.ForeignKey('Subject', on_delete=models.CASCADE)
    section = models.ForeignKey('Section', on_delete=models.CASCADE)
    teacher = models.ForeignKey('Teacher', on_delete=models.SET_NULL, null=True)
    semester = models.ForeignKey('Semester', on_delete=models.CASCADE)
    academic_year = models.CharField(max_length=9)  # e.g., "2024/2025"
    grade_type = models.CharField(max_length=20, choices=GRADE_TYPE_CHOICES)
    score = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 87.50
    full_mark = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    date_recorded = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'subject', 'semester', 'grade_type')

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.subject.name} - {self.grade_type}: {self.score}"


class Librarian(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'librarian'})
    employee_id = models.CharField(max_length=20, unique=True)
    library_branch = models.CharField(max_length=100)
    hire_date = models.DateField()

    def __str__(self):
        return f"{self.user.get_full_name()} - Librarian"

class Book(models.Model):
    isbn = models.CharField(max_length=13, unique=True)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255, blank=True, null=True)
    year_published = models.PositiveIntegerField(blank=True, null=True)
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    library_branch = models.CharField(max_length=100)  # Could also link to a LibraryBranch model

    def __str__(self):
        return f"{self.title} by {self.author}"

from django.utils import timezone

class BorrowRecord(models.Model):
    BORROWER_CHOICES = [
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrow_records')
    borrower_type = models.CharField(max_length=10, choices=BORROWER_CHOICES)
    borrower_teacher = models.ForeignKey(
        'Teacher', on_delete=models.CASCADE, null=True, blank=True,
        limit_choices_to={'user__role': 'teacher'}
    )
    borrower_student = models.ForeignKey(
        'User', on_delete=models.CASCADE, null=True, blank=True,
        limit_choices_to={'role': 'student'}
    )
    borrow_date = models.DateField(default=timezone.now)
    expected_return_date = models.DateField()
    actual_return_date = models.DateField(null=True, blank=True)
    returned = models.BooleanField(default=False)

    def __str__(self):
        borrower = self.borrower_teacher or self.borrower_student
        return f"{borrower.get_full_name()} borrowed '{self.book.title}'"

    def save(self, *args, **kwargs):
        if not self.pk:
            # On new borrow, reduce available copies
            if self.book.available_copies <= 0:
                raise ValueError("No available copies to borrow.")
            self.book.available_copies -= 1
            self.book.save()
        elif self.returned and self.actual_return_date:
            # On return, increase available copies
            self.book.available_copies += 1
            self.book.save()
        super().save(*args, **kwargs)


class HROfficer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'hr_officer'})
    position = models.CharField(max_length=100)
    hire_date = models.DateField()
    office_location = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user.get_full_name()} - HR"


class DormitoryManager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'dormitory_manager'})
    assigned_dormitory = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    office_number = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.user.get_full_name()} - Dorm Manager"


class RecordOfficer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'record_officer'})
    office = models.CharField(max_length=100)
    managed_records = models.TextField(help_text="Types of records managed")

    def __str__(self):
        return f"{self.user.get_full_name()} - Records"

class StoreMaterial(models.Model):
    name = models.CharField(max_length=100)  # e.g., Chair, Table, Projector
    description = models.TextField(blank=True, null=True)
    quantity_total = models.PositiveIntegerField(default=0)
    quantity_available = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=50, default="pcs")  # e.g., pieces, sets
    store_manager = models.ForeignKey(
        'StoreManager',
        on_delete=models.CASCADE,
        related_name='materials'
    )

    def __str__(self):
        return f"{self.name} ({self.quantity_available}/{self.quantity_total})"


class IssuedMaterial(models.Model):
    material = models.ForeignKey(StoreMaterial, on_delete=models.CASCADE, related_name='issued_records')
    issued_to = models.ForeignKey(User, on_delete=models.CASCADE)  # Can be student, teacher, etc.
    quantity = models.PositiveIntegerField()
    issue_date = models.DateField(auto_now_add=True)
    expected_return_date = models.DateField(null=True, blank=True)
    actual_return_date = models.DateField(null=True, blank=True)
    returned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.material.name} issued to {self.issued_to.get_full_name()}"

    def save(self, *args, **kwargs):
        if not self.pk:
            # New issue: subtract from available quantity
            if self.quantity > self.material.quantity_available:
                raise ValueError("Not enough stock available.")
            self.material.quantity_available -= self.quantity
            self.material.save()
        elif self.returned and self.actual_return_date:
            # On return: add back to available
            self.material.quantity_available += self.quantity
            self.material.save()
        super().save(*args, **kwargs)


class StoreManager(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'store'})
    store_name = models.CharField(max_length=100)
    inventory_count = models.PositiveIntegerField(default=0)  # Can update automatically from materials

    def __str__(self):
        return f"{self.user.get_full_name()} - Store Manager"

    def update_inventory_count(self):
        self.inventory_count = self.materials.aggregate(total=models.Sum('quantity_available'))['total'] or 0
        self.save()

class InventorialOfficer(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'inventorial'}
    )
    assigned_assets = models.TextField(help_text="Categories or types of assets managed")
    location = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user.get_full_name()} - Inventorial Officer"


class AssetCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Asset(models.Model):
    STATUS_CHOICES = [
        ('working', 'Working'),
        ('damaged', 'Damaged'),
        ('under_repair', 'Under Repair'),
        ('lost', 'Lost'),
        ('transferred', 'Transferred'),
    ]

    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(AssetCategory, on_delete=models.SET_NULL, null=True)
    assigned_to = models.CharField(max_length=100, blank=True, help_text="Room, department, or user")
    location = models.CharField(max_length=100)
    purchase_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='working')
    inventoried_by = models.ForeignKey(
        'InventorialOfficer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assets'
    )

    def __str__(self):
        return f"{self.name} ({self.serial_number})"

class AssetAudit(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='audits')
    officer = models.ForeignKey(InventorialOfficer, on_delete=models.SET_NULL, null=True)
    audit_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True)
    status_at_audit = models.CharField(max_length=20, choices=Asset.STATUS_CHOICES)

    def __str__(self):
        return f"Audit: {self.asset.name} on {self.audit_date}"


class ViceDirector(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'vice_director'})
    office = models.CharField(max_length=100)
    responsible_for = models.TextField(help_text="List of operational duties")

    def __str__(self):
        return f"{self.user.get_full_name()} - Vice Director"

class DepartmentHead(models.Model):
    teacher = models.OneToOneField(
        'Teacher',
        on_delete=models.CASCADE,
        related_name='department_head_role',
        help_text="The teacher who is head of this department"
    )
    department_name = models.CharField(max_length=100)
    head_since = models.DateField()

    def __str__(self):
        return f"{self.teacher.user.get_full_name()} - Head of {self.department_name}"

# teacher = Teacher.objects.get(employee_id='T-1023')

# # Assign department head role
# head = DepartmentHead.objects.create(
#     teacher=teacher,
#     department_name='Mathematics',
#     head_since='2024-09-01'
# )
# Get the user's department head info
# teacher.department_head_role  # returns DepartmentHead instance if exists

# # From DepartmentHead to User
# head.teacher.user.first_name
# class DepartmentHeadAdmin(admin.ModelAdmin):
#     list_display = ('teacher', 'department_name', 'head_since')

# admin.site.register(DepartmentHead, DepartmentHeadAdmin)



class SenateMember(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'senate'}
    )
    member_since = models.DateField()
    responsibilities = models.TextField()

    institutions = models.ManyToManyField(
        'Institution',
        related_name='senate_members',
        blank=True,
        help_text="Schools, Colleges, or Universities managed by this senate member"
    )

    def __str__(self):
        return f"{self.user.get_full_name()} - Senate"




# class Institution(models.Model):
#     TYPE_CHOICES = [
#         ('school', 'School'),
#         ('college', 'College'),
#         ('university', 'University'),
#     ]
#     name = models.CharField(max_length=200)
#     type = models.CharField(max_length=20, choices=TYPE_CHOICES)
#     region = models.CharField(max_length=100)
#     zone = models.CharField(max_length=100)
#     woreda = models.CharField(max_length=100)
#     established_year = models.PositiveIntegerField()
#     manager = models.ForeignKey(
#         User,
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         limit_choices_to={'role__in': ['school', 'college', 'university']},
#         related_name='managed_institutions'
#     )

#     def __str__(self):
#         return f"{self.name} ({self.get_type_display()})"


class EducationOffice(models.Model):
    LEVEL_CHOICES = [
        ('zone', 'Zone Office'),
        ('regional', 'Regional Office'),
        ('national', 'National Office'),
    ]
    name = models.CharField(max_length=200)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    location = models.CharField(max_length=100)
    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role__in': ['zone_office', 'regional_office', 'national_office']},
        related_name='managed_education_offices'
    )

    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"



class Institution(models.Model):
    TYPE_CHOICES = [
        ('school', 'School'),
        ('college', 'College'),
        ('university', 'University'),
    ]

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    education_office = models.ForeignKey(
        'EducationOffice',
        on_delete=models.PROTECT,
        related_name='institutions',
        help_text="The education office this institution belongs to"
    )
    woreda = models.CharField(max_length=100, help_text="Specific woreda inside the zone/region")
    established_year = models.PositiveIntegerField()

    manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role__in': ['school', 'college', 'university']},
        related_name='managed_institutions'
    )

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


# Suggested Models for E-Learning
from django.contrib.auth import get_user_model

User = get_user_model()

# --------------------------------------
# COURSE
# --------------------------------------
class Course(models.Model):
    STATUS_CHOICES = [
        ('live', 'Live'),
        ('inactive', 'Inactive'),
        ('draft', 'Draft'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    subject = models.ForeignKey('Subject', on_delete=models.CASCADE)
    teacher = models.ForeignKey('Teacher', on_delete=models.CASCADE)
    section = models.ForeignKey('Section', on_delete=models.CASCADE)
    semester = models.ForeignKey('Semester', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

# --------------------------------------
# LESSON
# --------------------------------------
class Lesson(models.Model):
    STATUS_CHOICES = [
        ('live', 'Live'),
        ('inactive', 'Inactive'),
        ('draft', 'Draft'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)  # Rich text or HTML content
    file = models.FileField(upload_to='lessons/', null=True, blank=True)
    video_url = models.URLField(blank=True, help_text="YouTube or external video link")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    posted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"

# --------------------------------------
# ASSIGNMENT
# --------------------------------------
class Assignment(models.Model):
    STATUS_CHOICES = [
        ('live', 'Live'),
        ('inactive', 'Inactive'),
        ('draft', 'Draft'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    instructions = models.TextField()
    due_date = models.DateTimeField()
    max_score = models.PositiveIntegerField(default=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    def __str__(self):
        return f"{self.lesson.course.title} - {self.title}"

# --------------------------------------
# ASSIGNMENT SUBMISSION
# --------------------------------------
class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    submitted_file = models.FileField(upload_to='submissions/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.assignment.title}"

# --------------------------------------
# QUIZ
# --------------------------------------
class Quiz(models.Model):
    STATUS_CHOICES = [
        ('live', 'Live'),
        ('inactive', 'Inactive'),
        ('draft', 'Draft'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    total_marks = models.PositiveIntegerField()
    due_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    def __str__(self):
        return self.title

# --------------------------------------
# QUESTION
# --------------------------------------
class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=200)
    option_b = models.CharField(max_length=200)
    option_c = models.CharField(max_length=200)
    option_d = models.CharField(max_length=200)
    correct_answer = models.CharField(
        max_length=1,
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')]
    )

    def __str__(self):
        return self.question_text
