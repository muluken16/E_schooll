import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';

const AuthGuard = ({ children, requiredRole = null }) => {
  const authenticated = isAuthenticated();
  const user = getUser();

  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have it, redirect to unauthorized
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '2rem',
        color: '#dc2626'
      }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Required role: <strong>{requiredRole}</strong></p>
        <p>Your role: <strong>{user?.role || 'Unknown'}</strong></p>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return children;
};

export default AuthGuard;