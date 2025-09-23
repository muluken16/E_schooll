
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import National from './Components/pages/national/National';
import Login from './Components/pages/login/Login';
import Home from './Components/pages/login/Home';
import NationalReport from './Components/pages/national/Report';
import RegionalDashboard from './Components/pages/national/National';
import Dashboard from './Components/pages/welcome/Dashboard';
import StudentFile from './Components/pages/recored/StudentFile';
import StudentId from './Components/pages/recored/StudentId';


import ZoneDashboard from './Components/pages/zone/Zone';
import WeredaManage from './Components/pages/zone/Wereda';
import AWM from './Components/pages/zone/AWM';
import ResouceAllocation from './Components/pages/zone/ResourceAllocation';
import SchoolInfrastructure from './Components/pages/zone/SchoolInfrastructure';
import CapacityBuilding from './Components/pages/zone/CapacityBuilding';
import StudentRecordOversite from './Components/pages/zone/StudentRecordOversite';
import TeacherStaffOversite from './Components/pages/zone/TeacherStaffOversite';
import Policy from './Components/pages/zone/Policy';
import WeredaReport from './Components/pages/zone/WeredaReport';


import Schools from './Components/pages/wereda/Schools'; 
import ADS from './Components/pages/wereda/ADS'; 
import Superviser from './Components/pages/wereda/Superviser'; 

import ZoneReport from './Components/pages/zone/ZoneReport';
import AlertNotification from './Components/pages/zone/AlertNotification';
import SchoolStaff from './Components/pages/school/SchoolStaff';
import AcademicsOversite from './Components/pages/school/AcademicsOversite';
import DesciplineActivity from './Components/pages/viceDirector/DesciplineActivity';
import TimeTable from './Components/pages/viceDirector/TimeTable';

import { setToken } from './Components/utils/auth';
import React from 'react';

function App() {
     const handleLogout = () => {
        alert('Logged out!');
        // clear token and redirect to login page
    };

    const toggleSidebar = () => {
        console.log('Sidebar toggled');
    };

    // Set token for 1 minute (60 seconds)
    React.useEffect(() => {
        setToken('my-token', 60);
    }, []); 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* national */}
        <Route path="/nationaldashboard" element={<RegionalDashboard />} />
        <Route path="/national/reports" element={<NationalReport />} />
        
        <Route path="/record/students" element={<StudentFile />} />
        <Route path="/record/students/id" element={<StudentId />} />
        <Route path="/zone/dashboard" element={<ZoneDashboard />} /> 

        <Route path="/zone/reports" element={<ZoneReport />} /> 
        <Route path="/zone/alerts" element={<AlertNotification />} />
        <Route path="/zone/awm" element={<AWM />} />
        <Route path="/zone/resources" element={<ResouceAllocation />} />
        <Route path="/zone/schools/infrastructure" element={<SchoolInfrastructure />} />
        <Route path="/zone/training" element={<CapacityBuilding />} />
        <Route path="/zone/students/records" element={<StudentRecordOversite />} />
        <Route path="/zone/staff/manage" element={<TeacherStaffOversite />} />
        <Route path="/zone/policies" element={<Policy />} />
        <Route path="/zone/wereda/reports" element={<WeredaReport />} />

        <Route path="/wereda/schools" element={<Schools />} /> 
        <Route path="/wereda/schools/directors" element={<ADS />} /> 
        <Route path="/wereda/supervisors" element={<Superviser />} /> 

        <Route path="/director/staff" element={<SchoolStaff />} /> 
        <Route path ="/director/academics" element = {<AcademicsOversite />} />
        <Route path ="/vice/discipline" element = {<DesciplineActivity />} />
        <Route path ="/vice/timetable" element ={<TimeTable />} />


        <Route path="/zone/wereda/manage" element={<WeredaManage />} /> 
        {/* ... other role routes ... */}
      </Routes>
    </Router>
  );
}

export default App;
