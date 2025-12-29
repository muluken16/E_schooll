import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { FaBullhorn, FaCalendarAlt, FaExclamationCircle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import './StudentAnnouncements.css';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      // For now, we'll use mock data since the API endpoint doesn't exist yet
      const mockAnnouncements = [
        {
          id: 1,
          title: "Mid-term Examination Schedule Released",
          content: "The mid-term examination schedule for all subjects has been published. Please check your individual timetables and prepare accordingly. Exams will begin from March 15th, 2024.",
          type: "exam",
          priority: "high",
          date: "2024-03-01",
          author: "Academic Office",
          read: false
        },
        {
          id: 2,
          title: "Library Hours Extended",
          content: "Due to upcoming examinations, the library will remain open until 10 PM from March 10th to March 30th. Students can utilize this extended time for their studies.",
          type: "general",
          priority: "medium",
          date: "2024-03-05",
          author: "Library Administration",
          read: true
        },
        {
          id: 3,
          title: "Fee Payment Reminder",
          content: "This is a reminder that the semester fee payment deadline is March 20th, 2024. Please ensure timely payment to avoid any inconvenience.",
          type: "fee",
          priority: "high",
          date: "2024-03-08",
          author: "Finance Office",
          read: false
        },
        {
          id: 4,
          title: "Sports Day Registration Open",
          content: "Registration for the annual sports day is now open. Students interested in participating can register at the sports office or through the online portal.",
          type: "event",
          priority: "low",
          date: "2024-03-10",
          author: "Sports Committee",
          read: true
        },
        {
          id: 5,
          title: "COVID-19 Safety Guidelines",
          content: "Please continue to follow COVID-19 safety protocols on campus. Masks are mandatory in all indoor spaces and maintain social distancing.",
          type: "health",
          priority: "medium",
          date: "2024-03-12",
          author: "Health & Safety",
          read: false
        }
      ];

      setAnnouncements(mockAnnouncements);
    } catch (err) {
      setError('Error loading announcements');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { ...announcement, read: true }
          : announcement
      )
    );
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'exam': return <FaCalendarAlt />;
      case 'fee': return <FaExclamationCircle />;
      case 'event': return <FaBullhorn />;
      case 'health': return <FaCheckCircle />;
      default: return <FaInfoCircle />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'exam': return '#3b82f6';
      case 'fee': return '#ef4444';
      case 'event': return '#10b981';
      case 'health': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !announcement.read;
    return announcement.type === filter;
  });

  if (loading) return <Layout><div className="loading">Loading announcements...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  const unreadCount = announcements.filter(a => !a.read).length;

  return (
    <Layout>
      <div className="student-announcements">
        <div className="announcements-header">
          <h1>Announcements & Notices</h1>
          <p>Stay updated with important information and notices</p>
          {unreadCount > 0 && (
            <div className="unread-badge">
              {unreadCount} unread announcement{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({announcements.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-tab ${filter === 'exam' ? 'active' : ''}`}
            onClick={() => setFilter('exam')}
          >
            Exams
          </button>
          <button 
            className={`filter-tab ${filter === 'fee' ? 'active' : ''}`}
            onClick={() => setFilter('fee')}
          >
            Fees
          </button>
          <button 
            className={`filter-tab ${filter === 'event' ? 'active' : ''}`}
            onClick={() => setFilter('event')}
          >
            Events
          </button>
          <button 
            className={`filter-tab ${filter === 'general' ? 'active' : ''}`}
            onClick={() => setFilter('general')}
          >
            General
          </button>
        </div>

        {/* Announcements List */}
        <div className="announcements-list">
          {filteredAnnouncements.length > 0 ? filteredAnnouncements.map(announcement => (
            <div 
              key={announcement.id} 
              className={`announcement-card ${!announcement.read ? 'unread' : ''}`}
              onClick={() => markAsRead(announcement.id)}
            >
              <div className="announcement-header">
                <div className="announcement-meta">
                  <div 
                    className="type-icon"
                    style={{ color: getTypeColor(announcement.type) }}
                  >
                    {getTypeIcon(announcement.type)}
                  </div>
                  <div className="announcement-info">
                    <h3>{announcement.title}</h3>
                    <div className="announcement-details">
                      <span className="author">{announcement.author}</span>
                      <span className="date">{new Date(announcement.date).toLocaleDateString()}</span>
                      <span 
                        className={`priority priority-${announcement.priority}`}
                        style={{ color: getPriorityColor(announcement.priority) }}
                      >
                        {announcement.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                {!announcement.read && (
                  <div className="unread-indicator"></div>
                )}
              </div>
              
              <div className="announcement-content">
                <p>{announcement.content}</p>
              </div>
              
              <div className="announcement-actions">
                <button 
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(announcement.id);
                  }}
                >
                  {announcement.read ? 'Read' : 'Mark as Read'}
                </button>
              </div>
            </div>
          )) : (
            <div className="no-announcements">
              <div className="no-announcements-icon">
                <FaBullhorn />
              </div>
              <h3>No announcements found</h3>
              <p>There are no announcements matching your current filter.</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="announcements-stats">
          <div className="stat-item">
            <span className="stat-label">Total Announcements:</span>
            <span className="stat-value">{announcements.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Unread:</span>
            <span className="stat-value unread">{unreadCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">This Week:</span>
            <span className="stat-value">
              {announcements.filter(a => {
                const announcementDate = new Date(a.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return announcementDate >= weekAgo;
              }).length}
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentAnnouncements;