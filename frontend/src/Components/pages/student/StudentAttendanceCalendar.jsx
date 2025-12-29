import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudentAttendanceCalendar.css';

const StudentAttendanceCalendar = () => {
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState({});
  const [riskPrediction, setRiskPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(`${API_URL}my_attendance/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance);
        calculateMonthlyStats(data.attendance);
        calculateRiskPrediction(data.statistics);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyStats = (attendanceData) => {
    const stats = {};
    attendanceData.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!stats[monthKey]) {
        stats[monthKey] = { present: 0, absent: 0, total: 0 };
      }
      
      stats[monthKey].total++;
      if (record.status === 'present') {
        stats[monthKey].present++;
      } else {
        stats[monthKey].absent++;
      }
    });
    
    setMonthlyStats(stats);
  };

  const calculateRiskPrediction = (statistics) => {
    const currentPercentage = statistics.attendance_percentage || 0;
    const trend = calculateTrend();
    
    let riskLevel = 'low';
    let message = 'Your attendance is on track!';
    let recommendation = 'Keep up the good work!';
    
    if (currentPercentage < 75) {
      riskLevel = 'high';
      message = 'Critical: Below minimum attendance requirement!';
      recommendation = 'Attend all remaining classes to avoid academic penalties.';
    } else if (currentPercentage < 80) {
      riskLevel = 'medium';
      message = 'Warning: Attendance is approaching minimum threshold.';
      recommendation = 'Try to attend more classes to maintain good standing.';
    } else if (trend < 0) {
      riskLevel = 'medium';
      message = 'Declining trend detected in recent attendance.';
      recommendation = 'Focus on improving attendance in coming weeks.';
    }
    
    setRiskPrediction({
      level: riskLevel,
      message,
      recommendation,
      currentPercentage,
      trend
    });
  };

  const calculateTrend = () => {
    // Simple trend calculation based on last 10 days vs previous 10 days
    const recentRecords = attendance.slice(0, 10);
    const previousRecords = attendance.slice(10, 20);
    
    const recentPercentage = recentRecords.filter(r => r.status === 'present').length / recentRecords.length * 100;
    const previousPercentage = previousRecords.filter(r => r.status === 'present').length / previousRecords.length * 100;
    
    return recentPercentage - previousPercentage;
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const dateString = date.toISOString().split('T')[0];
    const record = attendance.find(r => r.date === dateString);
    
    if (!record) return '';
    
    return `attendance-tile ${record.status}`;
  };

  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateString = date.toISOString().split('T')[0];
    const record = attendance.find(r => r.date === dateString);
    
    if (!record) return null;
    
    return (
      <div className="tile-indicator">
        {record.status === 'present' ? '✓' : '✗'}
      </div>
    );
  };

  const getSelectedDateRecords = () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    return attendance.filter(r => r.date === dateString);
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  if (loading) return <Layout><div className="loading">Loading attendance calendar...</div></Layout>;

  const selectedDateRecords = getSelectedDateRecords();

  return (
    <Layout>
      <div className="student-attendance-calendar">
        <div className="calendar-header">
          <h1>Attendance Calendar</h1>
          <p>Visual representation of your attendance pattern</p>
        </div>

        {/* Risk Prediction Alert */}
        {riskPrediction && riskPrediction.level !== 'low' && (
          <div className={`risk-alert ${riskPrediction.level}`}>
            <div className="alert-icon">
              <FaExclamationTriangle />
            </div>
            <div className="alert-content">
              <h4>Attendance Risk Alert</h4>
              <p className="risk-message">{riskPrediction.message}</p>
              <p className="risk-recommendation">{riskPrediction.recommendation}</p>
              <div className="risk-stats">
                <span>Current: {riskPrediction.currentPercentage.toFixed(1)}%</span>
                <span>Trend: {riskPrediction.trend > 0 ? '+' : ''}{riskPrediction.trend.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Calendar and Details */}
        <div className="calendar-content">
          <div className="calendar-section">
            <div className="calendar-container">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileClassName={getTileClassName}
                tileContent={getTileContent}
                showNeighboringMonth={false}
              />
            </div>
            
            <div className="calendar-legend">
              <h4>Legend</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-color present"></div>
                  <span>Present</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color absent"></div>
                  <span>Absent</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color no-data"></div>
                  <span>No Class</span>
                </div>
              </div>
            </div>
          </div>

          <div className="date-details-section">
            <div className="selected-date-info">
              <h3>
                <FaCalendarAlt /> {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {selectedDateRecords.length > 0 ? (
                <div className="date-records">
                  {selectedDateRecords.map((record, index) => (
                    <div key={index} className={`record-item ${record.status}`}>
                      <div className="record-status">
                        {record.status === 'present' ? (
                          <FaCheckCircle className="status-icon present" />
                        ) : (
                          <FaTimesCircle className="status-icon absent" />
                        )}
                        <span className="status-text">
                          {record.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </div>
                      <div className="record-details">
                        <span className="subject">{record.subject || 'General'}</span>
                        {record.remarks && (
                          <span className="remarks">{record.remarks}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-records">
                  <p>No attendance records for this date</p>
                </div>
              )}
            </div>

            {/* Monthly Summary */}
            <div className="monthly-summary">
              <h4>This Month Summary</h4>
              {(() => {
                const currentMonth = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
                const monthStats = monthlyStats[currentMonth];
                
                if (!monthStats) {
                  return <p>No data for this month</p>;
                }
                
                const percentage = (monthStats.present / monthStats.total * 100).toFixed(1);
                
                return (
                  <div className="month-stats">
                    <div className="stat-item">
                      <span className="stat-label">Present:</span>
                      <span className="stat-value present">{monthStats.present}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Absent:</span>
                      <span className="stat-value absent">{monthStats.absent}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total:</span>
                      <span className="stat-value">{monthStats.total}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Percentage:</span>
                      <span className="stat-value percentage">{percentage}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Attendance Heatmap */}
        <div className="heatmap-section">
          <h3>Attendance Heatmap - Last 12 Weeks</h3>
          <div className="heatmap-container">
            {/* This would be implemented with a proper heatmap library */}
            <div className="heatmap-placeholder">
              <p>Weekly attendance pattern visualization would go here</p>
              <p>Showing intensity of attendance across different weeks and days</p>
            </div>
          </div>
        </div>

        {/* Recovery Suggestions */}
        {riskPrediction && riskPrediction.level !== 'low' && (
          <div className="recovery-suggestions">
            <h3>Attendance Recovery Plan</h3>
            <div className="suggestions-grid">
              <div className="suggestion-item">
                <h4>Immediate Actions</h4>
                <ul>
                  <li>Attend all remaining classes this month</li>
                  <li>Contact teachers for makeup opportunities</li>
                  <li>Set daily attendance reminders</li>
                </ul>
              </div>
              <div className="suggestion-item">
                <h4>Long-term Strategy</h4>
                <ul>
                  <li>Create a consistent daily routine</li>
                  <li>Address any underlying issues</li>
                  <li>Seek academic counseling if needed</li>
                </ul>
              </div>
              <div className="suggestion-item">
                <h4>Target Goals</h4>
                <ul>
                  <li>Achieve 85% attendance by month end</li>
                  <li>Maintain consistent daily attendance</li>
                  <li>Zero unexcused absences</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentAttendanceCalendar;