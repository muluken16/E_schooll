import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import teacherAPI from './TeacherAPI';
import { 
  FaUsers, FaSearch, FaFilter, FaChartLine, 
  FaGraduationCap, FaCalendarCheck, FaEye, FaDownload 
} from 'react-icons/fa';
import './TeacherStudents.css';

const TeacherStudents = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('');
  
  // Student detail modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    fetchStudents();
  }, [selectedSubject, selectedSection]);

  const fetchSubjects = async () => {
    try {
      const data = await teacherAPI.getMySubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await teacherAPI.getMyClasses();
      setClasses(data);
    } catch (err) {
      console.error('Error loading classes:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const filters = {};
      if (selectedSubject) filters.subject = selectedSubject;
      if (selectedSection) filters.section = selectedSection;

      const data = await teacherAPI.getMyStudents(filters);
      setStudentsData(data.students || []);
    } catch (err) {
      setError('Error loading students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_id_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPerformance = !performanceFilter || 
      (performanceFilter === 'excellent' && student.academic_performance.average_grade >= 85) ||
      (performanceFilter === 'good' && student.academic_performance.average_grade >= 70 && student.academic_performance.average_grade < 85) ||
      (performanceFilter === 'needs_improvement' && student.academic_performance.average_grade < 70);
    
    return matchesSearch && matchesPerformance;
  });

  const getPerformanceColor = (average) => {
    if (average >= 85) return '#10b981';
    if (average >= 70) return '#3b82f6';
    if (average >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getPerformanceLabel = (average) => {
    if (average >= 85) return 'Excellent';
    if (average >= 70) return 'Good';
    if (average >= 60) return 'Satisfactory';
    return 'Needs Improvement';
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return '#10b981';
    if (rate >= 80) return '#3b82f6';
    if (rate >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  if (loading) return <TeacherLayout><div className="loading">Loading students...</div></TeacherLayout>;
  if (error) return <TeacherLayout><div className="error">{error}</div></TeacherLayout>;

  return (
    <TeacherLayout>
      <div className="teacher-students">
        <div className="students-header">
          <h1>My Students</h1>
          <p>View and manage students in your classes</p>
        </div>

        {/* Summary Stats */}
        <div className="summary-cards">
          <div className="summary-card total">
            <div className="summary-icon">
              <FaUsers />
            </div>
            <div className="summary-content">
              <h3>Total Students</h3>
              <div className="summary-value">{studentsData.length}</div>
            </div>
          </div>
          
          <div className="summary-card excellent">
            <div className="summary-icon">
              <FaGraduationCap />
            </div>
            <div className="summary-content">
              <h3>Excellent Performers</h3>
              <div className="summary-value">
                {studentsData.filter(s => s.academic_performance.average_grade >= 85).length}
              </div>
            </div>
          </div>
          
          <div className="summary-card good-attendance">
            <div className="summary-icon">
              <FaCalendarCheck />
            </div>
            <div className="summary-content">
              <h3>Good Attendance</h3>
              <div className="summary-value">
                {studentsData.filter(s => s.attendance_summary.attendance_rate >= 90).length}
              </div>
            </div>
          </div>
          
          <div className="summary-card average">
            <div className="summary-icon">
              <FaChartLine />
            </div>
            <div className="summary-content">
              <h3>Class Average</h3>
              <div className="summary-value">
                {studentsData.length > 0 
                  ? (studentsData.reduce((sum, s) => sum + s.academic_performance.average_grade, 0) / studentsData.length).toFixed(1)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="search-filters">
            <div className="search-group">
              <FaSearch className="search-icon" />
              <input 
                type="text"
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label>Subject:</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Section:</label>
              <select 
                value={selectedSection} 
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">All Sections</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Performance:</label>
              <select 
                value={performanceFilter} 
                onChange={(e) => setPerformanceFilter(e.target.value)}
              >
                <option value="">All Performance</option>
                <option value="excellent">Excellent (85%+)</option>
                <option value="good">Good (70-84%)</option>
                <option value="needs_improvement">Needs Improvement (&lt;70%)</option>
              </select>
            </div>
          </div>

          <div className="actions">
            <button className="export-btn">
              <FaDownload /> Export List
            </button>
          </div>
        </div>

        {/* Students Grid */}
        <div className="students-grid">
          {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
            <div key={index} className="student-card">
              <div className="student-header">
                <div className="student-info">
                  <h3 className="student-name">{student.student_name}</h3>
                  <p className="student-id">ID: {student.student_id_number}</p>
                  <p className="student-class">{student.class_section}</p>
                </div>
                <div className="student-actions">
                  <button 
                    className="view-btn"
                    onClick={() => handleViewStudent(student)}
                  >
                    <FaEye />
                  </button>
                </div>
              </div>

              <div className="student-stats">
                <div className="stat-item">
                  <span className="stat-label">Academic Performance</span>
                  <div className="performance-bar">
                    <div 
                      className="performance-fill"
                      style={{ 
                        width: `${student.academic_performance.average_grade}%`,
                        backgroundColor: getPerformanceColor(student.academic_performance.average_grade)
                      }}
                    ></div>
                    <span className="performance-text">
                      {student.academic_performance.average_grade.toFixed(1)}% - {getPerformanceLabel(student.academic_performance.average_grade)}
                    </span>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-label">Attendance Rate</span>
                  <div className="attendance-bar">
                    <div 
                      className="attendance-fill"
                      style={{ 
                        width: `${student.attendance_summary.attendance_rate}%`,
                        backgroundColor: getAttendanceColor(student.attendance_summary.attendance_rate)
                      }}
                    ></div>
                    <span className="attendance-text">
                      {student.attendance_summary.attendance_rate}% ({student.attendance_summary.present_days}/{student.attendance_summary.total_days})
                    </span>
                  </div>
                </div>

                <div className="recent-grades">
                  <span className="stat-label">Recent Grades</span>
                  <div className="grades-list">
                    {student.academic_performance.recent_grades.slice(0, 3).map((grade, idx) => (
                      <div key={idx} className="grade-item">
                        <span className="grade-subject">{grade.subject}</span>
                        <span 
                          className="grade-score"
                          style={{ color: getPerformanceColor(grade.percentage) }}
                        >
                          {grade.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="no-students">
              <FaUsers className="no-students-icon" />
              <h3>No students found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>

        {/* Student Detail Modal */}
        {showStudentModal && selectedStudent && (
          <div className="modal-overlay">
            <div className="student-modal">
              <div className="modal-header">
                <h3>Student Details - {selectedStudent.student_name}</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowStudentModal(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <div className="student-details">
                  <div className="detail-section">
                    <h4>Basic Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Full Name:</label>
                        <span>{selectedStudent.student_name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Student ID:</label>
                        <span>{selectedStudent.student_id_number}</span>
                      </div>
                      <div className="detail-item">
                        <label>Admission No:</label>
                        <span>{selectedStudent.admission_no}</span>
                      </div>
                      <div className="detail-item">
                        <label>Class/Section:</label>
                        <span>{selectedStudent.class_section}</span>
                      </div>
                      <div className="detail-item">
                        <label>Email:</label>
                        <span>{selectedStudent.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Academic Performance</h4>
                    <div className="performance-details">
                      <div className="performance-summary">
                        <div className="summary-item">
                          <label>Overall Average:</label>
                          <span 
                            className="performance-value"
                            style={{ color: getPerformanceColor(selectedStudent.academic_performance.average_grade) }}
                          >
                            {selectedStudent.academic_performance.average_grade.toFixed(1)}%
                          </span>
                        </div>
                        <div className="summary-item">
                          <label>Total Assessments:</label>
                          <span>{selectedStudent.academic_performance.total_assessments}</span>
                        </div>
                        <div className="summary-item">
                          <label>Subjects:</label>
                          <span>{selectedStudent.academic_performance.subjects_taught.join(', ')}</span>
                        </div>
                      </div>

                      <div className="recent-grades-detail">
                        <h5>Recent Grades</h5>
                        <div className="grades-table">
                          {selectedStudent.academic_performance.recent_grades.map((grade, idx) => (
                            <div key={idx} className="grade-row">
                              <span className="grade-subject">{grade.subject}</span>
                              <span className="grade-type">{grade.grade_type}</span>
                              <span className="grade-score">{grade.score}/{grade.full_mark}</span>
                              <span 
                                className="grade-percentage"
                                style={{ color: getPerformanceColor(grade.percentage) }}
                              >
                                {grade.percentage}%
                              </span>
                              <span className="grade-date">{grade.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Attendance Summary</h4>
                    <div className="attendance-details">
                      <div className="attendance-stats">
                        <div className="stat-box">
                          <label>Attendance Rate</label>
                          <span 
                            className="stat-value"
                            style={{ color: getAttendanceColor(selectedStudent.attendance_summary.attendance_rate) }}
                          >
                            {selectedStudent.attendance_summary.attendance_rate}%
                          </span>
                        </div>
                        <div className="stat-box">
                          <label>Present Days</label>
                          <span className="stat-value">{selectedStudent.attendance_summary.present_days}</span>
                        </div>
                        <div className="stat-box">
                          <label>Absent Days</label>
                          <span className="stat-value">{selectedStudent.attendance_summary.absent_days}</span>
                        </div>
                        <div className="stat-box">
                          <label>Total Days</label>
                          <span className="stat-value">{selectedStudent.attendance_summary.total_days}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherStudents;