import React from 'react';
import { getUser } from '../../utils/auth';

const TeacherSidebarTest = () => {
  const user = getUser();
  const localStorageUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      minWidth: '300px',
      fontSize: '0.85rem'
    }}>
      <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151' }}>
        🔍 Sidebar Debug Info
      </h4>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>User from getUser():</strong>
        <pre style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '0.5rem', borderRadius: '4px', margin: '0.25rem 0' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>User from localStorage:</strong>
        <pre style={{ fontSize: '0.75rem', background: '#f3f4f6', padding: '0.5rem', borderRadius: '4px', margin: '0.25rem 0' }}>
          {JSON.stringify(localStorageUser, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Detected Role:</strong> {user?.role || localStorageUser?.role || 'None'}
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Expected Navigation:</strong> Teacher menu items
      </div>
      
      <button
        onClick={() => {
          // Force update user role for testing
          const testUser = { ...localStorageUser, role: 'teacher' };
          localStorage.setItem('user', JSON.stringify(testUser));
          window.location.reload();
        }}
        style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.5rem 0.75rem',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem',
          marginRight: '0.5rem'
        }}
      >
        Force Teacher Role
      </button>
      
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#6b7280',
          color: 'white',
          border: 'none',
          padding: '0.5rem 0.75rem',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.8rem'
        }}
      >
        Refresh
      </button>
    </div>
  );
};

export default TeacherSidebarTest;