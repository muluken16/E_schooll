import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { 
  FaUser, FaGraduationCap, FaCalendarCheck, FaBook, FaChartLine, 
  FaBell, FaAward, FaExclamationTriangle, FaBookOpen, FaClock,
  FaCalculator, FaBullhorn, FaCalendarAlt, FaSpinner
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentGrades, setRecentGrades] = useState([]);
  const [libraryRecords, setLibraryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingStates, setLoadingStates] = useState({
    summary: true,
    grades: true,
    library: true
  });

  const user = JSON.parse(localStorage.getItem('user'));

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel for faster loading
      const [summaryResponse, gradesResponse, libraryResponse] = await Promise.all([
        fetch(`${API_URL}academic_summary/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
        fetch(`${API_URL}my_grades/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }),
        fetch(`${API_URL}my_library_records/`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        })
      ]);

      // Process responses as they complete
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
        setLoadingStates(prev => ({ ...prev, summary: false }));
      }

      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        setRecentGrades(gradesData.grades.slice(0, 5)); // Get latest 5 grades
        setLoadingStates(prev => ({ ...prev, grades: false }));
      }

      if (libraryResponse.ok) {
        const libraryData = await libraryResponse.json();
        setLibraryRecords(libraryData.slice(0, 3)); // Get latest 3 records
        setLoadingStates(prev => ({ ...prev, library: false }));
      }

    } catch (err) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score, fullMark) => {
    const percentage = (score / fullMark) * 100;
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#3b82f6';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { status: 'Excellent', color: '#10b981' };
    if (percentage >= 80) return { status: 'Good', color: '#3b82f6' };
    if (percentage >= 70) return { status: 'Average', color: '#f59e0b' };
    return { status: 'Needs Improvement', color: '#ef4444' };
  };

  // Memoize expensive calculations
  const attendanceStatus = useMemo(() => {
    if (!summary?.attendance_summary?.attendance_percentage) return { status: 'Loading...', color: '#6b7280' };
    return getAttendanceStatus(summary.attendance_summary.attendance_percentage);
  }, [summary]);

  const overdueBooks = useMemo(() => {
    return libraryRecords.filter(record => record.overdue);
  }, [libraryRecords]);

  if (loading && !summary) {
    return (
      <Layout>
        <div className="loading-dashboard">
          <FaSpinner className="loading-spinner" />
          <div>Loading your dashboard...</div>
        </div>
      </Layout>
    );
  }
  
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  return (
    <Layout>
      <div className="student-dashboard">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <div className="student-avatar">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              )}
            </div>
            <div className="welcome-text">
              <h1>Welcome back, {user?.first_name}!</h1>
              <p>Here's your academic overview for today</p>
              {summary?.student_info && (
                <div className="student-info">
                  <span className="class-info">{summary.student_info.class_section}</span>
                  <span className="id-info">ID: {summary.student_info.student_id}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="quick-actions">
            <Link to="/student/profile" className="quick-action">
              <FaUser /> Profile
            </Link>
            <Link to="/student/grades" className="quick-action">
              <FaGraduationCap /> Grades
            </Link>
            <Link to="/student/gpa-calculator" className="quick-action">
              <FaCalculator /> GPA
            </Link>
            <Link to="/student/attendance" className="quick-action">
              <FaCalendarCheck /> Attendance
            </Link>
            <Link to="/student/attendance-calendar" className="quick-action">
              <FaCalendarAlt /> Calendar
            </Link>
            <Link to="/student/announcements" className="quick-action">
              <FaBullhorn /> Notices
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card academic">
            <div className="metric-icon">
              <FaChartLine />
            </div>
            <div className="metric-content">
              <h3>Academic Average</h3>
              <div className="metric-value">
                {loadingStates.summary ? (
                  <FaSpinner className="loading-spinner-small" />
                ) : (
                  `${summary?.academic_performance?.overall_average || 0}%`
                )}
              </div>
              <div className="metric-subtitle">
                {summary?.academic_performance?.total_assessments || 0} assessments
              </div>
            </div>
          </div>

          <div className="metric-card attendance">
            <div className="metric-icon">
              <FaCalendarCheck />
            </div>
            <div className="metric-content">
              <h3>Attendance Rate</h3>
              <div 
                className="metric-value"
                style={{ color: attendanceStatus.color }}
              >
                {loadingStates.summary ? (
                  <FaSpinner className="loading-spinner-small" />
                ) : (
                  `${summary?.attendance_summary?.attendance_percentage?.toFixed(1) || 0}%`
                )}
              </div>
              <div className="metric-subtitle" style={{ color: attendanceStatus.color }}>
                {attendanceStatus.status}
              </div>
            </div>
          </div>

          <div className="metric-card subjects">
            <div className="metric-icon">
              <FaBook />
            </div>
            <div className="metric-content">
              <h3>Active Subjects</h3>
              <div className="metric-value">
                {loadingStates.summary ? (
                  <FaSpinner className="loading-spinner-small" />
                ) : (
                  summary?.academic_performance?.subjects_count || 0
                )}
              </div>
              <div className="metric-subtitle">
                This semester
              </div>
            </div>
          </div>

          <div className="metric-card library">
            <div className="metric-icon">
              <FaBookOpen />
            </div>
            <div className="metric-content">
              <h3>Library Books</h3>
              <div className="metric-value">
                {loadingStates.library ? (
                  <FaSpinner className="loading-spinner-small" />
                ) : (
                  libraryRecords.filter(record => !record.returned).length
                )}
              </div>
              <div className="metric-subtitle">
                Currently borrowed
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        {(summary?.attendance_summary?.attendance_percentage < 75 || 
          overdueBooks.length > 0) && (
          <div className="alerts-section">
            <h3><FaBell /> Important Alerts</h3>
            <div className="alerts-list">
              {summary?.attendance_summary?.attendance_percentage < 75 && (
                <div className="alert warning">
                  <FaExclamationTriangle />
                  <div className="alert-content">
                    <strong>Low Attendance Warning</strong>
                    <p>Your attendance is {summary.attendance_summary.attendance_percentage.toFixed(1)}%. Minimum required is 75%.</p>
                  </div>
                </div>
              )}
              {overdueBooks.map(record => (
                <div key={record.id} className="alert danger">
                  <FaClock />
                  <div className="alert-content">
                    <strong>Overdue Book</strong>
                    <p>"{record.book_title}" was due on {new Date(record.expected_return_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="recent-grades">
            <div className="section-header">
              <h3><FaGraduationCap /> Recent Grades</h3>
              <Link to="/student/grades" className="view-all">View All</Link>
            </div>
            <div className="grades-list">
              {recentGrades.length > 0 ? recentGrades.map((grade, index) => (
                <div key={index} className="grade-item">
                  <div className="grade-subject">
                    <strong>{grade.subject_name}</strong>
                    <span className="grade-type">{grade.grade_type}</span>
                  </div>
                  <div className="grade-score">
                    <span 
                      className="score"
                      style={{ color: getGradeColor(grade.score, grade.full_mark) }}
                    >
                      {grade.score}/{grade.full_mark}
                    </span>
                    <span className="percentage">
                      {((grade.score / grade.full_mark) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="grade-date">
                    {new Date(grade.date_recorded).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <div className="no-data">No recent grades available</div>
              )}
            </div>
          </div>

          <div className="subject-performance">
            <div className="section-header">
              <h3><FaAward /> Subject Performance</h3>
            </div>
            <div className="subjects-list">
              {summary?.academic_performance?.subjects_performance?.slice(0, 5).map((subject, index) => (
                <div key={index} className="subject-item">
                  <div className="subject-info">
                    <strong>{subject.subject_name}</strong>
                    <span className="subject-code">{subject.subject_code}</span>
                  </div>
                  <div className="subject-average">
                    <div 
                      className="average-bar"
                      style={{ 
                        width: `${subject.average_score}%`,
                        backgroundColor: getGradeColor(subject.average_score, 100)
                      }}
                    ></div>
                    <span className="average-text">{subject.average_score}%</span>
                  </div>
                </div>
              )) || (
                <div className="no-data">No subject data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Library Section */}
        <div className="library-section">
          <div className="section-header">
            <h3><FaBookOpen /> Library Activity</h3>
            <Link to="/student/library" className="view-all">View All</Link>
          </div>
          <div className="library-list">
            {libraryRecords.length > 0 ? libraryRecords.map((record, index) => (
              <div key={index} className={`library-item ${record.overdue ? 'overdue' : ''}`}>
                <div className="book-info">
                  <strong>{record.book_title}</strong>
                  <span className="book-author">by {record.book_author}</span>
                </div>
                <div className="borrow-info">
                  <span className="borrow-date">
                    Borrowed: {new Date(record.borrow_date).toLocaleDateString()}
                  </span>
                  <span className={`return-status ${record.returned ? 'returned' : record.overdue ? 'overdue' : 'active'}`}>
                    {record.returned ? 'Returned' : record.overdue ? 'Overdue' : 'Active'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="no-data">No library activity</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;