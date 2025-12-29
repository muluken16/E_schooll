// Teacher API Service
import { getToken, makeAuthenticatedRequest } from '../../utils/auth';

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000/api"
  : "https://eschooladmin.etbur.com/api";

class TeacherAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/teacher-self`;
  }

  // Helper method to make authenticated requests with auto-refresh
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await makeAuthenticatedRequest(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Profile Management
  async getProfile() {
    return this.makeRequest('/my_profile/');
  }

  async updateProfile(profileData) {
    return this.makeRequest('/my_profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    });
  }

  // Dashboard
  async getDashboardSummary() {
    return this.makeRequest('/dashboard_summary/');
  }

  // Subjects
  async getMySubjects() {
    return this.makeRequest('/my_subjects/');
  }

  // Classes
  async getMyClasses() {
    return this.makeRequest('/my_classes/');
  }

  // Schedule
  async getMySchedule() {
    return this.makeRequest('/my_schedule/');
  }

  // Students
  async getMyStudents(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const queryString = params.toString();
    return this.makeRequest(`/my_students/${queryString ? `?${queryString}` : ''}`);
  }

  // Attendance Management
  async getAttendance(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const queryString = params.toString();
    return this.makeRequest(`/attendance_management/${queryString ? `?${queryString}` : ''}`);
  }

  async markAttendance(attendanceData) {
    return this.makeRequest('/attendance_management/', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  }

  async bulkMarkAttendance(attendanceList) {
    return this.makeRequest('/attendance_management/', {
      method: 'POST',
      body: JSON.stringify(attendanceList)
    });
  }

  // Grade Management
  async getGrades(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const queryString = params.toString();
    return this.makeRequest(`/grade_management/${queryString ? `?${queryString}` : ''}`);
  }

  async addGrade(gradeData) {
    return this.makeRequest('/grade_management/', {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  }

  async updateGrade(gradeData) {
    return this.makeRequest('/grade_management/', {
      method: 'PUT',
      body: JSON.stringify(gradeData)
    });
  }

  async bulkAddGrades(gradesList) {
    return this.makeRequest('/grade_management/', {
      method: 'POST',
      body: JSON.stringify(gradesList)
    });
  }

  // Reports
  async getReports(reportType, filters = {}) {
    const params = new URLSearchParams();
    params.append('type', reportType);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const queryString = params.toString();
    return this.makeRequest(`/reports/${queryString ? `?${queryString}` : ''}`);
  }

  // Utility Methods
  async getAvailableSubjects() {
    return this.makeRequest('/available_subjects/', {}, `${API_BASE_URL}/teacher-utils`);
  }

  async getAvailableSections() {
    return this.makeRequest('/available_sections/', {}, `${API_BASE_URL}/teacher-utils`);
  }

  async getGradeTypes() {
    return this.makeRequest('/grade_types/', {}, `${API_BASE_URL}/teacher-utils`);
  }

  // Announcements
  async getAnnouncements() {
    return this.makeRequest('/announcements/', {}, API_BASE_URL);
  }

  async markAnnouncementRead(announcementId) {
    return this.makeRequest(`/announcements/${announcementId}/read/`, {
      method: 'POST'
    }, API_BASE_URL);
  }

  // Statistics and Analytics
  async getClassStatistics(subjectId, sectionId) {
    const params = new URLSearchParams();
    if (subjectId) params.append('subject', subjectId);
    if (sectionId) params.append('section', sectionId);
    
    const queryString = params.toString();
    return this.makeRequest(`/class_statistics/${queryString ? `?${queryString}` : ''}`);
  }

  async getStudentPerformance(studentId) {
    return this.makeRequest(`/student_performance/${studentId}/`);
  }

  // Export Functions
  async exportAttendance(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const queryString = params.toString();
    const url = `${this.baseURL}/export_attendance/${queryString ? `?${queryString}` : ''}`;
    
    const response = await makeAuthenticatedRequest(url);
    
    if (!response.ok) {
      throw new Error('Failed to export attendance');
    }
    
    return response.blob();
  }

  async exportGrades(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const queryString = params.toString();
    const url = `${this.baseURL}/export_grades/${queryString ? `?${queryString}` : ''}`;
    
    const response = await makeAuthenticatedRequest(url);
    
    if (!response.ok) {
      throw new Error('Failed to export grades');
    }
    
    return response.blob();
  }

  async exportStudentList(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const queryString = params.toString();
    const url = `${this.baseURL}/export_students/${queryString ? `?${queryString}` : ''}`;
    
    const response = await makeAuthenticatedRequest(url);
    
    if (!response.ok) {
      throw new Error('Failed to export student list');
    }
    
    return response.blob();
  }

  // Helper method to download blob as file
  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Create and export a singleton instance
const teacherAPI = new TeacherAPI();
export default teacherAPI;

// Export individual methods for convenience
export const {
  getProfile,
  updateProfile,
  getDashboardSummary,
  getMySubjects,
  getMyClasses,
  getMySchedule,
  getMyStudents,
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  getGrades,
  addGrade,
  updateGrade,
  bulkAddGrades,
  getReports,
  getAvailableSubjects,
  getAvailableSections,
  getGradeTypes,
  getAnnouncements,
  markAnnouncementRead,
  getClassStatistics,
  getStudentPerformance,
  exportAttendance,
  exportGrades,
  exportStudentList
} = teacherAPI;