// src/Components/pages/school/SchoolStaff.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Layout from '../../layout/Layout';
import { FaEllipsisV, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './SchoolStaff.css';

const API_URL = "http://127.0.0.1:8000/api/employees/";

const SchoolStaff = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', role: 'teacher',
    department: '', subject: '', hire_date: '', salary: '', qualifications: '',
    status: 'active', address: '', emergency_contact: '', notes: '', profile_photo: null,
    national_id: ''
  });

  const dropdownRefs = useRef({});

  // Fetch employees on mount
  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_URL);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees", err);
      alert("Failed to fetch employees.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      first_name: '', last_name: '', email: '', phone: '', role: 'teacher',
      department: '', subject: '', hire_date: '', salary: '', qualifications: '',
      status: 'active', address: '', emergency_contact: '', notes: '', profile_photo: null,
      national_id: ''
    });
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) { alert("First name is required"); return false; }
    if (!formData.last_name.trim()) { alert("Last name is required"); return false; }
    if (!formData.phone.trim()) { alert("Phone number is required"); return false; }
    if (!formData.department.trim()) { alert("Department is required"); return false; }
    if (!formData.national_id.trim()) { alert("National ID is required"); return false; }
    if (formData.role === 'teacher' && !formData.subject.trim()) { alert("Subject is required for teachers"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = new FormData();
      ['first_name','last_name','email','role','national_id'].forEach(k => { if(formData[k]) data.append(k, formData[k]); });
      ['phone','department','subject','hire_date','salary','qualifications','status','address','emergency_contact','notes'].forEach(k => { if(formData[k]) data.append(k, formData[k]); });
      if (formData.profile_photo) data.append('profile_photo', formData.profile_photo);

      if (editingEmployee) {
        await axios.put(`${API_URL}${editingEmployee.id}/`, data, { headers:{'Content-Type':'multipart/form-data'} });
        alert("Employee updated successfully!");
      } else {
        await axios.post(API_URL, data, { headers:{'Content-Type':'multipart/form-data'} });
        alert("Employee added successfully!");
      }

      fetchEmployees();
      setShowAddForm(false);
      setEditingEmployee(null);
      resetForm();
    } catch (err) {
      console.error("Error saving employee", err.response?.data || err);
      alert("Failed to save employee.");
    }
  };

  const editEmployee = (employee) => {
    const { user, ...profile } = employee;
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      role: user?.role || 'teacher',
      national_id: user?.national_id || '',
      phone: profile.phone || '',
      ...profile,
      profile_photo: null
    });
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  const deleteEmployee = async (employee) => {
    if (window.confirm(`Delete ${employee.user?.first_name || ''} ${employee.user?.last_name || ''}?`)) {
      try { await axios.delete(`${API_URL}${employee.id}/`); fetchEmployees(); alert("Employee deleted successfully!"); }
      catch(err){ console.error("Error deleting employee", err); alert("Failed to delete employee."); }
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(prev => prev === id ? null : id);
  };

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${API_URL}${emp.id}/`, { ...emp, status: newStatus });
      fetchEmployees();
      alert(`Employee is now ${newStatus}`);
    } catch(err) {
      console.error(err);
      alert('Failed to change status');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.user?.first_name || ''} ${employee.user?.last_name || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (employee.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment==='all' || (employee.department||'')===filterDepartment;
    const matchesStatus = filterStatus==='all' || (employee.status||'')===filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = ['all', ...new Set(employees.map(e => e.department || ''))];

  const getStatusBadge = (status) => {
    switch(status){
      case 'active': return <span className="badge badge-success">Active</span>;
      case 'on_leave': return <span className="badge badge-warning">On Leave</span>;
      case 'inactive': return <span className="badge badge-error">Inactive</span>;
      default: return <span className="badge">Unknown</span>;
    }
  };

  const getProfilePhoto = (photo) => photo ? photo : '/default-avatar.png';

  return (
    <Layout>
      <div className="school-staff-container">

        {/* Header */}
        <div className="page-header">
          <h1>School Staff Management</h1>
          <p className="welcome-message">Welcome, Director {user?.name}</p>
        </div>

        {/* Dashboard Cards */}
        <div className="dashboard-cards">
          <div className="stat-card"><h3>Total Staff</h3><p>{employees.length}</p></div>
          <div className="stat-card"><h3>Teachers</h3><p>{employees.filter(e=>e.role==='teacher').length}</p></div>
          <div className="stat-card"><h3>Admin Staff</h3><p>{employees.filter(e=>e.role!=='teacher').length}</p></div>
          <div className="stat-card"><h3>Active Staff</h3><p>{employees.filter(e=>e.status==='active').length}</p></div>
        </div>

        {/* Filters & Add */}
        <div className="controls-section">
          <div className="filters">
            <div className="filter-group"><label>Search:</label><input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} /></div>
            <div className="filter-group"><label>Department:</label>
              <select value={filterDepartment} onChange={e=>setFilterDepartment(e.target.value)}>
                {departments.map((dept,i)=><option key={i} value={dept}>{dept||'Unassigned'}</option>)}
              </select>
            </div>
            <div className="filter-group"><label>Status:</label>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={()=>{resetForm(); setEditingEmployee(null); setShowAddForm(true);}}>+ Add Employee</button>
        </div>

        {/* Add/Edit Form */}
        {/* Add/Edit Form */}
       {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingEmployee?'Edit Employee':'Add New Employee'}</h2>
              <form onSubmit={handleSubmit}>

                {/* Name */}
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required/>
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required/>
                  </div>
                </div>

                {/* Email / Phone / National ID */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}/>
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required/>
                  </div>
                  <div className="form-group">
                    <label>National ID *</label>
                    <input type="text" name="national_id" value={formData.national_id} onChange={handleInputChange} required/>
                  </div>
                </div>

                {/* Role / Status */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select name="role" value={formData.role} onChange={handleInputChange} required>
                      <option value="teacher">Teacher</option>
                      <option value="vice_director">Vice Director</option>
                      <option value="department_head">Department Head</option>
                      <option value="record_officer">Record Officer</option>
                      <option value="librarian">Librarian</option>
                      <option value="store_man">Store Manager</option>
                      <option value="inventorian">Inventorian</option>
                      <option value="hr_officer">HR Officer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} required>
                      <option value="active">Active</option>
                      <option value="on_leave">On Leave</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Department / Subject */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Department *</label>
                    <input type="text" name="department" value={formData.department} onChange={handleInputChange} required/>
                  </div>
                  {formData.role==='teacher' && (
                    <div className="form-group">
                      <label>Subject *</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required/>
                    </div>
                  )}
                </div>

                {/* Hire Date / Salary */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Hire Date</label>
                    <input type="date" name="hire_date" value={formData.hire_date} onChange={handleInputChange}/>
                  </div>
                  <div className="form-group">
                    <label>Salary ($)</label>
                    <input type="number" name="salary" value={formData.salary} onChange={handleInputChange}/>
                  </div>
                </div>

                {/* Other Fields */}
                <div className="form-group">
                  <label>Qualifications</label>
                  <input type="text" name="qualifications" value={formData.qualifications} onChange={handleInputChange}/>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange}/>
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input type="text" name="emergency_contact" value={formData.emergency_contact} onChange={handleInputChange}/>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3"/>
                </div>
                <div className="form-group">
                  <label>Profile Photo</label>
                  <input type="file" name="profile_photo" accept="image/*" onChange={handleInputChange}/>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">{editingEmployee?'Update Employee':'Add Employee'}</button>
                  <button type="button" className="btn btn-secondary" onClick={()=>{setShowAddForm(false); setEditingEmployee(null);}}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Employees Grid */}
        <div className="employees-table-container">
          <h2>Staff Directory ({filteredEmployees.length})</h2>
          {filteredEmployees.length===0 ? <p>No employees found.</p> : (
            <div className="employees-grid">
              {filteredEmployees.map(emp => (
                <div key={emp.id} className="employee-card">
                  <div className="employee-card-header">
                    <img src={getProfilePhoto(emp.user?.profile_photo)} alt={`${emp.user?.first_name||''} ${emp.user?.last_name||''}`} className="profile-photo-small"/>
                    <div className="employee-info">
                      <h3>{emp.user?.first_name} {emp.user?.last_name}</h3>
                      <p className="role">{emp.user?.role || emp.role}</p>
                      {getStatusBadge(emp.status)}
                    </div>
                    <div className="more-icon" onClick={()=>toggleDropdown(emp.id)}>
                      <FaEllipsisV />
                      {activeDropdown===emp.id && (
                        <div className="dropdown-menu">
                          <button className="dropdown-item" onClick={()=>editEmployee(emp)}>
                            <FaEdit style={{ marginRight: '6px' }}/> Edit
                          </button>
                          <button className="dropdown-item" onClick={()=>deleteEmployee(emp)}>
                            <FaTrash style={{ marginRight: '6px' }}/> Delete
                          </button>
                          <button className="dropdown-item" onClick={()=>toggleStatus(emp)}>
                            {emp.status==='active'? <FaToggleOff style={{ marginRight:'6px' }}/> : <FaToggleOn style={{ marginRight:'6px' }}/>}
                            {emp.status==='active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="employee-details">
                    <p><strong>Department:</strong> {emp.department || 'N/A'}</p>
                    {emp.subject && <p><strong>Subject:</strong> {emp.subject}</p>}
                    <p><strong>Email:</strong> {emp.user?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {emp.phone || 'N/A'}</p>
                    <p><strong>National ID:</strong> {emp.user?.national_id || 'N/A'}</p>
                    <p><strong>Hire Date:</strong> {emp.hire_date || 'N/A'}</p>
                    <p><strong>Salary:</strong> ${emp.salary?Number(emp.salary).toLocaleString():'0'}</p>
                  </div>
                  {emp.notes && <p className="notes"><strong>Notes:</strong> {emp.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default SchoolStaff;
