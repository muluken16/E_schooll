import React from 'react';
import Layout from '../../layout/Layout';

const StudentRecoredOversite = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <Layout>
            <h1>Student Recored Oversite for Zone </h1>
           
        </Layout>
    );
};

export default StudentRecoredOversite;
