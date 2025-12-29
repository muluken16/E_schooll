import React, { useState, useEffect } from 'react';

const TestPage = () => {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      // Test login
      const loginResponse = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'john.student@school.com',
          password: 'password123'
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        setApiStatus('✅ API Connection Successful!');
        
        // Test student profile
        const profileResponse = await fetch('http://127.0.0.1:8000/api/student-self/my_profile/', {
          headers: {
            'Authorization': `Bearer ${loginData.access_token}`
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setStudentData(profileData);
        }
      } else {
        setApiStatus('❌ API Connection Failed');
      }
    } catch (error) {
      setApiStatus('❌ API Connection Error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎓 E-School System Test Page</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h2>API Status</h2>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{apiStatus}</p>
      </div>

      {studentData && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fff0', borderRadius: '8px' }}>
          <h2>Sample Student Data</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <p><strong>Name:</strong> {studentData.user?.first_name} {studentData.user?.last_name}</p>
            <p><strong>Student ID:</strong> {studentData.student_id}</p>
            <p><strong>Admission No:</strong> {studentData.admission_no}</p>
            <p><strong>Class:</strong> {studentData.class_section}</p>
            <p><strong>Department:</strong> {studentData.department}</p>
            <p><strong>Status:</strong> {studentData.academic_status}</p>
            <p><strong>Email:</strong> {studentData.user?.email}</p>
            <p><strong>Phone:</strong> {studentData.phone}</p>
          </div>
        </div>
      )}

      <div style={{ padding: '15px', backgroundColor: '#fff8dc', borderRadius: '8px' }}>
        <h2>🌐 Access Information</h2>
        <div style={{ marginBottom: '15px' }}>
          <h3>Backend (Django API)</h3>
          <p>URL: <a href="http://127.0.0.1:8000/api/" target="_blank" rel="noopener noreferrer">http://127.0.0.1:8000/api/</a></p>
          <p>Admin Panel: <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noopener noreferrer">http://127.0.0.1:8000/admin/</a></p>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <h3>Frontend (React App)</h3>
          <p>URL: <a href="http://localhost:3001/" target="_blank" rel="noopener noreferrer">http://localhost:3001/</a></p>
          <p>Login Page: <a href="http://localhost:3001/login" target="_blank" rel="noopener noreferrer">http://localhost:3001/login</a></p>
        </div>

        <div>
          <h3>👤 Test Student Credentials</h3>
          <p><strong>Username:</strong> john_student</p>
          <p><strong>Email:</strong> john.student@school.com</p>
          <p><strong>Password:</strong> password123</p>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>🧪 Available Test Features</h2>
        <ul>
          <li>✅ Student Login & Authentication</li>
          <li>✅ Student Profile Management</li>
          <li>✅ Academic Grades Tracking</li>
          <li>✅ Attendance Records</li>
          <li>✅ Subject Performance</li>
          <li>✅ Library Management</li>
          <li>✅ Academic Reports</li>
          <li>✅ Dashboard Overview</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;