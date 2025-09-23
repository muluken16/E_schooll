


      // src/pages/Schools/Schools.jsx
import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import './Schools.css';

const Schools = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [viewSchool, setViewSchool] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: 'Primary',
    type: 'Government',
    studentCount: '',
    teacherCount: '',
    principal: '',
    address: '',
    phone: '',
    email: '',
    established: ''
  });

  const token = localStorage.getItem('access_token');
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    if (token) fetchSchools();
    else setLoading(false);
  }, [token]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('schools/');
      setSchools(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load schools. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      level: 'Primary',
      type: 'Government',
      studentCount: '',
      teacherCount: '',
      principal: '',
      address: '',
      phone: '',
      email: '',
      established: ''
    });
    setEditingSchool(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        studentCount: formData.studentCount ? parseInt(formData.studentCount) : 0,
        teacherCount: formData.teacherCount ? parseInt(formData.teacherCount) : 0,
        established: formData.established ? parseInt(formData.established) : null,
      };

      let response;
      if (editingSchool) {
        response = await axiosInstance.put(`schools/${editingSchool.id}/`, payload);
        setSchools(prev => prev.map(s => s.id === editingSchool.id ? response.data : s));
        setSuccess('School updated successfully!');
      } else {
        response = await axiosInstance.post('schools/', payload);
        setSchools(prev => [...prev, response.data]);
        setSuccess('School added successfully!');
      }

      resetForm();
    } catch (err) {
      console.error(err.response || err);
      setError(err.response?.data?.message || 'Failed to save school. Please try again.');
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      level: school.level,
      type: school.type,
      studentCount: school.studentCount || '',
      teacherCount: school.teacherCount || '',
      principal: school.principal || '',
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      established: school.established || ''
    });
    setShowForm(true);
  };

  const handleView = (school) => setViewSchool(school);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;

    try {
      await axiosInstance.delete(`schools/${id}/`);
      setSchools(prev => prev.filter(s => s.id !== id));
      setSuccess('School deleted successfully!');
    } catch (err) {
      console.error(err.response || err);
      setError('Failed to delete school. Please try again.');
    }
  };

  const handleCancel = () => resetForm();

  const totalStudents = schools.reduce((acc, s) => acc + (parseInt(s.studentCount) || 0), 0);
  const totalTeachers = schools.reduce((acc, s) => acc + (parseInt(s.teacherCount) || 0), 0);

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (school.principal || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (school.address || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || school.level === levelFilter;
    const matchesType = typeFilter === 'All' || school.type === typeFilter;
    return matchesSearch && matchesLevel && matchesType;
  });

  return (
    <Layout>
      <div className="schools-container">
        <div className="page-header">
          <h1>Schools Management</h1>
          <p>Manage schools in your subcity/wereda</p>
        </div>

        {error && <div className="alert alert-error">{error} <button onClick={() => setError('')}>×</button></div>}
        {success && <div className="alert alert-success">{success} <button onClick={() => setSuccess('')}>×</button></div>}

        <div className="dashboard-cards">
          <div className="card">
            <h3>{schools.length}</h3>
            <p>Total Schools</p>
          </div>
          <div className="card">
            <h3>{totalStudents.toLocaleString()}</h3>
            <p>Total Students</p>
          </div>
          <div className="card">
            <h3>{totalTeachers.toLocaleString()}</h3>
            <p>Total Teachers</p>
          </div>
        </div>

        <div className="schools-header">
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="All">All Levels</option>
            <option value="Primary">Primary</option>
            <option value="Secondary">Secondary</option>
            <option value="Preparatory">Preparatory</option>
            <option value="Combined">Combined</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Government">Government</option>
            <option value="Private">Private</option>
            <option value="NGO">NGO</option>
            <option value="Religious">Religious</option>
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add New School</button>
        </div>

        {/* Registration Form Modal */}
      {showForm && (
          <div className="form-modal">
            <div className="form-container">
              <h3>{editingSchool ? 'Edit School' : 'Add New School'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>School Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>School Code *</label>
                  <input type="text" name="code" value={formData.code} onChange={handleInputChange} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Level</label>
                    <select name="level" value={formData.level} onChange={handleInputChange}>
                      <option value="Primary">Primary</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Preparatory">Preparatory</option>
                      <option value="Combined">Combined</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange}>
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                      <option value="NGO">NGO</option>
                      <option value="Religious">Religious</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Students</label>
                    <input type="number" name="studentCount" value={formData.studentCount} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Teachers</label>
                    <input type="number" name="teacherCount" value={formData.teacherCount} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Principal</label>
                  <input type="text" name="principal" value={formData.principal} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Established</label>
                  <input type="number" name="established" value={formData.established} onChange={handleInputChange} />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingSchool ? 'Update School' : 'Add School'}</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* View School Modal */}
        {viewSchool && (
          <div className="form-modal">
            <div className="form-container">
              <h3>View School</h3>
              <p><strong>Name:</strong> {viewSchool.name}</p>
              <p><strong>Code:</strong> {viewSchool.code}</p>
              <p><strong>Level:</strong> {viewSchool.level}</p>
              <p><strong>Type:</strong> {viewSchool.type}</p>
              <p><strong>Students:</strong> {viewSchool.studentCount}</p>
              <p><strong>Teachers:</strong> {viewSchool.teacherCount}</p>
              <p><strong>Principal:</strong> {viewSchool.principal}</p>
              <p><strong>Address:</strong> {viewSchool.address}</p>
              <p><strong>Phone:</strong> {viewSchool.phone}</p>
              <p><strong>Email:</strong> {viewSchool.email}</p>
              <p><strong>Established:</strong> {viewSchool.established}</p>
              <div className="form-actions">
                <button onClick={() => setViewSchool(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Schools Table */}
        {loading ? <div className="loading">Loading schools...</div> : (
          <div className="table-container">
            <table className="school-table">
              <thead>
                <tr>
                  <th>Name</th><th>Code</th><th>Level</th><th>Type</th>
                  <th>Students</th><th>Teachers</th><th>Principal</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length === 0 ? (
                  <tr><td colSpan="8">No schools found.</td></tr>
                ) : filteredSchools.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.code}</td>
                    <td>{s.level}</td>
                    <td>{s.type}</td>
                    <td>{s.studentCount || 0}</td>
                    <td>{s.teacherCount || 0}</td>
                    <td>{s.principal}</td>
                    <td className="action-icons">
                      <FaEye onClick={() => handleView(s)} title="View" />
                      <FaEdit onClick={() => handleEdit(s)} title="Edit" />
                      <FaTrash onClick={() => handleDelete(s.id)} title="Delete" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Schools;
