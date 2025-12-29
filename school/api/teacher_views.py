"""
Teacher Role Views - Complete Implementation
Handles all teacher-specific functionality including:
- Authentication and profile management
- Class and subject management
- Attendance recording
- Grade entry and management
- Student performance monitoring
- Reports and analytics
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import status, viewsets
from rest_framework.decorators import action
from django.db import models
from django.contrib.auth import get_user_model
from datetime import datetime, date, timedelta
from collections import defaultdict

from .models import Teacher, Subject, Grade, Attendance, Section, Schedule, User, StudentProfile
from .serializers import TeacherSerializer, TeacherGradeSerializer, TeacherAttendanceSerializer

User = get_user_model()


class IsTeacherOwner(BasePermission):
    """Teachers can only access their own data and assigned classes"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'teacher'
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'teacher':
            # Check if teacher has access to this object
            if hasattr(obj, 'teacher'):
                return obj.teacher.user == request.user
            elif hasattr(obj, 'subject'):
                # Check if teacher teaches this subject
                try:
                    teacher = Teacher.objects.get(user=request.user)
                    return obj.subject in teacher.subjects.all()
                except Teacher.DoesNotExist:
                    return False
        return True


class TeacherSelfViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Complete Teacher Self-Service ViewSet
    Provides all functionality for teachers to manage their classes
    """
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated, IsTeacherOwner]
    
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
        """Get subjects assigned to current teacher with statistics"""
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
                
                # Get statistics
                total_students = Grade.objects.filter(
                    subject=subject,
                    teacher=teacher
                ).values('student').distinct().count()
                
                avg_grade = Grade.objects.filter(
                    subject=subject,
                    teacher=teacher
                ).aggregate(avg=models.Avg('score'))['avg'] or 0
                
                # Get recent attendance rate
                total_attendance = Attendance.objects.filter(
                    subject=subject,
                    taken_by=teacher
                ).count()
                
                present_attendance = Attendance.objects.filter(
                    subject=subject,
                    taken_by=teacher,
                    status='present'
                ).count()
                
                attendance_rate = (present_attendance / total_attendance * 100) if total_attendance > 0 else 0
                
                subjects_data.append({
                    "id": subject.id,
                    "name": subject.name,
                    "code": subject.code,
                    "credit_hours": subject.credit_hours,
                    "department": subject.department,
                    "level": subject.level,
                    "total_students": total_students,
                    "average_grade": round(avg_grade, 2),
                    "attendance_rate": round(attendance_rate, 1),
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
        """Get classes/sections assigned to current teacher"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            # Get all sections where teacher is involved
            section_ids = set()
            
            # Get sections where teacher is advisor
            advised_sections = Section.objects.filter(advisor=request.user)
            section_ids.update(advised_sections.values_list('id', flat=True))
            
            # Get sections where teacher is name_caller
            name_caller_sections = Section.objects.filter(name_caller=teacher)
            section_ids.update(name_caller_sections.values_list('id', flat=True))
            
            # Get sections from schedules
            scheduled_sections = Section.objects.filter(schedule__teacher=request.user)
            section_ids.update(scheduled_sections.values_list('id', flat=True))
            
            # Get all unique sections
            all_sections = Section.objects.filter(id__in=section_ids)
            
            sections_data = []
            for section in all_sections:
                # Get student count for this section
                student_count = User.objects.filter(
                    role='student',
                    studentprofile__class_section__icontains=section.class_group.name
                ).count()
                
                # Get subjects taught in this section
                subjects_in_section = Schedule.objects.filter(
                    section=section,
                    teacher=request.user
                ).values_list('subject__name', flat=True)
                
                sections_data.append({
                    "id": section.id,
                    "name": f"{section.class_group.name} - Section {section.name}",
                    "class_group": section.class_group.name,
                    "section": section.name,
                    "level": section.class_group.level,
                    "program": section.class_group.academic_program,
                    "student_count": student_count,
                    "is_advisor": section.advisor == request.user,
                    "is_name_caller": section.name_caller == teacher,
                    "subjects_taught": list(subjects_in_section)
                })
            
            return Response(sections_data)
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_schedule(self, request):
        """Get current teacher's teaching schedule"""
        try:
            schedules = Schedule.objects.filter(teacher=request.user).order_by('day_of_week', 'start_time')
            
            # Group by day of week
            schedule_by_day = defaultdict(list)
            
            for schedule in schedules:
                schedule_by_day[schedule.day_of_week].append({
                    "id": schedule.id,
                    "subject": schedule.subject.name,
                    "subject_code": schedule.subject.code,
                    "section": f"{schedule.section.class_group.name} - {schedule.section.name}",
                    "room": schedule.room.name if schedule.room else "TBA",
                    "start_time": schedule.start_time.strftime('%H:%M'),
                    "end_time": schedule.end_time.strftime('%H:%M'),
                    "duration": str(datetime.combine(date.today(), schedule.end_time) - 
                                  datetime.combine(date.today(), schedule.start_time))
                })
            
            return Response(dict(schedule_by_day))
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    @action(detail=False, methods=['get', 'post'])
    def attendance_management(self, request):
        """
        Complete attendance management system for teachers
        GET: Retrieve attendance records with filtering
        POST: Mark attendance for students
        """
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            if request.method == 'GET':
                # Get attendance records for teacher's subjects
                date_from = request.query_params.get('date_from')
                date_to = request.query_params.get('date_to')
                subject_id = request.query_params.get('subject')
                section_id = request.query_params.get('section')
                status_filter = request.query_params.get('status')
                
                # Filter attendance records
                attendance = Attendance.objects.filter(
                    taken_by=teacher
                ).select_related('student', 'subject', 'section')
                
                if date_from:
                    attendance = attendance.filter(date__gte=date_from)
                if date_to:
                    attendance = attendance.filter(date__lte=date_to)
                if subject_id:
                    attendance = attendance.filter(subject_id=subject_id)
                if section_id:
                    attendance = attendance.filter(section_id=section_id)
                if status_filter:
                    attendance = attendance.filter(status=status_filter)
                
                attendance = attendance.order_by('-date', 'student__first_name')
                
                # Calculate summary statistics before slicing
                total_records = attendance.count()
                present_count = attendance.filter(status='present').count()
                absent_count = attendance.filter(status='absent').count()
                attendance_rate = (present_count / total_records * 100) if total_records > 0 else 0
                
                # Now slice for the response
                attendance = attendance[:200]
                
                return Response({
                    "attendance_records": TeacherAttendanceSerializer(attendance, many=True).data,
                    "summary": {
                        "total_records": total_records,
                        "present_count": present_count,
                        "absent_count": absent_count,
                        "attendance_rate": round(attendance_rate, 1)
                    }
                })
            
            elif request.method == 'POST':
                # Mark attendance (can be single record or bulk)
                if isinstance(request.data, list):
                    # Bulk attendance marking
                    created_records = []
                    errors = []
                    
                    for attendance_data in request.data:
                        serializer = TeacherAttendanceSerializer(
                            data=attendance_data, 
                            context={'request': request}
                        )
                        if serializer.is_valid():
                            record = serializer.save()
                            created_records.append(serializer.data)
                        else:
                            errors.append({
                                "data": attendance_data,
                                "errors": serializer.errors
                            })
                    
                    return Response({
                        "created": len(created_records),
                        "errors": len(errors),
                        "records": created_records,
                        "error_details": errors
                    }, status=201 if created_records else 400)
                
                else:
                    # Single attendance record
                    serializer = TeacherAttendanceSerializer(
                        data=request.data, 
                        context={'request': request}
                    )
                    if serializer.is_valid():
                        serializer.save()
                        return Response(serializer.data, status=201)
                    return Response(serializer.errors, status=400)
                    
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get', 'post', 'put'])
    def grade_management(self, request):
        """
        Complete grade management system for teachers
        GET: Retrieve grades with filtering
        POST: Enter new grades
        PUT: Update existing grades
        """
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            if request.method == 'GET':
                # Get grades for teacher's subjects
                semester = request.query_params.get('semester')
                subject_id = request.query_params.get('subject')
                section_id = request.query_params.get('section')
                grade_type = request.query_params.get('grade_type')
                student_id = request.query_params.get('student')
                
                # Filter grades
                grades = Grade.objects.filter(
                    teacher=teacher
                ).select_related('student', 'subject', 'section', 'semester')
                
                if semester:
                    grades = grades.filter(semester_id=semester)
                if subject_id:
                    grades = grades.filter(subject_id=subject_id)
                if section_id:
                    grades = grades.filter(section_id=section_id)
                if grade_type:
                    grades = grades.filter(grade_type=grade_type)
                if student_id:
                    grades = grades.filter(student_id=student_id)
                
                grades = grades.order_by('-date_recorded')
                
                # Calculate statistics before slicing
                total_grades = grades.count()
                avg_score = grades.aggregate(avg=models.Avg('score'))['avg'] or 0
                
                # Grade distribution - calculate before slicing
                grade_distribution = {
                    'A': grades.filter(score__gte=90).count(),
                    'B': grades.filter(score__gte=80, score__lt=90).count(),
                    'C': grades.filter(score__gte=70, score__lt=80).count(),
                    'D': grades.filter(score__gte=60, score__lt=70).count(),
                    'F': grades.filter(score__lt=60).count()
                }
                
                # Now slice for the response
                grades = grades[:200]
                
                return Response({
                    "grades": TeacherGradeSerializer(grades, many=True).data,
                    "statistics": {
                        "total_grades": total_grades,
                        "average_score": round(avg_score, 2),
                        "grade_distribution": grade_distribution
                    }
                })
            
            elif request.method == 'POST':
                # Enter new grades (can be single or bulk)
                if isinstance(request.data, list):
                    # Bulk grade entry
                    created_grades = []
                    errors = []
                    
                    for grade_data in request.data:
                        serializer = TeacherGradeSerializer(
                            data=grade_data, 
                            context={'request': request}
                        )
                        if serializer.is_valid():
                            grade = serializer.save()
                            created_grades.append(serializer.data)
                        else:
                            errors.append({
                                "data": grade_data,
                                "errors": serializer.errors
                            })
                    
                    return Response({
                        "created": len(created_grades),
                        "errors": len(errors),
                        "grades": created_grades,
                        "error_details": errors
                    }, status=201 if created_grades else 400)
                
                else:
                    # Single grade entry
                    serializer = TeacherGradeSerializer(
                        data=request.data, 
                        context={'request': request}
                    )
                    if serializer.is_valid():
                        serializer.save()
                        return Response(serializer.data, status=201)
                    return Response(serializer.errors, status=400)
            
            elif request.method == 'PUT':
                # Update existing grade
                grade_id = request.data.get('id')
                if not grade_id:
                    return Response({"error": "Grade ID is required for updates"}, status=400)
                
                try:
                    grade = Grade.objects.get(id=grade_id, teacher=teacher)
                    serializer = TeacherGradeSerializer(
                        grade, 
                        data=request.data, 
                        partial=True,
                        context={'request': request}
                    )
                    if serializer.is_valid():
                        serializer.save()
                        return Response(serializer.data)
                    return Response(serializer.errors, status=400)
                except Grade.DoesNotExist:
                    return Response({"error": "Grade not found or not authorized"}, status=404)
                    
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def my_students(self, request):
        """Get detailed information about students in teacher's classes"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            subject_id = request.query_params.get('subject')
            section_id = request.query_params.get('section')
            
            # Get students based on filters
            students_query = User.objects.filter(role='student')
            
            if subject_id and section_id:
                # Get students from specific subject and section
                students_query = students_query.filter(
                    grade__subject_id=subject_id,
                    grade__section_id=section_id,
                    grade__teacher=teacher
                ).distinct()
            elif subject_id:
                # Get students from specific subject
                students_query = students_query.filter(
                    grade__subject_id=subject_id,
                    grade__teacher=teacher
                ).distinct()
            else:
                # Get all students taught by this teacher
                students_query = students_query.filter(
                    grade__teacher=teacher
                ).distinct()
            
            students_data = []
            # Convert to list to avoid query slicing issues
            students_list = list(students_query[:100])
            
            for student in students_list:  # Limit to 100 students
                # Get student profile
                try:
                    profile = student.studentprofile
                except:
                    continue
                
                # Get performance in teacher's subjects
                grades = Grade.objects.filter(
                    student=student,
                    teacher=teacher
                )
                
                attendance = Attendance.objects.filter(
                    student=student,
                    taken_by=teacher
                )
                
                # Calculate statistics
                avg_grade = grades.aggregate(avg=models.Avg('score'))['avg'] or 0
                total_attendance = attendance.count()
                present_count = attendance.filter(status='present').count()
                attendance_rate = (present_count / total_attendance * 100) if total_attendance > 0 else 0
                
                # Get recent grades
                recent_grades = grades.order_by('-date_recorded')[:5]
                
                # Get subjects taught to this student
                subjects_taught = grades.values_list('subject__name', flat=True).distinct()
                
                students_data.append({
                    "student_id": student.id,
                    "student_name": student.get_full_name(),
                    "admission_no": profile.admission_no,
                    "student_id_number": profile.student_id,
                    "class_section": profile.class_section,
                    "email": student.email,
                    "academic_performance": {
                        "average_grade": round(avg_grade, 2),
                        "total_assessments": grades.count(),
                        "subjects_taught": list(subjects_taught),
                        "recent_grades": [
                            {
                                "subject": grade.subject.name,
                                "score": float(grade.score),
                                "full_mark": float(grade.full_mark),
                                "percentage": round((float(grade.score) / float(grade.full_mark)) * 100, 1),
                                "grade_type": grade.grade_type,
                                "date": grade.date_recorded.strftime('%Y-%m-%d')
                            } for grade in recent_grades
                        ]
                    },
                    "attendance_summary": {
                        "attendance_rate": round(attendance_rate, 1),
                        "total_days": total_attendance,
                        "present_days": present_count,
                        "absent_days": total_attendance - present_count
                    }
                })
            
            return Response({
                "students": students_data,
                "total_students": len(students_data),
                "filters_applied": {
                    "subject_id": subject_id,
                    "section_id": section_id
                }
            })
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get comprehensive dashboard data for teacher"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            
            # Get basic statistics
            total_subjects = teacher.subjects.count()
            total_students = Grade.objects.filter(teacher=teacher).values('student').distinct().count()
            
            # Get today's schedule
            today = date.today()
            today_schedule = Schedule.objects.filter(
                teacher=request.user,
                day_of_week=today.strftime('%A')
            ).order_by('start_time')
            
            schedule_today = []
            for schedule in today_schedule:
                schedule_today.append({
                    "subject": schedule.subject.name,
                    "section": f"{schedule.section.class_group.name} - {schedule.section.name}",
                    "room": schedule.room.name if schedule.room else "TBA",
                    "time": f"{schedule.start_time.strftime('%H:%M')} - {schedule.end_time.strftime('%H:%M')}"
                })
            
            # Get recent activity
            recent_grades = Grade.objects.filter(
                teacher=teacher,
                date_recorded__gte=today - timedelta(days=7)
            ).count()
            
            recent_attendance = Attendance.objects.filter(
                taken_by=teacher,
                date__gte=today - timedelta(days=7)
            ).count()
            
            # Get pending tasks (example: classes without recent attendance)
            pending_attendance = Schedule.objects.filter(
                teacher=request.user
            ).exclude(
                section__attendance__taken_by=teacher,
                section__attendance__date=today
            ).count()
            
            # Get performance overview
            avg_class_performance = Grade.objects.filter(
                teacher=teacher,
                date_recorded__gte=today - timedelta(days=30)
            ).aggregate(avg=models.Avg('score'))['avg'] or 0
            
            return Response({
                "teacher_info": {
                    "name": teacher.user.get_full_name(),
                    "employee_id": teacher.employee_id,
                    "department": teacher.department,
                    "academic_rank": teacher.academic_rank
                },
                "statistics": {
                    "total_subjects": total_subjects,
                    "total_students": total_students,
                    "recent_grades_entered": recent_grades,
                    "recent_attendance_taken": recent_attendance,
                    "pending_attendance": pending_attendance,
                    "avg_class_performance": round(avg_class_performance, 2)
                },
                "today_schedule": schedule_today,
                "quick_actions": [
                    {"name": "Mark Attendance", "url": "/teacher/attendance", "icon": "calendar"},
                    {"name": "Enter Grades", "url": "/teacher/grades", "icon": "edit"},
                    {"name": "View Students", "url": "/teacher/students", "icon": "users"},
                    {"name": "Generate Reports", "url": "/teacher/reports", "icon": "chart"}
                ],
                "recent_activity": {
                    "grades_this_week": recent_grades,
                    "attendance_this_week": recent_attendance
                }
            })
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    @action(detail=False, methods=['get'])
    def reports(self, request):
        """Generate comprehensive reports for teacher"""
        try:
            teacher = Teacher.objects.get(user=request.user)
            report_type = request.query_params.get('type', 'summary')
            subject_id = request.query_params.get('subject')
            section_id = request.query_params.get('section')
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            
            if report_type == 'attendance':
                # Detailed attendance report
                attendance_data = Attendance.objects.filter(taken_by=teacher)
                
                if subject_id:
                    attendance_data = attendance_data.filter(subject_id=subject_id)
                if section_id:
                    attendance_data = attendance_data.filter(section_id=section_id)
                if date_from:
                    attendance_data = attendance_data.filter(date__gte=date_from)
                if date_to:
                    attendance_data = attendance_data.filter(date__lte=date_to)
                
                # Group by student
                student_attendance = defaultdict(lambda: {'present': 0, 'absent': 0, 'total': 0})
                
                for record in attendance_data:
                    student_name = record.student.get_full_name()
                    student_attendance[student_name]['total'] += 1
                    if record.status == 'present':
                        student_attendance[student_name]['present'] += 1
                    else:
                        student_attendance[student_name]['absent'] += 1
                
                report_data = []
                for student, stats in student_attendance.items():
                    attendance_rate = (stats['present'] / stats['total'] * 100) if stats['total'] > 0 else 0
                    report_data.append({
                        'student': student,
                        'present_days': stats['present'],
                        'absent_days': stats['absent'],
                        'total_days': stats['total'],
                        'attendance_rate': round(attendance_rate, 1)
                    })
                
                # Sort by attendance rate (lowest first for attention)
                report_data.sort(key=lambda x: x['attendance_rate'])
                
                return Response({
                    'report_type': 'attendance',
                    'data': report_data,
                    'summary': {
                        'total_students': len(report_data),
                        'avg_attendance_rate': round(sum(r['attendance_rate'] for r in report_data) / len(report_data), 1) if report_data else 0,
                        'students_below_75': len([r for r in report_data if r['attendance_rate'] < 75])
                    }
                })
            
            elif report_type == 'grades':
                # Detailed grade report
                grades_data = Grade.objects.filter(teacher=teacher)
                
                if subject_id:
                    grades_data = grades_data.filter(subject_id=subject_id)
                if section_id:
                    grades_data = grades_data.filter(section_id=section_id)
                if date_from:
                    grades_data = grades_data.filter(date_recorded__gte=date_from)
                if date_to:
                    grades_data = grades_data.filter(date_recorded__lte=date_to)
                
                # Group by student
                student_grades = defaultdict(list)
                
                for grade in grades_data:
                    student_name = grade.student.get_full_name()
                    student_grades[student_name].append({
                        'subject': grade.subject.name,
                        'grade_type': grade.grade_type,
                        'score': float(grade.score),
                        'full_mark': float(grade.full_mark),
                        'percentage': round((float(grade.score) / float(grade.full_mark)) * 100, 1),
                        'date': grade.date_recorded.strftime('%Y-%m-%d')
                    })
                
                report_data = []
                for student, grades in student_grades.items():
                    avg_percentage = sum(g['percentage'] for g in grades) / len(grades) if grades else 0
                    report_data.append({
                        'student': student,
                        'grades': grades,
                        'average_percentage': round(avg_percentage, 1),
                        'total_assessments': len(grades),
                        'highest_score': max(g['percentage'] for g in grades) if grades else 0,
                        'lowest_score': min(g['percentage'] for g in grades) if grades else 0
                    })
                
                # Sort by average percentage (lowest first for attention)
                report_data.sort(key=lambda x: x['average_percentage'])
                
                return Response({
                    'report_type': 'grades',
                    'data': report_data,
                    'summary': {
                        'total_students': len(report_data),
                        'class_average': round(sum(r['average_percentage'] for r in report_data) / len(report_data), 1) if report_data else 0,
                        'students_below_60': len([r for r in report_data if r['average_percentage'] < 60]),
                        'students_above_90': len([r for r in report_data if r['average_percentage'] >= 90])
                    }
                })
            
            elif report_type == 'performance':
                # Combined performance report
                students = User.objects.filter(
                    role='student',
                    grade__teacher=teacher
                ).distinct()
                
                performance_data = []
                for student in students:
                    grades = Grade.objects.filter(student=student, teacher=teacher)
                    attendance = Attendance.objects.filter(student=student, taken_by=teacher)
                    
                    avg_grade = grades.aggregate(avg=models.Avg('score'))['avg'] or 0
                    total_attendance = attendance.count()
                    present_count = attendance.filter(status='present').count()
                    attendance_rate = (present_count / total_attendance * 100) if total_attendance > 0 else 0
                    
                    performance_data.append({
                        'student': student.get_full_name(),
                        'average_grade': round(avg_grade, 2),
                        'attendance_rate': round(attendance_rate, 1),
                        'total_assessments': grades.count(),
                        'performance_status': self._get_performance_status(avg_grade, attendance_rate)
                    })
                
                return Response({
                    'report_type': 'performance',
                    'data': performance_data,
                    'summary': {
                        'total_students': len(performance_data),
                        'excellent_performers': len([p for p in performance_data if p['performance_status'] == 'Excellent']),
                        'at_risk_students': len([p for p in performance_data if p['performance_status'] == 'At Risk'])
                    }
                })
            
            else:
                # Summary report
                return Response({
                    'report_type': 'summary',
                    'subjects_taught': teacher.subjects.count(),
                    'total_students': Grade.objects.filter(teacher=teacher).values('student').distinct().count(),
                    'total_grades_entered': Grade.objects.filter(teacher=teacher).count(),
                    'total_attendance_records': Attendance.objects.filter(taken_by=teacher).count(),
                    'recent_activity': {
                        'grades_this_month': Grade.objects.filter(
                            teacher=teacher,
                            date_recorded__gte=date.today() - timedelta(days=30)
                        ).count(),
                        'attendance_this_month': Attendance.objects.filter(
                            taken_by=teacher,
                            date__gte=date.today() - timedelta(days=30)
                        ).count()
                    }
                })
                
        except Teacher.DoesNotExist:
            return Response({"error": "Teacher profile not found"}, status=404)
    
    def _get_performance_status(self, avg_grade, attendance_rate):
        """Helper method to determine student performance status"""
        if avg_grade >= 85 and attendance_rate >= 90:
            return "Excellent"
        elif avg_grade >= 70 and attendance_rate >= 80:
            return "Good"
        elif avg_grade >= 60 and attendance_rate >= 70:
            return "Satisfactory"
        elif avg_grade >= 50 and attendance_rate >= 60:
            return "Needs Improvement"
        else:
            return "At Risk"


# Additional utility views for teacher functionality
class TeacherUtilityViewSet(viewsets.ViewSet):
    """Utility endpoints for teacher functionality"""
    permission_classes = [IsAuthenticated, IsTeacherOwner]
    
    @action(detail=False, methods=['get'])
    def available_subjects(self, request):
        """Get all subjects available for assignment"""
        subjects = Subject.objects.all().order_by('name')
        return Response([
            {
                "id": subject.id,
                "name": subject.name,
                "code": subject.code,
                "department": subject.department,
                "level": subject.level
            } for subject in subjects
        ])
    
    @action(detail=False, methods=['get'])
    def available_sections(self, request):
        """Get all sections available for teaching"""
        sections = Section.objects.all().order_by('class_group__name', 'name')
        return Response([
            {
                "id": section.id,
                "name": f"{section.class_group.name} - Section {section.name}",
                "class_group": section.class_group.name,
                "level": section.class_group.level,
                "program": section.class_group.academic_program
            } for section in sections
        ])
    
    @action(detail=False, methods=['get'])
    def grade_types(self, request):
        """Get available grade types"""
        return Response([
            {"value": "assignment", "label": "Assignment"},
            {"value": "quiz", "label": "Quiz"},
            {"value": "midterm", "label": "Midterm Exam"},
            {"value": "final", "label": "Final Exam"},
            {"value": "project", "label": "Project"}
        ])