import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { FaCalculator, FaTrophy, FaChartLine } from 'react-icons/fa';
import './StudentGPACalculator.css';

const StudentGPACalculator = () => {
  const [grades, setGrades] = useState([]);
  const [gpaData, setGpaData] = useState({});
  const [semesterData, setSemesterData] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchGradesAndCalculateGPA();
  }, []);

  const gradePoints = {
    'A+': 4.0, 'A': 3.7, 'A-': 3.3,
    'B+': 3.0, 'B': 2.7, 'B-': 2.3,
    'C+': 2.0, 'C': 1.7, 'C-': 1.3, 
    'F': 0.0
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
      subjects: semesterGroups[semester].length,
      grades: semesterGroups[semester]
    }));
  };

  const fetchGradesAndCalculateGPA = async () => {
    try {
      const response = await fetch(`${API_URL}my_grades/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades);
        
        // Calculate overall GPA
        const overallGPA = calculateGPA(data.grades);
        
        // Calculate semester-wise GPA
        const semesterGPAs = calculateSemesterGPA(data.grades);
        setSemesterData(semesterGPAs);
        
        // Calculate CGPA (same as overall GPA for now)
        const cgpa = overallGPA;
        
        setGpaData({
          currentGPA: overallGPA,
          cgpa: cgpa,
          totalCredits: data.grades.length * 3, // Assuming 3 credits per subject
          totalSubjects: new Set(data.grades.map(g => g.subject_name)).size
        });
      }
    } catch (err) {
      console.error('Error calculating GPA:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGPAStatus = (gpa) => {
    if (gpa >= 3.5) return { status: 'Excellent', color: '#10b981' };
    if (gpa >= 3.0) return { status: 'Good', color: '#3b82f6' };
    if (gpa >= 2.5) return { status: 'Average', color: '#f59e0b' };
    if (gpa >= 2.0) return { status: 'Below Average', color: '#f97316' };
    return { status: 'Poor', color: '#ef4444' };
  };

  if (loading) return <Layout><div className="loading">Calculating GPA...</div></Layout>;

  const gpaStatus = getGPAStatus(parseFloat(gpaData.currentGPA));

  return (
    <Layout>
      <div className="student-gpa-calculator">
        <div className="gpa-header">
          <h1>GPA & CGPA Calculator</h1>
          <p>Track your academic performance with detailed GPA analysis</p>
        </div>

        {/* GPA Overview Cards */}
        <div className="gpa-overview">
          <div className="gpa-card current">
            <div className="gpa-icon">
              <FaCalculator />
            </div>
            <div className="gpa-content">
              <h3>Current GPA</h3>
              <div className="gpa-value" style={{ color: gpaStatus.color }}>
                {gpaData.currentGPA}
              </div>
              <div className="gpa-status" style={{ color: gpaStatus.color }}>
                {gpaStatus.status}
              </div>
            </div>
          </div>

          <div className="gpa-card cgpa">
            <div className="gpa-icon">
              <FaTrophy />
            </div>
            <div className="gpa-content">
              <h3>CGPA</h3>
              <div className="gpa-value" style={{ color: gpaStatus.color }}>
                {gpaData.cgpa}
              </div>
              <div className="gpa-status">
                Cumulative Grade Point Average
              </div>
            </div>
          </div>

          <div className="gpa-card credits">
            <div className="gpa-icon">
              <FaChartLine />
            </div>
            <div className="gpa-content">
              <h3>Total Credits</h3>
              <div className="gpa-value">
                {gpaData.totalCredits}
              </div>
              <div className="gpa-status">
                {gpaData.totalSubjects} Subjects
              </div>
            </div>
          </div>
        </div>

        {/* Semester-wise GPA */}
        <div className="semester-gpa-section">
          <h3>Semester-wise GPA Breakdown</h3>
          <div className="semester-grid">
            {semesterData.map((semester, index) => (
              <div key={index} className="semester-card">
                <div className="semester-header">
                  <h4>{semester.semester}</h4>
                  <div 
                    className="semester-gpa"
                    style={{ color: getGPAStatus(parseFloat(semester.gpa)).color }}
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
                      backgroundColor: getGPAStatus(parseFloat(semester.gpa)).color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GPA Scale Reference */}
        <div className="gpa-scale-section">
          <h3>GPA Scale Reference</h3>
          <div className="scale-grid">
            <div className="scale-item">
              <span className="grade-letter">A+</span>
              <span className="grade-points">4.0</span>
              <span className="grade-percentage">90-100%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">A</span>
              <span className="grade-points">3.7</span>
              <span className="grade-percentage">85-89%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">A-</span>
              <span className="grade-points">3.3</span>
              <span className="grade-percentage">80-84%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">B+</span>
              <span className="grade-points">3.0</span>
              <span className="grade-percentage">75-79%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">B</span>
              <span className="grade-points">2.7</span>
              <span className="grade-percentage">70-74%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">B-</span>
              <span className="grade-points">2.3</span>
              <span className="grade-percentage">65-69%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">C+</span>
              <span className="grade-points">2.0</span>
              <span className="grade-percentage">60-64%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">C</span>
              <span className="grade-points">1.7</span>
              <span className="grade-percentage">55-59%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">C-</span>
              <span className="grade-points">1.3</span>
              <span className="grade-percentage">50-54%</span>
            </div>
            <div className="scale-item">
              <span className="grade-letter">F</span>
              <span className="grade-points">0.0</span>
              <span className="grade-percentage">Below 50%</span>
            </div>
          </div>
        </div>

        {/* Academic Goals Section */}
        <div className="academic-goals-section">
          <h3>Academic Goals</h3>
          <div className="goals-content">
            <div className="goal-item">
              <h4>Target GPA for Next Semester</h4>
              <div className="goal-input">
                <input type="number" step="0.1" min="0" max="4" placeholder="3.5" />
                <button className="set-goal-btn">Set Goal</button>
              </div>
            </div>
            <div className="goal-item">
              <h4>Improvement Needed</h4>
              <p>To reach a 3.5 GPA, you need to improve your average by 0.3 points.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentGPACalculator;