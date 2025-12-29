import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import { useTeacher } from '../../contexts/TeacherContext';
import { 
  FaClock, FaCalendarAlt, FaBook, FaUsers, FaMapMarkerAlt,
  FaFilter, FaDownload, FaPrint, FaChevronLeft, FaChevronRight,
  FaCalendarWeek, FaCalendarDay
} from 'react-icons/fa';
import './TeacherSchedule.css';

const TeacherSchedule = () => {
  const { schedule, actions, loading, error } = useTeacher();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    actions.loadSchedule();
  }, []);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  const getScheduleForDay = (dayName) => {
    return schedule[dayName] || [];
  };

  const getScheduleForTime = (dayName, timeSlot) => {
    const daySchedule = getScheduleForDay(dayName);
    return daySchedule.find(item => {
      const startTime = item.start_time;
      return startTime === timeSlot;
    });
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const navigateDay = (direction) => {
    const newDay = new Date(selectedDay);
    newDay.setDate(selectedDay.getDate() + direction);
    setSelectedDay(newDay);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return `${currentHour.toString().padStart(2, '0')}:00`;
  };

  const isCurrentTimeSlot = (timeSlot) => {
    return getCurrentTimeSlot() === timeSlot;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTotalClassesToday = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return getScheduleForDay(today).length;
  };

  const getNextClass = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = getScheduleForDay(today);
    const currentTime = new Date();
    
    return todaySchedule.find(item => {
      const [hours, minutes] = item.start_time.split(':');
      const classTime = new Date();
      classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return classTime > currentTime;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create CSV content
    let csvContent = "Day,Time,Subject,Section,Room,Duration\n";
    
    daysOfWeek.forEach(day => {
      const daySchedule = getScheduleForDay(day);
      daySchedule.forEach(item => {
        csvContent += `${day},${item.start_time}-${item.end_time},${item.subject},${item.section},${item.room},${item.duration}\n`;
      });
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="schedule-loading">
          <div className="loading-spinner"></div>
          <p>Loading your schedule...</p>
        </div>
      </TeacherLayout>
    );
  }

  if (error) {
    return (
      <TeacherLayout>
        <div className="schedule-error">
          <h3>Error Loading Schedule</h3>
          <p>{error}</p>
          <button onClick={() => actions.loadSchedule()} className="retry-btn">
            Try Again
          </button>
        </div>
      </TeacherLayout>
    );
  }

  const nextClass = getNextClass();

  return (
    <TeacherLayout>
      <div className="teacher-schedule">
        {/* Header */}
        <div className="schedule-header">
          <div className="header-content">
            <h1><FaClock /> My Teaching Schedule</h1>
            <p>View and manage your weekly teaching timetable</p>
          </div>
          
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={viewMode === 'week' ? 'active' : ''}
                onClick={() => setViewMode('week')}
              >
                <FaCalendarWeek /> Week
              </button>
              <button 
                className={viewMode === 'day' ? 'active' : ''}
                onClick={() => setViewMode('day')}
              >
                <FaCalendarDay /> Day
              </button>
            </div>
            
            <div className="action-buttons">
              <button onClick={handlePrint} className="action-btn">
                <FaPrint /> Print
              </button>
              <button onClick={handleExport} className="action-btn">
                <FaDownload /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="schedule-stats">
          <div className="stat-card">
            <FaCalendarAlt />
            <div>
              <span className="stat-value">{getTotalClassesToday()}</span>
              <span className="stat-label">Classes Today</span>
            </div>
          </div>
          
          <div className="stat-card">
            <FaBook />
            <div>
              <span className="stat-value">
                {Object.keys(schedule).reduce((total, day) => total + schedule[day].length, 0)}
              </span>
              <span className="stat-label">Total Classes/Week</span>
            </div>
          </div>
          
          {nextClass && (
            <div className="stat-card next-class">
              <FaClock />
              <div>
                <span className="stat-value">{nextClass.start_time}</span>
                <span className="stat-label">Next: {nextClass.subject}</span>
              </div>
            </div>
          )}
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="schedule-week-view">
            <div className="week-navigation">
              <button onClick={() => navigateWeek(-1)} className="nav-btn">
                <FaChevronLeft />
              </button>
              <h2>
                Week of {weekDates[0].toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h2>
              <button onClick={() => navigateWeek(1)} className="nav-btn">
                <FaChevronRight />
              </button>
            </div>

            <div className="schedule-grid">
              <div className="time-column">
                <div className="time-header">Time</div>
                {timeSlots.map(time => (
                  <div 
                    key={time} 
                    className={`time-slot ${isCurrentTimeSlot(time) ? 'current' : ''}`}
                  >
                    {time}
                  </div>
                ))}
              </div>

              {daysOfWeek.map((day, dayIndex) => (
                <div key={day} className="day-column">
                  <div className={`day-header ${isToday(weekDates[dayIndex]) ? 'today' : ''}`}>
                    <span className="day-name">{day}</span>
                    <span className="day-date">{formatDate(weekDates[dayIndex])}</span>
                  </div>
                  
                  {timeSlots.map(time => {
                    const classItem = getScheduleForTime(day, time);
                    return (
                      <div 
                        key={`${day}-${time}`} 
                        className={`schedule-cell ${classItem ? 'has-class' : ''} ${isCurrentTimeSlot(time) ? 'current-time' : ''}`}
                      >
                        {classItem && (
                          <div className="class-card">
                            <div className="class-subject">{classItem.subject}</div>
                            <div className="class-details">
                              <span><FaUsers /> {classItem.section}</span>
                              <span><FaMapMarkerAlt /> {classItem.room}</span>
                            </div>
                            <div className="class-time">
                              {classItem.start_time} - {classItem.end_time}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="schedule-day-view">
            <div className="day-navigation">
              <button onClick={() => navigateDay(-1)} className="nav-btn">
                <FaChevronLeft />
              </button>
              <h2>
                {selectedDay.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h2>
              <button onClick={() => navigateDay(1)} className="nav-btn">
                <FaChevronRight />
              </button>
            </div>

            <div className="day-schedule">
              {getScheduleForDay(selectedDay.toLocaleDateString('en-US', { weekday: 'long' })).length > 0 ? (
                <div className="day-classes">
                  {getScheduleForDay(selectedDay.toLocaleDateString('en-US', { weekday: 'long' })).map((classItem, index) => (
                    <div key={index} className="day-class-card">
                      <div className="class-time-large">
                        <FaClock />
                        <span>{classItem.start_time} - {classItem.end_time}</span>
                        <span className="duration">({classItem.duration})</span>
                      </div>
                      
                      <div className="class-info">
                        <h3>{classItem.subject}</h3>
                        <div className="class-meta">
                          <span><FaUsers /> {classItem.section}</span>
                          <span><FaMapMarkerAlt /> {classItem.room}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-classes">
                  <FaCalendarAlt />
                  <h3>No Classes Scheduled</h3>
                  <p>You have no classes scheduled for this day.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherSchedule;