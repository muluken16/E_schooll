import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { TeacherProvider } from '../../contexts/TeacherContext';
import TeacherNavigation from './TeacherNavigation';
import TeacherDashboard from './TeacherDashboard';
import TeacherClasses from './TeacherClasses';
import TeacherStudents from './TeacherStudents';
import TeacherGrades from './TeacherGrades';
import TeacherAttendance from './TeacherAttendance';
import TeacherSchedule from './TeacherSchedule';
import TeacherReports from './TeacherReports';
import TeacherProfile from './TeacherProfile';

const TeacherMain = () => {
  return (
    <TeacherProvider>
      <Routes>
        <Route path="/" element={<TeacherNavigation />} />
        <Route path="/dashboard" element={<TeacherDashboard />} />
        <Route path="/classes" element={<TeacherClasses />} />
        <Route path="/students" element={<TeacherStudents />} />
        <Route path="/grades" element={<TeacherGrades />} />
        <Route path="/attendance" element={<TeacherAttendance />} />
        <Route path="/schedule" element={<TeacherSchedule />} />
        <Route path="/reports" element={<TeacherReports />} />
        <Route path="/profile" element={<TeacherProfile />} />
      </Routes>
    </TeacherProvider>
  );
};

export default TeacherMain;