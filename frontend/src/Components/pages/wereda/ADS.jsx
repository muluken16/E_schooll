// src/pages/ManagerSchool/ManagerSchool.jsx

import React, { useState, useEffect } from "react";
import Layout from "../../layout/Layout";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import "./ADS.css";

const ManagerSchool = () => {
  const token = localStorage.getItem("access_token"); // JWT token
  const [schools, setSchools] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    id: null, // For edit
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    national_id: "",
    kebele_id: "",
    assigned_school_id: "",
  });

  const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Fetch data
  useEffect(() => {
    if (token) fetchSchools();
  }, [token]);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const schoolsRes = await axiosInstance.get("schools/");
      const managersRes = await axiosInstance.get("register_school_manager/");
      setSchools(schoolsRes.data);
      setManagers(managersRes.data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const requiredFields = [
      "first_name",
      "last_name",
      "email",
      "national_id",
      "assigned_school_id",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`${field.replace("_", " ")} is required`);
        return;
      }
    }

    try {
      let response;
      if (formData.id) {
        // Update
        response = await axiosInstance.put(
          `register_school_manager/${formData.id}/`,
          formData
        );
        setManagers((prev) =>
          prev.map((m) => (m.id === formData.id ? response.data : m))
        );
        setSuccessMessage("Manager updated successfully!");
      } else {
        // Create
        response = await axiosInstance.post(
          "register_school_manager/",
          formData
        );
        setManagers((prev) => [...prev, response.data]);
        setSuccessMessage("Manager registered successfully!");
      }

      setFormData({
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        national_id: "",
        kebele_id: "",
        assigned_school_id: "",
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.detail || "Failed to save manager"
      );
    }
  };

  const handleEdit = (manager) => {
    setFormData({
      id: manager.id,
      first_name: manager.user.first_name,
      last_name: manager.user.last_name,
      email: manager.user.email,
      phone: manager.phone || "",
      national_id: manager.user.national_id,
      kebele_id: manager.kebele_id || "",
      assigned_school_id: manager.school?.id || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manager?")) return;
    try {
      await axiosInstance.delete(`register_school_manager/${id}/`);
      setManagers((prev) => prev.filter((m) => m.id !== id));
      setSuccessMessage("Manager deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to delete manager");
    }
  };

  const getSchoolName = (school) => (school ? school.name : "Not assigned");

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
        <h1>{formData.id ? "Edit Manager" : "Register New School Manager"}</h1>

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
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="manager-reg-form-row">
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
                  <label>Kebele ID</label>
                  <input
                    type="text"
                    name="kebele_id"
                    value={formData.kebele_id}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="manager-reg-form-group">
                <label>Assign to School *</label>
                <select
                  name="assigned_school_id"
                  value={formData.assigned_school_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select School --</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="manager-reg-submit-btn">
                {formData.id ? "Update Manager" : "Register Manager"}
              </button>
            </form>
          </div>

          {/* MANAGER LIST */}
          <div className="manager-reg-list-section">
            <h2>Registered Managers</h2>
            {managers.length === 0 ? (
              <p>No managers registered yet.</p>
            ) : (
              <div className="manager-reg-list">
                {managers.map((manager) => (
                  <div key={manager.id} className="manager-reg-card">
                    <div className="manager-reg-info">
                      <h3>
                        {manager.user.first_name} {manager.user.last_name}
                      </h3>
                      <p>
                        <strong>Email:</strong> {manager.user.email}
                      </p>
                      {manager.phone && <p><strong>Phone:</strong> {manager.phone}</p>}
                      <p><strong>National ID:</strong> {manager.user.national_id}</p>
                      {manager.kebele_id && <p><strong>Kebele ID:</strong> {manager.kebele_id}</p>}
                      <p><strong>Assigned School:</strong> {getSchoolName(manager.school)}</p>
                      <p>
                        <strong>Registered on:</strong>{" "}
                        {new Date(manager.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="manager-reg-actions">
                      <button onClick={() => handleEdit(manager)} title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(manager.id)} title="Delete">
                        <FaTrash />
                      </button>
                      <button title="View">
                        <FaEye />
                      </button>
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

export default ManagerSchool;
