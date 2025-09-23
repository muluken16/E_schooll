import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './SubcityWereda.css';

const SubcityWereda = () => {
  const [weredas, setWeredas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    population: '',
    area: '',
    number_of_schools: '',
    number_of_students: '',
    number_of_teachers: '',
    literacy_rate: '',
    status: 'active',
  });

  // Get token from localStorage
  const token = localStorage.getItem('access_token');

  // Fetch Weredas with authentication
  const fetchWeredas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/weredas/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 🔑 send JWT
        },
      });

      if (res.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      }

      const data = await res.json();
      setWeredas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching weredas:', error);
      setError(error.message || 'Failed to load weredas');
      setWeredas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWeredas();
    } else {
      setError('No access token found. Please login first.');
      setLoading(false);
    }
  }, [token]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit new Wereda
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/api/weredas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 🔑 send JWT
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to add wereda');

      const newWereda = await res.json();
      setWeredas([...weredas, newWereda]);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Error adding wereda:', error);
      setError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      population: '',
      area: '',
      number_of_schools: '',
      number_of_students: '',
      number_of_teachers: '',
      literacy_rate: '',
      status: 'active',
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    resetForm();
  };

  // Safe total calculations
  const totalPopulation = weredas.reduce(
    (acc, w) => acc + Number(w.population || 0),
    0
  );
  const totalArea = weredas.reduce(
    (acc, w) => acc + parseFloat(w.area || 0),
    0
  );

  return (
    <Layout>
      <div className="subcity-wereda">
        <div className="page-header">
          <h1>Subcity Wereda Management</h1>
          <p>Manage weredas in the subcity administration</p>
        </div>

        {error && (
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i> {error}
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
                <h3>Add New Wereda</h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Name *</label>
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
                        name="number_of_schools"
                        value={formData.number_of_schools}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Number of Students</label>
                      <input
                        type="number"
                        name="number_of_students"
                        value={formData.number_of_students}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Number of Teachers</label>
                      <input
                        type="number"
                        name="number_of_teachers"
                        value={formData.number_of_teachers}
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
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Wereda
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
                    <th>Name</th>
                    <th>Population</th>
                    <th>Area</th>
                    <th>Schools</th>
                    <th>Students</th>
                    <th>Teachers</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {weredas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No weredas found.{' '}
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="text-btn"
                        >
                          Add the first wereda
                        </button>
                      </td>
                    </tr>
                  ) : (
                    weredas.map((w) => (
                      <tr key={w.id}>
                        <td>{w.name}</td>
                        <td>{w.population}</td>
                        <td>{w.area}</td>
                        <td>{w.number_of_schools}</td>
                        <td>{w.number_of_students}</td>
                        <td>{w.number_of_teachers}</td>
                        <td>
                          <span className={`status-badge ${w.status}`}>
                            {w.status}
                          </span>
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
