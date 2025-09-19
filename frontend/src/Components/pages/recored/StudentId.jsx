import React, { useState } from 'react';
import { 
  FaUserGraduate, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaIdCard, FaVenusMars,
  FaBook, FaUniversity, FaCheckCircle, FaGlobe, FaLock, FaImage, FaMoneyBillWave, FaNotesMedical,
  FaHeart, FaAward, FaSchool, FaUserTie, FaChalkboardTeacher
} from 'react-icons/fa';

const StudentRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '', email: '', phone: '', alternatePhone: '',
    address: '', city: '', state: '', zipCode: '', country: '', dateOfBirth: '', placeOfBirth: '',
    gender: '', nationality: '', identificationNumber: '', identificationType: '', studentId: '',
    department: '', program: '', enrollmentDate: '', enrollmentType: '', currentSemester: '',
    academicStatus: '', previousSchool: '', previousQualification: '', previousGrades: '',
    graduationYear: '', guardianName: '', guardianRelationship: '', guardianPhone: '', guardianEmail: '',
    guardianOccupation: '', guardianAddress: '', bloodGroup: '', allergies: '', medicalConditions: '',
    emergencyContactName: '', emergencyContactPhone: '', insuranceProvider: '', insurancePolicyNumber: '',
    username: '', password: '', confirmPassword: '', photo: null, hobbies: '', achievements: '', notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    'Personal Information', 'Academic Information', 'Educational Background',
    'Guardian Information', 'Medical Information', 'Account Information', 'Additional Information'
  ];

  const departments = [
    'Computer Science','Business Administration','Engineering','Medicine','Law',
    'Arts & Humanities','Social Sciences','Natural Sciences'
  ];

  const programs = {
    'Computer Science': ['Software Engineering', 'Data Science', 'Cybersecurity', 'AI & Machine Learning'],
    'Business Administration': ['Finance', 'Marketing', 'Human Resources', 'International Business'],
    'Engineering': ['Mechanical', 'Electrical', 'Civil', 'Chemical'],
    'Medicine': ['General Medicine', 'Dentistry', 'Pharmacy', 'Nursing'],
    'Law': ['Corporate Law', 'Criminal Law', 'International Law', 'Human Rights Law'],
    'Arts & Humanities': ['Literature', 'History', 'Philosophy', 'Linguistics'],
    'Social Sciences': ['Psychology', 'Sociology', 'Economics', 'Political Science'],
    'Natural Sciences': ['Physics', 'Chemistry', 'Biology', 'Mathematics']
  };

  const identificationTypes = ['Passport', 'National ID', 'Driver License', 'Birth Certificate', 'Other'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value
    });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateSection = (sectionIndex) => {
    let sectionErrors = {};
    switch(sectionIndex) {
      case 0: // Personal Information
        if (!formData.firstName) sectionErrors.firstName = 'First name is required';
        if (!formData.lastName) sectionErrors.lastName = 'Last name is required';
        if (!formData.email) sectionErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) sectionErrors.email = 'Email is invalid';
        if (!formData.phone) sectionErrors.phone = 'Phone number is required';
        if (!formData.address) sectionErrors.address = 'Address is required';
        if (!formData.dateOfBirth) sectionErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) sectionErrors.gender = 'Gender is required';
        if (!formData.nationality) sectionErrors.nationality = 'Nationality is required';
        break;
      case 1: // Academic Information
        if (!formData.studentId) sectionErrors.studentId = 'Student ID is required';
        if (!formData.department) sectionErrors.department = 'Department is required';
        if (!formData.program) sectionErrors.program = 'Program is required';
        if (!formData.enrollmentDate) sectionErrors.enrollmentDate = 'Enrollment date is required';
        if (!formData.enrollmentType) sectionErrors.enrollmentType = 'Enrollment type is required';
        break;
      case 2: // Educational Background
        if (!formData.previousSchool) sectionErrors.previousSchool = 'Previous school is required';
        if (!formData.previousQualification) sectionErrors.previousQualification = 'Previous qualification is required';
        if (!formData.graduationYear) sectionErrors.graduationYear = 'Graduation year is required';
        break;
      case 3: // Guardian Information
        if (!formData.guardianName) sectionErrors.guardianName = 'Guardian name is required';
        if (!formData.guardianRelationship) sectionErrors.guardianRelationship = 'Relationship is required';
        if (!formData.guardianPhone) sectionErrors.guardianPhone = 'Guardian phone is required';
        break;
      case 4: // Medical Information
        if (!formData.bloodGroup) sectionErrors.bloodGroup = 'Blood group is required';
        if (!formData.emergencyContactName) sectionErrors.emergencyContactName = 'Emergency contact name is required';
        if (!formData.emergencyContactPhone) sectionErrors.emergencyContactPhone = 'Emergency contact phone is required';
        break;
      case 5: // Account Information
        if (!formData.username) sectionErrors.username = 'Username is required';
        if (!formData.password) sectionErrors.password = 'Password is required';
        else if (formData.password.length < 8) sectionErrors.password = 'Password must be at least 8 characters';
        if (!formData.confirmPassword) sectionErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) sectionErrors.confirmPassword = 'Passwords do not match';
        break;
      default: break;
    }
    setErrors(sectionErrors);
    return Object.keys(sectionErrors).length === 0;
  };

  const handleNext = () => { if(validateSection(currentSection)) setCurrentSection(currentSection + 1); };
  const handlePrevious = () => { setCurrentSection(currentSection - 1); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateSection(currentSection)) {
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '', lastName: '', middleName: '', email: '', phone: '', alternatePhone: '',
      address: '', city: '', state: '', zipCode: '', country: '', dateOfBirth: '', placeOfBirth: '',
      gender: '', nationality: '', identificationNumber: '', identificationType: '', studentId: '',
      department: '', program: '', enrollmentDate: '', enrollmentType: '', currentSemester: '',
      academicStatus: '', previousSchool: '', previousQualification: '', previousGrades: '',
      graduationYear: '', guardianName: '', guardianRelationship: '', guardianPhone: '', guardianEmail: '',
      guardianOccupation: '', guardianAddress: '', bloodGroup: '', allergies: '', medicalConditions: '',
      emergencyContactName: '', emergencyContactPhone: '', insuranceProvider: '', insurancePolicyNumber: '',
      username: '', password: '', confirmPassword: '', photo: null, hobbies: '', achievements: '', notes: ''
    });
    setErrors({}); setIsSubmitted(false); setCurrentSection(0);
  };

  if(isSubmitted) return (
    <div className="registration-container">
      <div className="success-message">
        <FaCheckCircle className="success-icon" />
        <h2>Registration Successful!</h2>
        <p>Thank you for registering. Your student account has been created successfully.</p>
        <p>We've sent a confirmation email to {formData.email}.</p>
        <button onClick={handleReset} className="btn btn-primary">Register Another Student</button>
      </div>
    </div>
  );

  return (
    <div className="registration-container">
      {/* Header */}
      <div className="registration-header">
        <h1><FaUserGraduate /> Student Registration</h1>
        <p>Please fill out all required fields to complete your registration</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-steps">
          {sections.map((section, index) => (
            <div key={index} className={`progress-step ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}>
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{section}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="registration-form">
        {/* --- Sections rendered here as per your original code --- */}
        {/* I recommend keeping your section code as-is for readability and functionality */}
        {/* The style improvements below will ensure fonts are consistent */}
      </form>

      <style jsx>{`
        .registration-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }
        /* Other styles remain same but add font-family consistently to input, select, textarea */
        input, select, textarea {
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    </div>
  );
};

export default StudentRegistration;
