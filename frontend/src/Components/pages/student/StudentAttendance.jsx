import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaChartPie, FaFilter } from 'react-icons/fa';
import './StudentAttendance.css';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchAttendance();
  }, [dateFrom, dateTo, selectedSubject]);

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (selectedSubject) params.append('subject', selectedSubject);

      const response = await fetch(`${API_URL}my_attendance/?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance);
        setStatistics(data.statistics);
      } else {
        setError('Failed to load attendance');
      }
    } catch (err) {
      setError('Error loading attendance');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#3b82f6';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Average';
    if (percentage >= 60) return 'Below Average';
    return 'Poor';
  };

  const generateCalendarData = () => {
    const calendarData = {};
    attendance.forEach(record => {
      const date = record.date;
      if (!calendarData[date]) {
        calendarData[date] = [];
      }
      calendarData[date].push(record);
    });
    return calendarData;
  };

  const getMonthlyStats = () => {
    const monthlyStats = {};
    attendance.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { present: 0, absent: 0, total: 0 };
      }
      monthlyStats[month].total++;
      if (record.status === 'present') {
        monthlyStats[month].present++;
      } else {
        monthlyStats[month].absent++;
      }
    });
    return monthlyStats;
  };

  if (loading) return <Layout><div className="loading">Loading attendance...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  const calendarData = generateCalendarData();
  const monthlyStats = getMonthlyStats();

  return (
    <Layout>
      <div className="student-attendance">
        <div className="attendance-header">
          <h1>My Attendance Record</h1>
          <p>Track your attendance and maintain good academic standing</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon present">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>Present Days</h3>
              <div className="stat-value">{statistics.present_days || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon absent">
              <FaTimesCircle />
            </div>
            <div className="stat-content">
              <h3>Absent Days</h3>
              <div className="stat-value">{statistics.absent_days || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>Total Days</h3>
              <div className="stat-value">{statistics.total_days || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon percentage">
              <FaChartPie />
            </div>
            <div className="stat-content">
              <h3>Attendance Rate</h3>
              <div 
                className="stat-value"
                style={{ color: getAttendanceColor(statistics.attendance_percentage || 0) }}
              >
                {(statistics.attendance_percentage || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Status */}
        <div className="attendance-status">
          <div className="status-card">
            <div className="status-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${statistics.attendance_percentage || 0}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ stroke: getAttendanceColor(statistics.attendance_percentage || 0) }}
                />
                <text x="18" y="20.35" className="percentage-text">
                  {(statistics.attendance_percentage || 0).toFixed(0)}%
                </text>
              </svg>
            </div>
            <div className="status-info">
              <h3>Attendance Status</h3>
              <p className="status-label" style={{ color: getAttendanceColor(statistics.attendance_percentage || 0) }}>
                {getAttendanceStatus(statistics.attendance_percentage || 0)}
              </p>
              <div className="status-details">
                <div className="detail-item">
                  <span className="detail-label">Present:</span>
                  <span className="detail-value present">{statistics.present_days || 0} days</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Absent:</span>
                  <span className="detail-value absent">{statistics.absent_days || 0} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters">
            <div className="filter-group">
              <label>From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Subject</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="filter-select"
              >
                <option value="">All Subjects</option>
                {/* Add subject options here */}
              </select>
            </div>
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="monthly-stats">
          <h3>Monthly Attendance Summary</h3>
          <div className="monthly-grid">
            {Object.entries(monthlyStats).map(([month, stats]) => {
              const percentage = (stats.present / stats.total) * 100;
              return (
                <div key={month} className="monthly-card">
                  <h4>{month}</h4>
                  <div className="monthly-percentage" style={{ color: getAttendanceColor(percentage) }}>
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="monthly-details">
                    <span className="present">{stats.present}P</span>
                    <span className="absent">{stats.absent}A</span>
                    <span className="total">/{stats.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Table */}
        <div className="attendance-table-section">
          <div className="section-header">
            <h3>Detailed Attendance Record</h3>
          </div>
          
          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? attendance.map((record, index) => (
                  <tr key={index}>
                    <td className="date-cell">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="day-cell">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="subject-cell">
                      {record.subject || 'General'}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${record.status}`}>
                        {record.status === 'present' ? (
                          <>
                            <FaCheckCircle /> Present
                          </>
                        ) : (
                          <>
                            <FaTimesCircle /> Absent
                          </>
                        )}
                      </span>
                    </td>
                    <td className="remarks-cell">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No attendance records found for the selected criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Warning */}
        {statistics.attendance_percentage < 75 && (
          <div className="attendance-warning">
            <div className="warning-icon">
              <FaTimesCircle />
            </div>
            <div className="warning-content">
              <h4>Attendance Warning</h4>
              <p>
                Your attendance is below the required 75% minimum. 
                Current attendance: {(statistics.attendance_percentage || 0).toFixed(1)}%
              </p>
              <p>Please ensure regular attendance to maintain good academic standing.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentAttendance;