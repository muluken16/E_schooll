import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './AlertNotification.css';

const AlertNotification = () => {
    const [alerts, setAlerts] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const [selectedPriority, setSelectedPriority] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedZone, setSelectedZone] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    // Mock data for alerts
    useEffect(() => {
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            const alertsData = [
                { 
                    id: 1, 
                    title: 'Infrastructure Delay', 
                    message: 'School reconstruction in Liben Woreda is behind schedule by 2 weeks', 
                    zone: 'Oromia Special Zone', 
                    woreda: 'Liben',
                    priority: 'High', 
                    status: 'Unresolved', 
                    date: '2025-01-15',
                    time: '10:30 AM',
                    source: 'System Generated'
                },
                { 
                    id: 2, 
                    title: 'Resource Shortage', 
                    message: 'Teacher training program requires additional materials', 
                    zone: 'West Shewa', 
                    woreda: 'Bako Tibe',
                    priority: 'Medium', 
                    status: 'In Progress', 
                    date: '2025-02-20',
                    time: '02:15 PM',
                    source: 'Field Report'
                },
                { 
                    id: 3, 
                    title: 'Community Engagement', 
                    message: 'Low participation in community meeting scheduled for next week', 
                    zone: 'East Bale', 
                    woreda: 'Goro Dola',
                    priority: 'Medium', 
                    status: 'Unresolved', 
                    date: '2025-03-10',
                    time: '09:45 AM',
                    source: 'Field Coordinator'
                },
                { 
                    id: 4, 
                    title: 'Budget Approval Needed', 
                    message: 'Infrastructure development project requires budget approval', 
                    zone: 'West Guji', 
                    woreda: 'Bule Hora',
                    priority: 'High', 
                    status: 'Unresolved', 
                    date: '2025-04-05',
                    time: '11:20 AM',
                    source: 'Finance Department'
                },
                { 
                    id: 5, 
                    title: 'Curriculum Review Completed', 
                    message: 'Curriculum supervision completed successfully', 
                    zone: 'East Hararghe', 
                    woreda: 'Chiro',
                    priority: 'Low', 
                    status: 'Resolved', 
                    date: '2025-05-25',
                    time: '04:40 PM',
                    source: 'Education Office'
                },
                { 
                    id: 6, 
                    title: 'Resource Allocation Issue', 
                    message: 'Delay in resource distribution to schools', 
                    zone: 'Oromia Special Zone', 
                    woreda: 'Liben',
                    priority: 'High', 
                    status: 'In Progress', 
                    date: '2025-06-12',
                    time: '03:10 PM',
                    source: 'Logistics Team'
                },
                { 
                    id: 7, 
                    title: 'Assessment Results Ready', 
                    message: 'Student assessment results are available for review', 
                    zone: 'West Shewa', 
                    woreda: 'Bako Tibe',
                    priority: 'Low', 
                    status: 'Resolved', 
                    date: '2025-07-18',
                    time: '01:55 PM',
                    source: 'Assessment System'
                },
                { 
                    id: 8, 
                    title: 'Parent Meeting Scheduled', 
                    message: 'Parent-teacher meeting scheduled for next month', 
                    zone: 'East Bale', 
                    woreda: 'Goro Dola',
                    priority: 'Low', 
                    status: 'Resolved', 
                    date: '2025-08-22',
                    time: '10:05 AM',
                    source: 'School Administration'
                },
            ];

            setAlerts(alertsData);
            setFilteredAlerts(alertsData);
            setIsLoading(false);
        }, 1000);
    }, []);

    // Get unique values for filters
    const priorities = ['All', 'High', 'Medium', 'Low'];
    const statuses = ['All', 'Unresolved', 'In Progress', 'Resolved'];
    const zones = ['All', ...new Set(alerts.map(alert => alert.zone))];

    // Apply filters
    useEffect(() => {
        let result = alerts;
        
        // Apply priority filter
        if (selectedPriority !== 'All') {
            result = result.filter(alert => alert.priority === selectedPriority);
        }
        
        // Apply status filter
        if (selectedStatus !== 'All') {
            result = result.filter(alert => alert.status === selectedStatus);
        }
        
        // Apply zone filter
        if (selectedZone !== 'All') {
            result = result.filter(alert => alert.zone === selectedZone);
        }
        
        setFilteredAlerts(result);
    }, [alerts, selectedPriority, selectedStatus, selectedZone]);

    // Get priority badge class
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High': return 'priority-badge high';
            case 'Medium': return 'priority-badge medium';
            default: return 'priority-badge low';
        }
    };

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'Unresolved': return 'status-badge unresolved';
            case 'In Progress': return 'status-badge in-progress';
            default: return 'status-badge resolved';
        }
    };

    // Mark alert as resolved
    const markAsResolved = (id) => {
        setAlerts(alerts.map(alert => 
            alert.id === id ? { ...alert, status: 'Resolved' } : alert
        ));
    };

    // Dismiss alert
    const dismissAlert = (id) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    return (
        <Layout>
            <div className="alert-notification-container">
                <div className="alert-header">
                    <h1>Zone Alert and Notification Center</h1>
                    {user && (
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">{user.role}</span>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading alerts...</p>
                    </div>
                ) : (
                    <>
                        <div className="alert-stats">
                            <div className="stat-card">
                                <div className="stat-icon total">
                                    <i className="fas fa-bell"></i>
                                </div>
                                <div className="stat-content">
                                    <h3>{alerts.length}</h3>
                                    <p>Total Alerts</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon high-priority">
                                    <i className="fas fa-exclamation-circle"></i>
                                </div>
                                <div className="stat-content">
                                    <h3>{alerts.filter(a => a.priority === 'High').length}</h3>
                                    <p>High Priority</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon unresolved">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="stat-content">
                                    <h3>{alerts.filter(a => a.status === 'Unresolved').length}</h3>
                                    <p>Unresolved</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon resolved">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="stat-content">
                                    <h3>{alerts.filter(a => a.status === 'Resolved').length}</h3>
                                    <p>Resolved</p>
                                </div>
                            </div>
                        </div>

                        <div className="filters-section">
                            <h2>Filter Alerts</h2>
                            <div className="filter-controls">
                                <div className="filter-group">
                                    <label htmlFor="priority">Priority:</label>
                                    <select
                                        id="priority"
                                        value={selectedPriority}
                                        onChange={(e) => setSelectedPriority(e.target.value)}
                                    >
                                        {priorities.map(priority => (
                                            <option key={priority} value={priority}>{priority}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="filter-group">
                                    <label htmlFor="status">Status:</label>
                                    <select
                                        id="status"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        {statuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="filter-group">
                                    <label htmlFor="zone">Zone:</label>
                                    <select
                                        id="zone"
                                        value={selectedZone}
                                        onChange={(e) => setSelectedZone(e.target.value)}
                                    >
                                        {zones.map(zone => (
                                            <option key={zone} value={zone}>{zone}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <button 
                                    className="clear-filters-btn"
                                    onClick={() => {
                                        setSelectedPriority('All');
                                        setSelectedStatus('All');
                                        setSelectedZone('All');
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        <div className="alerts-section">
                            <h2>Recent Alerts</h2>
                            
                            {filteredAlerts.length === 0 ? (
                                <div className="no-alerts">
                                    <i className="fas fa-check-circle"></i>
                                    <p>No alerts match your filters</p>
                                </div>
                            ) : (
                                <div className="alerts-list">
                                    {filteredAlerts.map(alert => (
                                        <div key={alert.id} className={`alert-item ${alert.priority.toLowerCase()}-priority`}>
                                            <div className="alert-main">
                                                <div className="alert-content">
                                                    <div className="alert-header-row">
                                                        <h3>{alert.title}</h3>
                                                        <div className="alert-meta">
                                                            <span className="alert-date">{alert.date} • {alert.time}</span>
                                                            <span className="alert-source">{alert.source}</span>
                                                        </div>
                                                    </div>
                                                    <p className="alert-message">{alert.message}</p>
                                                    <div className="alert-location">
                                                        <span className="zone-badge">{alert.zone}</span>
                                                        <span className="woreda-badge">{alert.woreda}</span>
                                                    </div>
                                                </div>
                                                <div className="alert-indicators">
                                                    <span className={getPriorityClass(alert.priority)}>
                                                        {alert.priority} Priority
                                                    </span>
                                                    <span className={getStatusClass(alert.status)}>
                                                        {alert.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="alert-actions">
                                                {alert.status !== 'Resolved' && (
                                                    <button 
                                                        className="resolve-btn"
                                                        onClick={() => markAsResolved(alert.id)}
                                                    >
                                                        <i className="fas fa-check"></i> Mark as Resolved
                                                    </button>
                                                )}
                                                <button 
                                                    className="dismiss-btn"
                                                    onClick={() => dismissAlert(alert.id)}
                                                >
                                                    <i className="fas fa-times"></i> Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="alert-summary">
                            <h2>Alert Summary</h2>
                            <div className="summary-content">
                                <div className="priority-summary">
                                    <h3>By Priority</h3>
                                    <div className="priority-chart">
                                        <div className="priority-item">
                                            <div className="priority-label">
                                                <span className="priority-dot high"></span>
                                                High
                                            </div>
                                            <div className="priority-bar">
                                                <div 
                                                    className="priority-fill high" 
                                                    style={{width: `${(alerts.filter(a => a.priority === 'High').length / alerts.length) * 100}%`}}
                                                ></div>
                                            </div>
                                            <div className="priority-count">
                                                {alerts.filter(a => a.priority === 'High').length}
                                            </div>
                                        </div>
                                        <div className="priority-item">
                                            <div className="priority-label">
                                                <span className="priority-dot medium"></span>
                                                Medium
                                            </div>
                                            <div className="priority-bar">
                                                <div 
                                                    className="priority-fill medium" 
                                                    style={{width: `${(alerts.filter(a => a.priority === 'Medium').length / alerts.length) * 100}%`}}
                                                ></div>
                                            </div>
                                            <div className="priority-count">
                                                {alerts.filter(a => a.priority === 'Medium').length}
                                            </div>
                                        </div>
                                        <div className="priority-item">
                                            <div className="priority-label">
                                                <span className="priority-dot low"></span>
                                                Low
                                            </div>
                                            <div className="priority-bar">
                                                <div 
                                                    className="priority-fill low" 
                                                    style={{width: `${(alerts.filter(a => a.priority === 'Low').length / alerts.length) * 100}%`}}
                                                ></div>
                                            </div>
                                            <div className="priority-count">
                                                {alerts.filter(a => a.priority === 'Low').length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="status-summary">
                                    <h3>By Status</h3>
                                    <div className="status-chart">
                                        <div className="status-item">
                                            <div className="status-label">
                                                <span className="status-dot unresolved"></span>
                                                Unresolved
                                            </div>
                                            <div className="status-bar">
                                                <div 
                                                    className="status-fill unresolved" 
                                                    style={{width: `${(alerts.filter(a => a.status === 'Unresolved').length / alerts.length) * 100}%`}}
                                                ></div>
                                            </div>
                                            <div className="status-count">
                                                {alerts.filter(a => a.status === 'Unresolved').length}
                                            </div>
                                        </div>
                                        <div className="status-item">
                                            <div className="status-label">
                                                <span className="status-dot in-progress"></span>
                                                In Progress
                                            </div>
                                            <div className="status-bar">
                                                <div 
                                                    className="status-fill in-progress" 
                                                    style={{width: `${(alerts.filter(a => a.status === 'In Progress').length / alerts.length) * 100}%`}}
                                                ></div>
                                            </div>
                                            <div className="status-count">
                                                {alerts.filter(a => a.status === 'In Progress').length}
                                            </div>
                                        </div>
                                        <div className="status-item">
                                            <div className="status-label">
                                                <span className="status-dot resolved"></span>
                                                Resolved
                                            </div>
                                            <div className="status-bar">
                                                <div 
                                                    className="status-fill resolved" 
                                                    style={{width: `${(alerts.filter(a => a.status === 'Resolved').length / alerts.length) * 100}%`}}
                                                ></div>
                                            </div>
                                            <div className="status-count">
                                                {alerts.filter(a => a.status === 'Resolved').length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default AlertNotification;