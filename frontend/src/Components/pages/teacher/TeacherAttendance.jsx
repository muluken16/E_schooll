import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import teacherAPI from './TeacherAPI';
import { 
  FaCalendarCheck, FaFilter, FaPlus, FaUsers, 
  FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaDownload 
} from 'react-icons/fa';
import './TeacherAttendance.css';

const TeacherAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Bulk attendance marking
  const [markingMode, setMarkingMode] = useState(false);
  const [bulkAttendance, setBulkAttendance] = useState([]);

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    fetchAttendance();
  }, [selectedSubject, selectedSection, selectedDate, statusFilter]);

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

  const fetchAttendance = async () => {
    try {
      const filters = {};
      if (selectedSubject) filters.subject = selectedSubject;
      if (selectedSection) filters.section = selectedSection;
      if (selectedDate) {
        filters.date_from = selectedDate;
        filters.date_to = selectedDate;
      }
      if (statusFilter) filters.status = statusFilter;

      const data = await teacherAPI.getAttendance(filters);
      setAttendanceData(data.attendance_records || []);
      setSummary(data.summary || {});
    } catch (err) {
      setError('Error loading attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    if (!selectedSubject || !selectedSection) {
      alert('Please select subject and section first');
      return;
    }

    try {
      const attendanceData = {
        student: studentId,
        subject: selectedSubject,
        section: selectedSection,
        date: selectedDate,
        status: status
      };

      await teacherAPI.markAttendance(attendanceData);
      fetchAttendance(); // Refresh data
    } catch (err) {
      alert('Error marking attendance: ' + err.message);
    }
  };

  const handleBulkAttendance = async () => {
    if (bulkAttendance.length === 0) {
      alert('No attendance data to submit');
      return;
    }

    try {
      const result = await teacherAPI.bulkMarkAttendance(bulkAttendance);
      alert(`Successfully marked attendance for ${result.created || bulkAttendance.length} students`);
      setBulkAttendance([]);
      setMarkingMode(false);
      fetchAttendance();
    } catch (err) {
      alert('Error submitting bulk attendance: ' + err.message);
    }
  };

  const addToBulkAttendance = (studentId, studentName, status) => {
    const existingIndex = bulkAttendance.findIndex(item => item.student === studentId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      const updated = [...bulkAttendance];
      updated[existingIndex].status = status;
      setBulkAttendance(updated);
    } else {
      // Add new entry
      setBulkAttendance([...bulkAttendance, {
        student: studentId,
        subject: selectedSubject,
        section: selectedSection,
        date: selectedDate,
        status: status,
        student_name: studentName
      }]);
    }
  };

  const getStatusColor = (status) => {
    return status === 'present' ? '#10b981' : '#ef4444';
  };

  const getStatusIcon = (status) => {
    return status === 'present' ? <FaCheckCircle /> : <FaTimesCircle />;
  };

  if (loading) return <TeacherLayout><div className="loading">Loading attendance...</div></TeacherLayout>;
  if (error) return <TeacherLayout><div className="error">{error}</div></TeacherLayout>;

  return (
    <TeacherLayout>
      <div className="teacher-attendance">
        <div className="attendance-header">
          <h1>Attendance Management</h1>
          <p>Mark and manage student attendance for your classes</p>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card total">
            <div className="summary-icon">
              <FaUsers />
            </div>
            <div className="summary-content">
              <h3>Total Records</h3>
              <div className="summary-value">{summary.total_records || 0}</div>
            </div>
          </div>
          
          <div className="summary-card present">
            <div className="summary-icon">
              <FaCheckCircle />
            </div>
            <div className="summary-content">
              <h3>Present</h3>
              <div className="summary-value">{summary.present_count || 0}</div>
            </div>
          </div>
          
          <div className="summary-card absent">
            <div className="summary-icon">
              <FaTimesCircle />
            </div>
            <div className="summary-content">
              <h3>Absent</h3>
              <div className="summary-value">{summary.absent_count || 0}</div>
            </div>
          </div>
          
          <div className="summary-card rate">
            <div className="summary-icon">
              <FaCalendarCheck />
            </div>
            <div className="summary-content">
              <h3>Attendance Rate</h3>
              <div className="summary-value">{summary.attendance_rate || 0}%</div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
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
              <label>Class/Section:</label>
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
              <label>Date:</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>

          <div className="actions">
            <button 
              className={`bulk-mode-btn ${markingMode ? 'active' : ''}`}
              onClick={() => setMarkingMode(!markingMode)}
            >
              <FaPlus /> {markingMode ? 'Exit Bulk Mode' : 'Bulk Mark'}
            </button>
            
            {markingMode && bulkAttendance.length > 0 && (
              <button className="submit-bulk-btn" onClick={handleBulkAttendance}>
                Submit {bulkAttendance.length} Records
              </button>
            )}
            
            <button className="export-btn">
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Bulk Attendance Preview */}
        {markingMode && bulkAttendance.length > 0 && (
          <div className="bulk-preview">
            <h3>Bulk Attendance Preview ({bulkAttendance.length} students)</h3>
            <div className="bulk-list">
              {bulkAttendance.map((item, index) => (
                <div key={index} className="bulk-item">
                  <span className="student-name">{item.student_name}</span>
                  <span className={`status ${item.status}`}>
                    {getStatusIcon(item.status)} {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="attendance-table-section">
          <div className="section-header">
            <h3>Attendance Records</h3>
            <span className="record-count">{attendanceData.length} records</span>
          </div>
          
          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Date</th>
                  <th>Status</th>
                  {markingMode && <th>Quick Mark</th>}
                </tr>
              </thead>
              <tbody>
                {attendanceData.length > 0 ? attendanceData.map((record, index) => (
                  <tr key={index}>
                    <td className="student-cell">
                      <span className="student-name">{record.student_name}</span>
                    </td>
                    <td>{record.subject_name}</td>
                    <td>{record.section_name}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <span 
                        className={`status-badge ${record.status}`}
                        style={{ color: getStatusColor(record.status) }}
                      >
                        {getStatusIcon(record.status)} {record.status}
                      </span>
                    </td>
                    {markingMode && (
                      <td className="quick-actions">
                        <button 
                          className="quick-present"
                          onClick={() => addToBulkAttendance(record.student, record.student_name, 'present')}
                        >
                          <FaCheckCircle /> P
                        </button>
                        <button 
                          className="quick-absent"
                          onClick={() => addToBulkAttendance(record.student, record.student_name, 'absent')}
                        >
                          <FaTimesCircle /> A
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={markingMode ? "6" : "5"} className="no-data">
                      No attendance records found for the selected criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Mark Section for Today */}
        {selectedDate === new Date().toISOString().split('T')[0] && selectedSubject && selectedSection && (
          <div className="quick-mark-section">
            <h3><FaCalendarAlt /> Quick Mark for Today</h3>
            <p>Mark attendance for all students in the selected class</p>
            <div className="quick-mark-actions">
              <button 
                className="mark-all-present"
                onClick={() => {
                  // This would need to fetch students and mark all present
                  alert('Mark all present functionality would be implemented here');
                }}
              >
                <FaCheckCircle /> Mark All Present
              </button>
              <button 
                className="mark-all-absent"
                onClick={() => {
                  // This would need to fetch students and mark all absent
                  alert('Mark all absent functionality would be implemented here');
                }}
              >
                <FaTimesCircle /> Mark All Absent
              </button>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherAttendance;