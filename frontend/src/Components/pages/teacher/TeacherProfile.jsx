import React, { useState, useEffect } from 'react';
import TeacherLayout from './TeacherLayout';
import teacherAPI from './TeacherAPI';
import { 
  FaUser, FaEdit, FaSave, FaTimes, FaBook, FaCalendarAlt, 
  FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap 
} from 'react-icons/fa';
import './TeacherProfile.css';

const TeacherProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchSubjects();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await teacherAPI.getProfile();
      setProfileData(data);
      setEditForm({
        first_name: data.user?.first_name || '',
        last_name: data.user?.last_name || '',
        email: data.user?.email || '',
        phone: data.phone || '',
        address: data.address || '',
        department: data.department || '',
        academic_rank: data.academic_rank || '',
        qualification: data.qualification || '',
        experience_years: data.experience_years || '',
        specialization: data.specialization || ''
      });
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await teacherAPI.getMySubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original data
      setEditForm({
        first_name: profileData.user?.first_name || '',
        last_name: profileData.user?.last_name || '',
        email: profileData.user?.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        department: profileData.department || '',
        academic_rank: profileData.academic_rank || '',
        qualification: profileData.qualification || '',
        experience_years: profileData.experience_years || '',
        specialization: profileData.specialization || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      await teacherAPI.updateProfile(editForm);
      await fetchProfile(); // Refresh profile data
      setIsEditing(false);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <TeacherLayout><div className="loading">Loading profile...</div></TeacherLayout>;
  if (error) return <TeacherLayout><div className="error">{error}</div></TeacherLayout>;

  return (
    <TeacherLayout>
      <div className="teacher-profile">
        <div className="profile-header">
          <div className="header-content">
            <div className="profile-title">
              <h1>My Profile</h1>
              <p>Manage your personal and professional information</p>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button className="edit-btn" onClick={handleEditToggle}>
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>
                    <FaSave /> Save Changes
                  </button>
                  <button className="cancel-btn" onClick={handleEditToggle}>
                    <FaTimes /> Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
          {/* Basic Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3><FaUser /> Basic Information</h3>
            </div>
            <div className="card-content">
              <div className="profile-photo-section">
                <div className="profile-photo">
                  {profileData?.user?.profile_photo ? (
                    <img src={profileData.user.profile_photo} alt="Profile" />
                  ) : (
                    <div className="photo-placeholder">
                      <FaUser />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="change-photo-btn">
                    Change Photo
                  </button>
                )}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label><FaUser /> First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                    />
                  ) : (
                    <span>{profileData?.user?.first_name || 'Not provided'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label><FaUser /> Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                    />
                  ) : (
                    <span>{profileData?.user?.last_name || 'Not provided'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label><FaEnvelope /> Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <span>{profileData?.user?.email || 'Not provided'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label><FaPhone /> Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <span>{profileData?.phone || 'Not provided'}</span>
                  )}
                </div>

                <div className="info-item full-width">
                  <label><FaMapMarkerAlt /> Address</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="2"
                    />
                  ) : (
                    <span>{profileData?.address || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3><FaGraduationCap /> Professional Information</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label><FaIdCard /> Employee ID</label>
                  <span>{profileData?.employee_id || 'Not assigned'}</span>
                </div>

                <div className="info-item">
                  <label><FaGraduationCap /> Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    />
                  ) : (
                    <span>{profileData?.department || 'Not provided'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label><FaGraduationCap /> Academic Rank</label>
                  {isEditing ? (
                    <select
                      value={editForm.academic_rank}
                      onChange={(e) => handleInputChange('academic_rank', e.target.value)}
                    >
                      <option value="">Select Rank</option>
                      <option value="Junior Teacher">Junior Teacher</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Senior Teacher">Senior Teacher</option>
                      <option value="Head Teacher">Head Teacher</option>
                      <option value="Principal">Principal</option>
                    </select>
                  ) : (
                    <span>{profileData?.academic_rank || 'Not provided'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label><FaCalendarAlt /> Hire Date</label>
                  <span>{profileData?.hire_date ? new Date(profileData.hire_date).toLocaleDateString() : 'Not provided'}</span>
                </div>

                <div className="info-item">
                  <label><FaGraduationCap /> Qualification</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      placeholder="e.g., M.Ed, B.Sc, PhD"
                    />
                  ) : (
                    <span>{profileData?.qualification || 'Not provided'}</span>
                  )}
                </div>

                <div className="info-item">
                  <label><FaCalendarAlt /> Experience (Years)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.experience_years}
                      onChange={(e) => handleInputChange('experience_years', e.target.value)}
                      min="0"
                    />
                  ) : (
                    <span>{profileData?.experience_years ? `${profileData.experience_years} years` : 'Not provided'}</span>
                  )}
                </div>

                <div className="info-item full-width">
                  <label><FaBook /> Specialization</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      rows="2"
                      placeholder="Areas of expertise and specialization"
                    />
                  ) : (
                    <span>{profileData?.specialization || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Taught Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3><FaBook /> Subjects Taught</h3>
            </div>
            <div className="card-content">
              {subjects.length > 0 ? (
                <div className="subjects-grid">
                  {subjects.map((subject, index) => (
                    <div key={index} className="subject-card">
                      <div className="subject-header">
                        <h4>{subject.name}</h4>
                        <span className="subject-code">{subject.code}</span>
                      </div>
                      <div className="subject-details">
                        <div className="subject-info">
                          <span className="info-label">Credit Hours:</span>
                          <span className="info-value">{subject.credit_hours}</span>
                        </div>
                        <div className="subject-info">
                          <span className="info-label">Department:</span>
                          <span className="info-value">{subject.department}</span>
                        </div>
                        <div className="subject-info">
                          <span className="info-label">Level:</span>
                          <span className="info-value">{subject.level}</span>
                        </div>
                        {subject.sections && subject.sections.length > 0 && (
                          <div className="subject-sections">
                            <span className="info-label">Sections:</span>
                            <div className="sections-list">
                              {subject.sections.map((section, idx) => (
                                <span key={idx} className="section-tag">
                                  {section.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="subject-stats">
                        <div className="stat-item">
                          <span className="stat-value">{subject.total_students || 0}</span>
                          <span className="stat-label">Students</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">{subject.average_grade || 0}%</span>
                          <span className="stat-label">Avg Grade</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-value">{subject.attendance_rate || 0}%</span>
                          <span className="stat-label">Attendance</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-subjects">
                  <FaBook className="no-subjects-icon" />
                  <p>No subjects assigned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h3><FaIdCard /> Account Information</h3>
            </div>
            <div className="card-content">
              <div className="info-grid">
                <div className="info-item">
                  <label>Username</label>
                  <span>{profileData?.user?.username || 'Not provided'}</span>
                </div>

                <div className="info-item">
                  <label>Role</label>
                  <span className="role-badge">Teacher</span>
                </div>

                <div className="info-item">
                  <label>Account Status</label>
                  <span className={`status-badge ${profileData?.user?.is_active ? 'active' : 'inactive'}`}>
                    {profileData?.user?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="info-item">
                  <label>Last Login</label>
                  <span>{profileData?.user?.last_login ? new Date(profileData.user.last_login).toLocaleString() : 'Never'}</span>
                </div>

                <div className="info-item">
                  <label>Date Joined</label>
                  <span>{profileData?.user?.date_joined ? new Date(profileData.user.date_joined).toLocaleDateString() : 'Not available'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherProfile;