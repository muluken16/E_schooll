import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import './SchoolInfrastructure.css';

const SchoolInfrastructure = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Sample data for North Wollo zone
    const zoneData = {
        name: "North Wollo",
        weredas: [
            {
                id: 1,
                name: "Woldiya",
                totalSchools: 8,
                totalStudents: 8500,
                totalClassrooms: 180,
                schools: [
                    { id: 1, name: "Woldiya Primary School", students: 1200, classrooms: 24, labs: 2, library: true, status: "Good", lat: 11.83, lng: 39.60 },
                    { id: 2, name: "St. George Secondary School", students: 800, classrooms: 18, labs: 3, library: true, status: "Excellent", lat: 11.82, lng: 39.62 },
                    { id: 3, name: "Mekane Selam Elementary", students: 600, classrooms: 12, labs: 1, library: false, status: "Fair", lat: 11.85, lng: 39.58 },
                    { id: 4, name: "Woldiya Preparatory School", students: 950, classrooms: 20, labs: 2, library: true, status: "Good", lat: 11.81, lng: 39.61 },
                    { id: 5, name: "St. Mary Primary School", students: 1100, classrooms: 22, labs: 2, library: true, status: "Excellent", lat: 11.84, lng: 39.59 },
                    { id: 6, name: "Woldiya Catholic School", students: 750, classrooms: 15, labs: 1, library: true, status: "Good", lat: 11.83, lng: 39.63 },
                    { id: 7, name: "Ras Dashen Elementary", students: 850, classrooms: 17, labs: 1, library: false, status: "Fair", lat: 11.86, lng: 39.57 },
                    { id: 8, name: "Woldiya Model School", students: 1250, classrooms: 25, labs: 3, library: true, status: "Excellent", lat: 11.80, lng: 39.64 }
                ]
            },
            {
                id: 2,
                name: "Kobo",
                totalSchools: 6,
                totalStudents: 6200,
                totalClassrooms: 130,
                schools: [
                    { id: 9, name: "Kobo Primary School", students: 900, classrooms: 20, labs: 2, library: true, status: "Good", lat: 12.15, lng: 39.63 },
                    { id: 10, name: "Raya Secondary School", students: 750, classrooms: 16, labs: 2, library: true, status: "Good", lat: 12.14, lng: 39.65 },
                    { id: 11, name: "Kobo Preparatory", students: 1100, classrooms: 22, labs: 3, library: true, status: "Excellent", lat: 12.16, lng: 39.62 },
                    { id: 12, name: "Meket Elementary", students: 850, classrooms: 18, labs: 1, library: false, status: "Fair", lat: 12.17, lng: 39.60 },
                    { id: 13, name: "Kobo Catholic School", students: 950, classrooms: 19, labs: 2, library: true, status: "Good", lat: 12.13, lng: 39.64 },
                    { id: 14, name: "Raya Primary School", students: 650, classrooms: 13, labs: 1, library: true, status: "Fair", lat: 12.18, lng: 39.61 }
                ]
            },
            {
                id: 3,
                name: "Habru",
                totalSchools: 7,
                totalStudents: 5800,
                totalClassrooms: 125,
                schools: [
                    { id: 15, name: "Habru Comprehensive School", students: 1100, classrooms: 22, labs: 3, library: true, status: "Excellent", lat: 11.78, lng: 39.90 },
                    { id: 16, name: "Guba Primary School", students: 500, classrooms: 10, labs: 1, library: false, status: "Needs Improvement", lat: 11.76, lng: 39.92 },
                    { id: 17, name: "Habru Secondary School", students: 800, classrooms: 16, labs: 2, library: true, status: "Good", lat: 11.79, lng: 39.89 },
                    { id: 18, name: "Mersa Elementary", students: 700, classrooms: 14, labs: 1, library: true, status: "Fair", lat: 11.77, lng: 39.91 },
                    { id: 19, name: "Habru Model School", students: 950, classrooms: 19, labs: 2, library: true, status: "Excellent", lat: 11.80, lng: 39.88 },
                    { id: 20, name: "Gubalafto Primary", students: 850, classrooms: 17, labs: 1, library: false, status: "Fair", lat: 11.75, lng: 39.93 },
                    { id: 21, name: "Habru Catholic School", students: 700, classrooms: 14, labs: 1, library: true, status: "Good", lat: 11.81, lng: 39.87 }
                ]
            },
            {
                id: 4,
                name: "Guba Lafto",
                totalSchools: 5,
                totalStudents: 4800,
                totalClassrooms: 105,
                schools: [
                    { id: 22, name: "Guba Lafto Secondary", students: 950, classrooms: 19, labs: 2, library: true, status: "Good", lat: 11.95, lng: 39.72 },
                    { id: 23, name: "Mersa Elementary School", students: 700, classrooms: 14, labs: 1, library: true, status: "Fair", lat: 11.94, lng: 39.74 },
                    { id: 24, name: "Lafto Primary School", students: 850, classrooms: 17, labs: 1, library: false, status: "Fair", lat: 11.96, lng: 39.71 },
                    { id: 25, name: "Guba Preparatory", students: 1100, classrooms: 22, labs: 3, library: true, status: "Excellent", lat: 11.93, lng: 39.73 },
                    { id: 26, name: "Mersa Catholic School", students: 600, classrooms: 12, labs: 1, library: true, status: "Good", lat: 11.97, lng: 39.70 }
                ]
            }
        ]
    };

    const [selectedWereda, setSelectedWereda] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Sort schools function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Excellent': return '#10b981';
            case 'Good': return '#3b82f6';
            case 'Fair': return '#f59e0b';
            case 'Needs Improvement': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getSortedSchools = (schools) => {
        if (!sortConfig.key) return schools;

        return [...schools].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    return (
        <Layout>
            <div className="school-infrastructure">
                {/* Header Section */}
                <div className="infrastructure-header">
                    <h1>School Infrastructure - {zoneData.name} Zone</h1>
                    <p>Comprehensive overview of educational facilities and resources across all weredas</p>
                </div>

                {/* Search and Filter Section */}
                <div className="controls-section">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search schools by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    
                    <div className="filter-buttons">
                        <button className="filter-btn active">All Schools</button>
                        <button className="filter-btn">With Library</button>
                        <button className="filter-btn">Excellent Condition</button>
                    </div>
                </div>

                {/* Main Statistics */}
                <div className="main-stats">
                    <div className="main-stat-card">
                        <div className="stat-icon">🏫</div>
                        <div className="stat-info">
                            <h3>Total Schools</h3>
                            <span className="stat-number">
                                {zoneData.weredas.reduce((total, wereda) => total + wereda.schools.length, 0)}
                            </span>
                        </div>
                    </div>
                    <div className="main-stat-card">
                        <div className="stat-icon">👨‍🎓</div>
                        <div className="stat-info">
                            <h3>Total Students</h3>
                            <span className="stat-number">
                                {zoneData.weredas.reduce((total, wereda) => 
                                    total + wereda.schools.reduce((sum, school) => sum + school.students, 0), 0
                                ).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="main-stat-card">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-info">
                            <h3>Total Classrooms</h3>
                            <span className="stat-number">
                                {zoneData.weredas.reduce((total, wereda) => 
                                    total + wereda.schools.reduce((sum, school) => sum + school.classrooms, 0), 0
                                ).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="main-stat-card">
                        <div className="stat-icon">🔬</div>
                        <div className="stat-info">
                            <h3>Science Labs</h3>
                            <span className="stat-number">
                                {zoneData.weredas.reduce((total, wereda) => 
                                    total + wereda.schools.reduce((sum, school) => sum + school.labs, 0), 0
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Weredas Summary Table */}
                <div className="table-section">
                    <h2>Weredas Summary</h2>
                    <div className="table-container">
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>Wereda Name</th>
                                    <th>Number of Schools</th>
                                    <th>Total Students</th>
                                    <th>Total Classrooms</th>
                                    <th>Average Students per Classroom</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {zoneData.weredas.map(wereda => (
                                    <tr key={wereda.id} className={selectedWereda?.id === wereda.id ? 'selected-row' : ''}>
                                        <td className="wereda-name">
                                            <strong>{wereda.name}</strong>
                                        </td>
                                        <td>{wereda.schools.length}</td>
                                        <td>{wereda.schools.reduce((sum, school) => sum + school.students, 0).toLocaleString()}</td>
                                        <td>{wereda.schools.reduce((sum, school) => sum + school.classrooms, 0)}</td>
                                        <td>
                                            {Math.round(
                                                wereda.schools.reduce((sum, school) => sum + school.students, 0) / 
                                                wereda.schools.reduce((sum, school) => sum + school.classrooms, 0)
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className={`view-btn ${selectedWereda?.id === wereda.id ? 'active' : ''}`}
                                                onClick={() => setSelectedWereda(selectedWereda?.id === wereda.id ? null : wereda)}
                                            >
                                                {selectedWereda?.id === wereda.id ? 'Hide Schools' : 'View Schools'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detailed Schools Table */}
                {selectedWereda && (
                    <div className="table-section detailed-section">
                        <div className="section-header">
                            <h2>Schools in {selectedWereda.name} Wereda</h2>
                            <div className="header-actions">
                                <span className="schools-count">{selectedWereda.schools.length} schools</span>
                                <button 
                                    className="close-btn"
                                    onClick={() => setSelectedWereda(null)}
                                >
                                    × Close
                                </button>
                            </div>
                        </div>
                        
                        <div className="table-container">
                            <table className="detailed-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => handleSort('name')} className="sortable">
                                            School Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('students')} className="sortable">
                                            Students {sortConfig.key === 'students' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('classrooms')} className="sortable">
                                            Classrooms {sortConfig.key === 'classrooms' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th onClick={() => handleSort('labs')} className="sortable">
                                            Science Labs {sortConfig.key === 'labs' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th>Library</th>
                                        <th onClick={() => handleSort('status')} className="sortable">
                                            Infrastructure Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th>Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getSortedSchools(selectedWereda.schools).map(school => (
                                        <tr key={school.id}>
                                            <td className="school-name">
                                                <div className="school-info">
                                                    <strong>{school.name}</strong>
                                                    <span className="school-id">ID: {school.id}</span>
                                                </div>
                                            </td>
                                            <td className="students-count">
                                                {school.students.toLocaleString()}
                                            </td>
                                            <td>{school.classrooms}</td>
                                            <td>
                                                <div className="labs-info">
                                                    <span className="labs-count">{school.labs}</span>
                                                    <span className="labs-label">lab(s)</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`library-indicator ${school.library ? 'available' : 'unavailable'}`}>
                                                    {school.library ? '📚 Available' : '❌ Not Available'}
                                                </span>
                                            </td>
                                            <td>
                                                <span 
                                                    className="status-badge"
                                                    style={{ backgroundColor: getStatusColor(school.status) }}
                                                >
                                                    {school.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="location-btn">
                                                    📍 View Map
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="legend-section">
                    <h4>Infrastructure Status Legend</h4>
                    <div className="legend-items">
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
                            <span>Excellent - Fully equipped and modern facilities</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
                            <span>Good - Adequate facilities with minor issues</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
                            <span>Fair - Basic facilities needing improvements</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
                            <span>Needs Improvement - Significant upgrades required</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SchoolInfrastructure;