// Teacher Components Export
export { default as TeacherMain } from './TeacherMain';
export { default as TeacherNavigation } from './TeacherNavigation';
export { default as TeacherDashboard } from './TeacherDashboard';
export { default as TeacherClasses } from './TeacherClasses';
export { default as TeacherStudents } from './TeacherStudents';
export { default as TeacherGrades } from './TeacherGrades';
export { default as TeacherAttendance } from './TeacherAttendance';
export { default as TeacherSchedule } from './TeacherSchedule';
export { default as TeacherReports } from './TeacherReports';
export { default as TeacherProfile } from './TeacherProfile';
export { default as TeacherLayout } from './TeacherLayout';
export { default as TeacherQuickActions } from './TeacherQuickActions';

// Teacher Context and Services
export { TeacherProvider, useTeacher } from '../../contexts/TeacherContext';
export { default as teacherApi } from '../../services/teacherApi';