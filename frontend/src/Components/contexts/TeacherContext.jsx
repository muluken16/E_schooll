import React, { createContext, useContext, useReducer, useEffect } from 'react';
import teacherApi from '../services/teacherApi';

// Initial state
const initialState = {
  // Profile data
  profile: null,
  subjects: [],
  classes: [],
  schedule: [],
  
  // Students data
  students: [],
  studentsLoading: false,
  studentsError: null,
  
  // Attendance data
  attendance: [],
  attendanceLoading: false,
  attendanceError: null,
  attendanceSummary: {},
  
  // Grades data
  grades: [],
  gradesLoading: false,
  gradesError: null,
  gradesStatistics: {},
  
  // Dashboard data
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,
  
  // Reports data
  reports: null,
  reportsLoading: false,
  reportsError: null,
  
  // UI state
  loading: false,
  error: null,
  
  // Filters
  filters: {
    selectedSubject: '',
    selectedSection: '',
    selectedDate: new Date().toISOString().split('T')[0],
    selectedGradeType: '',
    selectedStudent: '',
    dateFrom: '',
    dateTo: '',
    reportType: 'summary'
  }
};

// Action types
const ActionTypes = {
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Profile actions
  SET_PROFILE: 'SET_PROFILE',
  SET_SUBJECTS: 'SET_SUBJECTS',
  SET_CLASSES: 'SET_CLASSES',
  SET_SCHEDULE: 'SET_SCHEDULE',
  
  // Students actions
  SET_STUDENTS_LOADING: 'SET_STUDENTS_LOADING',
  SET_STUDENTS: 'SET_STUDENTS',
  SET_STUDENTS_ERROR: 'SET_STUDENTS_ERROR',
  
  // Attendance actions
  SET_ATTENDANCE_LOADING: 'SET_ATTENDANCE_LOADING',
  SET_ATTENDANCE: 'SET_ATTENDANCE',
  SET_ATTENDANCE_ERROR: 'SET_ATTENDANCE_ERROR',
  SET_ATTENDANCE_SUMMARY: 'SET_ATTENDANCE_SUMMARY',
  ADD_ATTENDANCE_RECORD: 'ADD_ATTENDANCE_RECORD',
  
  // Grades actions
  SET_GRADES_LOADING: 'SET_GRADES_LOADING',
  SET_GRADES: 'SET_GRADES',
  SET_GRADES_ERROR: 'SET_GRADES_ERROR',
  SET_GRADES_STATISTICS: 'SET_GRADES_STATISTICS',
  ADD_GRADE_RECORD: 'ADD_GRADE_RECORD',
  UPDATE_GRADE_RECORD: 'UPDATE_GRADE_RECORD',
  
  // Dashboard actions
  SET_DASHBOARD_LOADING: 'SET_DASHBOARD_LOADING',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_DASHBOARD_ERROR: 'SET_DASHBOARD_ERROR',
  
  // Reports actions
  SET_REPORTS_LOADING: 'SET_REPORTS_LOADING',
  SET_REPORTS: 'SET_REPORTS',
  SET_REPORTS_ERROR: 'SET_REPORTS_ERROR',
  
  // Filter actions
  SET_FILTER: 'SET_FILTER',
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS'
};

