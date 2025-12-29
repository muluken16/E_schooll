import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaGraduationCap, FaCalendarCheck, 
  FaChartBar, FaUser, FaBook, FaCog 
} from 'react-icons/fa';
import './TeacherNavigation.css';

const TeacherNavigation = () => {
  const location = useLocation();

  const navigationItems = [
    {
      path: '/teacher/dashboard',
      icon: FaTachometerAlt,
      label: 'Dashboard',
      description: 'Overview and quick stats'
    },
    {
      path: '/teacher/classes',
      icon: FaBook,
      label: 'My Classes',
      description: 'View assigned classes and sections'
    },
    {
      path: '/teacher/students',
      icon: FaUsers,
      label: 'My Students',
      description: 'View and manage students'
    },
    {
      path: '/teacher/grades',
      icon: FaGraduationCap,
      label: 'Grades',
      description: 'Enter and manage grades'
    },
    {
      path: '/teacher/attendance',
      icon: FaCalendarCheck,
      label: 'Attendance',
      description: 'Mark and track attendance'
    },
    {
      path: '/teacher/reports',
      icon: FaChartBar,
      label: 'Reports',
      description: 'Generate analytics reports'
    },
    {
      path: '/teacher/profile',
      icon: FaUser,
      label: 'My Profile',
      description: 'Manage personal information'
    }
  ];

  return (
    <div className="teacher-navigation">
      <div className="nav-header">
        <div className="nav-title">
          <FaBook className="nav-icon" />
          <h2>Teacher Portal</h2>
        </div>
        <p className="nav-subtitle">Manage your classes and students</p>
      </div>

      <div className="nav-grid">
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`nav-card ${isActive ? 'active' : ''}`}
            >
              <div className="nav-card-icon">
                <IconComponent />
              </div>
              <div className="nav-card-content">
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </div>
              <div className="nav-card-arrow">
                →
              </div>
            </Link>
          );
        })}
      </div>

      <div className="nav-footer">
        <div className="quick-stats">
          <h4>Quick Access</h4>
          <div className="quick-links">
            <Link to="/teacher/classes" className="quick-link">
              <FaBook />
              <span>View My Classes</span>
            </Link>
            <Link to="/teacher/attendance" className="quick-link">
              <FaCalendarCheck />
              <span>Mark Today's Attendance</span>
            </Link>
            <Link to="/teacher/grades" className="quick-link">
              <FaGraduationCap />
              <span>Enter Grades</span>
            </Link>
            <Link to="/teacher/students" className="quick-link">
              <FaUsers />
              <span>View Students</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNavigation;