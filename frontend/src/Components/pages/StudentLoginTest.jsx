import React, { useState } from 'react';
import { getToken, clearToken } from '../utils/auth';

const StudentLoginTest = () => {
  const [loginData, setLoginData] = useState({
    email: 'john.student@school.com',
    password: 'password123'
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');

    try {
      const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000/api/login/"
        : "https://eschooladmin.etbur.com/api/login/";

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Save to localStorage like the real login does
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setResult('✅ Login Successful!');
        setUserInfo(data.user);
        
        // Test student profile endpoint
        testStudentProfile(data.access_token);
      } else {
        const errorData = await response.json();
        setResult(`❌ Login Failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResult(`❌ Login Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testStudentProfile = async (token) => {
    try {
      const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000/api/student-self/my_profile/"
        : "https://eschooladmin.etbur.com/api/student-self/my_profile/";

      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        setResult(prev => prev + '\n✅ Student Profile Access: Success');
        console.log('Student Profile:', profileData);
      } else {
        setResult(prev => prev + '\n❌ Student Profile Access: Failed');
      }
    } catch (error) {
      setResult(prev => prev + `\n❌ Profile Error: ${error.message}`);
    }
  };

  const logout = () => {
    clearToken();
    setUserInfo(null);
    setResult('Logged out successfully');
  };

  const checkCurrentAuth = () => {
    const token = getToken();
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setUserInfo(JSON.parse(user));
      setResult('✅ Already logged in');
    } else {
      setResult('❌ Not logged in');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🎓 Student Login Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
        <h3>Test Credentials</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              style={{ width: '100%', padding: '8px', marginLeft: '10px' }}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              style={{ width: '100%', padding: '8px', marginLeft: '10px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={testLogin} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
        
        <button 
          onClick={checkCurrentAuth}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Check Auth Status
        </button>
        
        <button 
          onClick={logout}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {result && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da', 
          borderRadius: '8px',
          whiteSpace: 'pre-line'
        }}>
          <h3>Test Result:</h3>
          <p style={{ fontFamily: 'monospace' }}>{result}</p>
        </div>
      )}

      {userInfo && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
          <h3>👤 Logged in User Info:</h3>
          <div style={{ display: 'grid', gap: '5px' }}>
            <p><strong>Name:</strong> {userInfo.first_name} {userInfo.last_name}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Role:</strong> {userInfo.role}</p>
            <p><strong>ID:</strong> {userInfo.id}</p>
          </div>
        </div>
      )}

      <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h3>📝 Available Test Accounts:</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <strong>Student 1:</strong>
            <p>Email: john.student@school.com</p>
            <p>Password: password123</p>
          </div>
          <div>
            <strong>Student 2:</strong>
            <p>Email: jane.student@school.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔗 Quick Links:</h3>
        <ul>
          <li><a href="/login">Go to Login Page</a></li>
          <li><a href="/dashboard">Go to Dashboard</a></li>
          <li><a href="/student/profile">Student Profile</a></li>
          <li><a href="/student/grades">Student Grades</a></li>
        </ul>
      </div>
    </div>
  );
};

export default StudentLoginTest;