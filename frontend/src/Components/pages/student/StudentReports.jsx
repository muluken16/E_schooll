import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { FaDownload, FaFileAlt, FaChartBar, FaCalendarAlt, FaPrint, FaEye } from 'react-icons/fa';
import './StudentReports.css';

const StudentReports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState('');
  const [reportData, setReportData] = useState(null);

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_URL}academic_summary/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        setError('Failed to load summary');
      }
    } catch (err) {
      setError('Error loading summary');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType) => {
    setLoading(true);
    try {
      let endpoint = '';
      switch(reportType) {
        case 'grades':
          endpoint = 'my_grades/';
          break;
        case 'attendance':
          endpoint = 'my_attendance/';
          break;
        case 'academic_summary':
          endpoint = 'academic_summary/';
          break;
        default:
          return;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setSelectedReport(reportType);
      }
    } catch (err) {
      setError('Error generating report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (reportType, format = 'pdf') => {
    // This would typically call a backend endpoint to generate and download the report
    const reportContent = generateReportContent(reportType);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_report.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const generateReportContent = (reportType) => {
    if (!summary) return '';
    
    let content = `STUDENT ACADEMIC REPORT\n`;
    content += `========================\n\n`;
    content += `Student: ${summary.student_info.name}\n`;
    content += `ID: ${summary.student_info.student_id}\n`;
    content += `Class: ${summary.student_info.class_section}\n`;
    content += `Department: ${summary.student_info.department}\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    switch(reportType) {
      case 'academic_summary':
        content += `ACADEMIC PERFORMANCE SUMMARY\n`;
        content += `============================\n\n`;
        content += `Overall Average: ${summary.academic_performance.overall_average}%\n`;
        content += `Total Assessments: ${summary.academic_performance.total_assessments}\n`;
        content += `Subjects Count: ${summary.academic_performance.subjects_count}\n\n`;
        content += `ATTENDANCE SUMMARY\n`;
        content += `==================\n`;
        content += `Attendance Rate: ${summary.attendance_summary.attendance_percentage}%\n`;
        content += `Present Days: ${summary.attendance_summary.present_days}\n`;
        content += `Absent Days: ${summary.attendance_summary.absent_days}\n`;
        break;
      case 'grades':
        content += `GRADES REPORT\n`;
        content += `=============\n\n`;
        if (reportData && reportData.grades) {
          reportData.grades.forEach(grade => {
            content += `${grade.subject_name} - ${grade.grade_type}: ${grade.score}/${grade.full_mark} (${((grade.score/grade.full_mark)*100).toFixed(1)}%)\n`;
          });
        }
        break;
      case 'attendance':
        content += `ATTENDANCE REPORT\n`;
        content += `=================\n\n`;
        if (reportData && reportData.attendance) {
          reportData.attendance.forEach(record => {
            content += `${record.date} - ${record.status}\n`;
          });
        }
        break;
    }

    return content;
  };

  const printReport = () => {
    window.print();
  };

  if (loading) return <Layout><div className="loading">Loading reports...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  const reportTypes = [
    {
      id: 'academic_summary',
      title: 'Academic Summary Report',
      description: 'Complete overview of academic performance and attendance',
      icon: <FaChartBar />
    },
    {
      id: 'grades',
      title: 'Detailed Grades Report',
      description: 'All grades with subject-wise breakdown',
      icon: <FaFileAlt />
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Daily attendance records and statistics',
      icon: <FaCalendarAlt />
    }
  ];

  return (
    <Layout>
      <div className="student-reports">
        <div className="reports-header">
          <h1>Academic Reports & Certificates</h1>
          <p>Generate and download your academic reports</p>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-value">{summary?.academic_performance?.overall_average || 0}%</div>
            <div className="stat-label">Overall Average</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summary?.attendance_summary?.attendance_percentage?.toFixed(1) || 0}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summary?.academic_performance?.subjects_count || 0}</div>
            <div className="stat-label">Active Subjects</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{summary?.academic_performance?.total_assessments || 0}</div>
            <div className="stat-label">Total Assessments</div>
          </div>
        </div>

        {/* Available Reports */}
        <div className="reports-section">
          <h3>Available Reports</h3>
          <div className="reports-grid">
            {reportTypes.map(report => (
              <div key={report.id} className="report-card">
                <div className="report-icon">
                  {report.icon}
                </div>
                <div className="report-content">
                  <h4>{report.title}</h4>
                  <p>{report.description}</p>
                </div>
                <div className="report-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => generateReport(report.id)}
                  >
                    <FaEye /> View
                  </button>
                  <button 
                    className="action-btn download"
                    onClick={() => downloadReport(report.id)}
                  >
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Preview */}
        {selectedReport && reportData && (
          <div className="report-preview">
            <div className="preview-header">
              <h3>Report Preview</h3>
              <div className="preview-actions">
                <button className="action-btn print" onClick={printReport}>
                  <FaPrint /> Print
                </button>
                <button 
                  className="action-btn download"
                  onClick={() => downloadReport(selectedReport)}
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>
            
            <div className="preview-content">
              {selectedReport === 'academic_summary' && (
                <div className="summary-preview">
                  <div className="report-header-info">
                    <h2>Academic Summary Report</h2>
                    <div className="student-details">
                      <p><strong>Student:</strong> {summary.student_info.name}</p>
                      <p><strong>ID:</strong> {summary.student_info.student_id}</p>
                      <p><strong>Class:</strong> {summary.student_info.class_section}</p>
                      <p><strong>Department:</strong> {summary.student_info.department}</p>
                      <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="performance-section">
                    <h4>Academic Performance</h4>
                    <div className="performance-grid">
                      <div className="perf-item">
                        <span className="perf-label">Overall Average:</span>
                        <span className="perf-value">{summary.academic_performance.overall_average}%</span>
                      </div>
                      <div className="perf-item">
                        <span className="perf-label">Total Assessments:</span>
                        <span className="perf-value">{summary.academic_performance.total_assessments}</span>
                      </div>
                      <div className="perf-item">
                        <span className="perf-label">Subjects:</span>
                        <span className="perf-value">{summary.academic_performance.subjects_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="subjects-section">
                    <h4>Subject Performance</h4>
                    <div className="subjects-table">
                      {summary.academic_performance.subjects_performance.map((subject, index) => (
                        <div key={index} className="subject-row">
                          <span className="subject-name">{subject.subject_name}</span>
                          <span className="subject-code">{subject.subject_code}</span>
                          <span className="subject-average">{subject.average_score}%</span>
                          <span className="subject-assessments">{subject.total_assessments} assessments</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="attendance-section">
                    <h4>Attendance Summary</h4>
                    <div className="attendance-grid">
                      <div className="att-item">
                        <span className="att-label">Attendance Rate:</span>
                        <span className="att-value">{summary.attendance_summary.attendance_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="att-item">
                        <span className="att-label">Present Days:</span>
                        <span className="att-value">{summary.attendance_summary.present_days}</span>
                      </div>
                      <div className="att-item">
                        <span className="att-label">Absent Days:</span>
                        <span className="att-value">{summary.attendance_summary.absent_days}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === 'grades' && reportData.grades && (
                <div className="grades-preview">
                  <h2>Detailed Grades Report</h2>
                  <div className="grades-table">
                    <div className="table-header">
                      <span>Subject</span>
                      <span>Type</span>
                      <span>Score</span>
                      <span>Percentage</span>
                      <span>Date</span>
                    </div>
                    {reportData.grades.map((grade, index) => (
                      <div key={index} className="table-row">
                        <span>{grade.subject_name}</span>
                        <span>{grade.grade_type}</span>
                        <span>{grade.score}/{grade.full_mark}</span>
                        <span>{((grade.score/grade.full_mark)*100).toFixed(1)}%</span>
                        <span>{new Date(grade.date_recorded).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport === 'attendance' && reportData.attendance && (
                <div className="attendance-preview">
                  <h2>Attendance Report</h2>
                  <div className="attendance-stats">
                    <div className="stat">
                      <span>Total Days: {reportData.statistics.total_days}</span>
                    </div>
                    <div className="stat">
                      <span>Present: {reportData.statistics.present_days}</span>
                    </div>
                    <div className="stat">
                      <span>Absent: {reportData.statistics.absent_days}</span>
                    </div>
                    <div className="stat">
                      <span>Rate: {reportData.statistics.attendance_percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="attendance-table">
                    <div className="table-header">
                      <span>Date</span>
                      <span>Status</span>
                      <span>Subject</span>
                    </div>
                    {reportData.attendance.slice(0, 20).map((record, index) => (
                      <div key={index} className="table-row">
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                        <span className={`status ${record.status}`}>{record.status}</span>
                        <span>{record.subject || 'General'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentReports;