import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './WeredaReport.css';

const WeredaReport = () => {
    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        
        // Simulate API call to fetch reports
        setTimeout(() => {
            setReports(generateSampleReports());
            setLoading(false);
        }, 1000);
    }, []);

    const generateSampleReports = () => {
        return [
            {
                id: 1,
                title: "Quarterly Education Performance Report",
                wereda: "Wereda 01",
                period: "Q1 2024",
                status: "completed",
                submissionDate: "2024-03-31",
                author: "Education Bureau",
                summary: "Analysis of student performance and school activities for the first quarter",
                metrics: {
                    enrollment: 12500,
                    attendance: 94.2,
                    performance: 78.5,
                    schools: 45
                }
            },
            {
                id: 2,
                title: "Infrastructure Development Update",
                wereda: "Wereda 02",
                period: "January 2024",
                status: "in-progress",
                submissionDate: "2024-02-15",
                author: "Construction Committee",
                summary: "Progress report on new school buildings and facility renovations",
                metrics: {
                    enrollment: 8900,
                    attendance: 91.8,
                    performance: 82.1,
                    schools: 32
                }
            },
            {
                id: 3,
                title: "Teacher Training Program Evaluation",
                wereda: "Wereda 03",
                period: "Q4 2023",
                status: "completed",
                submissionDate: "2023-12-20",
                author: "HR Department",
                summary: "Assessment of teacher professional development initiatives",
                metrics: {
                    enrollment: 11200,
                    attendance: 95.7,
                    performance: 85.3,
                    schools: 38
                }
            },
            {
                id: 4,
                title: "Annual Educational Budget Report",
                wereda: "Wereda 04",
                period: "FY 2023",
                status: "pending",
                submissionDate: "2024-01-31",
                author: "Finance Office",
                summary: "Comprehensive review of educational expenditures and allocations",
                metrics: {
                    enrollment: 15600,
                    attendance: 93.4,
                    performance: 79.8,
                    schools: 52
                }
            }
        ];
    };

    const filteredReports = filter === 'all' 
        ? reports 
        : reports.filter(report => report.status === filter);

    const getStatusColor = (status) => {
        const colors = {
            completed: '#10b981',
            'in-progress': '#f59e0b',
            pending: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusText = (status) => {
        const texts = {
            completed: 'Completed',
            'in-progress': 'In Progress',
            pending: 'Pending Review'
        };
        return texts[status] || status;
    };

    const handleViewDetails = (report) => {
        setSelectedReport(report);
    };

    const handleCloseModal = () => {
        setSelectedReport(null);
    };

    if (loading) {
        return (
            <Layout>
                <div className="report-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading reports...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="wereda-report-container">
                {/* Header Section */}
                <div className="report-header">
                    <div className="header-content">
                        <h1 className="report-title">Wereda Education Reports</h1>
                        <p className="report-subtitle">
                            Comprehensive reports and analytics for educational institutions in each wereda
                        </p>
                    </div>
                    {user && (
                        <div className="user-info">
                            <div className="user-avatar">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <span className="user-role">Report Viewer</span>
                                <span className="user-name">{user.name}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistics Overview */}
                <div className="stats-overview">
                    <div className="stat-item">
                        <div className="stat-value">{reports.length}</div>
                        <div className="stat-label">Total Reports</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">
                            {reports.filter(r => r.status === 'completed').length}
                        </div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">
                            {reports.filter(r => r.status === 'in-progress').length}
                        </div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-value">
                            {[...new Set(reports.map(r => r.wereda))].length}
                        </div>
                        <div className="stat-label">Weredas Covered</div>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="filter-controls">
                    <div className="filter-group">
                        <label>Filter by Status:</label>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Reports</option>
                            <option value="completed">Completed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <button className="generate-report-btn">
                        + Generate New Report
                    </button>
                </div>

                {/* Reports Grid */}
                <div className="reports-grid">
                    {filteredReports.map((report) => (
                        <div key={report.id} className="report-card">
                            <div className="report-header">
                                <div className="wereda-badge">{report.wereda}</div>
                                <div 
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(report.status) }}
                                >
                                    {getStatusText(report.status)}
                                </div>
                            </div>
                            
                            <h3 className="report-title">{report.title}</h3>
                            <p className="report-period">Period: {report.period}</p>
                            <p className="report-summary">{report.summary}</p>
                            
                            <div className="report-metrics">
                                <div className="metric">
                                    <span className="metric-value">{report.metrics.enrollment.toLocaleString()}</span>
                                    <span className="metric-label">Students</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-value">{report.metrics.attendance}%</span>
                                    <span className="metric-label">Attendance</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-value">{report.metrics.performance}%</span>
                                    <span className="metric-label">Performance</span>
                                </div>
                            </div>
                            
                            <div className="report-footer">
                                <div className="report-author">
                                    By {report.author}
                                </div>
                                <div className="report-actions">
                                    <button 
                                        className="view-btn"
                                        onClick={() => handleViewDetails(report)}
                                    >
                                        View Details
                                    </button>
                                    <button className="download-btn">
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredReports.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h3>No reports found</h3>
                        <p>There are no reports matching the current filter criteria.</p>
                        <button 
                            className="clear-filter-btn"
                            onClick={() => setFilter('all')}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Report Detail Modal */}
                {selectedReport && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{selectedReport.title}</h2>
                                <button className="close-btn" onClick={handleCloseModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-details">
                                    <div className="detail-item">
                                        <label>Wereda:</label>
                                        <span>{selectedReport.wereda}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Reporting Period:</label>
                                        <span>{selectedReport.period}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Status:</label>
                                        <span style={{ color: getStatusColor(selectedReport.status) }}>
                                            {getStatusText(selectedReport.status)}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Author:</label>
                                        <span>{selectedReport.author}</span>
                                    </div>
                                    <div className="detail-item">
                                        <label>Submission Date:</label>
                                        <span>{new Date(selectedReport.submissionDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                
                                <div className="modal-summary">
                                    <h4>Summary</h4>
                                    <p>{selectedReport.summary}</p>
                                </div>
                                
                                <div className="modal-metrics">
                                    <h4>Key Metrics</h4>
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <div className="metric-value">{selectedReport.metrics.enrollment.toLocaleString()}</div>
                                            <div className="metric-label">Total Enrollment</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value">{selectedReport.metrics.attendance}%</div>
                                            <div className="metric-label">Average Attendance</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value">{selectedReport.metrics.performance}%</div>
                                            <div className="metric-label">Academic Performance</div>
                                        </div>
                                        <div className="metric-card">
                                            <div className="metric-value">{selectedReport.metrics.schools}</div>
                                            <div className="metric-label">Schools Covered</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary">Export as PDF</button>
                                <button className="btn-primary">Generate Analysis</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default WeredaReport;