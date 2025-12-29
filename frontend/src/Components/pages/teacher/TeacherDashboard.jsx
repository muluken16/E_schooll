import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import TeacherQuickActions from './TeacherQuickActions';
import teacherAPI from './TeacherAPI';
import { 
  FaUsers, FaBook, FaCalendarCheck, FaChartLine, 
  FaClock, FaClipboardList, FaBell, FaGraduationCap,
  FaTrophy, FaExclamationTriangle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchTodaySchedule();
    fetchRecentActivity();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await teacherAPI.getDashboardSummary();
      setDashboardData(data);
    } catch (err) {
      setError('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySchedule = async () => {
    try {
      const data = await teacherAPI.getMySchedule();
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      setTodaySchedule(data[today] || []);
    } catch (err) {
      console.error('Error loading schedule:', err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent grades and attendance
      const [gradesData, attendanceData] = await Promise.all([
        teacherAPI.getGrades({ limit: 5 }),
        teacherAPI.getAttendance({ limit: 5 })
      ]);

      const activities = [];
      
      if (gradesData.grades) {
        gradesData.grades.slice(0, 3).forEach(grade => {
          activities.push({
            type: 'grade',
            message: `Graded ${grade.student_name} in ${grade.subject_name}`,
            score: `${grade.score}/${grade.full_mark}`,
            time: new Date(grade.date_recorded).toLocaleDateString(),
            icon: FaGraduationCap,
            color: '#10b981'
          });
        });
      }

      // Add attendance activities
      if (attendanceData.attendance_records) {
        attendanceData.attendance_records.slice(0, 2).forEach(record => {
          activities.push({
            type: 'attendance',
            message: `Marked attendance for ${record.student_name}`,
            status: record.status,
            time: new Date(record.date).toLocaleDateString(),
            icon: FaCalendarCheck,
            color: record.status === 'present' ? '#10b981' : '#ef4444'
          });
        });
      }

      // Sort by time and limit to 5
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 5));
    } catch (err) {
      console.error('Error loading recent activity:', err);
    }
  };

  const getStatTrend = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isUp: change > 0,
      isDown: change < 0
    };
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout>
        <div className="dashboard-error">
          <FaExclamationTriangle />
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Try Again
          </button>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="teacher-dashboard">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1>Welcome back, {dashboardData?.teacher_info?.name}!</h1>
            <p>Here's what's happening with your classes today</p>
          </div>
          <div className="welcome-stats">
            <div className="quick-stat">
              <span className="stat-value">{todaySchedule.length}</span>
              <span className="stat-label">Classes Today</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">{dashboardData?.statistics?.pending_attendance || 0}</span>
              <span className="stat-label">Pending Attendance</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-header">
              <div className="stat-icon">
                <FaBook />
              </div>
              <div className="stat-trend">
                {getStatTrend(dashboardData?.statistics?.total_subjects, 5) && (
                  <span className={`trend ${getStatTrend(dashboardData?.statistics?.total_subjects, 5).isUp ? 'up' : 'down'}`}>
                    {getStatTrend(dashboardData?.statistics?.total_subjects, 5).isUp ? <FaArrowUp /> : <FaArrowDown />}
                    {getStatTrend(dashboardData?.statistics?.total_subjects, 5).value}%
                  </span>
                )}
              </div>
            </div>
            <div className="stat-content">
              <h3>Subjects Teaching</h3>
              <div className="stat-value">{dashboardData?.statistics?.total_subjects || 0}</div>
              <span className="stat-description">Active subjects this semester</span>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-header">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-trend">
                {getStatTrend(dashboardData?.statistics?.total_students, 45) && (
                  <span className={`trend ${getStatTrend(dashboardData?.statistics?.total_students, 45).isUp ? 'up' : 'down'}`}>
                    {getStatTrend(dashboardData?.statistics?.total_students, 45).isUp ? <FaArrowUp /> : <FaArrowDown />}
                    {getStatTrend(dashboardData?.statistics?.total_students, 45).value}%
                  </span>
                )}
              </div>
            </div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <div className="stat-value">{dashboardData?.statistics?.total_students || 0}</div>
              <span className="stat-description">Across all your classes</span>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-header">
              <div className="stat-icon">
                <FaGraduationCap />
              </div>
              <div className="stat-trend">
                {getStatTrend(dashboardData?.statistics?.recent_grades_entered, 15) && (
                  <span className={`trend ${getStatTrend(dashboardData?.statistics?.recent_grades_entered, 15).isUp ? 'up' : 'down'}`}>
                    {getStatTrend(dashboardData?.statistics?.recent_grades_entered, 15).isUp ? <FaArrowUp /> : <FaArrowDown />}
                    {getStatTrend(dashboardData?.statistics?.recent_grades_entered, 15).value}%
                  </span>
                )}
              </div>
            </div>
            <div className="stat-content">
              <h3>Grades This Week</h3>
              <div className="stat-value">{dashboardData?.statistics?.recent_grades_entered || 0}</div>
              <span className="stat-description">Assessments graded</span>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-header">
              <div className="stat-icon">
                <FaChartLine />
              </div>
              <div className="stat-trend">
                {dashboardData?.statistics?.avg_class_performance && (
                  <span className={`trend ${dashboardData.statistics.avg_class_performance >= 75 ? 'up' : 'down'}`}>
                    <FaTrophy />
                    {dashboardData.statistics.avg_class_performance >= 85 ? 'Excellent' : 
                     dashboardData.statistics.avg_class_performance >= 75 ? 'Good' : 'Needs Attention'}
                  </span>
                )}
              </div>
            </div>
            <div className="stat-content">
              <h3>Class Performance</h3>
              <div className="stat-value">{dashboardData?.statistics?.avg_class_performance || 0}%</div>
              <span className="stat-description">Average across all subjects</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Today's Schedule */}
          <div className="dashboard-card schedule-card">
            <div className="card-header">
              <h3><FaClock /> Today's Schedule</h3>
              <span className="schedule-date">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            
            <div className="card-content">
              {todaySchedule.length > 0 ? (
                <div className="schedule-timeline">
                  {todaySchedule.map((schedule, index) => (
                    <div key={index} className="schedule-item">
                      <div className="schedule-time">
                        <span className="time-start">{schedule.start_time}</span>
                        <span className="time-separator">-</span>
                        <span className="time-end">{schedule.end_time}</span>
                      </div>
                      <div className="schedule-details">
                        <h4>{schedule.subject}</h4>
                        <p className="schedule-section">{schedule.section}</p>
                        <span className="schedule-room">
                          <FaBook /> {schedule.room}
                        </span>
                      </div>
                      <div className="schedule-duration">
                        {schedule.duration}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-schedule">
                  <FaClock className="no-schedule-icon" />
                  <h4>No classes scheduled for today</h4>
                  <p>Enjoy your free day!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <TeacherQuickActions variant="compact" />
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h3><FaBell /> Recent Activity</h3>
              <button className="view-all-btn">View All</button>
            </div>
            
            <div className="card-content">
              {recentActivity.length > 0 ? (
                <div className="activity-list">
                  {recentActivity.map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={index} className="activity-item">
                        <div className="activity-icon" style={{ backgroundColor: activity.color }}>
                          <IconComponent />
                        </div>
                        <div className="activity-details">
                          <p className="activity-message">{activity.message}</p>
                          <div className="activity-meta">
                            {activity.score && (
                              <span className="activity-score">Score: {activity.score}</span>
                            )}
                            {activity.status && (
                              <span className={`activity-status ${activity.status}`}>
                                {activity.status}
                              </span>
                            )}
                            <span className="activity-time">{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-activity">
                  <FaBell className="no-activity-icon" />
                  <h4>No recent activity</h4>
                  <p>Your recent actions will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts and Notifications */}
        {dashboardData?.statistics?.pending_attendance > 0 && (
          <div className="alert-banner warning">
            <div className="alert-icon">
              <FaExclamationTriangle />
            </div>
            <div className="alert-content">
              <h4>Attendance Reminder</h4>
              <p>You have {dashboardData.statistics.pending_attendance} classes without attendance records for today.</p>
            </div>
            <a href="/teacher/attendance" className="alert-action">
              Mark Attendance
            </a>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;