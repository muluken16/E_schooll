import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { FaBook, FaUser, FaClock, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import './StudentCourses.css';

const StudentCourses = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}my_subjects/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        setError('Failed to load subjects');
      }
    } catch (err) {
      setError('Error loading subjects');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  const getGradeLetter = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    return 'F';
  };

  if (loading) return <Layout><div className="loading">Loading courses...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  return (
    <Layout>
      <div className="student-courses">
        <div className="courses-header">
          <h1>My Courses</h1>
          <p>View your enrolled subjects and academic progress</p>
        </div>

        {/* Course Statistics */}
        <div className="course-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaBook />
            </div>
            <div className="stat-content">
              <h3>Total Subjects</h3>
              <div className="stat-value">{subjects.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>Average Score</h3>
              <div className="stat-value">
                {subjects.length > 0 
                  ? (subjects.reduce((sum, subject) => sum + subject.average_score, 0) / subjects.length).toFixed(1)
                  : 0
                }%
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>Total Credit Hours</h3>
              <div className="stat-value">
                {subjects.reduce((sum, subject) => sum + subject.credit_hours, 0)}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>Total Assessments</h3>
              <div className="stat-value">
                {subjects.reduce((sum, subject) => sum + subject.total_grades, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="courses-section">
          <h3>My Enrolled Subjects</h3>
          <div className="courses-grid">
            {subjects.length > 0 ? subjects.map((subject, index) => (
              <div key={index} className="course-card">
                <div className="course-header">
                  <div className="course-icon">
                    <FaBook />
                  </div>
                  <div className="course-grade">
                    <span 
                      className="grade-letter"
                      style={{ 
                        backgroundColor: getGradeColor(subject.average_score),
                        color: 'white'
                      }}
                    >
                      {getGradeLetter(subject.average_score)}
                    </span>
                  </div>
                </div>
                
                <div className="course-info">
                  <h4>{subject.name}</h4>
                  <p className="course-code">{subject.code}</p>
                  <div className="course-details">
                    <div className="detail-item">
                      <span className="detail-label">Credit Hours:</span>
                      <span className="detail-value">{subject.credit_hours}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Assessments:</span>
                      <span className="detail-value">{subject.total_grades}</span>
                    </div>
                  </div>
                </div>

                <div className="course-progress">
                  <div className="progress-header">
                    <span className="progress-label">Current Average</span>
                    <span 
                      className="progress-value"
                      style={{ color: getGradeColor(subject.average_score) }}
                    >
                      {subject.average_score}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${subject.average_score}%`,
                        backgroundColor: getGradeColor(subject.average_score)
                      }}
                    ></div>
                  </div>
                </div>

                <div className="course-actions">
                  <button className="action-btn primary">
                    View Grades
                  </button>
                  <button className="action-btn secondary">
                    View Details
                  </button>
                </div>
              </div>
            )) : (
              <div className="no-courses">
                <div className="no-courses-icon">
                  <FaBook />
                </div>
                <h3>No Subjects Found</h3>
                <p>You don't have any enrolled subjects yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        {subjects.length > 0 && (
          <div className="performance-section">
            <h3>Performance Summary</h3>
            <div className="performance-grid">
              <div className="performance-chart">
                <h4>Subject Performance</h4>
                <div className="chart-container">
                  {subjects.map((subject, index) => (
                    <div key={index} className="chart-bar">
                      <div className="bar-label">{subject.code}</div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill"
                          style={{ 
                            height: `${subject.average_score}%`,
                            backgroundColor: getGradeColor(subject.average_score)
                          }}
                        ></div>
                      </div>
                      <div className="bar-value">{subject.average_score}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grade-distribution">
                <h4>Grade Distribution</h4>
                <div className="distribution-list">
                  {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'F'].map(grade => {
                    const count = subjects.filter(subject => getGradeLetter(subject.average_score) === grade).length;
                    return (
                      <div key={grade} className="distribution-item">
                        <span className="grade-label">{grade}</span>
                        <div className="grade-bar">
                          <div 
                            className="grade-bar-fill"
                            style={{ 
                              width: `${(count / subjects.length) * 100}%`,
                              backgroundColor: getGradeColor(grade === 'A+' ? 95 : grade === 'A' ? 87 : grade === 'A-' ? 82 : grade === 'B+' ? 77 : grade === 'B' ? 72 : grade === 'B-' ? 67 : grade === 'C+' ? 62 : grade === 'C' ? 57 : grade === 'C-' ? 52 : 40)
                            }}
                          ></div>
                        </div>
                        <span className="grade-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentCourses;