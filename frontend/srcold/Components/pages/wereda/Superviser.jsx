import React, { useState, useEffect } from "react";
import Layout from "../../layout/Layout";
import "./ADS.css";

const API_BASE = "http://localhost:8000/api"; // adjust to your backend

const SupervisorSchool = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [schools, setSchools] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    national_id: "",
    assigned_school_ids: [],
  });

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Token ${user?.token}`, // remove if no auth
  };

  // Fetch schools & supervisors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsRes, supervisorsRes] = await Promise.all([
          fetch(`${API_BASE}/schools/`, { headers }),
          fetch(`${API_BASE}/register_schools_supervisor/`, { headers }),
        ]);

        if (!schoolsRes.ok || !supervisorsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const schoolsData = await schoolsRes.json();
        const supervisorsData = await supervisorsRes.json();

        setSchools(Array.isArray(schoolsData) ? schoolsData : schoolsData.results || []);
        setSupervisors(Array.isArray(supervisorsData) ? supervisorsData : supervisorsData.results || []);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Multi-select schools
  const handleSchoolSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => parseInt(option.value));
    setFormData({ ...formData, assigned_school_ids: selected });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.national_id) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    if (!formData.assigned_school_ids.length) {
      setErrorMessage("Please assign at least one school");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/register_schools_supervisor/`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(result));
      }

      setSupervisors([...supervisors, result]);
      setSuccessMessage(
        `Supervisor registered! Username: ${result.username}, Password: ${result.plain_password}`
      );

      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        national_id: "",
        assigned_school_ids: [],
      });

      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Failed to register supervisor");
    }
  };

  const getSchoolNames = (ids) => {
    return ids
      .map((id) => {
        const school = schools.find((s) => s.id === id);
        return school ? school.name : "Unknown";
      })
      .join(", ");
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
        <h1>Register New Supervisor</h1>

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
            <h2>Supervisor Details</h2>
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
                <label>Assign Schools *</label>
                <select
                  multiple
                  size="6"
                  name="assigned_school_ids"
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
                Register Supervisor
              </button>
            </form>
          </div>

          {/* SUPERVISOR LIST */}
          <div className="manager-reg-list-section">
            <h2>Registered Supervisors</h2>
            {supervisors.length === 0 ? (
              <p className="manager-reg-no-managers">
                No supervisors registered yet.
              </p>
            ) : (
              <div className="manager-reg-list">
                {supervisors.map((sup) => (
                  <div key={sup.id} className="manager-reg-card">
                    <div className="manager-reg-info">
                      <h3>
                        {sup.first_name} {sup.last_name}
                      </h3>
                      <p>
                        <strong>Email:</strong> {sup.email}
                      </p>
                      <p>
                        <strong>National ID:</strong> {sup.national_id}
                      </p>
                      <p>
                        <strong>Assigned Schools:</strong>{" "}
                        {sup.assigned_school_ids
                          ? getSchoolNames(sup.assigned_school_ids)
                          : "None"}
                      </p>
                      {sup.username && (
                        <p>
                          <strong>Username:</strong> {sup.username}
                        </p>
                      )}
                      {sup.plain_password && (
                        <p>
                          <strong>Password:</strong> {sup.plain_password}
                        </p>
                      )}
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
