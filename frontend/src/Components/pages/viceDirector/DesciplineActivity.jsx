import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './DisciplineActivity.css';

const DisciplineActivity = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('overview');
    const [disciplineData, setDisciplineData] = useState([]);
    const [recentIncidents, setRecentIncidents] = useState([]);
    const [stats, setStats] = useState({
        totalIncidents: 0,
        resolvedCases: 0,
        pendingCases: 0,
        repeatOffenders: 0
    });

    // Mock data - in a real application, this would come from an API
    useEffect(() => {
        // Simulate API call for discipline data
        const mockDisciplineData = [
            { class: 'Grade 10A', incidents: 5, resolved: 3, major: 1, minor: 4, trend: 'decreasing' },
            { class: 'Grade 10B', incidents: 8, resolved: 5, major: 3, minor: 5, trend: 'stable' },
            { class: 'Grade 9A', incidents: 2, resolved: 2, major: 0, minor: 2, trend: 'decreasing' },
            { class: 'Grade 9B', incidents: 12, resolved: 7, major: 5, minor: 7, trend: 'increasing' },
            { class: 'Grade 8A', incidents: 4, resolved: 3, major: 1, minor: 3, trend: 'stable' },
            { class: 'Grade 8B', incidents: 7, resolved: 4, major: 2, minor: 5, trend: 'increasing' }
        ];

        // Simulate API call for recent incidents
        const mockRecentIncidents = [
            { id: 1, student: 'John Doe', class: 'Grade 10B', date: '2023-05-15', type: 'Major', description: 'Fighting in hallway', status: 'Under Review', action: 'Pending' },
            { id: 2, student: 'Sarah Smith', class: 'Grade 9B', date: '2023-05-14', type: 'Minor', description: 'Repeated tardiness', status: 'Resolved', action: 'Detention' },
            { id: 3, student: 'Mike Johnson', class: 'Grade 8B', date: '2023-05-13', type: 'Major', description: 'Vandalism', status: 'Investigation', action: 'Suspension' },
            { id: 4, student: 'Emma Wilson', class: 'Grade 10A', date: '2023-05-12', type: 'Minor', description: 'Uniform violation', status: 'Resolved', action: 'Warning' },
            { id: 5, student: 'Alex Brown', class: 'Grade 9B', date: '2023-05-11', type: 'Major', description: 'Bullying', status: 'Under Review', action: 'Pending' }
        ];

        // Calculate stats
        const totalIncidents = mockDisciplineData.reduce((sum, item) => sum + item.incidents, 0);
        const resolvedCases = mockDisciplineData.reduce((sum, item) => sum + item.resolved, 0);
        const pendingCases = totalIncidents - resolvedCases;
        const repeatOffenders = 3; // This would normally come from backend

        setDisciplineData(mockDisciplineData);
        setRecentIncidents(mockRecentIncidents);
        setStats({
            totalIncidents,
            resolvedCases,
            pendingCases,
            repeatOffenders
        });
    }, []);

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing': return '📈';
            case 'decreasing': return '📉';
            default: return '↔️';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return '#4caf50';
            case 'Under Review': return '#ff9800';
            case 'Investigation': return '#f44336';
            default: return '#9e9e9e';
        }
    };

    const getTypeColor = (type) => {
        return type === 'Major' ? '#f44336' : '#ff9800';
    };

    return (
        <Layout>
            <div className="discipline-activity">
                <div className="discipline-header">
                    <h1>Discipline Activity Monitoring</h1>
                    <p>Vice Director Dashboard • {user?.name || 'Administrator'}</p>
                </div>

                {/* Stats Overview */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#ffebee' }}>
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.totalIncidents}</h3>
                            <p>Total Incidents</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.resolvedCases}</h3>
                            <p>Resolved Cases</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#fff3e0' }}>
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.pendingCases}</h3>
                            <p>Pending Cases</p>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                            <i className="fas fa-redo"></i>
                        </div>
                        <div className="stat-info">
                            <h3>{stats.repeatOffenders}</h3>
                            <p>Repeat Offenders</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="tabs">
                    <button 
                        className={activeTab === 'overview' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        Class Overview
                    </button>
                    <button 
                        className={activeTab === 'incidents' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('incidents')}
                    >
                        Recent Incidents
                    </button>
                    <button 
                        className={activeTab === 'actions' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('actions')}
                    >
                        Disciplinary Actions
                    </button>
                    <button 
                        className={activeTab === 'reports' ? 'tab-active' : ''}
                        onClick={() => setActiveTab('reports')}
                    >
                        Generate Reports
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="discipline-table">
                            <h2>Class Discipline Overview</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Class</th>
                                        <th>Total Incidents</th>
                                        <th>Resolved</th>
                                        <th>Major</th>
                                        <th>Minor</th>
                                        <th>Trend</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disciplineData.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.class}</td>
                                            <td>
                                                <span className="count-badge">{item.incidents}</span>
                                            </td>
                                            <td>
                                                <div className="progress-container">
                                                    <div 
                                                        className="progress-bar" 
                                                        style={{ 
                                                            width: `${(item.resolved / item.incidents) * 100}%`,
                                                            backgroundColor: '#4caf50'
                                                        }}
                                                    ></div>
                                                    <span>{item.resolved}/{item.incidents}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="type-badge major">{item.major}</span>
                                            </td>
                                            <td>
                                                <span className="type-badge minor">{item.minor}</span>
                                            </td>
                                            <td>
                                                <span className="trend-indicator">
                                                    {getTrendIcon(item.trend)} {item.trend}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-sm btn-primary">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'incidents' && (
                        <div className="incidents-section">
                            <h2>Recent Discipline Incidents</h2>
                            <div className="incidents-table-container">
                                <table className="incidents-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Class</th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                            <th>Options</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentIncidents.map(incident => (
                                            <tr key={incident.id}>
                                                <td className="student-cell">
                                                    <div className="student-avatar">
                                                        {incident.student.charAt(0)}
                                                    </div>
                                                    {incident.student}
                                                </td>
                                                <td>{incident.class}</td>
                                                <td>{incident.date}</td>
                                                <td>
                                                    <span 
                                                        className="type-tag"
                                                        style={{ backgroundColor: getTypeColor(incident.type) }}
                                                    >
                                                        {incident.type}
                                                    </span>
                                                </td>
                                                <td className="description-cell">{incident.description}</td>
                                                <td>
                                                    <span 
                                                        className="status-badge"
                                                        style={{ backgroundColor: getStatusColor(incident.status) }}
                                                    >
                                                        {incident.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="action-tag">{incident.action}</span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="btn-icon" title="Edit">
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="btn-icon" title="Resolve">
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button className="btn-icon" title="View Details">
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div className="actions-section">
                            <h2>Disciplinary Actions Management</h2>
                            <div className="actions-grid">
                                <div className="action-card">
                                    <div className="action-card-header">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <h3>Issue Warning</h3>
                                    </div>
                                    <p>Formal written warning for minor infractions</p>
                                    <button className="btn btn-primary">Select</button>
                                </div>
                                
                                <div className="action-card">
                                    <div className="action-card-header">
                                        <i className="fas fa-clock"></i>
                                        <h3>Assign Detention</h3>
                                    </div>
                                    <p>Schedule after-school detention sessions</p>
                                    <button className="btn btn-primary">Select</button>
                                </div>
                                
                                <div className="action-card">
                                    <div className="action-card-header">
                                        <i className="fas fa-ban"></i>
                                        <h3>Suspend Student</h3>
                                    </div>
                                    <p>Temporary removal from school (1-5 days)</p>
                                    <button className="btn btn-primary">Select</button>
                                </div>
                                
                                <div className="action-card">
                                    <div className="action-card-header">
                                        <i className="fas fa-gavel"></i>
                                        <h3>Initiate Expulsion</h3>
                                    </div>
                                    <p>Begin formal expulsion proceedings</p>
                                    <button className="btn btn-primary">Select</button>
                                </div>
                                
                                <div className="action-card">
                                    <div className="action-card-header">
                                        <i className="fas fa-handshake"></i>
                                        <h3>Parent Conference</h3>
                                    </div>
                                    <p>Schedule meeting with parents/guardians</p>
                                    <button className="btn btn-primary">Select</button>
                                </div>
                                
                                <div className="action-card">
                                    <div className="action-card-header">
                                        <i className="fas fa-heart"></i>
                                        <h3>Counseling Referral</h3>
                                    </div>
                                    <p>Refer student to counseling services</p>
                                    <button className="btn btn-primary">Select</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="reports-section">
                            <h2>Discipline Reports</h2>
                            <div className="report-options">
                                <div className="report-card">
                                    <i className="fas fa-chart-bar"></i>
                                    <h3>Monthly Discipline Report</h3>
                                    <p>Generate comprehensive report on all discipline incidents for the selected month</p>
                                    <button className="btn btn-primary">Generate</button>
                                </div>
                                
                                <div className="report-card">
                                    <i className="fas fa-user-graduate"></i>
                                    <h3>Student Behavior Report</h3>
                                    <p>Create individual student behavior reports</p>
                                    <button className="btn btn-primary">Generate</button>
                                </div>
                                
                                <div className="report-card">
                                    <i className="fas fa-chart-pie"></i>
                                    <h3>Trend Analysis</h3>
                                    <p>Analyze discipline trends across classes and time periods</p>
                                    <button className="btn btn-primary">Generate</button>
                                </div>
                                
                                <div className="report-card">
                                    <i className="fas fa-file-export"></i>
                                    <h3>Export Data</h3>
                                    <p>Export discipline data for external analysis</p>
                                    <button className="btn btn-primary">Export</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DisciplineActivity;