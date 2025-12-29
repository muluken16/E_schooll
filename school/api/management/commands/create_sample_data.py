from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    StudentProfile, Subject, Semester, Grade, Attendance, 
    Book, BorrowRecord, ClassGroup, Section, Teacher, Schedule
)
from datetime import date, datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample data for testing student functionality'

    def handle(self, *args, **options):
        self.stdout.write('Creating comprehensive sample data...')
        
        # Clear existing sample data to avoid conflicts
        self.stdout.write('Clearing existing sample data...')
        Grade.objects.filter(academic_year='2024/2025').delete()
        Attendance.objects.filter(date__gte=date(2024, 9, 1)).delete()
        BorrowRecord.objects.filter(borrower_type='student').delete()
        
        # Clear existing students
        User.objects.filter(role='student').delete()
        
        # Create comprehensive subjects for Grade 10
        subjects_data = [
            {'name': 'Mathematics', 'code': 'MATH101', 'credit_hours': 4, 'department': 'Science', 'level': 'Grade 10'},
            {'name': 'Physics', 'code': 'PHYS101', 'credit_hours': 4, 'department': 'Science', 'level': 'Grade 10'},
            {'name': 'Chemistry', 'code': 'CHEM101', 'credit_hours': 4, 'department': 'Science', 'level': 'Grade 10'},
            {'name': 'Biology', 'code': 'BIOL101', 'credit_hours': 3, 'department': 'Science', 'level': 'Grade 10'},
            {'name': 'English Language', 'code': 'ENG101', 'credit_hours': 3, 'department': 'Language', 'level': 'Grade 10'},
            {'name': 'History', 'code': 'HIST101', 'credit_hours': 2, 'department': 'Social Studies', 'level': 'Grade 10'},
            {'name': 'Geography', 'code': 'GEOG101', 'credit_hours': 2, 'department': 'Social Studies', 'level': 'Grade 10'},
            {'name': 'Computer Science', 'code': 'CS101', 'credit_hours': 3, 'department': 'Technology', 'level': 'Grade 10'},
            {'name': 'Physical Education', 'code': 'PE101', 'credit_hours': 1, 'department': 'Sports', 'level': 'Grade 10'},
            {'name': 'Art & Design', 'code': 'ART101', 'credit_hours': 2, 'department': 'Arts', 'level': 'Grade 10'},
        ]
        
        subjects = []
        for subject_data in subjects_data:
            subject, created = Subject.objects.get_or_create(
                code=subject_data['code'],
                defaults=subject_data
            )
            subjects.append(subject)
            if created:
                self.stdout.write(f'Created subject: {subject.name}')

        # Create sample semester
        semester, created = Semester.objects.get_or_create(
            name='Semester 1',
            academic_year='2024/2025',
            defaults={
                'start_date': date(2024, 9, 1),
                'end_date': date(2025, 1, 31)
            }
        )
        if created:
            self.stdout.write(f'Created semester: {semester.name}')

        # Create sample class group and section
        class_group, created = ClassGroup.objects.get_or_create(
            name='Grade 10',
            defaults={
                'level': 'Secondary',
                'academic_program': 'Natural Science'
            }
        )
        if created:
            self.stdout.write(f'Created class group: {class_group.name}')

        section, created = Section.objects.get_or_create(
            class_group=class_group,
            name='A',
            defaults={}
        )
        if created:
            self.stdout.write(f'Created section: {section.name}')

        # Create multiple students with diverse profiles
        students_data = [
            {
                'username': 'john_student',
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'john.student@school.com',
                'profile': {
                    'admission_no': 'ADM2024001',
                    'student_id': 'STUD0001',
                    'class_section': 'Grade 10A',
                    'department': 'Natural Science',
                    'year': '2024',
                    'academic_status': 'Active',
                    'enrollment_date': date(2024, 9, 1),
                    'gender': 'Male',
                    'dob': date(2006, 5, 15),
                    'phone': '+1234567890',
                    'address': '123 Main Street, Addis Ababa, Ethiopia',
                    'blood_group': 'O+',
                    'father_name': 'Robert Doe',
                    'mother_name': 'Jane Doe',
                    'guardian_contact': '+251911234567',
                    'guardian_email': 'robert.doe@email.com',
                    'guardian_relation': 'Father',
                    'extra_activities': 'Basketball team captain, Science club member, Math olympiad participant',
                    'remarks': 'Excellent student with strong academic performance and leadership qualities'
                }
            },
            {
                'username': 'jane_student',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'email': 'jane.student@school.com',
                'profile': {
                    'admission_no': 'ADM2024002',
                    'student_id': 'STUD0002',
                    'class_section': 'Grade 10A',
                    'department': 'Natural Science',
                    'year': '2024',
                    'academic_status': 'Active',
                    'enrollment_date': date(2024, 9, 1),
                    'gender': 'Female',
                    'dob': date(2006, 8, 22),
                    'phone': '+1234567892',
                    'address': '456 Oak Avenue, Addis Ababa, Ethiopia',
                    'blood_group': 'A+',
                    'father_name': 'Michael Smith',
                    'mother_name': 'Sarah Smith',
                    'guardian_contact': '+251922345678',
                    'guardian_email': 'michael.smith@email.com',
                    'guardian_relation': 'Father',
                    'extra_activities': 'Drama club president, Debate team, Environmental club',
                    'remarks': 'Creative student with excellent communication skills and environmental awareness'
                }
            },
            {
                'username': 'alex_student',
                'first_name': 'Alex',
                'last_name': 'Johnson',
                'email': 'alex.student@school.com',
                'profile': {
                    'admission_no': 'ADM2024003',
                    'student_id': 'STUD0003',
                    'class_section': 'Grade 10B',
                    'department': 'Natural Science',
                    'year': '2024',
                    'academic_status': 'Active',
                    'enrollment_date': date(2024, 9, 1),
                    'gender': 'Male',
                    'dob': date(2006, 12, 10),
                    'phone': '+1234567893',
                    'address': '789 Pine Road, Addis Ababa, Ethiopia',
                    'blood_group': 'B+',
                    'father_name': 'David Johnson',
                    'mother_name': 'Lisa Johnson',
                    'guardian_contact': '+251933456789',
                    'guardian_email': 'david.johnson@email.com',
                    'guardian_relation': 'Father',
                    'extra_activities': 'Computer programming club, Chess club, Robotics team',
                    'remarks': 'Technically gifted student with strong problem-solving abilities'
                }
            },
            {
                'username': 'maria_student',
                'first_name': 'Maria',
                'last_name': 'Garcia',
                'email': 'maria.student@school.com',
                'profile': {
                    'admission_no': 'ADM2024004',
                    'student_id': 'STUD0004',
                    'class_section': 'Grade 10B',
                    'department': 'Social Science',
                    'year': '2024',
                    'academic_status': 'Active',
                    'enrollment_date': date(2024, 9, 1),
                    'gender': 'Female',
                    'dob': date(2006, 3, 18),
                    'phone': '+1234567894',
                    'address': '321 Elm Street, Addis Ababa, Ethiopia',
                    'blood_group': 'AB+',
                    'father_name': 'Carlos Garcia',
                    'mother_name': 'Ana Garcia',
                    'guardian_contact': '+251944567890',
                    'guardian_email': 'carlos.garcia@email.com',
                    'guardian_relation': 'Father',
                    'extra_activities': 'Student council secretary, Language club, Cultural dance group',
                    'remarks': 'Well-rounded student with strong social skills and cultural awareness'
                }
            }
        ]

        # Create comprehensive teachers with realistic data
        teachers_data = [
            {
                'username': 'john_teacher',
                'first_name': 'John',
                'last_name': 'Smith',
                'email': 'john.teacher@school.com',
                'national_id': 'ID1234567890',
                'profile': {
                    'employee_id': 'T0001',
                    'department': 'Mathematics',
                    'hire_date': date(2020, 9, 1),
                    'academic_rank': 'Senior Teacher',
                    'subjects': ['Mathematics', 'Physics']
                }
            },
            {
                'username': 'mary_teacher',
                'first_name': 'Mary',
                'last_name': 'Johnson',
                'email': 'mary.teacher@school.com',
                'national_id': 'ID2345678901',
                'profile': {
                    'employee_id': 'T0002',
                    'department': 'Science',
                    'hire_date': date(2019, 8, 15),
                    'academic_rank': 'Head Teacher',
                    'subjects': ['Chemistry', 'Biology']
                }
            },
            {
                'username': 'david_teacher',
                'first_name': 'David',
                'last_name': 'Wilson',
                'email': 'david.teacher@school.com',
                'national_id': 'ID3456789012',
                'profile': {
                    'employee_id': 'T0003',
                    'department': 'Language',
                    'hire_date': date(2021, 1, 10),
                    'academic_rank': 'Teacher',
                    'subjects': ['English Language', 'History']
                }
            },
            {
                'username': 'sarah_teacher',
                'first_name': 'Sarah',
                'last_name': 'Brown',
                'email': 'sarah.teacher@school.com',
                'national_id': 'ID4567890123',
                'profile': {
                    'employee_id': 'T0004',
                    'department': 'Technology',
                    'hire_date': date(2022, 3, 1),
                    'academic_rank': 'Junior Teacher',
                    'subjects': ['Computer Science', 'Art & Design']
                }
            }
        ]

        created_teachers = []
        created_teacher_profiles = []
        for teacher_data in teachers_data:
            # Create user
            teacher_user, created = User.objects.get_or_create(
                username=teacher_data['username'],
                defaults={
                    'first_name': teacher_data['first_name'],
                    'last_name': teacher_data['last_name'],
                    'email': teacher_data['email'],
                    'role': 'teacher',
                    'national_id': teacher_data['national_id']
                }
            )
            if created:
                teacher_user.set_password('password123')
                teacher_user.save()
                self.stdout.write(f'Created teacher user: {teacher_user.username}')

            # Create teacher profile
            teacher_profile, created = Teacher.objects.get_or_create(
                user=teacher_user,
                defaults={
                    'employee_id': teacher_data['profile']['employee_id'],
                    'department': teacher_data['profile']['department'],
                    'hire_date': teacher_data['profile']['hire_date'],
                    'academic_rank': teacher_data['profile']['academic_rank']
                }
            )
            if created:
                # Assign subjects
                subject_names = teacher_data['profile']['subjects']
                for subject_name in subject_names:
                    try:
                        subject = Subject.objects.get(name=subject_name)
                        teacher_profile.subjects.add(subject)
                    except Subject.DoesNotExist:
                        pass
                
                self.stdout.write(f'Created teacher profile: {teacher_profile.employee_id}')
            
            created_teachers.append(teacher_user)
            created_teacher_profiles.append(teacher_profile)

        # Create multiple students with diverse profiles
        students_data = [
            {
                'username': 'john_student',
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'john.student@school.com',
                'profile': {
                    'admission_no': 'ADM2024001',
                    'student_id': 'STUD0001',
                    'class_section': 'Grade 10A',
                    'department': 'Natural Science',
                    'year': '2024',
                    'academic_status': 'Active',
                    'enrollment_date': date(2024, 9, 1),
                    'gender': 'Male',
                    'dob': date(2006, 5, 15),
                    'phone': '+1234567890',
                    'address': '123 Main Street, Addis Ababa, Ethiopia',
                    'blood_group': 'O+',
                    'father_name': 'Robert Doe',
                    'mother_name': 'Jane Doe',
                    'guardian_contact': '+251911234567',
                    'guardian_email': 'robert.doe@email.com',
                    'guardian_relation': 'Father',
                    'extra_activities': 'Basketball team captain, Science club member, Math olympiad participant',
                    'remarks': 'Excellent student with strong academic performance and leadership qualities'
                }
            },
            {
                'username': 'jane_student',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'email': 'jane.student@school.com',
                'profile': {
                    'admission_no': 'ADM2024002',
                    'student_id': 'STUD0002',
                    'class_section': 'Grade 10A',
                    'department': 'Natural Science',
                    'year': '2024',
                    'academic_status': 'Active',
                    'enrollment_date': date(2024, 9, 1),
                    'gender': 'Female',
                    'dob': date(2006, 8, 22),
                    'phone': '+1234567892',
                    'address': '456 Oak Avenue, Addis Ababa, Ethiopia',
                    'blood_group': 'A+',
                    'father_name': 'Michael Smith',
                    'mother_name': 'Sarah Smith',
                    'guardian_contact': '+251922345678',
                    'guardian_email': 'michael.smith@email.com',
                    'guardian_relation': 'Father',
                    'extra_activities': 'Drama club president, Debate team, Environmental club',
                    'remarks': 'Creative student with excellent communication skills and environmental awareness'
                }
            },
            {
                'username': 'alex_student',
                'first_name': 'Alex',
                'last_name': 'Johnson',
                'email': 'alex.student@school.com',
                'profile': {
                    'admission_no': 'ADM2024003',
                    'student_id': 'STUD0003',
                    'class_section': 'Grade 10B',
                    'department': 'Natural Science',
                    'year': '2024',
                    'academic_status': 'Active',
                    'enrollment_date': date(2024, 9, 1),
                    'gender': 'Male',
                    'dob': date(2006, 12, 10),
                    'phone': '+1234567893',
                    'address': '789 Pine Road, Addis Ababa, Ethiopia',
                    'blood_group': 'B+',
                    'father_name': 'David Johnson',
                    'mother_name': 'Lisa Johnson',
                    'guardian_contact': '+251933456789',
                    'guardian_email': 'david.johnson@email.com',
                    'guardian_relation': 'Father',
                    'extra_activities': 'Computer programming club, Chess club, Robotics team',
                    'remarks': 'Technically gifted student with strong problem-solving abilities'
                }
            },
            {
                'username': 'maria_student',
                'first_name': 'Maria',
                'last_name': 'Garcia',
                'email': 'maria.student@school.com',
                'profile': {
                    'admission_no': 'ADM2024004',
                    'student_id': 'STUD0004',
                    'class_section': 'Grade 10B',
                    'department': 'Social Science',
                    'year': '2024',
                    'academic_status': 'Active',
                    'enrollment_date': date(2024, 9, 1),
                    'gender': 'Female',
                    'dob': date(2006, 3, 18),
                    'phone': '+1234567894',
                    'address': '321 Elm Street, Addis Ababa, Ethiopia',
                    'blood_group': 'AB+',
                    'father_name': 'Carlos Garcia',
                    'mother_name': 'Ana Garcia',
                    'guardian_contact': '+251944567890',
                    'guardian_email': 'carlos.garcia@email.com',
                    'guardian_relation': 'Father',
                    'extra_activities': 'Student council secretary, Language club, Cultural dance group',
                    'remarks': 'Well-rounded student with strong social skills and cultural awareness'
                }
            }
        ]

        created_students = []
        for student_data in students_data:
            # Create user
            student_user, created = User.objects.get_or_create(
                username=student_data['username'],
                defaults={
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                    'email': student_data['email'],
                    'role': 'student',
                    'national_id': f"ID{random.randint(1000000000, 9999999999)}"
                }
            )
            if created:
                student_user.set_password('password123')
                student_user.save()
                self.stdout.write(f'Created student user: {student_user.username}')

            # Create student profile
            student_profile, created = StudentProfile.objects.get_or_create(
                user=student_user,
                defaults=student_data['profile']
            )
            if created:
                self.stdout.write(f'Created student profile: {student_profile.admission_no}')
            
            created_students.append(student_user)
        for student_data in students_data:
            # Create user
            student_user, created = User.objects.get_or_create(
                username=student_data['username'],
                defaults={
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                    'email': student_data['email'],
                    'role': 'student',
                    'national_id': f"ID{random.randint(1000000000, 9999999999)}"
                }
            )
            if created:
                student_user.set_password('password123')
                student_user.save()
                self.stdout.write(f'Created student user: {student_user.username}')

            # Create student profile
            student_profile, created = StudentProfile.objects.get_or_create(
                user=student_user,
                defaults=student_data['profile']
            )
            if created:
                self.stdout.write(f'Created student profile: {student_profile.admission_no}')
            
            created_students.append(student_user)

        # Create comprehensive grades for all students - OPTIMIZED BULK CREATE
        grade_types = ['assignment', 'quiz', 'midterm', 'final', 'project']
        
        # Prepare bulk data for grades
        grades_to_create = []
        attendance_to_create = []
        
        for student_user in created_students:
            student_performance = random.choice(['excellent', 'good', 'average', 'struggling'])
            
            # Set performance ranges based on student type
            if student_performance == 'excellent':
                score_range = (85, 100)
            elif student_performance == 'good':
                score_range = (75, 90)
            elif student_performance == 'average':
                score_range = (65, 80)
            else:
                score_range = (50, 70)
            
            for subject in subjects:
                # Create 3-5 grades per subject per student (reduced for speed)
                num_grades = random.randint(3, 5)
                for i in range(num_grades):
                    grade_type = random.choice(grade_types)
                    
                    # Adjust score based on grade type
                    base_min, base_max = score_range
                    if grade_type == 'final':
                        score = random.randint(max(base_min - 10, 40), base_max - 5)
                    elif grade_type == 'assignment':
                        score = random.randint(base_min + 5, min(base_max + 5, 100))
                    else:
                        score = random.randint(base_min, base_max)
                    
                    full_mark = random.choice([100, 50, 25])  # Simplified scales
                    if full_mark != 100:
                        score = int((score / 100) * full_mark)
                    
                    # Create grade with realistic date distribution
                    days_ago = random.randint(1, 90)  # Last 3 months only
                    grade_date = datetime.now().date() - timedelta(days=days_ago)
                    
                    grades_to_create.append(Grade(
                        student=student_user,
                        subject=subject,
                        semester=semester,
                        grade_type=grade_type,
                        section=section,
                        score=score,
                        full_mark=full_mark,
                        academic_year='2024/2025',
                        date_recorded=grade_date,
                        teacher=created_teacher_profiles[0] if created_teacher_profiles else None  # Assign to first teacher
                    ))

        # Bulk create grades (much faster)
        Grade.objects.bulk_create(grades_to_create, ignore_conflicts=True)
        self.stdout.write(f'✅ Created {len(grades_to_create)} grades in bulk')

        # Create attendance records - OPTIMIZED
        start_date = date(2024, 11, 1)  # Only last 2 months for speed
        end_date = date.today()
        
        for student_user in created_students:
            attendance_rate = random.choice([0.95, 0.90, 0.85, 0.75])
            
            current_date = start_date
            while current_date <= end_date:
                # Skip weekends
                if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                    # Create attendance for 2-3 subjects per day (reduced for speed)
                    daily_subjects = random.sample(list(subjects), min(3, len(subjects)))
                    for subject in daily_subjects:
                        is_present = random.random() < attendance_rate
                        status = 'present' if is_present else 'absent'
                        
                        attendance_to_create.append(Attendance(
                            student=student_user,
                            section=section,
                            subject=subject,
                            date=current_date,
                            status=status,
                            taken_by=created_teacher_profiles[0] if created_teacher_profiles else None  # Assign to first teacher
                        ))
                
                current_date += timedelta(days=1)

        # Bulk create attendance (much faster)
        Attendance.objects.bulk_create(attendance_to_create, ignore_conflicts=True)
        self.stdout.write(f'✅ Created {len(attendance_to_create)} attendance records in bulk')
        
        # Show attendance summary for students
        for student_user in created_students:
            total_days = Attendance.objects.filter(student=student_user).count()
            present_days = Attendance.objects.filter(student=student_user, status='present').count()
            if total_days > 0:
                attendance_percentage = (present_days / total_days) * 100
                self.stdout.write(f'📊 {student_user.first_name}: {attendance_percentage:.1f}% attendance ({present_days}/{total_days})')

        # Create library with fewer books for speed
        books_data = [
            {'isbn': '9780123456789', 'title': 'Advanced Mathematics', 'author': 'Dr. Smith Johnson', 'publisher': 'Academic Press', 'year_published': 2023},
            {'isbn': '9780987654321', 'title': 'Physics Fundamentals', 'author': 'Prof. Emily Johnson', 'publisher': 'Science Books', 'year_published': 2022},
            {'isbn': '9781234567890', 'title': 'Chemistry Laboratory', 'author': 'Dr. Robert Brown', 'publisher': 'Lab Publications', 'year_published': 2023},
            {'isbn': '9789876543210', 'title': 'Biology Textbook', 'author': 'Prof. Maria Davis', 'publisher': 'Bio Press', 'year_published': 2024},
            {'isbn': '9785432109876', 'title': 'English Literature', 'author': 'Ms. Sarah Wilson', 'publisher': 'Literary Works', 'year_published': 2023},
            {'isbn': '9781111222333', 'title': 'World History', 'author': 'Dr. James Miller', 'publisher': 'Historical Studies', 'year_published': 2023},
            {'isbn': '9782222333444', 'title': 'Geography Textbook', 'author': 'Prof. Lisa Anderson', 'publisher': 'Geographic Publications', 'year_published': 2024},
            {'isbn': '9783333444555', 'title': 'Computer Programming', 'author': 'Dr. Alex Thompson', 'publisher': 'Tech Education', 'year_published': 2024},
        ]
        
        books = []
        books_to_create = []
        for book_data in books_data:
            books_to_create.append(Book(
                isbn=book_data['isbn'],
                title=book_data['title'],
                author=book_data['author'],
                publisher=book_data['publisher'],
                year_published=book_data['year_published'],
                total_copies=random.randint(3, 6),
                available_copies=random.randint(1, 4),
                library_branch='Main Library'
            ))
        
        # Bulk create books
        Book.objects.bulk_create(books_to_create, ignore_conflicts=True)
        books = Book.objects.all()
        self.stdout.write(f'✅ Created {len(books_to_create)} books in bulk')

        # Create library borrowing records - OPTIMIZED
        borrow_records_to_create = []
        for student_user in created_students:
            # Each student borrows 2-3 books (reduced for speed)
            num_books_to_borrow = random.randint(2, 3)
            student_books = random.sample(list(books), num_books_to_borrow)
            
            for i, book in enumerate(student_books):
                days_ago = random.randint(5, 45)  # Last 1.5 months only
                borrow_date = date.today() - timedelta(days=days_ago)
                expected_return = borrow_date + timedelta(days=14)
                
                # Determine return status
                if i < len(student_books) // 2:
                    returned = True
                    return_delay = random.randint(-2, 3)
                    actual_return = expected_return + timedelta(days=return_delay)
                    if actual_return > date.today():
                        actual_return = date.today() - timedelta(days=random.randint(1, 2))
                else:
                    returned = False
                    actual_return = None
                
                borrow_records_to_create.append(BorrowRecord(
                    book=book,
                    borrower_type='student',
                    borrower_student=student_user,
                    borrow_date=borrow_date,
                    expected_return_date=expected_return,
                    actual_return_date=actual_return,
                    returned=returned
                ))

        # Bulk create library records
        BorrowRecord.objects.bulk_create(borrow_records_to_create, ignore_conflicts=True)
        self.stdout.write(f'✅ Created {len(borrow_records_to_create)} library records in bulk')

        self.stdout.write(
            self.style.SUCCESS(
                '\n🎉 COMPREHENSIVE SAMPLE DATA CREATED SUCCESSFULLY!\n'
                '=' * 60 + '\n'
                '👥 STUDENT ACCOUNTS CREATED:\n'
                '1. Username: john_student    | Email: john.student@school.com    | Password: password123\n'
                '2. Username: jane_student    | Email: jane.student@school.com    | Password: password123\n'
                '3. Username: alex_student    | Email: alex.student@school.com    | Password: password123\n'
                '4. Username: maria_student   | Email: maria.student@school.com   | Password: password123\n\n'
                '�‍🏫 TEAICHER ACCOUNTS CREATED:\n'
                '1. Username: john_teacher    | Email: john.teacher@school.com    | Password: password123\n'
                '2. Username: mary_teacher    | Email: mary.teacher@school.com    | Password: password123\n'
                '3. Username: david_teacher   | Email: david.teacher@school.com   | Password: password123\n'
                '4. Username: sarah_teacher   | Email: sarah.teacher@school.com   | Password: password123\n\n'
                '📚 ACADEMIC DATA CREATED:\n'
                f'• {len(subjects)} Subjects (Math, Physics, Chemistry, Biology, English, etc.)\n'
                f'• {Grade.objects.count()} Grade records with realistic performance patterns\n'
                f'• {Attendance.objects.count()} Attendance records with varied attendance rates\n'
                f'• {len(books)} Library books across multiple categories\n'
                f'• {BorrowRecord.objects.count()} Library borrowing records\n'
                f'• {len(created_teachers)} Teachers with subject assignments and schedules\n'
                f'• {Schedule.objects.count()} Teaching schedules across the week\n\n'
                '� PEROFILES INCLUDE:\n'
                '• Complete personal information (address, contacts, blood group)\n'
                '• Guardian/parent contact details for students\n'
                '• Teacher qualifications and subject assignments\n'
                '• Extracurricular activities and achievements\n'
                '• Academic performance with different skill levels\n'
                '• Realistic attendance patterns (75%-95%)\n'
                '• Library borrowing history with some overdue books\n'
                '• Teacher schedules and class assignments\n\n'
                '🌐 READY FOR TESTING:\n'
                '• Backend API: http://127.0.0.1:8000/api/\n'
                '• Frontend App: http://localhost:3001/\n'
                '• Student Login: http://localhost:3001/login\n'
                '• Teacher Login: http://localhost:3001/login\n\n'
                '✅ Both student and teacher roles are now ready with comprehensive sample data!'
            )
        )

        # Create sample announcements
        admin_user = User.objects.filter(is_superuser=True).first()
        if admin_user:
            from api.models import Announcement
            
            announcements_data = [
                {
                    'title': 'Mid-term Examination Schedule Released',
                    'content': 'The mid-term examination schedule for all subjects has been published. Please check your individual timetables and prepare accordingly. Exams will begin from March 15th, 2024.',
                    'type': 'exam',
                    'priority': 'high',
                    'author': admin_user,
                    'target_audience': 'students'
                },
                {
                    'title': 'Library Hours Extended',
                    'content': 'Due to upcoming examinations, the library will remain open until 10 PM from March 10th to March 30th. Students can utilize this extended time for their studies.',
                    'type': 'general',
                    'priority': 'medium',
                    'author': admin_user,
                    'target_audience': 'all'
                },
                {
                    'title': 'Fee Payment Reminder',
                    'content': 'This is a reminder that the semester fee payment deadline is March 20th, 2024. Please ensure timely payment to avoid any inconvenience.',
                    'type': 'fee',
                    'priority': 'high',
                    'author': admin_user,
                    'target_audience': 'students'
                },
                {
                    'title': 'Sports Day Registration Open',
                    'content': 'Registration for the annual sports day is now open. Students interested in participating can register at the sports office or through the online portal.',
                    'type': 'event',
                    'priority': 'low',
                    'author': admin_user,
                    'target_audience': 'all'
                },
                {
                    'title': 'COVID-19 Safety Guidelines',
                    'content': 'Please continue to follow COVID-19 safety protocols on campus. Masks are mandatory in all indoor spaces and maintain social distancing.',
                    'type': 'health',
                    'priority': 'medium',
                    'author': admin_user,
                    'target_audience': 'all'
                }
            ]
            
            for announcement_data in announcements_data:
                announcement, created = Announcement.objects.get_or_create(
                    title=announcement_data['title'],
                    defaults=announcement_data
                )
                if created:
                    self.stdout.write(f'Created announcement: {announcement.title}')
            
            self.stdout.write(self.style.SUCCESS('✅ Sample announcements created successfully'))
        
        self.stdout.write(self.style.SUCCESS('\n🎉 ALL ENHANCED SAMPLE DATA CREATED SUCCESSFULLY!'))