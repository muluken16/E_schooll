import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import teacherAPI from './TeacherAPI';
import { 
  FaGraduationCap, FaPlus, FaEdit, FaChartBar, 
  FaFilter, FaDownload, FaTrophy, FaUsers 
} from 'react-icons/fa';
import './TeacherGrades.css';

const TeacherGrades = () => {
  const [gradesData, setGradesData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedGradeType, setSelectedGradeType] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  
  // Grade entry modal
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    student: '',
    subject: '',
    section: '',
    grade_type: '',
    score: '',
    full_mark: '100'
  });

  const gradeTypes = [
    { value: 'assignment', label: 'Assignment' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'midterm', label: 'Midterm Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'project', label: 'Project' }
  ];

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    fetchGrades();
  }, [selectedSubject, selectedSection, selectedGradeType, selectedStudent]);

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

  const fetchGrades = async () => {
    try {
      const filters = {};
      if (selectedSubject) filters.subject = selectedSubject;
      if (selectedSection) filters.section = selectedSection;
      if (selectedGradeType) filters.grade_type = selectedGradeType;
      if (selectedStudent) filters.student = selectedStudent;

      const data = await teacherAPI.getGrades(filters);
      setGradesData(data.grades || []);
      setStatistics(data.statistics || {});
    } catch (err) {
      setError('Error loading grades');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    
    try {
      const gradeData = {
        ...gradeForm,
        ...(editingGrade && { id: editingGrade.id })
      };

      if (editingGrade) {
        await teacherAPI.updateGrade(gradeData);
      } else {
        await teacherAPI.addGrade(gradeData);
      }

      setShowGradeModal(false);
      setEditingGrade(null);
      setGradeForm({
        student: '',
        subject: '',
        section: '',
        grade_type: '',
        score: '',
        full_mark: '100'
      });
      fetchGrades();
    } catch (err) {
      alert('Error saving grade: ' + err.message);
    }
  };

  const handleEditGrade = (grade) => {
    setEditingGrade(grade);
    setGradeForm({
      student: grade.student,
      subject: grade.subject,
      section: grade.section,
      grade_type: grade.grade_type,
      score: grade.score,
      full_mark: grade.full_mark
    });
    setShowGradeModal(true);
  };

  const getGradeColor = (score, fullMark) => {
    const percentage = (score / fullMark) * 100;
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#3b82f6';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
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

  if (loading) return <TeacherLayout><div className="loading">Loading grades...</div></TeacherLayout>;
  if (error) return <TeacherLayout><div className="error">{error}</div></TeacherLayout>;

  return (
    <TeacherLayout>
      <div className="teacher-grades">
        <div className="grades-header">
          <h1>Grade Management</h1>
          <p>Enter and manage student grades for your subjects</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <FaGraduationCap />
            </div>
            <div className="stat-content">
              <h3>Total Grades</h3>
              <div className="stat-value">{statistics.total_grades || 0}</div>
            </div>
          </div>
          
          <div className="stat-card average">
            <div className="stat-icon">
              <FaChartBar />
            </div>
            <div className="stat-content">
              <h3>Class Average</h3>
              <div className="stat-value">{statistics.average_score || 0}%</div>
            </div>
          </div>
          
          <div className="stat-card distribution">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <h3>A Grades</h3>
              <div className="stat-value">{statistics.grade_distribution?.A || 0}</div>
            </div>
          </div>
          
          <div className="stat-card students">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>Students</h3>
              <div className="stat-value">
                {gradesData.reduce((acc, grade) => {
                  if (!acc.includes(grade.student_name)) acc.push(grade.student_name);
                  return acc;
                }, []).length}
              </div>
            </div>
          </div>
        </div>

        {/* Grade Distribution Chart */}
        {statistics.grade_distribution && (
          <div className="grade-distribution-section">
            <h3>Grade Distribution</h3>
            <div className="distribution-chart">
              {Object.entries(statistics.grade_distribution).map(([grade, count]) => (
                <div key={grade} className="distribution-bar">
                  <div className="bar-label">{grade}</div>
                  <div 
                    className="bar-fill" 
                    style={{ 
                      height: `${(count / Math.max(...Object.values(statistics.grade_distribution))) * 100}%`,
                      backgroundColor: grade === 'A' ? '#10b981' : 
                                     grade === 'B' ? '#3b82f6' : 
                                     grade === 'C' ? '#f59e0b' : 
                                     grade === 'D' ? '#f97316' : '#ef4444'
                    }}
                  ></div>
                  <div className="bar-count">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="controls-section">
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

            <div className="filter-group">
              <label>Grade Type:</label>
              <select 
                value={selectedGradeType} 
                onChange={(e) => setSelectedGradeType(e.target.value)}
              >
                <option value="">All Types</option>
                {gradeTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="actions">
            <button 
              className="add-grade-btn"
              onClick={() => setShowGradeModal(true)}
            >
              <FaPlus /> Add Grade
            </button>
            <button className="export-btn">
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Grades Table */}
        <div className="grades-table-section">
          <div className="section-header">
            <h3>Grade Records</h3>
            <span className="record-count">{gradesData.length} records</span>
          </div>
          
          <div className="grades-table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Full Mark</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gradesData.length > 0 ? gradesData.map((grade, index) => {
                  const percentage = (grade.score / grade.full_mark) * 100;
                  return (
                    <tr key={index}>
                      <td className="student-cell">
                        <span className="student-name">{grade.student_name}</span>
                      </td>
                      <td>{grade.subject_name}</td>
                      <td>{grade.section_name}</td>
                      <td>
                        <span className={`grade-type ${grade.grade_type}`}>
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
                      <td>{new Date(grade.date_recorded).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditGrade(grade)}
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No grade records found for the selected criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade Entry Modal */}
        {showGradeModal && (
          <div className="modal-overlay">
            <div className="grade-modal">
              <div className="modal-header">
                <h3>{editingGrade ? 'Edit Grade' : 'Add New Grade'}</h3>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowGradeModal(false);
                    setEditingGrade(null);
                  }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmitGrade} className="grade-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Subject *</label>
                    <select 
                      value={gradeForm.subject}
                      onChange={(e) => setGradeForm({...gradeForm, subject: e.target.value})}
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Section *</label>
                    <select 
                      value={gradeForm.section}
                      onChange={(e) => setGradeForm({...gradeForm, section: e.target.value})}
                      required
                    >
                      <option value="">Select Section</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Grade Type *</label>
                    <select 
                      value={gradeForm.grade_type}
                      onChange={(e) => setGradeForm({...gradeForm, grade_type: e.target.value})}
                      required
                    >
                      <option value="">Select Type</option>
                      {gradeTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Student *</label>
                    <input 
                      type="text"
                      value={gradeForm.student}
                      onChange={(e) => setGradeForm({...gradeForm, student: e.target.value})}
                      placeholder="Student ID"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Score *</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={gradeForm.score}
                      onChange={(e) => setGradeForm({...gradeForm, score: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Full Mark *</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="1"
                      value={gradeForm.full_mark}
                      onChange={(e) => setGradeForm({...gradeForm, full_mark: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowGradeModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingGrade ? 'Update Grade' : 'Add Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherGrades;