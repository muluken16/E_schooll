import React, { useState, useEffect } from "react";
import Layout from "../../layout/Layout";
import "./ADS.css";

const API_BASE = "http://localhost:8000/api"; // adjust to your backend

const ManagerSchool = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [schools, setSchools] = useState([]);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    national_id: "",
    kebele_id: "",
    assigned_school_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${user?.token}`, // remove if you don’t use auth
  };

  // Fetch schools & managers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsRes, managersRes] = await Promise.all([
          fetch(`${API_BASE}/schools/`, { headers }),
          fetch(`${API_BASE}/register_school_manager/`, { headers }),
        ]);

        if (!schoolsRes.ok || !managersRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const schoolsData = await schoolsRes.json();
        const managersData = await managersRes.json();

        setSchools(schoolsData);
        setManagers(managersData);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.national_id) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    if (!formData.assigned_school_id) {
      setErrorMessage("Please assign the manager to a school");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/register_school_manager/`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to register manager");
      }

      const newManager = await response.json();

      setManagers([...managers, newManager]);
      setSuccessMessage("Manager registered successfully!");

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        national_id: "",
        kebele_id: "",
        assigned_school_id: "",
      });

      // Auto clear message
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to register manager");
    }
  };

  const getSchoolName = (schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.name : "Not assigned";
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
        <h1>Register New School Manager</h1>

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
                    placeholder="Enter first name"
                  />
                </div>

                <div className="manager-reg-form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="manager-reg-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="manager-reg-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
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
                    placeholder="Enter National ID"
                  />
                </div>

                <div className="manager-reg-form-group">
                  <label>Kebele ID</label>
                  <input
                    type="text"
                    name="kebele_id"
                    value={formData.kebele_id}
                    onChange={handleInputChange}
                    placeholder="Enter Kebele ID"
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
                Register Manager
              </button>
            </form>
          </div>

          {/* MANAGER LIST */}
          <div className="manager-reg-list-section">
            <h2>Registered Managers</h2>
            {managers.length === 0 ? (
              <p className="manager-reg-no-managers">
                No managers registered yet.
              </p>
            ) : (
              <div className="manager-reg-list">
                {managers.map((manager) => (
                  <div key={manager.id} className="manager-reg-card">
                    <div className="manager-reg-info">
                      <h3>
                        {manager.first_name} {manager.last_name}
                      </h3>
                      <p>
                        <strong>Email:</strong> {manager.email}
                      </p>
                      {manager.phone && (
                        <p>
                          <strong>Phone:</strong> {manager.phone}
                        </p>
                      )}
                      <p>
                        <strong>National ID:</strong> {manager.national_id}
                      </p>
                      {manager.kebele_id && (
                        <p>
                          <strong>Kebele ID:</strong> {manager.kebele_id}
                        </p>
                      )}
                      <p>
                        <strong>Assigned School:</strong>{" "}
                        {getSchoolName(manager.assigned_school_id)}
                      </p>
                      <p>
                        <strong>Registered on:</strong>{" "}
                        {manager.date_created || "N/A"}
                      </p>
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
