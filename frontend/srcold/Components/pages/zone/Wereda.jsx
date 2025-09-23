import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './SubcityWereda.css';

const SubcityWereda = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [weredas, setWeredas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWereda, setEditingWereda] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    population: '',
    area: '',
    status: 'active',
    schools: '',
    students: '',
    teachers: '',
    literacy_rate: '',
  });

  // API base URL - adjust according to your Django server
  const API_BASE = 'http://localhost:8000/api';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Token ${user?.token}` // Assuming you use token authentication
  };

  // Add this useEffect hook to fetch weredas when component mounts
  useEffect(() => {
    fetchWeredas();
  }, []); // Empty dependency array means this runs once on mount

  const fetchWeredas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/weredas/`, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch weredas');
      }
      
      const data = await response.json();
      setWeredas(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weredas:', error);
      setError('Failed to load weredas. Please try again.');
      setLoading(false);
    }
  };

  // ... rest of your component code remains the same
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const url = editingWereda 
        ? `${API_BASE}/weredas/${editingWereda.id}/` 
        : `${API_BASE}/weredas/`;
      
      const method = editingWereda ? 'PUT' : 'POST';
      
      // Convert numeric values to proper types
      const submitData = {
        ...formData,
        population: parseInt(formData.population),
        area: parseFloat(formData.area),
        schools: formData.schools ? parseInt(formData.schools) : null,
        students: formData.students ? parseInt(formData.students) : null,
        teachers: formData.teachers ? parseInt(formData.teachers) : null,
        literacy_rate: formData.literacy_rate ? parseFloat(formData.literacy_rate) : null,
      };
      
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(submitData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save wereda');
      }
      
      const savedWereda = await response.json();
      
      if (editingWereda) {
        setWeredas(weredas.map(w => w.id === savedWereda.id ? savedWereda : w));
        setSuccess('Wereda updated successfully!');
      } else {
        setWeredas([...weredas, savedWereda]);
        setSuccess('Wereda added successfully!');
      }
      
      setShowAddForm(false);
      resetForm();
      setEditingWereda(null);
    } catch (error) {
      console.error('Error saving wereda:', error);
      setError(error.message || 'Failed to save wereda. Please try again.');
    }
  };

  const handleEdit = (wereda) => {
    setEditingWereda(wereda);
    setFormData({
      name: wereda.name,
      population: wereda.population,
      area: wereda.area,
      status: wereda.status,
      schools: wereda.schools || '',
      students: wereda.students || '',
      teachers: wereda.teachers || '',
      literacy_rate: wereda.literacy_rate || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wereda?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/weredas/${id}/`, {
        method: 'DELETE',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete wereda');
      }
      
      setWeredas(weredas.filter(w => w.id !== id));
      setSuccess('Wereda deleted successfully!');
    } catch (error) {
      console.error('Error deleting wereda:', error);
      setError('Failed to delete wereda. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      population: '',
      area: '',
      status: 'active',
      schools: '',
      students: '',
      teachers: '',
      literacy_rate: '',
    });
    setEditingWereda(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    resetForm();
  };

  // Calculate totals for dashboard
  const totalPopulation = weredas.reduce((acc, w) => acc + parseInt(w.population || 0), 0);
  const totalArea = weredas.reduce((acc, w) => acc + parseFloat(w.area || 0), 0);
  const totalSchools = weredas.reduce((acc, w) => acc + parseInt(w.schools || 0), 0);



  return (
    <Layout>
      <div className="subcity-wereda">
        <div className="page-header">
          <h1>Subcity Wereda Management</h1>
          <p>Manage weredas in the subcity administration</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i> {error}
            <button onClick={() => setError('')} className="alert-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i> {success}
            <button onClick={() => setSuccess('')} className="alert-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <div className="dashboard-cards">
          <div className="card">
            <div className="card-icon">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <div className="card-info">
              <h3>{weredas.length}</h3>
              <p>Total Weredas</p>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="card-info">
              <h3>{totalPopulation.toLocaleString()}</h3>
              <p>Total Population</p>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">
              <i className="fas fa-chart-area"></i>
            </div>
            <div className="card-info">
              <h3>{totalArea.toFixed(1)} km²</h3>
              <p>Total Area</p>
            </div>
          </div>

          <div className="card">
            <div className="card-icon">
              <i className="fas fa-school"></i>
            </div>
            <div className="card-info">
              <h3>{totalSchools}</h3>
              <p>Total Schools</p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h2>Wereda List</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus"></i> Add New Wereda
            </button>
          </div>

          {showAddForm && (
            <div className="form-modal">
              <div className="form-container">
                <h3>{editingWereda ? 'Edit Wereda' : 'Add New Wereda'}</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Wereda Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Population *</label>
                      <input
                        type="number"
                        name="population"
                        value={formData.population}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Area (km²) *</label>
                      <input
                        type="number"
                        step="0.1"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  

                  <div className="form-row">
                    <div className="form-group">
                      <label>Number of Schools</label>
                      <input
                        type="number"
                        name="schools"
                        value={formData.schools}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Number of Students</label>
                      <input
                        type="number"
                        name="students"
                        value={formData.students}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Number of Teachers</label>
                      <input
                        type="number"
                        name="teachers"
                        value={formData.teachers}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Literacy Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="literacy_rate"
                        value={formData.literacy_rate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingWereda ? 'Update Wereda' : 'Add Wereda'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin"></i> Loading weredas...
            </div>
          ) : (
            <div className="table-container">
              <table className="wereda-table">
                <thead>
                  <tr>
                    <th>Wereda Name</th>
                    <th>Population</th>
                    <th>Area (km²)</th>
                    <th>Schools</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {weredas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No weredas found. <button onClick={() => setShowAddForm(true)} className="text-btn">Add the first wereda</button>
                      </td>
                    </tr>
                  ) : (
                    weredas.map(wereda => (
                      <tr key={wereda.id}>
                        <td>{wereda.name}</td>
                        <td>{parseInt(wereda.population).toLocaleString()}</td>
                        <td>{wereda.area}</td>
                        
                        <td>{wereda.schools || 0}</td>
                        <td>
                          <span className={`status-badge ${wereda.status}`}>
                            {wereda.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon"
                              onClick={() => handleEdit(wereda)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn-icon"
                              onClick={() => handleDelete(wereda.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SubcityWereda;