import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './Timetable.css';

const Timetable = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedClass, setSelectedClass] = useState('10A');
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [timetableData, setTimetableData] = useState({});
    const [conflicts, setConflicts] = useState([]);
    const [teacherAvailability, setTeacherAvailability] = useState([]);
    const [stats, setStats] = useState({
        totalClasses: 0,
        scheduledHours: 0,
        freePeriods: 0,
        teacherUtilization: 0
    });

    // Days and periods
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = ['8:00-9:00', '9:00-10:00', '10:15-11:15', '11:15-12:15', '12:15-1:15', '2:00-3:00', '3:00-4:00'];
    const classes = ['10A', '10B', '9A', '9B', '8A', '8B', '7A', '7B'];

    // Mock data - in a real application, this would come from an API
    useEffect(() => {
        // Generate sample timetable data
        const sampleTimetable = {};
        classes.forEach(cls => {
            sampleTimetable[cls] = {};
            days.forEach(day => {
                sampleTimetable[cls][day] = periods.map(period => {
                    const subjects = ['Math', 'Science', 'English', 'History', 'Geography', 'Art', 'PE', 'Music'];
                    const teachers = ['Dr. Smith', 'Ms. Johnson', 'Mr. Williams', 'Mrs. Brown', 'Dr. Davis', 'Ms. Miller'];
                    
                    return {
                        subject: subjects[Math.floor(Math.random() * subjects.length)],
                        teacher: teachers[Math.floor(Math.random() * teachers.length)],
                        room: `R${Math.floor(Math.random() * 20) + 1}`
                    };
                });
            });
        });

        // Sample conflicts
        const sampleConflicts = [
            { id: 1, type: 'Teacher Double Booking', teacher: 'Dr. Smith', period: '9:00-10:00', day: 'Monday', classes: ['10A', '10B'] },
            { id: 2, type: 'Room Conflict', room: 'R12', period: '11:15-12:15', day: 'Wednesday', classes: ['9A', '8B'] },
            { id: 3, type: 'Subject Overload', subject: 'Math', class: '10A', day: 'Tuesday', periods: 3 }
        ];

        // Sample teacher availability
        const sampleTeacherAvailability = [
            { teacher: 'Dr. Smith', assignedPeriods: 28, totalPeriods: 35, utilization: '80%' },
            { teacher: 'Ms. Johnson', assignedPeriods: 32, totalPeriods: 35, utilization: '91%' },
            { teacher: 'Mr. Williams', assignedPeriods: 25, totalPeriods: 35, utilization: '71%' },
            { teacher: 'Mrs. Brown', assignedPeriods: 30, totalPeriods: 35, utilization: '86%' },
            { teacher: 'Dr. Davis', assignedPeriods: 22, totalPeriods: 35, utilization: '63%' },
            { teacher: 'Ms. Miller', assignedPeriods: 28, totalPeriods: 35, utilization: '80%' }
        ];

        // Calculate stats
        const totalClasses = classes.length;
        const scheduledHours = totalClasses * periods.length * days.length;
        const freePeriods = 12; // This would be calculated from actual data
        const teacherUtilization = 82; // This would be calculated from actual data

        setTimetableData(sampleTimetable);
        setConflicts(sampleConflicts);
        setTeacherAvailability(sampleTeacherAvailability);
        setStats({
            totalClasses,
            scheduledHours,
            freePeriods,
            teacherUtilization
        });
    }, []);

    const getClassTimetable = () => {
        if (!timetableData[selectedClass] || !timetableData[selectedClass][selectedDay]) {
            return [];
        }
        return timetableData[selectedClass][selectedDay];
    };

    const getTeacherSchedule = (teacherName) => {
        // This would be more complex in a real application
        const schedule = {};
        days.forEach(day => {
            schedule[day] = {};
            periods.forEach((period, index) => {
                schedule[day][period] = null;
                classes.forEach(cls => {
                    if (timetableData[cls] && timetableData[cls][day] && 
                        timetableData[cls][day][index] && 
                        timetableData[cls][day][index].teacher === teacherName) {
                        schedule[day][period] = `${cls} - ${timetableData[cls][day][index].subject}`;
                    }
                });
            });
        });
        return schedule;
    };

    const getUtilizationColor = (percentage) => {
        if (percentage >= 90) return '#4caf50';
        if (percentage >= 75) return '#ff9800';
        return '#f44336';
    };

    const getConflictColor = (type) => {
        switch (type) {
            case 'Teacher Double Booking': return '#f44336';
            case 'Room Conflict': return '#ff9800';
            case 'Subject Overload': return '#2196f3';
            default: return '#9e9e9e';
        }
    };

    return (
        <Layout>
            <div className="timetable-activity">
                <div className="timetable-header">
                    <h1>Timetable Management System</h1>
                    <p>Vice Director Dashboard • {user?.name || 'Administrator'}</p>
                </div>

                {/* Stats Overview */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                            <i className="fas fa-chalkboard"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.totalClasses}</h3>
                            <p>Total Classes</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.scheduledHours}</h3>
                            <p>Scheduled Hours/Week</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fff3e0' }}>
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.freePeriods}</h3>
                            <p>Free Periods</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#ffebee' }}>
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.teacherUtilization}%</h3>
                            <p>Teacher Utilization</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="tabs">
                    <button 
                        className={activeTab === 'overview' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        Class Timetables
                    </button>
                    <button 
                        className={activeTab === 'teachers' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('teachers')}
                    >
                        Teacher Schedules
                    </button>
                    <button 
                        className={activeTab === 'conflicts' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('conflicts')}
                    >
                        Conflict Resolution
                    </button>
                    <button 
                        className={activeTab === 'management' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('management')}
                    >
                        Timetable Management
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="timetable-section">
                            <h2>Class Timetable Viewer</h2>
                            
                            <div className="view-controls">
                                <div className="control-group">
                                    <label htmlFor="class-select">Select Class:</label>
                                    <select 
                                        id="class-select"
                                        value={selectedClass} 
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                    >
                                        {classes.map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="control-group">
                                    <label htmlFor="day-select">Select Day:</label>
                                    <select 
                                        id="day-select"
                                        value={selectedDay} 
                                        onChange={(e) => setSelectedDay(e.target.value)}
                                    >
                                        {days.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="timetable-container">
                                <table className="timetable">
                                    <thead>
                                        <tr>
                                            <th>Period</th>
                                            <th>Time</th>
                                            <th>Subject</th>
                                            <th>Teacher</th>
                                            <th>Room</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getClassTimetable().map((period, index) => (
                                            <tr key={index}>
                                                <td className="period-number">Period {index + 1}</td>
                                                <td className="period-time">{periods[index]}</td>
                                                <td className="subject">{period.subject}</td>
                                                <td className="teacher">{period.teacher}</td>
                                                <td className="room">{period.room}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="timetable-actions">
                                <button className="btn btn-primary">
                                    <i className="fas fa-print"></i> Print Timetable
                                </button>
                                <button className="btn btn-secondary">
                                    <i className="fas fa-download"></i> Export as PDF
                                </button>
                                <button className="btn btn-secondary">
                                    <i className="fas fa-share-alt"></i> Share
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="teachers-section">
                            <h2>Teacher Schedule & Utilization</h2>
                            
                            <div className="teacher-utilization">
                                <h3>Teacher Utilization Rates</h3>
                                <table className="utilization-table">
                                    <thead>
                                        <tr>
                                            <th>Teacher</th>
                                            <th>Assigned Periods</th>
                                            <th>Total Periods</th>
                                            <th>Utilization Rate</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teacherAvailability.map((teacher, index) => {
                                            const utilization = parseInt(teacher.utilization);
                                            return (
                                                <tr key={index}>
                                                    <td className="teacher-name">{teacher.teacher}</td>
                                                    <td>{teacher.assignedPeriods}</td>
                                                    <td>{teacher.totalPeriods}</td>
                                                    <td>
                                                        <div className="utilization-display">
                                                            <div 
                                                                className="utilization-bar"
                                                                style={{ 
                                                                    width: `${utilization}%`,
                                                                    backgroundColor: getUtilizationColor(utilization)
                                                                }}
                                                            ></div>
                                                            <span>{teacher.utilization}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <button className="btn-sm btn-primary">
                                                            View Schedule
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="teacher-schedule-demo">
                                <h3>Sample Teacher Schedule (Dr. Smith)</h3>
                                <div className="schedule-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Period</th>
                                                {days.map(day => <th key={day}>{day}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {periods.map((period, pIndex) => (
                                                <tr key={pIndex}>
                                                    <td className="period-time">{period}</td>
                                                    {days.map(day => {
                                                        const schedule = getTeacherSchedule('Dr. Smith');
                                                        const classInfo = schedule[day] && schedule[day][period];
                                                        return (
                                                            <td key={day} className={classInfo ? 'scheduled' : 'free'}>
                                                                {classInfo || 'Free'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'conflicts' && (
                        <div className="conflicts-section">
                            <h2>Timetable Conflict Resolution</h2>
                            
                            <div className="conflicts-list">
                                <h3>Detected Conflicts</h3>
                                {conflicts.length > 0 ? (
                                    <div className="conflicts-cards">
                                        {conflicts.map(conflict => (
                                            <div key={conflict.id} className="conflict-card">
                                                <div 
                                                    className="conflict-type" 
                                                    style={{ backgroundColor: getConflictColor(conflict.type) }}
                                                >
                                                    {conflict.type}
                                                </div>
                                                <div className="conflict-details">
                                                    <p><strong>Resource:</strong> {conflict.teacher || conflict.room || conflict.subject}</p>
                                                    <p><strong>Time:</strong> {conflict.day}, {conflict.period}</p>
                                                    <p><strong>Affected:</strong> {conflict.classes ? conflict.classes.join(', ') : conflict.class}</p>
                                                </div>
                                                <div className="conflict-actions">
                                                    <button className="btn-sm btn-primary">Resolve</button>
                                                    <button className="btn-sm btn-secondary">Ignore</button>
                                                    <button className="btn-sm btn-secondary">View Details</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-conflicts">
                                        <i className="fas fa-check-circle"></i>
                                        <p>No timetable conflicts detected</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="conflict-prevention">
                                <h3>Conflict Prevention Rules</h3>
                                <div className="rules-list">
                                    <div className="rule-item">
                                        <i className="fas fa-ban"></i>
                                        <div className="rule-content">
                                            <h4>No Teacher Double Booking</h4>
                                            <p>Prevent the same teacher being scheduled in multiple classes simultaneously</p>
                                        </div>
                                    </div>
                                    <div className="rule-item">
                                        <i className="fas fa-door-closed"></i>
                                        <div className="rule-content">
                                            <h4>Room Availability</h4>
                                            <p>Ensure rooms are not double-booked for the same period</p>
                                        </div>
                                    </div>
                                    <div className="rule-item">
                                        <i className="fas fa-balance-scale"></i>
                                        <div className="rule-content">
                                            <h4>Subject Distribution</h4>
                                            <p>Balance subject periods across the week</p>
                                        </div>
                                    </div>
                                    <div className="rule-item">
                                        <i className="fas fa-user-check"></i>
                                        <div className="rule-content">
                                            <h4>Teacher Workload</h4>
                                            <p>Monitor and limit maximum periods per teacher per day</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'management' && (
                        <div className="management-section">
                            <h2>Timetable Management Tools</h2>
                            
                            <div className="management-tools">
                                <div className="tool-card">
                                    <div className="tool-icon">
                                        <i className="fas fa-plus-circle"></i>
                                    </div>
                                    <h3>Create New Timetable</h3>
                                    <p>Generate a new timetable for the upcoming term</p>
                                    <button className="btn btn-primary">Start</button>
                                </div>
                                
                                <div className="tool-card">
                                    <div className="tool-icon">
                                        <i className="fas fa-edit"></i>
                                    </div>
                                    <h3>Edit Current Timetable</h3>
                                    <p>Make changes to the existing timetable</p>
                                    <button className="btn btn-primary">Edit</button>
                                </div>
                                
                                <div className="tool-card">
                                    <div className="tool-icon">
                                        <i className="fas fa-copy"></i>
                                    </div>
                                    <h3>Clone Timetable</h3>
                                    <p>Create a new timetable based on the current one</p>
                                    <button className="btn btn-primary">Clone</button>
                                </div>
                                
                                <div className="tool-card">
                                    <div className="tool-icon">
                                        <i className="fas fa-history"></i>
                                    </div>
                                    <h3>View History</h3>
                                    <p>Access previous timetables and changes</p>
                                    <button className="btn btn-primary">View</button>
                                </div>
                                
                                <div className="tool-card">
                                    <div className="tool-icon">
                                        <i className="fas fa-cogs"></i>
                                    </div>
                                    <h3>Auto-Scheduler</h3>
                                    <p>Use AI to generate an optimal timetable</p>
                                    <button className="btn btn-primary">Generate</button>
                                </div>
                                
                                <div className="tool-card">
                                    <div className="tool-icon">
                                        <i className="fas fa-sliders-h"></i>
                                    </div>
                                    <h3>Configuration</h3>
                                    <p>Adjust timetable settings and constraints</p>
                                    <button className="btn btn-primary">Configure</button>
                                </div>
                            </div>
                            
                            <div className="timetable-calendar">
                                <h3>Academic Calendar Integration</h3>
                                <div className="calendar-view">
                                    <div className="calendar-header">
                                        <button className="btn-icon"><i className="fas fa-chevron-left"></i></button>
                                        <h4>May 2023</h4>
                                        <button className="btn-icon"><i className="fas fa-chevron-right"></i></button>
                                    </div>
                                    <div className="calendar-days">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="day-header">{day}</div>
                                        ))}
                                        {/* This would be populated with actual days in a real implementation */}
                                        <div className="empty-day"></div>
                                        <div className="empty-day"></div>
                                        <div className="calendar-day">1</div>
                                        <div className="calendar-day">2</div>
                                        <div className="calendar-day">3</div>
                                        <div className="calendar-day">4</div>
                                        <div className="calendar-day">5</div>
                                        <div className="calendar-day event-day">
                                            6
                                            <span className="event-dot"></span>
                                        </div>
                                        {/* More days would follow */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Timetable;