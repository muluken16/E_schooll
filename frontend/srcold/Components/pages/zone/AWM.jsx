import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './AWM.css';

const ManagerRegistration = () => {
  const [weredas, setWeredas] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    national_id: '',
    assigned_wereda_id: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE = 'http://localhost:8000/api';

  // Fetch weredas and existing wereda managers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch weredas
        const weredaRes = await fetch(`${API_BASE}/weredas/`);
        if (!weredaRes.ok) throw new Error('Failed to fetch weredas');
        const weredaData = await weredaRes.json();
        setWeredas(weredaData);

        // Fetch users with role=wereda_office using the custom endpoint
        const managerRes = await fetch(`${API_BASE}/register_wereda_manager/`);
        if (!managerRes.ok) throw new Error('Failed to fetch managers');
        const managerData = await managerRes.json();
        setManagers(managerData);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMessage(err.message || 'Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (!formData.first_name || !formData.last_name || !formData.email || 
        !formData.national_id || !formData.assigned_wereda_id) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    try {
      // Use the custom endpoint to create manager and assign to wereda in one request
      const response = await fetch(`${API_BASE}/register_wereda_manager/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.assigned_wereda_id || 'Failed to create manager');
      }

      const newManager = await response.json();

      // Update UI
      setManagers([...managers, newManager]);
      setSuccessMessage('Manager registered and assigned successfully!');
      
      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        national_id: '',
        assigned_wereda_id: ''
      });

      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    }
  };

  const getWeredaName = (weredaId) => {
    const wereda = weredas.find(w => w.id === weredaId);
    return wereda ? `${wereda.name} (${wereda.zone || 'N/A'})` : 'Not assigned';
  };

  if (loading) return <Layout><div className="manager-reg-loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="manager-reg-container">
        <h1>Register New Wereda Manager</h1>

        {successMessage && <div className="manager-reg-alert manager-reg-alert-success">{successMessage}</div>}
        {errorMessage && <div className="manager-reg-alert manager-reg-alert-error">{errorMessage}</div>}

        <div className="manager-reg-content">
          <div className="manager-reg-form-section">
            <h2>Manager Details</h2>
            <form onSubmit={handleSubmit} className="manager-reg-form">
              <div className="manager-reg-form-row">
                <div className="manager-reg-form-group">
                  <label>First Name *</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleInputChange} 
                    placeholder="First Name" 
                    required 
                  />
                </div>
                <div className="manager-reg-form-group">
                  <label>Last Name *</label>
                  <input 
                    type="text" 
                    name="last_name" 
                    value={formData.last_name} 
                    onChange={handleInputChange} 
                    placeholder="Last Name" 
                    required 
                  />
                </div>
              </div>

              <div className="manager-reg-form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="Email" 
                  required 
                />
              </div>

              

              <div className="manager-reg-form-group">
                <label>National ID *</label>
                <input 
                  type="text" 
                  name="national_id" 
                  value={formData.national_id} 
                  onChange={handleInputChange} 
                  placeholder="National ID" 
                  required 
                />
              </div>

              <div className="manager-reg-form-group">
                <label>Assign to Wereda *</label>
                <select 
                  name="assigned_wereda_id" 
                  value={formData.assigned_wereda_id} 
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Wereda --</option>
                  {weredas.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.zone || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="manager-reg-submit-btn">Register Manager</button>
            </form>
          </div>

          <div className="manager-reg-list-section">
            <h2>Registered Managers</h2>
            {managers.length === 0 ? (
              <p>No managers registered yet.</p>
            ) : (
              <div className="manager-reg-list">
                {managers.map(manager => (
                  <div key={manager.id} className="manager-reg-card">
                    <h3>{manager.first_name} {manager.last_name}</h3>
                    <p><strong>Email:</strong> {manager.email}</p>
               
                    <p><strong>National ID:</strong> {manager.national_id}</p>
                    <p><strong>Assigned Wereda:</strong> {getWeredaName(manager.assigned_wereda_id)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerRegistration;