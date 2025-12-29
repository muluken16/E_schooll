import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacher } from '../../contexts/TeacherContext';
import { 
  FaCalendarCheck, FaGraduationCap, FaUsers, FaChartLine,
  FaFileExport, FaPlus, FaClock, FaBell, FaBook, FaClipboardList
} from 'react-icons/fa';
import './TeacherQuickActions.css';

const TeacherQuickActions = ({ variant = 'full', className = '' }) => {
  const navigate = useNavigate();
  const { 
    classes, 
    subjects, 
    dashboardData, 
    attendanceSummary,
    actions 
  } = useTeacher();

  const quickActions = [
    {
      id: 'mark-attendance',
      title: 'Mark Attendance',
      description: 'Take attendance for today\'s classes',
      icon: FaCalendarCheck,
      color: '#10b981',
      path: '/teacher/attendance',
      badge: dashboardData?.statistics?.pending_attendance || 0,
      badgeColor: '#ef4444'
    },
    {
      id: 'enter-grades',
      title: 'Enter Grades',
      description: 'Add or update student grades',
      icon: FaGraduationCap,
      color: '#f59e0b',
      path: '/teacher/grades',
      badge: null
    },
    {
      id: 'view-students',
      title: 'My Students',
      description: 'View and manage student information',
      icon: FaUsers,
      color: '#6366f1',
      path: '/teacher/students',
      badge: dashboardData?.statistics?.total_students || 0,
      badgeColor: '#6366f1'
    },
    {
      id: 'my-classes',
      title: 'My Classes',
      description: 'View assigned classes and sections',
      icon: FaBook,
      color: '#8b5cf6',
      path: '/teacher/classes',
      badge: classes?.length || 0,
      badgeColor: '#8b5cf6'
    },
    {
      id: 'generate-reports',
      title: 'Reports',
      description: 'Generate performance and attendance reports',
      icon: FaChartLine,
      color: '#06b6d4',
      path: '/teacher/reports',
      badge: null
    },
    {
      id: 'my-schedule',
      title: 'My Schedule',
      description: 'View teaching schedule and timetable',
      icon: FaClock,
      color: '#84cc16',
      path: '/teacher/schedule',
      badge: null
    }
  ];

  const exportActions = [
    {
      id: 'export-attendance',
      title: 'Export Attendance',
      icon: FaFileExport,
      color: '#10b981',
      action: () => actions.exportAttendance()
    },
    {
      id: 'export-grades',
      title: 'Export Grades',
      icon: FaFileExport,
      color: '#f59e0b',
      action: () => actions.exportGrades()
    },
    {
      id: 'export-students',
      title: 'Export Students',
      icon: FaFileExport,
      color: '#6366f1',
      action: () => actions.exportStudents()
    }
  ];

  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.action) {
      action.action();
    }
  };

  const renderActionCard = (action, isCompact = false) => {
    const IconComponent = action.icon;
    
    return (
      <div
        key={action.id}
        className={`quick-action-card ${isCompact ? 'compact' : ''}`}
        onClick={() => handleActionClick(action)}
        style={{ '--action-color': action.color }}
      >
        <div className="action-icon">
          <IconComponent />
          {action.badge !== null && action.badge > 0 && (
            <span 
              className="action-badge"
              style={{ backgroundColor: action.badgeColor || action.color }}
            >
              {action.badge > 99 ? '99+' : action.badge}
            </span>
          )}
        </div>
        
        {!isCompact && (
          <div className="action-content">
            <h4>{action.title}</h4>
            <p>{action.description}</p>
          </div>
        )}
        
        {isCompact && (
          <span className="action-title-compact">{action.title}</span>
        )}
      </div>
    );
  };

  if (variant === 'compact') {
    return (
      <div className={`teacher-quick-actions compact ${className}`}>
        <div className="quick-actions-grid compact">
          {quickActions.slice(0, 4).map(action => renderActionCard(action, true))}
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`teacher-quick-actions sidebar ${className}`}>
        <div className="quick-actions-header">
          <h3><FaClipboardList /> Quick Actions</h3>
        </div>
        <div className="quick-actions-list">
          {quickActions.map(action => (
            <div
              key={action.id}
              className="quick-action-item"
              onClick={() => handleActionClick(action)}
            >
              <div className="action-icon-small" style={{ color: action.color }}>
                <action.icon />
              </div>
              <div className="action-details">
                <span className="action-title">{action.title}</span>
                {action.badge !== null && action.badge > 0 && (
                  <span 
                    className="action-badge-small"
                    style={{ backgroundColor: action.badgeColor || action.color }}
                  >
                    {action.badge}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="export-actions">
          <h4>Export Data</h4>
          {exportActions.map(action => (
            <button
              key={action.id}
              className="export-button"
              onClick={() => handleActionClick(action)}
              style={{ color: action.color }}
            >
              <action.icon />
              {action.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`teacher-quick-actions full ${className}`}>
      <div className="quick-actions-header">
        <h2><FaClipboardList /> Quick Actions</h2>
        <p>Access frequently used features quickly</p>
      </div>
      
      <div className="quick-actions-grid">
        {quickActions.map(action => renderActionCard(action))}
      </div>
      
      {variant === 'full' && (
        <div className="export-section">
          <h3><FaFileExport /> Export Data</h3>
          <div className="export-actions-grid">
            {exportActions.map(action => (
              <button
                key={action.id}
                className="export-action-button"
                onClick={() => handleActionClick(action)}
                style={{ '--export-color': action.color }}
              >
                <action.icon />
                <span>{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {dashboardData?.statistics && (
        <div className="quick-stats">
          <div className="stat-item">
            <FaBook />
            <div>
              <span className="stat-value">{subjects?.length || 0}</span>
              <span className="stat-label">Subjects</span>
            </div>
          </div>
          <div className="stat-item">
            <FaUsers />
            <div>
              <span className="stat-value">{dashboardData.statistics.total_students}</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
          <div className="stat-item">
            <FaCalendarCheck />
            <div>
              <span className="stat-value">{attendanceSummary?.present_count || 0}</span>
              <span className="stat-label">Present Today</span>
            </div>
          </div>
          <div className="stat-item">
            <FaGraduationCap />
            <div>
              <span className="stat-value">{dashboardData.statistics.recent_grades_entered}</span>
              <span className="stat-label">Grades This Week</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuickActions;