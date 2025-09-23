import React from 'react';
import Layout from '../../layout/Layout';
import './Dashboard.css'; // We'll create this CSS file

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Function to display role-specific information with card layout
    const renderRoleSpecificContent = () => {
        const role = user?.role;
        
        const roleConfigs = {
            national_office: {
                title: "National Office Dashboard",
                scope: "National Level Access",
                responsibilities: ["Oversee all regional offices", "System-wide analytics", "National reporting", "Policy implementation"],
                stats: ["15 Regions", "250+ Zones", "5000+ Institutions"],
                color: "#2c3e50"
            },
            regional_office: {
                title: "Regional Office Dashboard",
                scope: "Regional Level Access",
                responsibilities: ["Manage zone offices", "Regional analytics", "Regional reporting", "Resource allocation"],
                stats: ["12 Zones", "150 Weredas", "800+ Schools"],
                color: "#34495e"
            },
            zone_office: {
                title: "Zone Office Dashboard",
                scope: "Zone Level Access",
                responsibilities: ["Coordinate wereda offices", "Zone-level monitoring", "Performance tracking", "Support services"],
                stats: ["25 Weredas", "200+ Schools", "50k+ Students"],
                color: "#16a085"
            },
            wereda_office: {
                title: "Wereda Office Dashboard",
                scope: "Wereda Level Access",
                responsibilities: ["Manage schools and institutions", "Local implementation", "Community engagement", "Quality assurance"],
                stats: ["45 Schools", "15k+ Students", "500+ Teachers"],
                color: "#27ae60"
            },
            university: {
                title: "University Dashboard",
                scope: "University Level Access",
                responsibilities: ["University administration", "Academic programs", "Student management", "Research coordination"],
                stats: ["8 Colleges", "150 Programs", "20k+ Students"],
                color: "#2980b9"
            },
            college: {
                title: "College Dashboard",
                scope: "College Level Access",
                responsibilities: ["College administration", "Department coordination", "Faculty management", "Academic planning"],
                stats: ["12 Departments", "150 Faculty", "3k+ Students"],
                color: "#8e44ad"
            },
            senate: {
                title: "Senate Dashboard",
                scope: "Academic Senate Access",
                responsibilities: ["Academic policy", "Curriculum approval", "Faculty affairs", "Quality standards"],
                stats: ["50 Committees", "200+ Policies", "Academic oversight"],
                color: "#f39c12"
            },
            school: {
                title: "School Dashboard",
                scope: "School Level Access",
                responsibilities: ["School administration", "Teacher management", "Student affairs", "Academic performance"],
                stats: ["45 Teachers", "1200 Students", "Academic programs"],
                color: "#d35400"
            },
            vice_director: {
                title: "Vice Director Dashboard",
                scope: "Deputy Leadership Access",
                responsibilities: ["Assist director", "Operational management", "Departmental oversight", "Strategic planning"],
                stats: ["5 Departments", "10 Projects", "Operational excellence"],
                color: "#c0392b"
            },
            department: {
                title: "Department Dashboard",
                scope: "Department Level Access",
                responsibilities: ["Department management", "Academic coordination", "Faculty support", "Curriculum development"],
                stats: ["25 Faculty", "500 Students", "Academic programs"],
                color: "#7f8c8d"
            },
            teacher: {
                title: "Teacher Dashboard",
                scope: "Classroom Level Access",
                responsibilities: ["Teaching", "Student assessment", "Classroom management", "Parent communication"],
                stats: ["6 Classes", "180 Students", "Daily lessons"],
                color: "#2c3e50"
            },
            librarian: {
                title: "Librarian Dashboard",
                scope: "Library Access",
                responsibilities: ["Library management", "Resource cataloging", "User assistance", "Digital resources"],
                stats: ["10k+ Books", "500+ Journals", "Digital library"],
                color: "#16a085"
            },
            record_officer: {
                title: "Record Officer Dashboard",
                scope: "Records Management Access",
                responsibilities: ["Document management", "Record keeping", "Data integrity", "Archival systems"],
                stats: ["50k+ Records", "Compliance monitoring", "Data security"],
                color: "#27ae60"
            },
            student: {
                title: "Student Dashboard",
                scope: "Student Access",
                responsibilities: ["Academic progress", "Course registration", "Personal information", "Learning resources"],
                stats: ["6 Courses", "GPA: 3.8", "Academic standing"],
                color: "#2980b9"
            },
            inventorial: {
                title: "Inventory Manager Dashboard",
                scope: "Inventory Management Access",
                responsibilities: ["Asset tracking", "Inventory control", "Supply management", "Procurement support"],
                stats: ["5k+ Assets", "Inventory value", "Supply chain"],
                color: "#8e44ad"
            },
            store: {
                title: "Store Manager Dashboard",
                scope: "Store Management Access",
                responsibilities: ["Store operations", "Stock management", "Supply distribution", "Inventory optimization"],
                stats: ["500+ Items", "Daily transactions", "Stock levels"],
                color: "#f39c12"
            },
            dormitory_manager: {
                title: "Dormitory Manager Dashboard",
                scope: "Dormitory Management Access",
                responsibilities: ["Student housing", "Facility management", "Resident support", "Safety compliance"],
                stats: ["300 Residents", "5 Buildings", "Facility maintenance"],
                color: "#d35400"
            },
            hr_officer: {
                title: "HR Officer Dashboard",
                scope: "Human Resources Access",
                responsibilities: ["Staff management", "Recruitment", "Payroll", "Employee relations"],
                stats: ["250 Employees", "HR operations", "Staff development"],
                color: "#c0392b"
            }
        };

        const config = roleConfigs[role] || {
            title: "General Dashboard",
            scope: "System Access",
            responsibilities: ["Welcome to the education management system"],
            stats: ["System overview"],
            color: "#7f8c8d"
        };

        return (
            <div className="dashboard-board">
                <div className="main-card" style={{borderLeft: `4px solid ${config.color}`}}>
                    <div className="card-header">
                        <h3>{config.title}</h3>
                        <span className="role-badge" style={{backgroundColor: config.color}}>
                            {formatRoleName(role)}
                        </span>
                    </div>
                    
                    <div className="card-content">
                        <div className="scope-section">
                            <h4>Scope</h4>
                            <p>{config.scope}</p>
                        </div>
                        
                        <div className="responsibilities-section">
                            <h4>Key Responsibilities</h4>
                            <ul>
                                {config.responsibilities.map((resp, index) => (
                                    <li key={index}>{resp}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    {config.stats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{borderTop: `3px solid ${config.color}`}}>
                            <div className="stat-value">{stat.split(':')[0]}</div>
                            <div className="stat-label">{stat.split(':')[1] || 'Overview'}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions Card */}
                <div className="actions-card">
                    <h4>Quick Actions</h4>
                    <div className="actions-grid">
                        <button className="action-btn primary">View Profile</button>
                        <button className="action-btn secondary">Change Password</button>
                        <button className="action-btn success">Recent Activities</button>
                        <button className="action-btn info">Notifications</button>
                        {['national_office', 'regional_office', 'zone_office'].includes(role) && (
                            <button className="action-btn warning">Generate Reports</button>
                        )}
                        {['teacher', 'student'].includes(role) && (
                            <button className="action-btn success">Academic Calendar</button>
                        )}
                        {['hr_officer'].includes(role) && (
                            <button className="action-btn info">Employee Directory</button>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-card">
                    <h4>Recent Activity</h4>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="activity-dot" style={{backgroundColor: config.color}}></span>
                            <div className="activity-content">
                                <p>Last login: {new Date().toLocaleDateString()}</p>
                                <small>System access recorded</small>
                            </div>
                        </div>
                        <div className="activity-item">
                            <span className="activity-dot" style={{backgroundColor: config.color}}></span>
                            <div className="activity-content">
                                <p>Profile updated</p>
                                <small>2 days ago</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Function to format role display name
    const formatRoleName = (role) => {
        return role ? role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General Access';
    };

    return (
        <Layout>
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="user-welcome-card">
                        <div className="avatar-section">
                            <div className="user-avatar">
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                            </div>
                        </div>
                        <div className="user-info">
                            <h2>Welcome back, {user?.first_name} {user?.last_name}!</h2>
                            <p>Here's what's happening in your {formatRoleName(user?.role)} today</p>
                            <div className="user-meta">
                                <span><strong>Email:</strong> {user?.email}</span>
                                <span className="role-tag">{formatRoleName(user?.role)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-content">
                    {renderRoleSpecificContent()}
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;