import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import teacherAPI from './TeacherAPI';
import { 
  FaUsers, FaBook, FaGraduationCap, FaUserTie, 
  FaCalendarAlt, FaChartLine, FaEye, FaFilter,
  FaSearch, FaSort, FaInfoCircle
} from 'react-icons/fa';
import './TeacherClasses.css';

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherAPI.getMyClasses();
      setClasses(data);
    } catch (err) {
      setError('Error loading classes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedClasses = classes
    .filter(classItem => {
      const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           classItem.class_group.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' ||
        (filterBy === 'advisor' && classItem.is_advisor) ||
        (filterBy === 'name_caller' && classItem.is_name_caller) ||
        (filterBy === 'teaching' && classItem.subjects_taught.length > 0);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'students':
          return b.student_count - a.student_count;
        case 'level':
          return a.level.localeCompare(b.level);
        case 'subjects':
          return b.subjects_taught.length - a.subjects_taught.length;
        default:
          return 0;
      }
    });

  const getRoleText = (classItem) => {
    const roles = [];
    if (classItem.is_advisor) roles.push('Class Advisor');
    if (classItem.is_name_caller) roles.push('Name Caller');
    if (classItem.subjects_taught.length > 0) roles.push('Subject Teacher');
    return roles.join(', ') || 'Teaching';
  };

  const getRoleColor = (classItem) => {
    if (classItem.is_advisor) return '#10b981';
    if (classItem.is_name_caller) return '#f59e0b';
    return '#6366f1';
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="classes-loading">
          <div className="loading-spinner"></div>
          <p>Loading your classes...</p>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout>
        <div className="classes-error">
          <FaInfoCircle />
          <h3>Error Loading Classes</h3>
          <p>{error}</p>
          <button onClick={fetchClasses} className="retry-btn">
            Try Again
          </button>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="teacher-classes">
        {/* Header */}
        <div className="classes-header">
          <div className="header-content">
            <h1><FaGraduationCap /> My Classes</h1>
            <p>Manage and view all your assigned classes and sections</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{classes.length}</span>
              <span className="stat-label">Total Classes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {classes.reduce((sum, cls) => sum + cls.student_count, 0)}
              </span>
              <span className="stat-label">Total Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {classes.filter(cls => cls.is_advisor).length}
              </span>
              <span className="stat-label">Advisory Classes</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="classes-controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <FaFilter />
              <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                <option value="all">All Classes</option>
                <option value="advisor">Advisory Classes</option>
                <option value="name_caller">Name Caller</option>
                <option value="teaching">Teaching Classes</option>
              </select>
            </div>

            <div className="sort-group">
              <FaSort />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="students">Sort by Students</option>
                <option value="level">Sort by Level</option>
                <option value="subjects">Sort by Subjects</option>
              </select>
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="classes-grid">
          {filteredAndSortedClasses.length > 0 ? (
            filteredAndSortedClasses.map((classItem) => (
              <div key={classItem.id} className="class-card">
                <div className="class-header">
                  <div className="class-title">
                    <h3>{classItem.name}</h3>
                    <span className="class-level">{classItem.level}</span>
                  </div>
                  <div 
                    className="class-role"
                    style={{ backgroundColor: getRoleColor(classItem) }}
                  >
                    {classItem.is_advisor && <FaUserTie />}
                    {classItem.is_name_caller && <FaCalendarAlt />}
                    {!classItem.is_advisor && !classItem.is_name_caller && <FaBook />}
                  </div>
                </div>

                <div className="class-info">
                  <div className="info-row">
                    <span className="info-label">Program:</span>
                    <span className="info-value">{classItem.program}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Role:</span>
                    <span className="info-value">{getRoleText(classItem)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Students:</span>
                    <span className="info-value">
                      <FaUsers /> {classItem.student_count}
                    </span>
                  </div>
                </div>

                {classItem.subjects_taught.length > 0 && (
                  <div className="subjects-taught">
                    <h4>Subjects Teaching:</h4>
                    <div className="subjects-list">
                      {classItem.subjects_taught.map((subject, index) => (
                        <span key={index} className="subject-tag">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="class-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => window.location.href = `/teacher/students?section=${classItem.id}`}
                  >
                    <FaUsers /> View Students
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => window.location.href = `/teacher/attendance?section=${classItem.id}`}
                  >
                    <FaCalendarAlt /> Attendance
                  </button>
                  <button 
                    className="action-btn tertiary"
                    onClick={() => window.location.href = `/teacher/grades?section=${classItem.id}`}
                  >
                    <FaGraduationCap /> Grades
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-classes">
              <FaGraduationCap className="no-classes-icon" />
              <h3>No Classes Found</h3>
              <p>
                {searchTerm || filterBy !== 'all' 
                  ? 'No classes match your current filters.' 
                  : 'You have no classes assigned yet.'}
              </p>
              {(searchTerm || filterBy !== 'all') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                  }}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredAndSortedClasses.length > 0 && (
          <div className="classes-summary">
            <div className="summary-stats">
              <div className="summary-item">
                <FaGraduationCap />
                <span>
                  Showing {filteredAndSortedClasses.length} of {classes.length} classes
                </span>
              </div>
              <div className="summary-item">
                <FaUsers />
                <span>
                  {filteredAndSortedClasses.reduce((sum, cls) => sum + cls.student_count, 0)} students total
                </span>
              </div>
              <div className="summary-item">
                <FaBook />
                <span>
                  {[...new Set(filteredAndSortedClasses.flatMap(cls => cls.subjects_taught))].length} unique subjects
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherClasses;