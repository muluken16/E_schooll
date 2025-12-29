import React, { useState, useEffect } from 'react';
import teacherApi from '../../services/teacherApi';
import { getToken, setToken } from '../../utils/auth';

const TeacherTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    // Set a test token (you would normally get this from login)
    setToken('test-token');

    try {
      // Test 1: Get Profile
      try {
        const profile = await teacherApi.getProfile();
        results.push({ test: 'Get Profile', status: 'PASS', data: profile });
      } catch (error) {
        results.push({ test: 'Get Profile', status: 'FAIL', error: error.message });
      }

      // Test 2: Get Subjects
      try {
        const subjects = await teacherApi.getMySubjects();
        results.push({ test: 'Get Subjects', status: 'PASS', data: subjects });
      } catch (error) {
        results.push({ test: 'Get Subjects', status: 'FAIL', error: error.message });
      }

      // Test 3: Get Classes
      try {
        const classes = await teacherApi.getMyClasses();
        results.push({ test: 'Get Classes', status: 'PASS', data: classes });
      } catch (error) {
        results.push({ test: 'Get Classes', status: 'FAIL', error: error.message });
      }

      // Test 4: Get Students
      try {
        const students = await teacherApi.getMyStudents();
        results.push({ test: 'Get Students', status: 'PASS', data: students });
      } catch (error) {
        results.push({ test: 'Get Students', status: 'FAIL', error: error.message });
      }

      // Test 5: Get Dashboard
      try {
        const dashboard = await teacherApi.getDashboardSummary();
        results.push({ test: 'Get Dashboard', status: 'PASS', data: dashboard });
      } catch (error) {
        results.push({ test: 'Get Dashboard', status: 'FAIL', error: error.message });
      }

    } catch (error) {
      results.push({ test: 'General Error', status: 'FAIL', error: error.message });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Teacher API Test Suite</h1>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Running Tests...' : 'Run Tests'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h2>Test Results:</h2>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{
              padding: '10px',
              margin: '10px 0',
              border: '1px solid #ccc',
              borderRadius: '5px',
              backgroundColor: result.status === 'PASS' ? '#d1fae5' : '#fee2e2'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0' }}>
              {result.test} - 
              <span style={{ 
                color: result.status === 'PASS' ? '#059669' : '#dc2626',
                fontWeight: 'bold'
              }}>
                {result.status}
              </span>
            </h3>
            
            {result.error && (
              <p style={{ color: '#dc2626', margin: '5px 0' }}>
                Error: {result.error}
              </p>
            )}
            
            {result.data && (
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  View Data
                </summary>
                <pre style={{ 
                  backgroundColor: '#f3f4f6', 
                  padding: '10px', 
                  borderRadius: '5px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3>API Endpoints Being Tested:</h3>
        <ul>
          <li><code>GET /api/teacher-self/my_profile/</code></li>
          <li><code>GET /api/teacher-self/my_subjects/</code></li>
          <li><code>GET /api/teacher-self/my_classes/</code></li>
          <li><code>GET /api/teacher-self/my_students/</code></li>
          <li><code>GET /api/teacher-self/dashboard_summary/</code></li>
        </ul>
        
        <h3>Teacher Login Credentials:</h3>
        <ul>
          <li>Username: <code>john_teacher</code> | Password: <code>password123</code></li>
          <li>Username: <code>mary_teacher</code> | Password: <code>password123</code></li>
          <li>Username: <code>david_teacher</code> | Password: <code>password123</code></li>
          <li>Username: <code>sarah_teacher</code> | Password: <code>password123</code></li>
        </ul>
      </div>
    </div>
  );
};

export default TeacherTest;