// Reducer function
function teacherReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    // Profile cases
    case ActionTypes.SET_PROFILE:
      return { ...state, profile: action.payload };
    
    case ActionTypes.SET_SUBJECTS:
      return { ...state, subjects: action.payload };
    
    case ActionTypes.SET_CLASSES:
      return { ...state, classes: action.payload };
    
    case ActionTypes.SET_SCHEDULE:
      return { ...state, schedule: action.payload };
    
    // Students cases
    case ActionTypes.SET_STUDENTS_LOADING:
      return { ...state, studentsLoading: action.payload };
    
    case ActionTypes.SET_STUDENTS:
      return { 
        ...state, 
        students: action.payload, 
        studentsLoading: false, 
        studentsError: null 
      };
    
    case ActionTypes.SET_STUDENTS_ERROR:
      return { 
        ...state, 
        studentsError: action.payload, 
        studentsLoading: false 
      };
    
    // Attendance cases
    case ActionTypes.SET_ATTENDANCE_LOADING:
      return { ...state, attendanceLoading: action.payload };
    
    case ActionTypes.SET_ATTENDANCE:
      return { 
        ...state, 
        attendance: action.payload, 
        attendanceLoading: false, 
        attendanceError: null 
      };
    
    case ActionTypes.SET_ATTENDANCE_ERROR:
      return { 
        ...state, 
        attendanceError: action.payload, 
        attendanceLoading: false 
      };
    
    case ActionTypes.SET_ATTENDANCE_SUMMARY:
      return { ...state, attendanceSummary: action.payload };
    
    case ActionTypes.ADD_ATTENDANCE_RECORD:
      return { 
        ...state, 
        attendance: [...state.attendance, action.payload] 
      };
    
    // Grades cases
    case ActionTypes.SET_GRADES_LOADING:
      return { ...state, gradesLoading: action.payload };
    
    case ActionTypes.SET_GRADES:
      return { 
        ...state, 
        grades: action.payload, 
        gradesLoading: false, 
        gradesError: null 
      };
    
    case ActionTypes.SET_GRADES_ERROR:
      return { 
        ...state, 
        gradesError: action.payload, 
        gradesLoading: false 
      };
    
    case ActionTypes.SET_GRADES_STATISTICS:
      return { ...state, gradesStatistics: action.payload };
    
    case ActionTypes.ADD_GRADE_RECORD:
      return { 
        ...state, 
        grades: [...state.grades, action.payload] 
      };
    
    case ActionTypes.UPDATE_GRADE_RECORD:
      return { 
        ...state, 
        grades: state.grades.map(grade => 
          grade.id === action.payload.id ? action.payload : grade
        ) 
      };
    
    // Dashboard cases
    case ActionTypes.SET_DASHBOARD_LOADING:
      return { ...state, dashboardLoading: action.payload };
    
    case ActionTypes.SET_DASHBOARD_DATA:
      return { 
        ...state, 
        dashboardData: action.payload, 
        dashboardLoading: false, 
        dashboardError: null 
      };
    
    case ActionTypes.SET_DASHBOARD_ERROR:
      return { 
        ...state, 
        dashboardError: action.payload, 
        dashboardLoading: false 
      };
    
    // Reports cases
    case ActionTypes.SET_REPORTS_LOADING:
      return { ...state, reportsLoading: action.payload };
    
    case ActionTypes.SET_REPORTS:
      return { 
        ...state, 
        reports: action.payload, 
        reportsLoading: false, 
        reportsError: null 
      };
    
    case ActionTypes.SET_REPORTS_ERROR:
      return { 
        ...state, 
        reportsError: action.payload, 
        reportsLoading: false 
      };
    
    // Filter cases
    case ActionTypes.SET_FILTER:
      return { 
        ...state, 
        filters: { 
          ...state.filters, 
          [action.payload.key]: action.payload.value 
        } 
      };
    
    case ActionTypes.SET_FILTERS:
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      };
    
    case ActionTypes.RESET_FILTERS:
      return { 
        ...state, 
        filters: initialState.filters 
      };
    
    default:
      return state;
  }
}

// Create context
const TeacherContext = createContext();

