// src/pages/ManagerRegistration/ManagerRegistration.jsx

import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import './AWM.css';

const ManagerRegistration = () => {
  const [weredas, setWeredas] = useState([]);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    national_id: '',
    kebele_id: '',
    department: '',
    subject: '',
    hire_date: '',
    salary: '',
    qualifications: '',
    address: '',
    emergency_contact: '',
    status: 'active',
    wereda: '',
  });

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  const token = localStorage.getItem('access_token');

  const axiosInstance = axios.create({
    baseURL: 'https://eschooladmin.etbur.com/api/',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Fetch Weredas and Managers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, mRes] = await Promise.all([
          axiosInstance.get('weredas/'),
          axiosInstance.get('wereda/officer/'),
        ]);
        setWeredas(wRes.data);
        setManagers(mRes.data);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
    else setLoading(false);
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      national_id: '',
      kebele_id: '',
      department: '',
      subject: '',
      hire_date: '',
      salary: '',
      qualifications: '',
      address: '',
      emergency_contact: '',
      status: 'active',
      wereda: '',
    });
    setEditMode(false);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const requiredFields = ['first_name', 'last_name', 'email', 'department', 'wereda'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`${field.replace('_', ' ')} is required`);
        return;
      }
    }

    try {
      const payload = { ...formData, wereda: parseInt(formData.wereda) };
      let res;

      if (editMode) {
        res = await axiosInstance.put(`wereda/officer/${formData.id}/`, payload);
        setManagers((prev) =>
          prev.map((m) => (m.id === formData.id ? res.data : m))
        );
        setSuccessMessage('Manager updated successfully!');
      } else {
        res = await axiosInstance.post('wereda/officer/', payload);
        setManagers((prev) => [...prev, res.data]);
        setSuccessMessage('Manager registered successfully!');
      }

      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err.response || err);
      setErrorMessage(
        err.response?.data?.error || JSON.stringify(err.response?.data) || 'Error processing request'
      );
    }
  };

  // Edit handler
  const handleEdit = (manager) => {
    setFormData({
      id: manager.id,
      first_name: manager.user.first_name,
      last_name: manager.user.last_name,
      email: manager.user.email,
      phone: manager.user.phone || '',
      national_id: manager.national_id || '',
      kebele_id: manager.kebele_id || '',
      department: manager.department || '',
      subject: manager.subject || '',
      hire_date: manager.hire_date || '',
      salary: manager.salary || '',
      qualifications: manager.qualifications || '',
      address: manager.address || '',
      emergency_contact: manager.emergency_contact || '',
      status: manager.status || 'active',
      wereda: manager.wereda || '',
    });
    setEditMode(true);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;

    try {
      await axiosInstance.delete(`wereda/officer/${id}/`);
      setManagers((prev) => prev.filter((m) => m.id !== id));
      setSuccessMessage('Manager deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err.response || err);
      setErrorMessage('Failed to delete manager.');
    }
  };

  // View details (simple alert for demo)
  const handleView = (manager) => {
    alert(JSON.stringify(manager, null, 2));
  };

  if (loading) {
    return (
      <Layout>
        <div className="manager-reg-loading">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="manager-reg-container">
        <h1>{editMode ? 'Edit Manager' : 'Register New Manager'}</h1>

        {successMessage && (
          <div className="manager-reg-alert manager-reg-alert-success">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="manager-reg-alert manager-reg-alert-error">{errorMessage}</div>
        )}

        <div className="manager-reg-content">
          {/* Form Section */}
          <div className="manager-reg-form-section">
            <form onSubmit={handleSubmit} className="manager-reg-form">
              {/* All input fields */}
              <div className="manager-reg-form-row">
                <div className="manager-reg-form-group">
                  <label>First Name *</label>
                  <input name="first_name" value={formData.first_name} onChange={handleInputChange} required/>
                </div>
                <div className="manager-reg-form-group">
                  <label>Last Name *</label>
                  <input name="last_name" value={formData.last_name} onChange={handleInputChange} required/>
                </div>
              </div>

              <div className="manager-reg-form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required/>
              </div>

              <div className="manager-reg-form-group">
                <label>Phone</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange}/>
              </div>

              <div className="manager-reg-form-row">
                <div className="manager-reg-form-group">
                  <label>National Id</label>
                  <input name="national_id" value={formData.national_id} onChange={handleInputChange}/>
                </div>
                <div className="manager-reg-form-group">
                  <label>Kebele Id</label>
                  <input name="kebele_id" value={formData.kebele_id} onChange={handleInputChange}/>
                </div>
              </div>

              <div className="manager-reg-form-group">
                <label>Department *</label>
                <input name="department" value={formData.department} onChange={handleInputChange} required/>
              </div>
              <div className="manager-reg-form-group">
                <label>Subject</label>
                <input name="subject" value={formData.subject} onChange={handleInputChange}/>
              </div>
              <div className="manager-reg-form-group">
                <label>Hire Date</label>
                <input type="date" name="hire_date" value={formData.hire_date} onChange={handleInputChange}/>
              </div>
              <div className="manager-reg-form-group">
                <label>Salary</label>
                <input type="number" step="0.01" name="salary" value={formData.salary} onChange={handleInputChange}/>
              </div>
              <div className="manager-reg-form-group">
                <label>Qualifications</label>
                <textarea name="qualifications" value={formData.qualifications} onChange={handleInputChange}></textarea>
              </div>
              <div className="manager-reg-form-group">
                <label>Address</label>
                <input name="address" value={formData.address} onChange={handleInputChange}/>
              </div>
              <div className="manager-reg-form-group">
                <label>Emergency Contact</label>
                <input name="emergency_contact" value={formData.emergency_contact} onChange={handleInputChange}/>
              </div>

              <div className="manager-reg-form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="manager-reg-form-group">
                <label>Assign to Wereda *</label>
                <select name="wereda" value={formData.wereda} onChange={handleInputChange} required>
                  <option value="">-- Select Wereda --</option>
                  {weredas.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.zone})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="manager-reg-submit-btn">
                {editMode ? 'Update Manager' : 'Register Manager'}
              </button>
              {editMode && <button type="button" onClick={resetForm}>Cancel</button>}
            </form>
          </div>

          {/* Manager List */}
          <div className="manager-reg-list-section">
            <h2>Registered Managers</h2>
            {managers.length === 0 ? (
              <p>No managers registered yet.</p>
            ) : (
              <div className="manager-reg-list">
                {managers.map((manager) => {
                  const wereda = weredas.find((w) => w.id === manager.wereda);
                  return (
                    <div key={manager.id} className="manager-reg-card">
                      <div className="manager-reg-info">
                        <h3>{manager.user?.first_name} {manager.user?.last_name}</h3>
                        <p><strong>Email:</strong> {manager.user?.email}</p>
                        {manager.user?.phone && <p><strong>Phone:</strong> {manager.user.phone}</p>}
                        <p><strong>Department:</strong> {manager.department}</p>
                        {manager.subject && <p><strong>Subject:</strong> {manager.subject}</p>}
                        {manager.salary && <p><strong>Salary:</strong> {manager.salary}</p>}
                        {manager.address && <p><strong>Address:</strong> {manager.address}</p>}
                        {manager.emergency_contact && <p><strong>Emergency Contact:</strong> {manager.emergency_contact}</p>}
                        <p><strong>Status:</strong> {manager.status}</p>
                        <p><strong>Assigned Wereda:</strong> {wereda ? `${wereda.name} (${wereda.zone})` : 'Not assigned'}</p>
                        <p><strong>Registered on:</strong> {manager.created_at?.split('T')[0]}</p>
                        <div className="manager-actions">
                          <button onClick={() => handleEdit(manager)}><FaEdit/></button>
                          <button onClick={() => handleDelete(manager.id)}><FaTrash/></button>
                          <button onClick={() => handleView(manager)}><FaEye/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerRegistration;
