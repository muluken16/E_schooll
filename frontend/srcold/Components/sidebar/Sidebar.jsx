import React from 'react';
import { 
  SidebarContainer, 
  NavItem, 
  Overlay, 
  SidebarHeader, 
  UserInfo, 
  UserRole, 
  SidebarFooter, 
  NavItemsContainer 
} from './styles';
import { Link } from 'react-router-dom';
import {
  FaChalkboardTeacher, FaFileAlt, FaClipboardList, FaGraduationCap, FaVideo,
  FaTachometerAlt, FaSignOutAlt, FaCog, FaUser, FaHome, FaChartBar, FaMapMarkerAlt,
  FaUniversity, FaSchool, FaUserTie, FaBook, FaIdCard, FaListAlt, FaExchangeAlt,
  FaClock, FaExclamationTriangle, FaBell, FaBox, FaBed, FaUsers, FaBookReader,
  FaBuilding, FaLandmark, FaUserGraduate, FaMoneyBillAlt, FaEnvelope, FaBalanceScale,
  FaFlask, FaUserCheck, FaBookOpen, FaTabletAlt, FaTags, FaTools, FaUserPlus, FaBoxes, FaWallet, FaClipboardCheck, FaFileContract, FaUserShield, FaUsersCog, FaCalendarAlt, FaFolderOpen, FaLightbulb, FaProjectDiagram, FaBullseye
} from 'react-icons/fa';




