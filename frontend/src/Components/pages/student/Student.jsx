// src/Components/pages/student/Student.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import StudentProfile from './StudentProfile';
import StudentGrades from './StudentGrades';
import StudentAttendance from './StudentAttendance';
import StudentLibrary from './StudentLibrary';
import StudentCourses from './StudentCourses';
import StudentReports from './StudentReports';
import StudentGPACalculator from './StudentGPACalculator';
import StudentAttendanceCalendar from './StudentAttendanceCalendar';
import StudentAnnouncements from './StudentAnnouncements';

const Student = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/profile" element={<StudentProfile />} />
      <Route path="/grades" element={<StudentGrades />} />
      <Route path="/gpa-calculator" element={<StudentGPACalculator />} />
      <Route path="/attendance" element={<StudentAttendance />} />
      <Route path="/attendance-calendar" element={<StudentAttendanceCalendar />} />
      <Route path="/library" element={<StudentLibrary />} />
      <Route path="/courses" element={<StudentCourses />} />
      <Route path="/reports" element={<StudentReports />} />
      <Route path="/announcements" element={<StudentAnnouncements />} />
    </Routes>
  );
};

export default Student;
