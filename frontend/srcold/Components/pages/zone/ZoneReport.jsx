import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './ZoneReport.css';

const ZoneReport = () => {
    const [zones, setZones] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedZone, setSelectedZone] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    // Mock data for zones and activities
    useEffect(() => {
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            const zonesData = [
                { id: 1, name: 'Oromia Special Zone', woredaCount: 12, completedActivities: 24, inProgress: 8, planned: 5 },
                { id: 2, name: 'West Shewa', woredaCount: 18, completedActivities: 32, inProgress: 12, planned: 7 },
                { id: 3, name: 'East Bale', woredaCount: 10, completedActivities: 18, inProgress: 6, planned: 4 },
                { id: 4, name: 'West Guji', woredaCount: 8, completedActivities: 15, inProgress: 5, planned: 3 },
                { id: 5, name: 'East Hararghe', woredaCount: 15, completedActivities: 28, inProgress: 9, planned: 6 },
            ];

            const activitiesData = [
                { id: 1, zone: 'Oromia Special Zone', woreda: 'Liben', activity: 'School Reconstruction', date: '2025-01-15', status: 'Completed' },
                { id: 2, zone: 'West Shewa', woreda: 'Bako Tibe', activity: 'Teacher Training', date: '2025-02-20', status: 'In Progress' },
                { id: 3, zone: 'East Bale', woreda: 'Goro Dola', activity: 'Community Engagement', date: '2025-03-10', status: 'Planning' },
                { id: 4, zone: 'West Guji', woreda: 'Bule Hora', activity: 'Infrastructure Development', date: '2025-04-05', status: 'In Progress' },
                { id: 5, zone: 'East Hararghe', woreda: 'Chiro', activity: 'Curriculum Supervision', date: '2025-05-25', status: 'Not Started' },
                { id: 6, zone: 'Oromia Special Zone', woreda: 'Liben', activity: 'Resource Allocation', date: '2025-06-12', status: 'Completed' },
                { id: 7, zone: 'West Shewa', woreda: 'Bako Tibe', activity: 'Student Assessment', date: '2025-07-18', status: 'Planning' },
                { id: 8, zone: 'East Bale', woreda: 'Goro Dola', activity: 'Parent Meeting', date: '2025-08-22', status: 'Completed' },
                { id: 9, zone: 'West Guji', woreda: 'Bule Hora', activity: 'School Supplies Distribution', date: '2025-09-15', status: 'Completed' },
                { id: 10, zone: 'East Hararghe', woreda: 'Chiro', activity: 'Teacher Recruitment', date: '2025-10-10', status: 'In Progress' },
            ];

            setZones(zonesData);
            setActivities(activitiesData);
            setIsLoading(false);
        }, 1000);
    }, []);

    // Filter activities by selected zone
    const filteredActivities = selectedZone === 'All' 
        ? activities 
        : activities.filter(activity => activity.zone === selectedZone);

    // Calculate overall statistics
    const totalWoredas = zones.reduce((sum, zone) => sum + zone.woredaCount, 0);
    const totalCompleted = zones.reduce((sum, zone) => sum + zone.completedActivities, 0);
    const totalInProgress = zones.reduce((sum, zone) => sum + zone.inProgress, 0);
    const totalPlanned = zones.reduce((sum, zone) => sum + zone.planned, 0);

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-badge completed';
            case 'In Progress': return 'status-badge in-progress';
            case 'Planning': return 'status-badge planning';
            default: return 'status-badge not-started';
        }
    };

    return (
        <Layout>
            <div className="zone-report-container">
                <div className="zone-report-header">
                    <h1>Zone Performance Report</h1>
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
                        <p>Loading zone data...</p>
                    </div>
                ) : (
                    <>
                        <div className="overview-section">
                            <h2>Regional Overview</h2>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon" style={{backgroundColor: '#3498db20', color: '#3498db'}}>
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div className="stat-content">
                                        <h3>{zones.length}</h3>
                                        <p>Total Zones</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{backgroundColor: '#2ecc7120', color: '#2ecc71'}}>
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <div className="stat-content">
                                        <h3>{totalCompleted}</h3>
                                        <p>Completed Activities</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{backgroundColor: '#f39c1220', color: '#f39c12'}}>
                                        <i className="fas fa-tasks"></i>
                                    </div>
                                    <div className="stat-content">
                                        <h3>{totalInProgress}</h3>
                                        <p>In Progress</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon" style={{backgroundColor: '#e74c3c20', color: '#e74c3c'}}>
                                        <i className="fas fa-clipboard-list"></i>
                                    </div>
                                    <div className="stat-content">
                                        <h3>{totalWoredas}</h3>
                                        <p>Total Woredas</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="zones-section">
                            <h2>Zone Performance</h2>
                            <div className="zone-cards">
                                {zones.map(zone => (
                                    <div key={zone.id} className="zone-card" onClick={() => setSelectedZone(zone.name)}>
                                        <h3>{zone.name}</h3>
                                        <div className="zone-stats">
                                            <div className="zone-stat">
                                                <span className="stat-value">{zone.woredaCount}</span>
                                                <span className="stat-label">Woredas</span>
                                            </div>
                                            <div className="zone-stat">
                                                <span className="stat-value">{zone.completedActivities}</span>
                                                <span className="stat-label">Completed</span>
                                            </div>
                                            <div className="zone-stat">
                                                <span className="stat-value">{zone.inProgress}</span>
                                                <span className="stat-label">In Progress</span>
                                            </div>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{width: `${(zone.completedActivities / (zone.completedActivities + zone.inProgress + zone.planned)) * 100}%`}}
                                            ></div>
                                        </div>
                                        <div className="completion-rate">
                                            {Math.round((zone.completedActivities / (zone.completedActivities + zone.inProgress + zone.planned)) * 100)}% Completion Rate
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="activities-section">
                            <div className="section-header">
                                <h2>Activities by Zone</h2>
                                <div className="zone-filter">
                                    <label htmlFor="zone-select">Filter by Zone:</label>
                                    <select 
                                        id="zone-select"
                                        value={selectedZone} 
                                        onChange={(e) => setSelectedZone(e.target.value)}
                                    >
                                        <option value="All">All Zones</option>
                                        {zones.map(zone => (
                                            <option key={zone.id} value={zone.name}>{zone.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {filteredActivities.length === 0 ? (
                                <div className="no-data">No activities found for the selected zone.</div>
                            ) : (
                                <div className="activities-table-container">
                                    <table className="activities-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Zone</th>
                                                <th>Woreda</th>
                                                <th>Activity</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredActivities.map(activity => (
                                                <tr key={activity.id}>
                                                    <td>{activity.id}</td>
                                                    <td>
                                                        <span className="zone-badge">{activity.zone}</span>
                                                    </td>
                                                    <td>{activity.woreda}</td>
                                                    <td>{activity.activity}</td>
                                                    <td>{activity.date}</td>
                                                    <td>
                                                        <span className={getStatusClass(activity.status)}>
                                                            {activity.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="summary-section">
                            <h2>Performance Summary</h2>
                            <div className="summary-content">
                                <div className="summary-chart">
                                    <div className="chart-header">
                                        <h3>Activity Status Distribution</h3>
                                    </div>
                                    <div className="chart-bars">
                                        <div className="chart-bar">
                                            <div className="bar-label">Completed</div>
                                            <div className="bar-container">
                                                <div 
                                                    className="bar-fill completed" 
                                                    style={{width: `${(totalCompleted / (totalCompleted + totalInProgress + totalPlanned)) * 100}%`}}
                                                >
                                                    <span className="bar-value">{totalCompleted}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="chart-bar">
                                            <div className="bar-label">In Progress</div>
                                            <div className="bar-container">
                                                <div 
                                                    className="bar-fill in-progress" 
                                                    style={{width: `${(totalInProgress / (totalCompleted + totalInProgress + totalPlanned)) * 100}%`}}
                                                >
                                                    <span className="bar-value">{totalInProgress}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="chart-bar">
                                            <div className="bar-label">Planning</div>
                                            <div className="bar-container">
                                                <div 
                                                    className="bar-fill planning" 
                                                    style={{width: `${(totalPlanned / (totalCompleted + totalInProgress + totalPlanned)) * 100}%`}}
                                                >
                                                    <span className="bar-value">{totalPlanned}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="summary-notes">
                                    <h3>Key Observations</h3>
                                    <ul>
                                        <li>Overall completion rate: {Math.round((totalCompleted / (totalCompleted + totalInProgress + totalPlanned)) * 100)}%</li>
                                        <li>West Shewa zone has the highest number of woredas</li>
                                        <li>Oromia Special Zone has the most completed activities</li>
                                        <li>East Bale has the highest completion rate</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default ZoneReport;