// Role-based menu items with icons for all
const roleMenus = {
  national_office: [
    { label: 'Dashboard', to: '/nationaldashboard', icon: <FaTachometerAlt /> },
    { label: 'Region', to: '/Reagion', icon: <FaMapMarkerAlt /> },
    { label: 'National Reports', to: '/national/reports', icon: <FaFileAlt /> },
  ],
  // regional_office: [
  //   { label: 'Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  //   { label: 'Region Overview', to: '/regional/overview', icon: <FaChartBar /> },
  // ],
  regional_office: [
  { label: 'Dashboard', to: '/regionaldashboard', icon: <FaTachometerAlt /> },
  { label: 'Zones & Woredas', to: '/zones-woredas', icon: <FaMapMarkerAlt /> },
  { label: 'Schools', to: '/schools', icon: <FaSchool /> },
  { label: 'Teachers & Staff', to: '/teachers', icon: <FaChalkboardTeacher /> },
  { label: 'Students', to: '/students', icon: <FaUserGraduate /> },
  { label: 'Curriculum & Exams', to: '/curriculum-exams', icon: <FaBook /> },
  { label: 'Financials', to: '/financials', icon: <FaMoneyBillAlt /> },
  { label: 'Reports', to: '/regional/reports', icon: <FaFileAlt /> },
  { label: 'Communication', to: '/communication', icon: <FaEnvelope /> },
  { label: 'Policy & Compliance', to: '/policy', icon: <FaBalanceScale /> },
],

  zone_office: [
  { label: 'Zone Dashboard', to: '/zone/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Woreda Management', to: '/zone/wereda/manage', icon: <FaBuilding /> },
  { label: 'assign wereda manager', to: '/zone/awm', icon: <FaWallet /> },

  // Additional suggestions
  { label: 'School Infrastructure', to: '/zone/schools/infrastructure', icon: <FaSchool /> },
  { label: 'Training & Capacity Building', to: '/zone/training', icon: <FaChalkboardTeacher /> },
  { label: 'Resource Allocation', to: '/zone/resources', icon: <FaBoxes /> },
  
  { label: 'Examinations & Assessment', to: '/zone/exams', icon: <FaClipboardCheck /> },
  { label: 'Community Engagement', to: '/zone/community', icon: <FaUsers /> },
  { label: 'Policy Updates', to: '/zone/policies', icon: <FaFileContract /> },
  
  { label: 'School Reports by Woreda', to: '/zone/wereda/reports', icon: <FaFileAlt /> },
  { label: 'Student Records Oversight', to: '/zone/students/records', icon: <FaBookReader /> },
  { label: 'Teacher & Staff Oversight', to: '/zone/staff/manage', icon: <FaUserTie /> },
  { label: 'Zone Reports', to: '/zone/reports', icon: <FaFileAlt /> },
  { label: 'Alerts & Notifications', to: '/zone/alerts', icon: <FaBell /> },
],
wereda_office: [
  { label: 'Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Schools', to: '/wereda/schools', icon: <FaChalkboardTeacher /> },
  { label: 'Assign Director School', to: '/wereda/schools/directors', icon: <FaChalkboardTeacher /> },
  { label: 'Supervisors', to: '/wereda/supervisors', icon: <FaChalkboardTeacher /> },
  { label: 'Curriculum & Subjects', to: '/curriculum', icon: <FaBook /> },
  { label: 'Reports', to: '/reports', icon: <FaClipboardList /> },
  { label: 'Resources & Infrastructure', to: '/resources', icon: <FaProjectDiagram /> },
  { label: 'Faculties', to: '/university/faculties', icon: <FaUniversity /> },
  { label: 'Analytics', to: '/analytics', icon: <FaChartBar /> },
],
  university: [
    { label: 'Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
    { label: 'Faculties', to: '/university/faculties', icon: <FaUniversity /> },
  ],
  college: [
    { label: 'College Info', to: '/dashboard', icon: <FaTachometerAlt /> },
    { label: 'Courses', to: '/college/courses', icon: <FaBook /> },
  ],
  senate: [
    { label: 'Supervisor Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'School Visits', to: '/supervisor/school-visits', icon: <FaChalkboardTeacher /> },
  { label: 'Teacher Mentorship', to: '/supervisor/teacher-mentorship', icon: <FaUsers /> },
  { label: 'Student Performance', to: '/supervisor/student-performance', icon: <FaChartBar /> },
  { label: 'Reports', to: '/supervisor/reports', icon: <FaClipboardList /> },
  { label: 'Resources & Facilities', to: '/supervisor/resources', icon: <FaProjectDiagram /> },
  { label: 'Community Engagement', to: '/supervisor/community', icon: <FaUsers /> },
  { label: 'Equity & Inclusion', to: '/supervisor/equity', icon: <FaBullseye /> },
  { label: 'Policy & Guidance', to: '/supervisor/policy', icon: <FaBook /> },
  { label: 'Special Programs', to: '/supervisor/special-programs', icon: <FaChalkboardTeacher /> },
  ],
  school: [
  { label: 'Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Staff & Teachers', to: '/director/staff', icon: <FaUsers /> },
  { label: 'Academic Oversight', to: '/director/academics', icon: <FaBook /> },
  { label: 'Students', to: '/director/students', icon: <FaUserGraduate /> },
  { label: 'Facilities & Resources', to: '/director/facilities', icon: <FaBuilding /> },
  { label: 'Communication', to: '/director/communication', icon: <FaEnvelope /> },
  { label: 'Reports', to: '/director/reports', icon: <FaFileAlt /> },
],

  vice_director: [
  { label: 'Overview', to: '/dashboard', icon: <FaTachometerAlt /> },

  // Staff responsibilities
  { label: 'Staff Management', to: '/vice/staff', icon: <FaUsers /> },
  { label: 'Teacher Development', to: '/vice/teacher-training', icon: <FaChalkboardTeacher /> },

  // Student responsibilities
  { label: 'Student Management', to: '/vice/students', icon: <FaUserGraduate /> },
  { label: 'Discipline & Activities', to: '/vice/discipline', icon: <FaUserShield /> },

  // Academic responsibilities
  { label: 'Academic Oversight', to: '/vice/academics', icon: <FaBook /> },
  { label: 'Timetable & Scheduling', to: '/vice/timetable', icon: <FaCalendarAlt /> },
  { label: 'Exams & Assessment', to: '/vice/exams', icon: <FaClipboardList /> },

  // Resource & facility management  
  { label: 'Facilities & Resources', to: '/vice/facilities', icon: <FaBuilding /> },

  // Community & communication
  { label: 'Parent & Community', to: '/vice/community', icon: <FaUsersCog /> },
  { label: 'Communication', to: '/vice/communication', icon: <FaEnvelope /> },

  // Documentation & reporting
  { label: 'Records & Documentation', to: '/vice/records', icon: <FaFolderOpen /> },
  { label: 'Reports', to: '/vice/reports', icon: <FaFileAlt /> },

  // Strategic leadership
  { label: 'School Improvement', to: '/vice/improvement', icon: <FaLightbulb /> },
  { label: 'Leadership & Delegation', to: '/vice/leadership', icon: <FaUserTie /> },
],


  department_head: [
  { label: 'Department Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Courses', to: '/department/courses', icon: <FaBook /> },
  { label: 'Faculty & Staff', to: '/department/faculty', icon: <FaChalkboardTeacher /> },
  { label: 'Student Enrollment', to: '/department/students', icon: <FaUserGraduate /> },
  { label: 'Exams & Assessments', to: '/department/exams', icon: <FaFileAlt /> },
  { label: 'Research & Projects', to: '/department/projects', icon: <FaFlask /> },
  { label: 'Reports', to: '/department/reports', icon: <FaChartBar /> },
  { label: 'Communication', to: '/department/communication', icon: <FaEnvelope /> },
],

  teacher: [
  { label: 'Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'My Classes', to: '/classes', icon: <FaChalkboardTeacher /> },
  { label: 'Assignments', to: '/teacher/assignments', icon: <FaClipboardList /> },
  { label: 'Student Exam', to: '/exam', icon: <FaFileAlt /> },
  { label: 'Student Results', to: '/results', icon: <FaGraduationCap /> },
  { label: 'Attendance', to: '/attendance', icon: <FaUserCheck /> },
  { label: 'Virtual Class', to: '/virtual-class', icon: <FaVideo /> },
  { label: 'Communication', to: '/communication', icon: <FaEnvelope /> },
  { label: 'Reports', to: '/teacher/reports', icon: <FaChartBar /> },
  { label: 'Resources', to: '/resources', icon: <FaBookOpen /> },
],

  librarian: [
  { label: 'Library Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Books', to: '/librarian/books', icon: <FaBook /> },
  { label: 'Issue & Return', to: '/librarian/issue-return', icon: <FaExchangeAlt /> },
  { label: 'Users', to: '/librarian/accounts', icon: <FaUsers /> },
  { label: 'Reports', to: '/librarian/reports', icon: <FaFileAlt /> },
  { label: 'Digital Resources', to: '/librarian/digital', icon: <FaTabletAlt /> },
],

  record_officer: [
    { label: 'Records', to: '/dashboard', icon: <FaTachometerAlt /> },
    { label: 'Student Files', to: '/record/students', icon: <FaFileAlt /> },
    { label: 'Student ID', to: '/record/students/id', icon: <FaIdCard /> },
    { label: 'Enrollments', to: '/record/enrollments', icon: <FaListAlt /> },
    { label: 'Academic Records', to: '/record/academic', icon: <FaGraduationCap /> },
    { label: 'Transfers & Withdrawals', to: '/record/transfers', icon: <FaExchangeAlt /> },
    { label: 'Attendance', to: '/record/attendance', icon: <FaClock /> },
    { label: 'Discipline', to: '/record/discipline', icon: <FaExclamationTriangle /> },
    { label: 'Reports', to: '/record/reports', icon: <FaFileAlt /> },
    { label: 'Notifications', to: '/record/notifications', icon: <FaBell /> },
  ],
  student: [
  { label: 'My Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Courses', to: '/student/courses', icon: <FaBook /> },
  { label: 'Assignments', to: '/student/assignments', icon: <FaClipboardList /> },
  { label: 'Exams & Results', to: '/student/exams-results', icon: <FaFileAlt /> },
  { label: 'Attendance', to: '/student/attendance', icon: <FaUserCheck /> },
  { label: 'Library', to: '/student/library', icon: <FaBookOpen /> },
  { label: 'Communication', to: '/student/communication', icon: <FaEnvelope /> },
  { label: 'Reports & Certificates', to: '/student/reports', icon: <FaGraduationCap /> },
],

  inventorial: [
  { label: 'Inventory Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Assets', to: '/inventorial/assets', icon: <FaBox /> },
  { label: 'Issue & Return', to: '/inventorial/issue-return', icon: <FaExchangeAlt /> },
  { label: 'Categories & Suppliers', to: '/inventorial/categories-suppliers', icon: <FaTags /> },
  { label: 'Reports', to: '/inventorial/reports', icon: <FaFileAlt /> },
  { label: 'Maintenance & Audit', to: '/inventorial/maintenance', icon: <FaTools /> },
],

  store: [
  { label: 'Store Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Supplies', to: '/store/supplies', icon: <FaBox /> },
  { label: 'Issue & Distribution', to: '/store/issue-distribution', icon: <FaExchangeAlt /> },
  { label: 'Categories & Suppliers', to: '/store/categories-suppliers', icon: <FaTags /> },
  { label: 'Reports', to: '/store/reports', icon: <FaFileAlt /> },
  { label: 'Requests & Orders', to: '/store/requests', icon: <FaClipboardList /> },
],

  dormitory_manager: [
  { label: 'Dorm Dashboard', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Rooms', to: '/dormitory/rooms', icon: <FaBed /> },
  { label: 'Student Residency', to: '/dormitory/residency', icon: <FaUser /> },
  { label: 'Payments & Fees', to: '/dormitory/payments', icon: <FaMoneyBillAlt /> },
  { label: 'Maintenance & Requests', to: '/dormitory/maintenance', icon: <FaTools /> },
  { label: 'Reports', to: '/dormitory/reports', icon: <FaFileAlt /> },
  { label: 'Communication', to: '/dormitory/communication', icon: <FaEnvelope /> },
],

  hr_officer: [
  { label: 'HR Panel', to: '/dashboard', icon: <FaTachometerAlt /> },
  { label: 'Employees', to: '/hr/employees', icon: <FaUsers /> },
  { label: 'Recruitment & Onboarding', to: '/hr/recruitment', icon: <FaUserPlus /> },
  { label: 'Attendance & Leave', to: '/hr/attendance-leave', icon: <FaUserCheck /> },
  { label: 'Payroll & Benefits', to: '/hr/payroll', icon: <FaMoneyBillAlt /> },
  { label: 'Training & Development', to: '/hr/training', icon: <FaChalkboardTeacher /> },
  { label: 'Reports', to: '/hr/reports', icon: <FaFileAlt /> },
  { label: 'Communication', to: '/hr/communication', icon: <FaEnvelope /> },
],

  
};

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User', role: 'teacher' };
  const role = user?.role;
  const menuItems = roleMenus[role] || [];

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
  };

  return (
    <>
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <UserInfo>
            <FaUser size={24} />
            <div>
              <h4>{user.name || 'User'}</h4>
              <UserRole>{role || 'Role'}</UserRole>
            </div>
          </UserInfo>
        </SidebarHeader>

        <NavItemsContainer>
          <nav>
            {menuItems.map((item, index) => (
              <NavItem key={index}>
                <Link to={item.to} onClick={toggleSidebar}>
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </Link>
              </NavItem>
            ))}
          </nav>
        </NavItemsContainer>

        <SidebarFooter>
          <NavItem>
            <Link to="/settings" onClick={toggleSidebar}>
              <span className="icon"><FaCog /></span>
              <span className="label">Settings</span>
            </Link>
          </NavItem>
          <NavItem>
            <button onClick={handleLogout} className="logout-btn">
              <span className="icon"><FaSignOutAlt /></span>
              <span className="label">Logout</span>
            </button>
          </NavItem>
          <NavItem>
            <button onClick={handleLogout} className="logout-btn">
            </button>
          </NavItem>
          <NavItem>
            <button onClick={handleLogout} className="logout-btn">
            </button>
          </NavItem>
        </SidebarFooter>
      </SidebarContainer>
      {isOpen && <Overlay onClick={toggleSidebar} />}
    </>
  );
};

export default Sidebar;