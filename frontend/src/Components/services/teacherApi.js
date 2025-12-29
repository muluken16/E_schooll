// Teacher API Service
import { getToken } from '../utils/auth';

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000/api"
  : "https://eschooladmin.etbur.com/api";

class TeacherApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/teacher-self`;
  }

  // Helper method to get headers with authentication
  getHeaders() {
    return {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Profile Management
  async getProfile() {
    const response = await fetch(`${this.baseURL}/my_profile/`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData) {
    const response = await fetch(`${this.baseURL}/my_profile/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData)
    });
    return this.handleResponse(response);
  }

  // Dashboard
  async getDashboardSummary() {
    const response = await fetch(`${this.baseURL}/dashboard_summary/`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Subjects Management
  async getMySubjects() {
    const response = await fetch(`${this.baseURL}/my_subjects/`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Classes Management
  async getMyClasses() {
    const response = await fetch(`${this.baseURL}/my_classes/`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getMySchedule() {
    const response = await fetch(`${this.baseURL}/my_schedule/`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Students Management
  async getMyStudents(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await fetch(`${this.baseURL}/my_students/?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Attendance Management
  async getAttendance(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await fetch(`${this.baseURL}/attendance_management/?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async markAttendance(attendanceData) {
    const response = await fetch(`${this.baseURL}/attendance_management/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(attendanceData)
    });
    return this.handleResponse(response);
  }

  async markBulkAttendance(attendanceArray) {
    const response = await fetch(`${this.baseURL}/attendance_management/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(attendanceArray)
    });
    return this.handleResponse(response);
  }

  // Grade Management
  async getGrades(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await fetch(`${this.baseURL}/grade_management/?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async addGrade(gradeData) {
    const response = await fetch(`${this.baseURL}/grade_management/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(gradeData)
    });
    return this.handleResponse(response);
  }

  async updateGrade(gradeData) {
    const response = await fetch(`${this.baseURL}/grade_management/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(gradeData)
    });
    return this.handleResponse(response);
  }

  async addBulkGrades(gradesArray) {
    const response = await fetch(`${this.baseURL}/grade_management/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(gradesArray)
    });
    return this.handleResponse(response);
  }

  // Reports
  async getReports(reportType, filters = {}) {
    const params = new URLSearchParams();
    params.append('type', reportType);
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await fetch(`${this.baseURL}/reports/?${params}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Utility Methods
  async getAvailableSubjects() {
    const response = await fetch(`${API_BASE_URL}/teacher-utils/available_subjects/`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getAvailableSections() {
    const response = await fetch(`${API_BASE_URL}/teacher-utils/available_sections/`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getGradeTypes() {
    const response = await fetch(`${API_BASE_URL}/teacher-utils/grade_types/`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // Export functionality
  async exportAttendance(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await fetch(`${this.baseURL}/attendance_management/export/?${params}`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    return response.blob();
  }

  async exportGrades(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await fetch(`${this.baseURL}/grade_management/export/?${params}`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    return response.blob();
  }

  async exportStudents(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    
    const response = await fetch(`${this.baseURL}/my_students/export/?${params}`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    return response.blob();
  }

  // Helper method to download exported files
  downloadFile(blob, filename) {
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
const teacherApi = new TeacherApiService();
export default teacherApi;

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
  markBulkAttendance,
  getGrades,
  addGrade,
  updateGrade,
  addBulkGrades,
  getReports,
  getAvailableSubjects,
  getAvailableSections,
  getGradeTypes,
  exportAttendance,
  exportGrades,
  exportStudents,
  downloadFile
} = teacherApi;