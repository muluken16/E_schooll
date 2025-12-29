import React, { useState, useEffect } from "react";
import Layout from "../../layout/Layout";
import { getToken } from "../../utils/auth";
import {
  PageContainer,
  SectionContainer,
  SubTitle,
  Input,
  Select,
  Button,
  TableContainer,
  Table,
  THead,
  TR,
  TH,
  TD,
  ErrorText,
  SuccessMessage,
  FileInputLabel,
  ModalBackground,
  ModalContent,
  CloseButton,
  StatsGrid,
  StatCard,
  StatusBadge,
  Avatar,
  FilterBar,
  SectionDivider
} from "./stdformstyles";
import { FaEye, FaEdit, FaTrash, FaUserGraduate, FaUserCheck, FaUserTimes, FaRestroom, FaFileCsv, FaPlus, FaPrint, FaFilter, FaSearch, FaIdCard } from "react-icons/fa";

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000/api/students/"
  : "https://eschooladmin.etbur.com/api/students/";

const StudentFile = () => {
  const [students, setStudents] = useState([]);

  // Advanced Filters
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // view | edit | add
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // Fix: use null initially

  // Academic Record State
  const [academicData, setAcademicData] = useState(null);
  const [loadingAcademic, setLoadingAcademic] = useState(false);

  // Stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => (s.academic_status || "Active") === "Active").length;
  const maleStudents = students.filter(s => (s.gender || "").toLowerCase() === "male").length;
  const femaleStudents = students.filter(s => (s.gender || "").toLowerCase() === "female").length;

  const initialStudent = {
    admission_no: "",
    first_name: "",
    last_name: "",
    email: "",
    gender: "Male",
    dob: "",
    phone: "",
    address: "",
    national_id: "",
    department: "",
    year: "",
    student_id: "",
    enrollment_date: "",
    class_section: "",
    academic_status: "Active",
    father_name: "",
    mother_name: "",
    guardian_contact: "",
    guardian_email: "",
    guardian_relation: "",
    blood_group: "",
    medical_condition: "",
    extra_activities: "",
    remarks: "",
    photo: null,
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setStudents(data.results || data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Fetch academic record
  const fetchAcademicRecord = async (studentId) => {
    setLoadingAcademic(true);
    try {
      const res = await fetch(`${API_URL}${studentId}/academic_record/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAcademicData(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingAcademic(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);


  const validateForm = () => {
    const newErrors = {};
    if (!selectedStudent.admission_no.trim()) newErrors.admission_no = "Admission No is required";
    if (!selectedStudent.first_name.trim()) newErrors.first_name = "First Name is required";
    if (!selectedStudent.last_name.trim()) newErrors.last_name = "Last Name is required";
    if (!selectedStudent.class_section.trim()) newErrors.class_section = "Class / Section is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOrEditStudent = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const method = modalType === "edit" ? "PUT" : "POST";
      const url = modalType === "edit" ? `${API_URL}${selectedStudent.id}/` : API_URL;

      const formData = new FormData();
      for (let key in selectedStudent) {
        if (selectedStudent[key] !== null) {
          // If photo is string (url from backend), don't send it again unless changed
          if (key === "photo" && typeof selectedStudent[key] === "string") continue;
          formData.append(key, selectedStudent[key]);
        }
      }

      const res = await fetch(url, {
        method,
        body: formData,
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data });
        setIsLoading(false);
        return;
      }

      setSuccessMessage(modalType === "edit" ? "Student updated successfully!" : "Student added successfully!");
      if (data.password && modalType === "add") setGeneratedPassword(data.password);

      setIsModalOpen(false);
      setSelectedStudent(initialStudent);
      fetchStudents();
    } catch (err) {
      setErrors({ form: "Failed to save student" });
    }
    setIsLoading(false);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setSuccessMessage("Student deleted successfully!");
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}import_csv/`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || "CSV imported successfully!");
        fetchStudents();
      } else {
        setErrors({ import: data.error || "Failed to import CSV" });
      }
    } catch (err) {
      setErrors({ import: "Error uploading CSV" });
    }
    setIsLoading(false);
    e.target.value = "";
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`${API_URL}export_csv/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to export CSV");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "students.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccessMessage("Students exported successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.first_name && s.first_name.toLowerCase().includes(search.toLowerCase())) ||
      (s.username && s.username.toLowerCase().includes(search.toLowerCase())) ||
      (s.admission_no && s.admission_no.toLowerCase().includes(search.toLowerCase()));

    const matchesClass = filterClass ? s.class_section === filterClass : true;
    const matchesGender = filterGender ? (s.gender || "").toLowerCase() === filterGender.toLowerCase() : true;
    const matchesStatus = filterStatus ? (s.academic_status || "Active") === filterStatus : true;

    return matchesSearch && matchesClass && matchesGender && matchesStatus;
  });

  // Extract unique classes for filter dropdown
  const uniqueClasses = [...new Set(students.map(s => s.class_section).filter(Boolean))].sort();

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);

  const openModal = (type, student = initialStudent) => {
    setModalType(type);
    setSelectedStudent(student);
    setIsModalOpen(true);
    setAcademicData(null);
    if (type === 'view' && student.id) {
      fetchAcademicRecord(student.id);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <StatsGrid>
          <StatCard color="#3182ce">
            <div className="content">
              <h3>Total Students</h3>
              <div className="value">{totalStudents}</div>
            </div>
            <div className="icon"><FaUserGraduate /></div>
          </StatCard>
          <StatCard color="#38a169">
            <div className="content">
              <h3>Active Students</h3>
              <div className="value">{activeStudents}</div>
            </div>
            <div className="icon"><FaUserCheck /></div>
          </StatCard>
          <StatCard color="#e53e3e">
            <div className="content">
              <h3>Inactive</h3>
              <div className="value">{totalStudents - activeStudents}</div>
            </div>
            <div className="icon"><FaUserTimes /></div>
          </StatCard>
          <StatCard color="#805ad5">
            <div className="content">
              <h3>Male / Female</h3>
              <div className="value">{maleStudents} / {femaleStudents}</div>
            </div>
            <div className="icon"><FaRestroom /></div>
          </StatCard>
        </StatsGrid>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#2d3748" }}>Student Management</h1>
            <p style={{ color: "#718096", fontSize: "14px" }}>Manage, track, and report student data</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button onClick={() => openModal("add")} bgColor="#3182ce" hoverColor="#2c5282">
              <FaPlus /> New Student
            </Button>
            <Button onClick={handlePrint} bgColor="#718096" hoverColor="#4a5568">
              <FaPrint /> Print List
            </Button>
          </div>
        </div>

        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        {generatedPassword && modalType === "add" && (
          <SuccessMessage>Generated Password: <strong>{generatedPassword}</strong></SuccessMessage>
        )}

        {/* Filters */}
        <SectionContainer>
          <FilterBar>
            <div style={{ flex: 2, minWidth: "200px" }}>
              <div style={{ position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: "12px", top: "14px", color: "#a0aec0" }} />
                <Input
                  placeholder="Search by Name, ID, or Admission No..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: "35px" }}
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                <option value="">All Classes</option>
                {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <Select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
              </Select>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <FileInputLabel title="Import CSV" bgColor="#2f855a" hoverColor="#276749">
                <FaFileCsv size={18} /> Import
                <input type="file" accept=".csv" onChange={handleImport} disabled={isLoading} />
              </FileInputLabel>
              <Button onClick={handleExport} disabled={students.length === 0} bgColor="#2b6cb0" hoverColor="#2c5282" title="Export CSV">
                <FaFileCsv size={18} /> Export
              </Button>
            </div>
          </FilterBar>

          {errors.import && <ErrorText>{errors.import}</ErrorText>}
          {isLoading && <p style={{ color: "#3182ce", fontWeight: "600" }}>Processing...</p>}

          <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>Student</TH>
                  <TH>Admission No</TH>
                  <TH>Gender</TH>
                  <TH>Class</TH>
                  <TH>Department</TH>
                  <TH>Status</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <tbody>
                {currentStudents.length > 0 ? currentStudents.map((s) => (
                  <TR key={s.id}>
                    <TD>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Avatar>
                          {s.photo ? (
                            <img src={s.photo} alt={s.first_name} />
                          ) : (
                            <span>{s.first_name?.[0]}{s.last_name?.[0]}</span>
                          )}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: "bold" }}>{s.first_name} {s.last_name}</div>
                          <div style={{ fontSize: "12px", color: "#718096" }}>{s.username}</div>
                        </div>
                      </div>
                    </TD>
                    <TD style={{ fontWeight: "600", color: "#4a5568" }}>{s.admission_no}</TD>
                    <TD>{s.gender || "-"}</TD>
                    <TD><span style={{ fontWeight: "bold" }}>{s.class_section}</span></TD>
                    <TD>{s.department || "-"}</TD>
                    <TD><StatusBadge status={s.academic_status || "Active"}>{s.academic_status || "Active"}</StatusBadge></TD>
                    <TD>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button onClick={() => openModal("view", s)} bgColor="#edf2f7" hoverColor="#e2e8f0" style={{ color: "#2d3748", padding: "8px" }} title="View Details"><FaEye /></Button>
                        <Button onClick={() => openModal("edit", s)} bgColor="#edf2f7" hoverColor="#e2e8f0" style={{ color: "#d69e2e", padding: "8px" }} title="Edit"><FaEdit /></Button>
                        <Button onClick={() => handleDeleteStudent(s.id)} bgColor="#edf2f7" hoverColor="#e2e8f0" style={{ color: "#e53e3e", padding: "8px" }} title="Delete"><FaTrash /></Button>
                      </div>
                    </TD>
                  </TR>
                )) : (
                  <TR>
                    <TD colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#a0aec0" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <FaUserGraduate size={40} style={{ opacity: 0.2 }} />
                        <p>No students found matching your filters.</p>
                      </div>
                    </TD>
                  </TR>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#718096", fontSize: "14px" }}>
            <div>Showing {currentStudents.length} of {filteredStudents.length} students</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>Rows per page:</span>
              <Select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ width: "70px", padding: "5px" }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </div>
          </div>
        </SectionContainer>

        {/* Modal */}
        {isModalOpen && selectedStudent && (
          <ModalBackground>
            <ModalContent>
              <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
              <h2 style={{ marginBottom: "25px", fontSize: "24px", color: "#2d3748", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px" }}>
                {modalType === "view" ? "Student Details" : modalType === "edit" ? "Edit Student" : "Register New Student"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                {/* Personal Info */}
                <div>
                  <SubTitle>Personal Information</SubTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    {[
                      { label: "Profile Photo", type: "file", key: "photo" },
                      { label: "First Name", type: "text", key: "first_name" },
                      { label: "Last Name", type: "text", key: "last_name" },
                      { label: "Admission No", type: "text", key: "admission_no" },
                      { label: "Username", type: "text", key: "username" },
                      { label: "Email", type: "email", key: "email" },
                      { label: "Phone", type: "text", key: "phone" },
                      { label: "Gender", type: "select", key: "gender", options: ["Male", "Female"] },
                      { label: "Date of Birth", type: "date", key: "dob" },
                      { label: "Blood Group", type: "select", key: "blood_group", options: ["A+", "A-", "B+", "B-", "O+", "O-"] },
                      { label: "Address", type: "textarea", key: "address" },
                    ].map(field => (
                      <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontWeight: "600", fontSize: "13px", color: "#4a5568" }}>{field.label}</label>
                        {modalType === "view" ? (
                          <div style={{ padding: "10px", background: "#f7fafc", borderRadius: "8px", border: "1px solid #edf2f7" }}>{selectedStudent[field.key] || "N/A"}</div>
                        ) : field.type === "file" ? (
                          <Input type="file" onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.files[0] })} />
                        ) : field.type === "select" ? (
                          <Select value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })}>
                            <option value="">Select {field.label}</option>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </Select>
                        ) : field.type === "textarea" ? (
                          <textarea
                            rows={2}
                            value={selectedStudent[field.key]}
                            onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })}
                            style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", fontFamily: "inherit" }}
                          />
                        ) : (
                          <Input type={field.type} value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })} />
                        )}
                        {errors[field.key] && <ErrorText>{errors[field.key]}</ErrorText>}
                      </div>
                    ))}
                  </div>
                </div>


                <div style={{ margin: "20px 0", height: "1px", background: "#e2e8f0" }}></div>

                {/* Academic Info */}
                <div>
                  <SubTitle>Academic Information</SubTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    {[
                      { label: "Class / Section", key: "class_section", type: "text" },
                      { label: "Student ID", key: "student_id", type: "text" },
                      { label: "Department", key: "department", type: "text" },
                      { label: "Enrollment Date", key: "enrollment_date", type: "date" },
                      { label: "Status", key: "academic_status", type: "select", options: ["Active", "Inactive", "Graduated"] },
                    ].map(field => (
                      <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontWeight: "600", fontSize: "13px", color: "#4a5568" }}>{field.label}</label>
                        {modalType === "view" ? (
                          <div style={{ padding: "10px", background: "#f7fafc", borderRadius: "8px", border: "1px solid #edf2f7" }}>{selectedStudent[field.key] || "N/A"}</div>
                        ) : field.type === "select" ? (
                          <Select value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })}>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </Select>
                        ) : (
                          <Input type={field.type} value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Record / Score Section (View Only) */}
                {modalType === 'view' && (
                  <>
                    <div style={{ margin: "20px 0", height: "1px", background: "#e2e8f0" }}></div>
                    <div>
                      <SubTitle>Academic Performance & Activities</SubTitle>
                      {loadingAcademic ? <p>Loading academic records...</p> : academicData ? (
                        <div>
                          <h4 style={{ marginBottom: '10px', color: '#4a5568' }}>Grades</h4>
                          {academicData.grades && academicData.grades.length > 0 ? (
                            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                <thead>
                                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                    <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Subject</th>
                                    <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Type</th>
                                    <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Score</th>
                                    <th style={{ padding: '8px', border: '1px solid #e2e8f0' }}>Semester</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {academicData.grades.map(g => (
                                    <tr key={g.id}>
                                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{g.subject_name || '-'}</td>
                                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{g.grade_type}</td>
                                      <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{g.score} / {g.full_mark}</td>
                                      <td style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{g.semester_name}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p style={{ color: '#718096', fontStyle: 'italic', marginBottom: '15px' }}>No grades recorded.</p>
                          )}

                          <h4 style={{ marginBottom: '10px', color: '#4a5568' }}>Extra Activities & Remarks</h4>
                          <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr' }}>
                            <div style={{ padding: '12px', background: '#fffaf0', borderRadius: '8px', border: '1px solid #fbd38d' }}>
                              <strong>Extra Activities:</strong>
                              <p style={{ marginTop: '5px' }}>{academicData.extra_activities || "None reported."}</p>
                            </div>
                            <div style={{ padding: '12px', background: '#ebf8ff', borderRadius: '8px', border: '1px solid #bee3f8' }}>
                              <strong>Remarks:</strong>
                              <p style={{ marginTop: '5px' }}>{academicData.remarks || "No remarks."}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p>No academic data available.</p>
                      )}
                    </div>
                  </>
                )}

                {modalType !== "view" && (
                  <div style={{ marginTop: "20px" }}>
                    <Button
                      onClick={handleAddOrEditStudent}
                      bgColor="#38a169"
                      hoverColor="#2f855a"
                      style={{ width: "100%", padding: "15px", fontSize: "16px" }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : modalType === "edit" ? "Update Student" : "Register Student"}
                    </Button>
                  </div>
                )}
              </div>
            </ModalContent>
          </ModalBackground>
        )}
      </PageContainer>
    </Layout >
  );
};

export default StudentFile;
