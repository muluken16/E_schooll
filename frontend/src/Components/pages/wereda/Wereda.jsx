import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './WeredaManagement.css';

const WeredaManagement = () => {
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [zoneFilter, setZoneFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newWoreda, setNewWoreda] = useState({
        zone: '',
        woreda: '',
        activity: '',
        date: '',
        status: 'Planning'
    });
    
    const user = JSON.parse(localStorage.getItem('user'));

    // Fetch or mock activities
    useEffect(() => {
        const fetchActivities = async () => {
            setIsLoading(true);
            // Simulate API call delay
            setTimeout(() => {
                const data = [
                    { id: 1, zone: 'Oromia Special Zone', woreda: 'Liben', activity: 'School Reconstruction', date: '2025-01-15', status: 'Completed' },
                    { id: 2, zone: 'West Shewa', woreda: 'Bako Tibe', activity: 'Teacher Training', date: '2025-02-20', status: 'In Progress' },
                    { id: 3, zone: 'East Bale', woreda: 'Goro Dola', activity: 'Community Engagement', date: '2025-03-10', status: 'Planning' },
                    { id: 4, zone: 'West Guji', woreda: 'Bule Hora', activity: 'Infrastructure Development', date: '2025-04-05', status: 'In Progress' },
                    { id: 5, zone: 'East Hararghe', woreda: 'Chiro', activity: 'Curriculum Supervision', date: '2025-05-25', status: 'Not Started' },
                    { id: 6, zone: 'Oromia Special Zone', woreda: 'Liben', activity: 'Resource Allocation', date: '2025-06-12', status: 'Completed' },
                    { id: 7, zone: 'West Shewa', woreda: 'Bako Tibe', activity: 'Student Assessment', date: '2025-07-18', status: 'Planning' },
                    { id: 8, zone: 'East Bale', woreda: 'Goro Dola', activity: 'Parent Meeting', date: '2025-08-22', status: 'Completed' },
                ];
                setActivities(data);
                setFilteredActivities(data);
                setIsLoading(false);
            }, 800);
        };

        fetchActivities();
    }, []);

    // Get unique zones for filter dropdown
    const zones = ['All', ...new Set(activities.map(activity => activity.zone))];

    // Apply filters
    useEffect(() => {
        let result = activities;
        
        // Apply search term filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(activity => 
                activity.zone.toLowerCase().includes(lowerSearch) ||
                activity.woreda.toLowerCase().includes(lowerSearch) ||
                activity.activity.toLowerCase().includes(lowerSearch) ||
                activity.status.toLowerCase().includes(lowerSearch)
            );
        }
        
        // Apply zone filter
        if (zoneFilter !== 'All') {
            result = result.filter(activity => activity.zone === zoneFilter);
        }
        
        // Apply date filter
        if (dateFilter) {
            result = result.filter(activity => activity.date === dateFilter);
        }
        
        // Apply sorting
        if (sortConfig.key) {
            result = result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        
        setFilteredActivities(result);
    }, [activities, searchTerm, zoneFilter, dateFilter, sortConfig]);

    // Handle sorting
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Get status badge class
    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-badge completed';
            case 'In Progress': return 'status-badge in-progress';
            case 'Planning': return 'status-badge planning';
            default: return 'status-badge not-started';
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setZoneFilter('All');
        setDateFilter('');
        setSortConfig({ key: null, direction: 'ascending' });
    };

    // Handle modal open/close
    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setNewWoreda({
            zone: '',
            woreda: '',
            activity: '',
            date: '',
            status: 'Planning'
        });
    };

    // Handle input changes in modal form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewWoreda({
            ...newWoreda,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const newActivity = {
            id: activities.length + 1,
            ...newWoreda
        };
        
        setActivities([...activities, newActivity]);
        handleCloseModal();
    };

    return (
        <Layout>
            <div className="woreda-management-container">
                <div className="dashboard-header">
                    <h1>Woreda Management Dashboard</h1>
                    {user && (
                        <div className="user-welcome">
                            <strong>Welcome:</strong> {user.name} ({user.role})
                        </div>
                    )}
                </div>

                <div className="dashboard-content">
                    <div className="actions-section">
                        <button className="add-woreda-btn" onClick={handleOpenModal}>
                            + Add New Woreda Activity
                        </button>
                    </div>

                    <div className="filters-section">
                        <h2>Activity Filters</h2>
                        <div className="filter-controls">
                            <div className="filter-group">
                                <label htmlFor="search">Search:</label>
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Search activities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <div className="filter-group">
                                <label htmlFor="zone">Filter by Zone:</label>
                                <select
                                    id="zone"
                                    value={zoneFilter}
                                    onChange={(e) => setZoneFilter(e.target.value)}
                                >
                                    {zones.map(zone => (
                                        <option key={zone} value={zone}>{zone}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label htmlFor="date">Filter by Date:</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>
                            
                            <button className="reset-btn" onClick={resetFilters}>
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    <div className="stats-section">
                        <div className="stat-card">
                            <h3>Total Activities</h3>
                            <p className="stat-number">{activities.length}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Completed</h3>
                            <p className="stat-number">
                                {activities.filter(a => a.status === 'Completed').length}
                            </p>
                        </div>
                        <div className="stat-card">
                            <h3>In Progress</h3>
                            <p className="stat-number">
                                {activities.filter(a => a.status === 'In Progress').length}
                            </p>
                        </div>
                        <div className="stat-card">
                            <h3>Zones Covered</h3>
                            <p className="stat-number">
                                {new Set(activities.map(a => a.zone)).size}
                            </p>
                        </div>
                    </div>

                    <div className="activities-section">
                        <h2>All Activities by Zone</h2>
                        
                        {isLoading ? (
                            <div className="loading">Loading activities...</div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="no-results">No activities match your filters.</div>
                        ) : (
                            <div className="table-container">
                                <table className="activities-table">
                                    <thead>
                                        <tr>
                                            <th onClick={() => handleSort('id')}>
                                                ID {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => handleSort('zone')}>
                                                Zone {sortConfig.key === 'zone' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => handleSort('woreda')}>
                                                Woreda {sortConfig.key === 'woreda' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => handleSort('activity')}>
                                                Activity {sortConfig.key === 'activity' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => handleSort('date')}>
                                                Date {sortConfig.key === 'date' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                            </th>
                                            <th onClick={() => handleSort('status')}>
                                                Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredActivities.map((act) => (
                                            <tr key={act.id}>
                                                <td>{act.id}</td>
                                                <td>{act.zone}</td>
                                                <td>{act.woreda}</td>
                                                <td>{act.activity}</td>
                                                <td>{act.date}</td>
                                                <td>
                                                    <span className={getStatusClass(act.status)}>
                                                        {act.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal for adding new woreda */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Add New Woreda Activity</h2>
                                <button className="close-btn" onClick={handleCloseModal}>×</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="zone">Zone:</label>
                                    <select
                                        id="zone"
                                        name="zone"
                                        value={newWoreda.zone}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Zone</option>
                                        {zones.filter(zone => zone !== 'All').map(zone => (
                                            <option key={zone} value={zone}>{zone}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="woreda">Woreda:</label>
                                    <input
                                        type="text"
                                        id="woreda"
                                        name="woreda"
                                        value={newWoreda.woreda}
                                        onChange={handleInputChange}
                                        placeholder="Enter woreda name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="activity">Activity:</label>
                                    <input
                                        type="text"
                                        id="activity"
                                        name="activity"
                                        value={newWoreda.activity}
                                        onChange={handleInputChange}
                                        placeholder="Enter activity description"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="date">Date:</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={newWoreda.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="status">Status:</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={newWoreda.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="Planning">Planning</option>
                                        <option value="Not Started">Not Started</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn">
                                        Add Activity
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default WeredaManagement;