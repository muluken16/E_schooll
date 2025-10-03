// src/pages/SupervisorSchool/SupervisorSchool.jsx

import React, { useState, useEffect } from "react";
import Layout from "../../layout/Layout";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "./ADS.css";

const SupervisorSchool = () => {
  const token = localStorage.getItem("access_token"); // JWT token
  const [schools, setSchools] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    national_id: "",
    assigned_school_ids: [],
  });

  const axiosInstance = axios.create({
    baseURL: "https://eschooladmin.etbur.com/api/",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // --------------------------
  // Fetch schools & supervisors
  // --------------------------
  useEffect(() => {
    if (token) fetchSchoolsAndSupervisors();
    else setLoading(false);
  }, [token]);

  const fetchSchoolsAndSupervisors = async () => {
    try {
      setLoading(true);
      const [schoolsRes, supervisorsRes] = await Promise.all([
        axiosInstance.get("schools/"),
        axiosInstance.get("register_schools_supervisor/"),
      ]);
      setSchools(schoolsRes.data || []);
      setSupervisors(supervisorsRes.data || []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Handle input changes
  // --------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSchoolSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({ ...prev, assigned_school_ids: selected }));
  };

  // --------------------------
  // Submit form
  // --------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.national_id
    ) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    if (!formData.assigned_school_ids.length) {
      setErrorMessage("Please assign at least one school");
      return;
    }

    try {
      let response;
      if (formData.id) {
        // Update
        response = await axiosInstance.put(
          `register_schools_supervisor/${formData.id}/`,
          formData
        );
        setSupervisors((prev) =>
          prev.map((sup) => (sup.id === formData.id ? response.data : sup))
        );
        setSuccessMessage("Supervisor updated successfully!");
      } else {
        // Create
        response = await axiosInstance.post(
          "register_schools_supervisor/",
          formData
        );
        setSupervisors((prev) => [...prev, response.data]);
        setSuccessMessage(
          `Supervisor registered! Username: ${response.data.username}, Password: ${response.data.plain_password}`
        );
      }

      setFormData({
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        national_id: "",
        assigned_school_ids: [],
      });

      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.detail || "Failed to save supervisor"
      );
    }
  };

  // --------------------------
  // Edit / Delete
  // --------------------------
  const handleEdit = (sup) => {
    setFormData({
      id: sup.id,
      first_name: sup.first_name,
      last_name: sup.last_name,
      email: sup.email,
      national_id: sup.national_id,
      assigned_school_ids: sup.assigned_school_ids || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supervisor?")) return;
    try {
      await axiosInstance.delete(`register_schools_supervisor/${id}/`);
      setSupervisors((prev) => prev.filter((s) => s.id !== id));
      setSuccessMessage("Supervisor deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to delete supervisor");
    }
  };

  // --------------------------
  // Helper: safely get school names
  // --------------------------
  const getSchoolNames = (ids) => {
    if (!ids || !Array.isArray(ids)) return "None";
    return ids
      .map((id) => {
        const school = schools.find((s) => s.id === id);
        return school ? school.name : "Unknown";
      })
      .join(", ");
  };

  // --------------------------
  // Render loading
  // --------------------------
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
        <h1>{formData.id ? "Edit Supervisor" : "Register New Supervisor"}</h1>

        {successMessage && (
          <div className="manager-reg-alert manager-reg-alert-success">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="manager-reg-alert manager-reg-alert-error">
            {errorMessage}
          </div>
        )}

        <div className="manager-reg-content">
          {/* FORM */}
          <div className="manager-reg-form-section">
            <form onSubmit={handleSubmit} className="manager-reg-form">
              <div className="manager-reg-form-row">
                <div className="manager-reg-form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="manager-reg-form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
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
                />
              </div>

              <div className="manager-reg-form-group">
                <label>National ID *</label>
                <input
                  type="text"
                  name="national_id"
                  value={formData.national_id}
                  onChange={handleInputChange}
                />
              </div>

              <div className="manager-reg-form-group">
                <label>Assign Schools *</label>
                <select
                  multiple
                  size="6"
                  value={formData.assigned_school_ids}
                  onChange={handleSchoolSelect}
                >
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <small>Hold Ctrl/Cmd to select multiple</small>
              </div>

              <button type="submit" className="manager-reg-submit-btn">
                {formData.id ? "Update Supervisor" : "Register Supervisor"}
              </button>
            </form>
          </div>

          {/* SUPERVISOR LIST */}
          <div className="manager-reg-list-section">
            <h2>Registered Supervisors</h2>
            {supervisors.length === 0 ? (
              <p>No supervisors registered yet.</p>
            ) : (
              <div className="manager-reg-list">
                {supervisors.map((sup) => (
                  <div key={sup.id} className="manager-reg-card">
                    <div className="manager-reg-info">
                      <h3>
                        {sup.first_name} {sup.last_name}
                      </h3>
                      <p><strong>Email:</strong> {sup.email}</p>
                      <p><strong>National ID:</strong> {sup.national_id}</p>
                      <p><strong>Assigned Schools:</strong> {getSchoolNames(sup.assigned_school_ids)}</p>
                      {sup.username && <p><strong>Username:</strong> {sup.username}</p>}
                      {sup.plain_password && <p><strong>Password:</strong> {sup.plain_password}</p>}
                    </div>
                    <div className="manager-reg-actions">
                      <button onClick={() => handleEdit(sup)} title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDelete(sup.id)} title="Delete"><FaTrash /></button>
                      <button title="View"><FaEye /></button>
                    </div>
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

export default SupervisorSchool;
