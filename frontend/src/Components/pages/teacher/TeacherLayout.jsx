import React from 'react';
import { TeacherProvider } from '../../contexts/TeacherContext';
import AuthGuard from '../../guards/AuthGuard';
import Layout from '../../layout/Layout';
import TeacherLoginStatus from './TeacherLoginStatus';
import TeacherSidebarTest from './TeacherSidebarTest';
import './TeacherLayout.css';

const TeacherLayout = ({ children }) => {
  return (
    <AuthGuard requiredRole="teacher">
      <TeacherProvider>
        <Layout>
          <div className="teacher-layout">
            <TeacherLoginStatus />
            <TeacherSidebarTest />
            <div className="teacher-content">
              {children}
            </div>
          </div>
        </Layout>
      </TeacherProvider>
    </AuthGuard>
  );
};

export default TeacherLayout;