// Provider component
export const TeacherProvider = ({ children }) => {
  const [state, dispatch] = useReducer(teacherReducer, initialState);

  // Action creators
  const actions = {
    // Basic actions
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),

    // Profile actions
    async loadProfile() {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const profile = await teacherApi.getProfile();
        dispatch({ type: ActionTypes.SET_PROFILE, payload: profile });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    async updateProfile(profileData) {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const updatedProfile = await teacherApi.updateProfile(profileData);
        dispatch({ type: ActionTypes.SET_PROFILE, payload: updatedProfile });
        return updatedProfile;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    async loadSubjects() {
      try {
        const subjects = await teacherApi.getMySubjects();
        dispatch({ type: ActionTypes.SET_SUBJECTS, payload: subjects });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },

    async loadClasses() {
      try {
        const classes = await teacherApi.getMyClasses();
        dispatch({ type: ActionTypes.SET_CLASSES, payload: classes });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },

    async loadSchedule() {
      try {
        const schedule = await teacherApi.getMySchedule();
        dispatch({ type: ActionTypes.SET_SCHEDULE, payload: schedule });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },

    // Students actions
    async loadStudents(filters = {}) {
      try {
        dispatch({ type: ActionTypes.SET_STUDENTS_LOADING, payload: true });
        const studentsData = await teacherApi.getMyStudents(filters);
        dispatch({ type: ActionTypes.SET_STUDENTS, payload: studentsData.students || [] });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_STUDENTS_ERROR, payload: error.message });
      }
    },

    // Attendance actions
    async loadAttendance(filters = {}) {
      try {
        dispatch({ type: ActionTypes.SET_ATTENDANCE_LOADING, payload: true });
        const attendanceData = await teacherApi.getAttendance(filters);
        dispatch({ type: ActionTypes.SET_ATTENDANCE, payload: attendanceData.attendance_records || [] });
        dispatch({ type: ActionTypes.SET_ATTENDANCE_SUMMARY, payload: attendanceData.summary || {} });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ATTENDANCE_ERROR, payload: error.message });
      }
    },

    async markAttendance(attendanceData) {
      try {
        const newRecord = await teacherApi.markAttendance(attendanceData);
        dispatch({ type: ActionTypes.ADD_ATTENDANCE_RECORD, payload: newRecord });
        return newRecord;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ATTENDANCE_ERROR, payload: error.message });
        throw error;
      }
    },

    async markBulkAttendance(attendanceArray) {
      try {
        const result = await teacherApi.markBulkAttendance(attendanceArray);
        // Reload attendance data after bulk operation
        await actions.loadAttendance(state.filters);
        return result;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ATTENDANCE_ERROR, payload: error.message });
        throw error;
      }
    },

    // Grades actions
    async loadGrades(filters = {}) {
      try {
        dispatch({ type: ActionTypes.SET_GRADES_LOADING, payload: true });
        const gradesData = await teacherApi.getGrades(filters);
        dispatch({ type: ActionTypes.SET_GRADES, payload: gradesData.grades || [] });
        dispatch({ type: ActionTypes.SET_GRADES_STATISTICS, payload: gradesData.statistics || {} });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_GRADES_ERROR, payload: error.message });
      }
    },

    async addGrade(gradeData) {
      try {
        const newGrade = await teacherApi.addGrade(gradeData);
        dispatch({ type: ActionTypes.ADD_GRADE_RECORD, payload: newGrade });
        return newGrade;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_GRADES_ERROR, payload: error.message });
        throw error;
      }
    },

    async updateGrade(gradeData) {
      try {
        const updatedGrade = await teacherApi.updateGrade(gradeData);
        dispatch({ type: ActionTypes.UPDATE_GRADE_RECORD, payload: updatedGrade });
        return updatedGrade;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_GRADES_ERROR, payload: error.message });
        throw error;
      }
    },

    // Dashboard actions
    async loadDashboard() {
      try {
        dispatch({ type: ActionTypes.SET_DASHBOARD_LOADING, payload: true });
        const dashboardData = await teacherApi.getDashboardSummary();
        dispatch({ type: ActionTypes.SET_DASHBOARD_DATA, payload: dashboardData });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_DASHBOARD_ERROR, payload: error.message });
      }
    },

    // Reports actions
    async loadReports(reportType, filters = {}) {
      try {
        dispatch({ type: ActionTypes.SET_REPORTS_LOADING, payload: true });
        const reportsData = await teacherApi.getReports(reportType, filters);
        dispatch({ type: ActionTypes.SET_REPORTS, payload: reportsData });
      } catch (error) {
        dispatch({ type: ActionTypes.SET_REPORTS_ERROR, payload: error.message });
      }
    },

    // Filter actions
    setFilter: (key, value) => dispatch({ 
      type: ActionTypes.SET_FILTER, 
      payload: { key, value } 
    }),
    
    setFilters: (filters) => dispatch({ 
      type: ActionTypes.SET_FILTERS, 
      payload: filters 
    }),
    
    resetFilters: () => dispatch({ type: ActionTypes.RESET_FILTERS }),

    // Export actions
    async exportAttendance(filters = {}) {
      try {
        const blob = await teacherApi.exportAttendance(filters);
        const filename = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        teacherApi.downloadFile(blob, filename);
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },

    async exportGrades(filters = {}) {
      try {
        const blob = await teacherApi.exportGrades(filters);
        const filename = `grades_${new Date().toISOString().split('T')[0]}.csv`;
        teacherApi.downloadFile(blob, filename);
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    },

    async exportStudents(filters = {}) {
      try {
        const blob = await teacherApi.exportStudents(filters);
        const filename = `students_${new Date().toISOString().split('T')[0]}.csv`;
        teacherApi.downloadFile(blob, filename);
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      }
    }
  };

  // Load initial data
  useEffect(() => {
    actions.loadProfile();
    actions.loadSubjects();
    actions.loadClasses();
  }, []);

  const value = {
    ...state,
    actions
  };

  return (
    <TeacherContext.Provider value={value}>
      {children}
    </TeacherContext.Provider>
  );
};

// Custom hook to use the teacher context
export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
};

export default TeacherContext;