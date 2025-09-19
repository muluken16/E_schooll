
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
import WeredaManage from './Components/pages/wereda/Wereda';
import ZoneReport from './Components/pages/zone/ZoneReport';
import AlertNotification from './Components/pages/zone/AlertNotification';
import SchoolStaff from './Components/pages/school/SchoolStaff';
import AcademicsOversite from './Components/pages/school/AcademicsOversite';
import DesciplineActivity from './Components/pages/viceDirector/DesciplineActivity';
import TimeTable from './Components/pages/viceDirector/TimeTable';

function App() {
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
