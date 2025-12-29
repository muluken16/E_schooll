import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { FaChartLine, FaFilter, FaDownload, FaTrophy, FaCalculator, FaAward } from 'react-icons/fa';
import './StudentGrades.css';

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [gpaData, setGpaData] = useState({});
  const [semesterData, setSemesterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchGrades();
    fetchSubjects();
  }, [selectedSemester, selectedSubject, selectedYear]);

  const fetchGrades = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester', selectedSemester);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedYear) params.append('academic_year', selectedYear);

      const response = await fetch(`${API_URL}my_grades/?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades);
        setStatistics(data.statistics);
        
        // Calculate GPA data
        const overallGPA = calculateGPA(data.grades);
        const semesterGPAs = calculateSemesterGPA(data.grades);
        setSemesterData(semesterGPAs);
        
        setGpaData({
          currentGPA: overallGPA,
          cgpa: overallGPA, // Same as overall for now
          totalCredits: new Set(data.grades.map(g => g.subject_name)).size * 3,
          totalSubjects: new Set(data.grades.map(g => g.subject_name)).size
        });
      } else {
        setError('Failed to load grades');
      }
    } catch (err) {
      setError('Error loading grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}my_subjects/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const getGradeColor = (score, fullMark) => {
    const percentage = (score / fullMark) * 100;
    if (percentage >= 90) return '#10b981'; // Green
    if (percentage >= 80) return '#3b82f6'; // Blue
    if (percentage >= 70) return '#f59e0b'; // Yellow
    if (percentage >= 60) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getGradeLetter = (score, fullMark) => {
    const percentage = (score / fullMark) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
  };

  const gradePoints = {
    'A+': 4.0, 'A': 3.7, 'A-': 3.3,
    'B+': 3.0, 'B': 2.7, 'B-': 2.3,
    'C+': 2.0, 'C': 1.7, 'C-': 1.3, 
    'F': 0.0
  };

  const calculateGPA = (gradesList, creditHours = {}) => {
    let totalPoints = 0;
    let totalCredits = 0;

    // Group grades by subject to get final grades
    const subjectGrades = {};
    gradesList.forEach(grade => {
      if (!subjectGrades[grade.subject_name]) {
        subjectGrades[grade.subject_name] = [];
      }
      subjectGrades[grade.subject_name].push(grade);
    });

    // Calculate final grade for each subject
    Object.keys(subjectGrades).forEach(subject => {
      const subjectGradesList = subjectGrades[subject];
      const avgScore = subjectGradesList.reduce((sum, g) => sum + (g.score / g.full_mark * 100), 0) / subjectGradesList.length;
      const gradeLetter = getGradeLetter(avgScore, 100);
      const points = gradePoints[gradeLetter] || 0;
      const credits = creditHours[subject] || 3; // Default 3 credits

      totalPoints += points * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  };

  const calculateSemesterGPA = (gradesList) => {
    const semesterGroups = {};
    
    gradesList.forEach(grade => {
      const semester = grade.semester_name || 'Current';
      if (!semesterGroups[semester]) {
        semesterGroups[semester] = [];
      }
      semesterGroups[semester].push(grade);
    });

    return Object.keys(semesterGroups).map(semester => ({
      semester,
      gpa: calculateGPA(semesterGroups[semester]),
      subjects: new Set(semesterGroups[semester].map(g => g.subject_name)).size,
      grades: semesterGroups[semester]
    }));
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.5) return '#10b981';
    if (gpa >= 3.0) return '#3b82f6';
    if (gpa >= 2.5) return '#f59e0b';
    if (gpa >= 2.0) return '#f97316';
    return '#ef4444';
  };

  if (loading) return <Layout><div className="loading">Loading grades...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  return (
    <Layout>
      <div className="student-grades">
        <div className="grades-header">
          <h1>My Academic Performance</h1>
          <p>Track your grades and academic progress</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>Overall Average</h3>
              <div className="stat-value">{statistics.average_score || 0}%</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaCalculator />
            </div>
            <div className="stat-content">
              <h3>Current GPA</h3>
              <div className="stat-value" style={{ color: getGPAColor(parseFloat(gpaData.currentGPA)) }}>
                {gpaData.currentGPA || '0.00'}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaAward />
            </div>
            <div className="stat-content">
              <h3>CGPA</h3>
              <div className="stat-value" style={{ color: getGPAColor(parseFloat(gpaData.cgpa)) }}>
                {gpaData.cgpa || '0.00'}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3>Total Assessments</h3>
              <div className="stat-value">{statistics.total_grades || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaFilter />
            </div>
            <div className="stat-content">
              <h3>Subjects</h3>
              <div className="stat-value">{statistics.subjects_count || 0}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters">
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="filter-select"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
            
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-select"
            >
              <option value="">All Years</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2023/2024">2023/2024</option>
              <option value="2022/2023">2022/2023</option>
            </select>
          </div>
        </div>

        {/* Subject Performance Overview */}
        <div className="subjects-overview">
          <h3>Subject Performance</h3>
          <div className="subjects-grid">
            {subjects.map(subject => (
              <div key={subject.id} className="subject-card">
                <div className="subject-header">
                  <h4>{subject.name}</h4>
                  <span className="subject-code">{subject.code}</span>
                </div>
                <div className="subject-stats">
                  <div className="subject-average">
                    <span className="average-label">Average</span>
                    <span 
                      className="average-value"
                      style={{ color: getGradeColor(subject.average_score, 100) }}
                    >
                      {subject.average_score}%
                    </span>
                  </div>
                  <div className="subject-grade">
                    <span 
                      className="grade-letter"
                      style={{ 
                        backgroundColor: getGradeColor(subject.average_score, 100),
                        color: 'white'
                      }}
                    >
                      {getGradeLetter(subject.average_score, 100)}
                    </span>
                  </div>
                </div>
                <div className="subject-assessments">
                  {subject.total_grades} assessments
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semester GPA Breakdown */}
        {semesterData.length > 0 && (
          <div className="semester-gpa-section">
            <h3>Semester-wise GPA Breakdown</h3>
            <div className="semester-grid">
              {semesterData.map((semester, index) => (
                <div key={index} className="semester-card">
                  <div className="semester-header">
                    <h4>{semester.semester}</h4>
                    <div 
                      className="semester-gpa"
                      style={{ color: getGPAColor(parseFloat(semester.gpa)) }}
                    >
                      {semester.gpa}
                    </div>
                  </div>
                  <div className="semester-details">
                    <span>{semester.subjects} subjects</span>
                    <span>{semester.grades.length} assessments</span>
                  </div>
                  <div className="semester-progress">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${(parseFloat(semester.gpa) / 4.0) * 100}%`,
                        backgroundColor: getGPAColor(parseFloat(semester.gpa))
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grades Table */}
        <div className="grades-table-section">
          <div className="section-header">
            <h3>Detailed Grades</h3>
            <button className="download-btn">
              <FaDownload /> Export Grades
            </button>
          </div>
          
          <div className="grades-table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Assessment Type</th>
                  <th>Score</th>
                  <th>Full Mark</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Semester</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {grades.length > 0 ? grades.map((grade, index) => {
                  const percentage = (grade.score / grade.full_mark) * 100;
                  return (
                    <tr key={index}>
                      <td className="subject-cell">
                        <span className="subject-name">{grade.subject_name}</span>
                      </td>
                      <td>
                        <span className={`assessment-type ${grade.grade_type}`}>
                          {grade.grade_type}
                        </span>
                      </td>
                      <td className="score-cell">{grade.score}</td>
                      <td className="full-mark-cell">{grade.full_mark}</td>
                      <td className="percentage-cell">
                        <span 
                          className="percentage-value"
                          style={{ color: getGradeColor(grade.score, grade.full_mark) }}
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span 
                          className="grade-badge"
                          style={{ 
                            backgroundColor: getGradeColor(grade.score, grade.full_mark),
                            color: 'white'
                          }}
                        >
                          {getGradeLetter(grade.score, grade.full_mark)}
                        </span>
                      </td>
                      <td>{grade.semester_name}</td>
                      <td>{new Date(grade.date_recorded).toLocaleDateString()}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No grades found for the selected criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentGrades;