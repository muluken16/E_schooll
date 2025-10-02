import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './Policy.css';

const Policy = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading and get user data
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
        setLoading(false);
    }, []);

    const policies = [
        {
            id: 1,
            title: "Curriculum Standards",
            description: "Updated curriculum guidelines for all grade levels",
            effectiveDate: "2024-09-01",
            category: "Academic"
        },
        {
            id: 2,
            title: "Teacher Qualifications",
            description: "Revised requirements for teaching staff certification",
            effectiveDate: "2024-08-15",
            category: "Staff"
        },
        {
            id: 3,
            title: "School Infrastructure",
            description: "New standards for classroom facilities and safety",
            effectiveDate: "2024-10-01",
            category: "Facilities"
        },
        {
            id: 4,
            title: "Student Assessment",
            description: "Updated evaluation methods and grading system",
            effectiveDate: "2024-09-15",
            category: "Academic"
        }
    ];

    const getCategoryColor = (category) => {
        const colors = {
            Academic: '#3b82f6',
            Staff: '#ef4444',
            Facilities: '#10b981',
            Administrative: '#f59e0b'
        };
        return colors[category] || '#6b7280';
    };

    if (loading) {
        return (
            <Layout>
                <div className="policy-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading policy information...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="policy-container">
                {/* Header Section */}
                <div className="policy-header">
                    <h1 className="policy-title">Zone Policy Update for Wereda Educations and Schools</h1>
                    <p className="policy-subtitle">
                        Latest policies and guidelines for educational institutions in the zone
                    </p>
                    {user && (
                        <div className="user-welcome">
                            Welcome, <span className="user-name">{user.name}</span>
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="policy-stats">
                    <div className="stat-card">
                        <div className="stat-number">{policies.length}</div>
                        <div className="stat-label">Active Policies</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {policies.filter(policy => new Date(policy.effectiveDate) > new Date()).length}
                        </div>
                        <div className="stat-label">Upcoming Changes</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {[...new Set(policies.map(policy => policy.category))].length}
                        </div>
                        <div className="stat-label">Categories</div>
                    </div>
                </div>

                {/* Policies Grid */}
                <div className="policies-grid">
                    {policies.map((policy) => (
                        <div key={policy.id} className="policy-card">
                            <div 
                                className="policy-category-badge"
                                style={{ backgroundColor: getCategoryColor(policy.category) }}
                            >
                                {policy.category}
                            </div>
                            <h3 className="policy-card-title">{policy.title}</h3>
                            <p className="policy-card-description">{policy.description}</p>
                            <div className="policy-card-footer">
                                <span className="effective-date">
                                    Effective: {new Date(policy.effectiveDate).toLocaleDateString()}
                                </span>
                                <button className="view-details-btn">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Section */}
                <div className="policy-actions">
                    <button className="btn-primary">
                        Download All Policies (PDF)
                    </button>
                    <button className="btn-secondary">
                        Request Clarification
                    </button>
                    <button className="btn-outline">
                        Subscribe to Updates
                    </button>
                </div>

                {/* Last Updated */}
                <div className="last-updated">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </Layout>
    );
};

export default Policy;