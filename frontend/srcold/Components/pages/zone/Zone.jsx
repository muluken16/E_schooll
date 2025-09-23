import React from 'react';
import Layout from '../../layout/Layout';

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <Layout>
            <h1>Zone Dashboard </h1>
            <h2>Welcome, {user?.first_name} {user?.last_name}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p>Your role: {user?.role.replace('_', ' ')}</p>
        </Layout>
    );
};

export default Dashboard;
