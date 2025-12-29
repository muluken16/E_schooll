import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import teacherAPI from './TeacherAPI';
import { 
  FaUsers, FaBook, FaCalendarCheck, FaChartLine, 
  FaClock, FaClipboardList, FaBell, FaGraduationCap,
  FaTrophy, FaExclamationTriangle, FaArrowUp, FaArrowDown,
  FaEye, FaPlus, FaDownload, FaRefresh
} from 'react-icons/fa';
import './ModernTeacherDashboard.css';

const ModernTeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickStats, setQuickStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all dashboard data in parallel
      const [
        dashboardSummary,
        schedule,
        subjects,
        students,
        recentGrades,
        recentAttendance
      ] = await Promise.all([
        teacherAPI.getDashboardSummary(),
        teacherAPI.getMySchedule(),
        teacherAPI.getMySubjects(),
        teacherAPI.getMyStudents(),
        teacherAPI.getGrades({ limit: 5 }),
        teacherAPI.getAttendance({ limit: 5 })
      ]);

      setDashboardData(dashboardSummary);
      
      // Process today's schedule
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      setTodaySchedule(schedule[today] || []);

      // Process quick stats
      setQuickStats({
        totalSubjects: subjects.length,
        totalStudents: students.students?.length || 0,
        todayClasses: (schedule[today] || []).length,
        pendingTasks: (dashboardSummary.statistics?.pending_attendance || 0)
      });

      // Process recent activity
      const activities = [];
      
      // Add recent grades
      if (recentGrades.grades) {
        recentGrades.grades.slice(0, 3).forEach(grade => {
          activities.push({
            id: `grade-${grade.id}`,
            type: 'grade',
            title: 'Grade Entered',
            description: `${grade.student_name} - ${grade.subject_name}`,
            value: `${grade.score}/${grade.full_mark}`,
            time: new Date(grade.date_recorded),
            icon: FaGraduationCap,
            color: '#10b981'
          });
        });
      }

      // Add recent attendance
      if (recentAttendance.attendance_records) {
        recentAttendance.attendance_records.slice(0, 2).forEach(record => {
          activities.push({
            id: `attendance-${record.id}`,
            type: 'attendance',
            title: 'Attendance Marked',
            description: `${record.student_name} - ${record.subject_name}`,
            value: record.status,
            time: new Date(record.date),
            icon: FaCalendarCheck,
            color: record.status === 'present' ? '#10b981' : '#ef4444'
          });
        });
      }

      // Sort activities by time
      activities.sort((a, b) => b.time - a.time);
      setRecentActivity(activities.slice(0, 5));

    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getPerformanceColor = (value) => {
    if (value >= 85) return '#10b981';
    if (value >= 70) return '#3b82f6';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getPerformanceLabel = (value) => {
    if (value >= 85) return 'Excellent';
    if (value >= 70) return 'Good';
    if (value >= 60) return 'Fair';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="modern-dashboard-loading">
          <div className="loading-spinner"></div>
          <h3>Loading Dashboard</h3>
          <p>Fetching your latest data...</p>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout>
        <div className="modern-dashboard-error">
          <FaExclamationTriangle />
          <h3>Unable to Load Dashboard</h3>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-btn">
            <FaRefresh /> Try Again
          </button>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="modern-teacher-dashboard">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!</h1>
              <p>Here's what's happening with your classes today</p>
            </div>
            <div className="header-actions">
              <button 
                className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <FaRefresh /> {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="quick-stats-bar">
            <div className="quick-stat">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-content">
                <span className="stat-value">{quickStats.totalSubjects}</span>
                <span className="stat-label">Subjects</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <span className="stat-value">{quickStats.totalStudents}</span>
                <span className="stat-label">Students</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <span className="stat-value">{quickStats.todayClasses}</span>
                <span className="stat-label">Today's Classes</span>
              </div>
            </div>
            <div className="quick-stat">
              <div className="stat-icon">
                <FaBell />
              </div>
              <div className="stat-content">
                <span className="stat-value">{quickStats.pendingTasks}</span>
                <span className="stat-label">Pending Tasks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-content-grid">
          {/* Performance Overview */}
          <div className="dashboard-card performance-card">
            <div className="card-header">
              <h3><FaChartLine /> Performance Overview</h3>
              <button className="view-details-btn">
                <FaEye /> View Details
              </button>
            </div>
            <div className="card-content">
              <div className="performance-metrics">
                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Class Average</span>
                    <span 
                      className="metric-trend"
                      style={{ color: getPerformanceColor(dashboardData?.statistics?.avg_class_performance || 0) }}
                    >
                      <FaArrowUp /> +2.3%
                    </span>
                  </div>
                  <div className="metric-value">
                    <span 
                      className="value"
                      style={{ color: getPerformanceColor(dashboardData?.statistics?.avg_class_performance || 0) }}
                    >
                      {dashboardData?.statistics?.avg_class_performance || 0}%
                    </span>
                    <span className="value-label">
                      {getPerformanceLabel(dashboardData?.statistics?.avg_class_performance || 0)}
                    </span>
                  </div>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${dashboardData?.statistics?.avg_class_performance || 0}%`,
                        backgroundColor: getPerformanceColor(dashboardData?.statistics?.avg_class_performance || 0)
                      }}
                    ></div>
                  </div>
                </div>

                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Attendance Rate</span>
                    <span className="metric-trend positive">
                      <FaArrowUp /> +1.8%
                    </span>
                  </div>
                  <div className="metric-value">
                    <span className="value" style={{ color: '#10b981' }}>92%</span>
                    <span className="value-label">Excellent</span>
                  </div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: '92%', backgroundColor: '#10b981' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="dashboard-card schedule-card">
            <div className="card-header">
              <h3><FaClock /> Today's Schedule</h3>
              <span className="schedule-date">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="card-content">
              {todaySchedule.length > 0 ? (
                <div className="schedule-timeline">
                  {todaySchedule.map((schedule, index) => (
                    <div key={index} className="schedule-item">
                      <div className="schedule-time">
                        <span className="time">{schedule.start_time}</span>
                        <span className="duration">{schedule.duration}</span>
                      </div>
                      <div className="schedule-content">
                        <h4>{schedule.subject}</h4>
                        <p>{schedule.section}</p>
                        <span className="room">📍 {schedule.room}</span>
                      </div>
                      <div className="schedule-actions">
                        <button className="action-btn">
                          <FaUsers />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-schedule">
                  <FaClock />
                  <h4>No Classes Today</h4>
                  <p>Enjoy your free day!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card actions-card">
            <div className="card-header">
              <h3><FaClipboardList /> Quick Actions</h3>
            </div>
            <div className="card-content">
              <div className="actions-grid">
                <a href="/teacher/attendance" className="action-item">
                  <div className="action-icon attendance">
                    <FaCalendarCheck />
                  </div>
                  <div className="action-content">
                    <span className="action-title">Mark Attendance</span>
                    <span className="action-subtitle">Record student presence</span>
                  </div>
                </a>
                
                <a href="/teacher/grades" className="action-item">
                  <div className="action-icon grades">
                    <FaGraduationCap />
                  </div>
                  <div className="action-content">
                    <span className="action-title">Enter Grades</span>
                    <span className="action-subtitle">Add assessment scores</span>
                  </div>
                </a>
                
                <a href="/teacher/students" className="action-item">
                  <div className="action-icon students">
                    <FaUsers />
                  </div>
                  <div className="action-content">
                    <span className="action-title">View Students</span>
                    <span className="action-subtitle">Manage class roster</span>
                  </div>
                </a>
                
                <a href="/teacher/reports" className="action-item">
                  <div className="action-icon reports">
                    <FaChartLine />
                  </div>
                  <div className="action-content">
                    <span className="action-title">Generate Reports</span>
                    <span className="action-subtitle">Analytics & insights</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h3><FaBell /> Recent Activity</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="card-content">
              {recentActivity.length > 0 ? (
                <div className="activity-timeline">
                  {recentActivity.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon" style={{ backgroundColor: activity.color }}>
                          <IconComponent />
                        </div>
                        <div className="activity-content">
                          <div className="activity-header">
                            <span className="activity-title">{activity.title}</span>
                            <span className="activity-time">
                              {activity.time.toLocaleDateString()}
                            </span>
                          </div>
                          <p className="activity-description">{activity.description}</p>
                          {activity.value && (
                            <span className={`activity-value ${activity.type}`}>
                              {activity.value}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-activity">
                  <FaBell />
                  <h4>No Recent Activity</h4>
                  <p>Your recent actions will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alert Notifications */}
        {dashboardData?.statistics?.pending_attendance > 0 && (
          <div className="alert-notification warning">
            <div className="alert-icon">
              <FaExclamationTriangle />
            </div>
            <div className="alert-content">
              <h4>Attendance Reminder</h4>
              <p>You have {dashboardData.statistics.pending_attendance} classes without attendance records for today.</p>
            </div>
            <div className="alert-actions">
              <a href="/teacher/attendance" className="alert-btn primary">
                Mark Attendance
              </a>
              <button className="alert-btn secondary">Dismiss</button>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default ModernTeacherDashboard;