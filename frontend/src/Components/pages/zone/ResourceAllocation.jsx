import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './ResourceAllocation.css';

const ResourceAllocation = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('overview');
    const [resources, setResources] = useState([]);
    const [schools, setSchools] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');

    // Mock data - replace with actual API calls
    useEffect(() => {
        // Simulate fetching data
        const mockResources = [
            { id: 1, name: 'Textbooks', category: 'Learning Materials', totalQuantity: 5000, allocated: 3200, available: 1800 },
            { id: 2, name: 'Desks', category: 'Furniture', totalQuantity: 2000, allocated: 1500, available: 500 },
            { id: 3, name: 'Computers', category: 'Technology', totalQuantity: 300, allocated: 220, available: 80 },
            { id: 4, name: 'Science Kits', category: 'Lab Equipment', totalQuantity: 150, allocated: 90, available: 60 },
        ];

        const mockSchools = [
            { id: 1, name: 'Primary School A', students: 800, teachers: 25 },
            { id: 2, name: 'Primary School B', students: 650, teachers: 20 },
            { id: 3, name: 'Secondary School A', students: 1200, teachers: 35 },
            { id: 4, name: 'Secondary School B', students: 950, teachers: 30 },
        ];

        const mockAllocations = [
            { id: 1, resourceId: 1, schoolId: 1, quantity: 800, date: '2024-01-15' },
            { id: 2, resourceId: 1, schoolId: 2, quantity: 650, date: '2024-01-16' },
            { id: 3, resourceId: 2, schoolId: 1, quantity: 400, date: '2024-01-10' },
            { id: 4, resourceId: 3, schoolId: 3, quantity: 100, date: '2024-01-20' },
        ];

        setResources(mockResources);
        setSchools(mockSchools);
        setAllocations(mockAllocations);
    }, []);

    const getSchoolAllocations = (schoolId) => {
        return allocations.filter(allocation => allocation.schoolId === schoolId);
    };

    const getResourceAllocations = (resourceId) => {
        return allocations.filter(allocation => allocation.resourceId === resourceId);
    };

    const calculateAllocationPercentage = (resource) => {
        return ((resource.allocated / resource.totalQuantity) * 100).toFixed(1);
    };

    const handleAllocateResource = (resourceId, schoolId, quantity) => {
        // Simulate allocation - replace with API call
        const newAllocation = {
            id: allocations.length + 1,
            resourceId,
            schoolId,
            quantity: parseInt(quantity),
            date: new Date().toISOString().split('T')[0]
        };

        setAllocations([...allocations, newAllocation]);
        
        // Update resource availability
        setResources(resources.map(resource => {
            if (resource.id === resourceId) {
                return {
                    ...resource,
                    allocated: resource.allocated + parseInt(quantity),
                    available: resource.available - parseInt(quantity)
                };
            }
            return resource;
        }));
    };

    return (
        <Layout>
            <div className="resource-allocation">
                <div className="page-header">
                    <h1>Resource Allocation Management</h1>
                    <p>Wereda Education Office - School Resource Distribution System</p>
                </div>

                {/* User Info */}
                <div className="user-info">
                    <span>Welcome, {user?.name || 'Administrator'}</span>
                    <span>Role: {user?.role || 'Wereda Education Officer'}</span>
                </div>

                {/* Navigation Tabs */}
                <div className="tabs">
                    <button 
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={activeTab === 'resources' ? 'active' : ''}
                        onClick={() => setActiveTab('resources')}
                    >
                        Resources
                    </button>
                    <button 
                        className={activeTab === 'schools' ? 'active' : ''}
                        onClick={() => setActiveTab('schools')}
                    >
                        Schools
                    </button>
                    <button 
                        className={activeTab === 'allocation' ? 'active' : ''}
                        onClick={() => setActiveTab('allocation')}
                    >
                        New Allocation
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="overview">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Total Resources</h3>
                                    <span className="stat-number">{resources.length}</span>
                                </div>
                                <div className="stat-card">
                                    <h3>Schools</h3>
                                    <span className="stat-number">{schools.length}</span>
                                </div>
                                <div className="stat-card">
                                    <h3>Total Allocations</h3>
                                    <span className="stat-number">{allocations.length}</span>
                                </div>
                                <div className="stat-card">
                                    <h3>Allocation Rate</h3>
                                    <span className="stat-number">
                                        {((allocations.length / (resources.length * schools.length)) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="recent-activity">
                                <h3>Recent Allocations</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Resource</th>
                                            <th>School</th>
                                            <th>Quantity</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allocations.slice(-5).map(allocation => {
                                            const resource = resources.find(r => r.id === allocation.resourceId);
                                            const school = schools.find(s => s.id === allocation.schoolId);
                                            return (
                                                <tr key={allocation.id}>
                                                    <td>{resource?.name}</td>
                                                    <td>{school?.name}</td>
                                                    <td>{allocation.quantity}</td>
                                                    <td>{allocation.date}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Resources Tab */}
                    {activeTab === 'resources' && (
                        <div className="resources-list">
                            <h3>Available Resources</h3>
                            <div className="resources-grid">
                                {resources.map(resource => (
                                    <div key={resource.id} className="resource-card">
                                        <h4>{resource.name}</h4>
                                        <p className="category">{resource.category}</p>
                                        <div className="resource-stats">
                                            <div className="stat">
                                                <span>Total: {resource.totalQuantity}</span>
                                            </div>
                                            <div className="stat">
                                                <span>Allocated: {resource.allocated}</span>
                                            </div>
                                            <div className="stat">
                                                <span>Available: {resource.available}</span>
                                            </div>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ width: `${calculateAllocationPercentage(resource)}%` }}
                                            ></div>
                                        </div>
                                        <span className="percentage">{calculateAllocationPercentage(resource)}% allocated</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Schools Tab */}
                    {activeTab === 'schools' && (
                        <div className="schools-list">
                            <h3>Schools in Wereda</h3>
                            <select 
                                value={selectedSchool} 
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                className="school-selector"
                            >
                                <option value="">Select a school to view allocations</option>
                                {schools.map(school => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>

                            {selectedSchool && (
                                <div className="school-allocations">
                                    <h4>Resource Allocations for {
                                        schools.find(s => s.id === parseInt(selectedSchool))?.name
                                    }</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Resource</th>
                                                <th>Quantity Allocated</th>
                                                <th>Allocation Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getSchoolAllocations(parseInt(selectedSchool)).map(allocation => {
                                                const resource = resources.find(r => r.id === allocation.resourceId);
                                                return (
                                                    <tr key={allocation.id}>
                                                        <td>{resource?.name}</td>
                                                        <td>{allocation.quantity}</td>
                                                        <td>{allocation.date}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* New Allocation Tab */}
                    {activeTab === 'allocation' && (
                        <div className="allocation-form">
                            <h3>Allocate Resources to Schools</h3>
                            <AllocationForm 
                                resources={resources}
                                schools={schools}
                                onAllocate={handleAllocateResource}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

// Allocation Form Component
const AllocationForm = ({ resources, schools, onAllocate }) => {
    const [formData, setFormData] = useState({
        resourceId: '',
        schoolId: '',
        quantity: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.resourceId && formData.schoolId && formData.quantity) {
            onAllocate(formData.resourceId, formData.schoolId, formData.quantity);
            setFormData({ resourceId: '', schoolId: '', quantity: '' });
            alert('Resource allocated successfully!');
        }
    };

    const selectedResource = resources.find(r => r.id === parseInt(formData.resourceId));

    return (
        <form onSubmit={handleSubmit} className="allocation-form-container">
            <div className="form-group">
                <label>Select Resource:</label>
                <select 
                    value={formData.resourceId}
                    onChange={(e) => setFormData({...formData, resourceId: e.target.value})}
                    required
                >
                    <option value="">Choose a resource</option>
                    {resources.map(resource => (
                        <option key={resource.id} value={resource.id}>
                            {resource.name} (Available: {resource.available})
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Select School:</label>
                <select 
                    value={formData.schoolId}
                    onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
                    required
                >
                    <option value="">Choose a school</option>
                    {schools.map(school => (
                        <option key={school.id} value={school.id}>
                            {school.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Quantity:</label>
                <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    max={selectedResource?.available}
                    min="1"
                    required
                />
                {selectedResource && (
                    <span className="available-quantity">
                        Maximum available: {selectedResource.available}
                    </span>
                )}
            </div>

            <button type="submit" className="allocate-btn">
                Allocate Resource
            </button>
        </form>
    );
};

export default ResourceAllocation;