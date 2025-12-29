import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import teacherAPI from './TeacherAPI';
import { 
  FaChartBar, FaCalendarCheck, FaGraduationCap, FaUsers, 
  FaDownload, FaFilter, FaChartLine, FaExclamationTriangle 
} from 'react-icons/fa';
import './TeacherReports.css';

const TeacherReports = () => {
  const [reportData, setReportData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Report filters
  const [reportType, setReportType] = useState('summary');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const reportTypes = [
    { value: 'summary', label: 'Summary Report', icon: FaChartBar },
    { value: 'attendance', label: 'Attendance Report', icon: FaCalendarCheck },
    { value: 'grades', label: 'Grades Report', icon: FaGraduationCap },
    { value: 'performance', label: 'Performance Report', icon: FaChartLine }
  ];

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (subjects.length > 0) {
      fetchReport();
    }
  }, [reportType, selectedSubject, selectedSection, dateFrom, dateTo, subjects]);

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

  const fetchReport = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedSubject) filters.subject = selectedSubject;
      if (selectedSection) filters.section = selectedSection;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;

      const data = await teacherAPI.getReports(reportType, filters);
      setReportData(data);
    } catch (err) {
      setError('Error loading report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // This would implement the export functionality
    alert('Export functionality would be implemented here');
  };

  const getPerformanceColor = (value, type = 'grade') => {
    if (type === 'grade') {
      if (value >= 85) return '#10b981';
      if (value >= 70) return '#3b82f6';
      if (value >= 60) return '#f59e0b';
      return '#ef4444';
    } else if (type === 'attendance') {
      if (value >= 90) return '#10b981';
      if (value >= 80) return '#3b82f6';
      if (value >= 70) return '#f59e0b';
      return '#ef4444';
    }
    return '#6b7280';
  };

  const renderSummaryReport = () => {
    if (!reportData) return null;

    return (
      <div className="report-content">
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>Total Students</h3>
              <div className="stat-value">{reportData.total_students || 0}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaGraduationCap />
            </div>
            <div className="stat-info">
              <h3>Subjects Taught</h3>
              <div className="stat-value">{reportData.subjects_taught || 0}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartBar />
            </div>
            <div className="stat-info">
              <h3>Total Grades</h3>
              <div className="stat-value">{reportData.total_grades_entered || 0}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaCalendarCheck />
            </div>
            <div className="stat-info">
              <h3>Attendance Records</h3>
              <div className="stat-value">{reportData.total_attendance_records || 0}</div>
            </div>
          </div>
        </div>

        <div className="activity-summary">
          <h3>Recent Activity</h3>
          <div className="activity-grid">
            <div className="activity-item">
              <span className="activity-label">Grades entered this month:</span>
              <span className="activity-value">{reportData.recent_activity?.grades_this_month || 0}</span>
            </div>
            <div className="activity-item">
              <span className="activity-label">Attendance taken this month:</span>
              <span className="activity-value">{reportData.recent_activity?.attendance_this_month || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAttendanceReport = () => {
    if (!reportData || !reportData.data) return null;

    return (
      <div className="report-content">
        <div className="report-summary">
          <div className="summary-card">
            <h3>Attendance Summary</h3>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="label">Total Students:</span>
                <span className="value">{reportData.summary?.total_students || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Average Attendance:</span>
                <span 
                  className="value"
                  style={{ color: getPerformanceColor(reportData.summary?.avg_attendance_rate || 0, 'attendance') }}
                >
                  {reportData.summary?.avg_attendance_rate || 0}%
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Students Below 75%:</span>
                <span className="value warning">{reportData.summary?.students_below_75 || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="attendance-table-section">
          <h3>Student Attendance Details</h3>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Total Days</th>
                  <th>Attendance Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((student, index) => (
                  <tr key={index}>
                    <td className="student-name">{student.student}</td>
                    <td>{student.present_days}</td>
                    <td>{student.absent_days}</td>
                    <td>{student.total_days}</td>
                    <td>
                      <span 
                        className="attendance-rate"
                        style={{ color: getPerformanceColor(student.attendance_rate, 'attendance') }}
                      >
                        {student.attendance_rate}%
                      </span>
                    </td>
                    <td>
                      {student.attendance_rate < 75 && (
                        <span className="status-warning">
                          <FaExclamationTriangle /> At Risk
                        </span>
                      )}
                      {student.attendance_rate >= 75 && student.attendance_rate < 90 && (
                        <span className="status-ok">Good</span>
                      )}
                      {student.attendance_rate >= 90 && (
                        <span className="status-excellent">Excellent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderGradesReport = () => {
    if (!reportData || !reportData.data) return null;

    return (
      <div className="report-content">
        <div className="report-summary">
          <div className="summary-card">
            <h3>Grades Summary</h3>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="label">Total Students:</span>
                <span className="value">{reportData.summary?.total_students || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Class Average:</span>
                <span 
                  className="value"
                  style={{ color: getPerformanceColor(reportData.summary?.class_average || 0) }}
                >
                  {reportData.summary?.class_average || 0}%
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Students Below 60%:</span>
                <span className="value warning">{reportData.summary?.students_below_60 || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Students Above 90%:</span>
                <span className="value excellent">{reportData.summary?.students_above_90 || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grades-table-section">
          <h3>Student Grade Details</h3>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Total Assessments</th>
                  <th>Average Percentage</th>
                  <th>Highest Score</th>
                  <th>Lowest Score</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((student, index) => (
                  <tr key={index}>
                    <td className="student-name">{student.student}</td>
                    <td>{student.total_assessments}</td>
                    <td>
                      <span 
                        className="average-grade"
                        style={{ color: getPerformanceColor(student.average_percentage) }}
                      >
                        {student.average_percentage}%
                      </span>
                    </td>
                    <td>{student.highest_score}%</td>
                    <td>{student.lowest_score}%</td>
                    <td>
                      {student.average_percentage < 60 && (
                        <span className="status-warning">
                          <FaExclamationTriangle /> Needs Improvement
                        </span>
                      )}
                      {student.average_percentage >= 60 && student.average_percentage < 85 && (
                        <span className="status-ok">Good</span>
                      )}
                      {student.average_percentage >= 85 && (
                        <span className="status-excellent">Excellent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceReport = () => {
    if (!reportData || !reportData.data) return null;

    return (
      <div className="report-content">
        <div className="report-summary">
          <div className="summary-card">
            <h3>Performance Summary</h3>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="label">Total Students:</span>
                <span className="value">{reportData.summary?.total_students || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Excellent Performers:</span>
                <span className="value excellent">{reportData.summary?.excellent_performers || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">At Risk Students:</span>
                <span className="value warning">{reportData.summary?.at_risk_students || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="performance-table-section">
          <h3>Student Performance Overview</h3>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Average Grade</th>
                  <th>Attendance Rate</th>
                  <th>Total Assessments</th>
                  <th>Performance Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((student, index) => (
                  <tr key={index}>
                    <td className="student-name">{student.student}</td>
                    <td>
                      <span 
                        className="grade-value"
                        style={{ color: getPerformanceColor(student.average_grade) }}
                      >
                        {student.average_grade}%
                      </span>
                    </td>
                    <td>
                      <span 
                        className="attendance-value"
                        style={{ color: getPerformanceColor(student.attendance_rate, 'attendance') }}
                      >
                        {student.attendance_rate}%
                      </span>
                    </td>
                    <td>{student.total_assessments}</td>
                    <td>
                      <span className={`performance-status ${student.performance_status.toLowerCase().replace(' ', '-')}`}>
                        {student.performance_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'attendance':
        return renderAttendanceReport();
      case 'grades':
        return renderGradesReport();
      case 'performance':
        return renderPerformanceReport();
      default:
        return renderSummaryReport();
    }
  };

  if (loading) return <TeacherLayout><div className="loading">Loading reports...</div></TeacherLayout>;
  if (error) return <TeacherLayout><div className="error">{error}</div></TeacherLayout>;

  return (
    <TeacherLayout>
      <div className="teacher-reports">
        <div className="reports-header">
          <h1>Reports & Analytics</h1>
          <p>Generate comprehensive reports for your classes</p>
        </div>

        {/* Report Type Selection */}
        <div className="report-types">
          {reportTypes.map(type => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.value}
                className={`report-type-btn ${reportType === type.value ? 'active' : ''}`}
                onClick={() => setReportType(type.value)}
              >
                <IconComponent className="report-icon" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters">
            <div className="filter-group">
              <label>Subject:</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
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

            {(reportType === 'attendance' || reportType === 'grades') && (
              <>
                <div className="filter-group">
                  <label>From Date:</label>
                  <input 
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>To Date:</label>
                  <input 
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="actions">
            <button className="export-btn" onClick={handleExportReport}>
              <FaDownload /> Export Report
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="report-container">
          {renderReportContent()}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherReports;