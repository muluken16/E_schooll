import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import './StudentProfile.css';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}my_profile/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading profile...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;
  if (!profile) return <Layout><div className="error">Profile not found</div></Layout>;

  return (
    <Layout>
      <div className="student-profile">
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.user?.profile_photo ? (
              <img src={profile.user.profile_photo} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {profile.user?.first_name?.[0]}{profile.user?.last_name?.[0]}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h1>{profile.user?.first_name} {profile.user?.last_name}</h1>
            <p className="student-id">Student ID: {profile.student_id}</p>
            <p className="admission-no">Admission No: {profile.admission_no}</p>
            <span className={`status-badge ${profile.academic_status?.toLowerCase()}`}>
              {profile.academic_status}
            </span>
          </div>
        </div>

        <div className="profile-sections">
          <div className="section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <span>{profile.user?.first_name} {profile.user?.last_name}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{profile.user?.email || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{profile.phone || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <span>{profile.gender || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <span>{profile.dob || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Blood Group</label>
                <span>{profile.blood_group || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Address</label>
                <span>{profile.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Academic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Class/Section</label>
                <span>{profile.class_section}</span>
              </div>
              <div className="info-item">
                <label>Department</label>
                <span>{profile.department || 'Not assigned'}</span>
              </div>
              <div className="info-item">
                <label>Year</label>
                <span>{profile.year || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Enrollment Date</label>
                <span>{profile.enrollment_date || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Academic Status</label>
                <span className={`status ${profile.academic_status?.toLowerCase()}`}>
                  {profile.academic_status}
                </span>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Guardian Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Father's Name</label>
                <span>{profile.father_name || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Mother's Name</label>
                <span>{profile.mother_name || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Guardian Contact</label>
                <span>{profile.guardian_contact || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Guardian Email</label>
                <span>{profile.guardian_email || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Guardian Relation</label>
                <span>{profile.guardian_relation || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Medical Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Blood Group</label>
                <span>{profile.blood_group || 'Not specified'}</span>
              </div>
              <div className="info-item full-width">
                <label>Medical Conditions</label>
                <span>{profile.medical_condition || 'None reported'}</span>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>Additional Information</h3>
            <div className="info-grid">
              <div className="info-item full-width">
                <label>Extra-curricular Activities</label>
                <span>{profile.extra_activities || 'None reported'}</span>
              </div>
              <div className="info-item full-width">
                <label>Remarks</label>
                <span>{profile.remarks || 'No remarks'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentProfile;