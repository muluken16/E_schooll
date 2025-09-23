import React, { useState, useEffect } from "react";
import Layout from "../../layout/Layout";
import {
  PageContainer,
  SectionContainer,
  SubTitle,
  Input,
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
} from "./stdformstyles";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "https://eschooladmin.etbur.com/api/students/";

const StudentFile = () => {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // view | edit | add
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const [selectedStudent, setSelectedStudent] = useState(initialStudent);


  // Fetch students
  const fetchStudents = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setStudents(data.results || data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!selectedStudent.admission_no.trim())
      newErrors.admission_no = "Admission No is required";
    if (!selectedStudent.first_name.trim()) newErrors.first_name = "First Name is required";
    if (!selectedStudent.last_name.trim())
      newErrors.last_name = "Last Name is required";
    if (!selectedStudent.class_section.trim())
      newErrors.class_section = "Class / Section is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add/Edit Student
  const handleAddOrEditStudent = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const method = modalType === "edit" ? "PUT" : "POST";
      const url =
        modalType === "edit" ? `${API_URL}${selectedStudent.id}/` : API_URL;

      const formData = new FormData();
      for (let key in selectedStudent) {
        if (selectedStudent[key] !== null) {
          formData.append(key, selectedStudent[key]);
        }
      }

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data });
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        modalType === "edit"
          ? "Student updated successfully!"
          : "Student added successfully!"
      );
      if (data.password && modalType === "add")
        setGeneratedPassword(data.password);

      setIsModalOpen(false);
      setSelectedStudent(initialStudent);
      fetchStudents();
    } catch (err) {
      setErrors({ form: "Failed to save student" });
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`${API_URL}${id}/`, { method: "DELETE" });
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
      const res = await fetch(`${API_URL}import_csv/`, { method: "POST", body: formData });
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
      const res = await fetch(`${API_URL}export_csv/`);
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

  const filteredStudents = students.filter(
    (s) =>
      (s.first_name && s.first_name.toLowerCase().includes(filter.toLowerCase())) ||
      (s.username && s.username.toLowerCase().includes(filter.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(filter.toLowerCase())) ||
      (s.admission_no && s.admission_no.toLowerCase().includes(filter.toLowerCase()))
  );

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);

  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const openModal = (type, student = initialStudent) => {
    setModalType(type);
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <PageContainer>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Student Management</h1>

        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        {generatedPassword && modalType === "add" && (
          <SuccessMessage>
            Generated Password: <strong>{generatedPassword}</strong>
          </SuccessMessage>
        )}
        {errors.form && <ErrorText>{JSON.stringify(errors.form)}</ErrorText>}

        <Button onClick={() => openModal("add")}>Register New Student</Button>

        {/* Modal */}
        {isModalOpen && (
          <ModalBackground>
            <ModalContent>
              <CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
              <h2 style={{ marginBottom: "15px" }}>
                {modalType === "view" ? "View Student" : modalType === "edit" ? "Edit Student" : "Add Student"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Personal Info */}
                <SectionContainer>
                  <SubTitle>Personal Information</SubTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {[
                      { label: "Profile Photo", type: "file", key: "photo" },
                      { label: "First Name", type: "text", key: "first_name" },
                      { label: "Last Name", type: "text", key: "last_name" },
                      { label: "Admission No", type: "text", key: "admission_no" },
                      { label: "Username", type: "text", key: "username" },
                      { label: "Email", type: "email", key: "email" },
                      { label: "Phone", type: "text", key: "phone" },
                      { label: "Gender", type: "select", key: "gender", options: ["Male", "Female", "Other"] },
                      { label: "Date of Birth", type: "date", key: "dob" },
                      { label: "Blood Group", type: "select", key: "blood_group", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
                      { label: "Address", type: "textarea", key: "address" },
                      { label: "National ID", type: "text", key: "national_id" },
                    ].map(field => (
                      <div key={field.key} style={{ flex: "1 1 200px", display: "flex", flexDirection: "column" }}>
                        <label style={{ fontWeight: "bold" }}>{field.label}</label>
                        {modalType === "view" ? (
                          <span>{selectedStudent[field.key] || "-"}</span>
                        ) : field.type === "file" ? (
                          <Input type="file" onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.files[0] })} />
                        ) : field.type === "select" ? (
                          <select value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })}>
                            <option value="">Select {field.label}</option>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea rows={2} value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })} />
                        ) : (
                          <Input type={field.type} value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })} />
                        )}
                        {errors[field.key] && <ErrorText>{errors[field.key]}</ErrorText>}
                      </div>
                    ))}
                  </div>
                </SectionContainer>

                {/* Academic Info */}
                <SectionContainer>
                  <SubTitle>Academic Information</SubTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {[
                      { label: "Class / Section", key: "class_section" },
                      { label: "Student ID", key: "student_id" },
                      { label: "Department", key: "department" },
                      { label: "Year", key: "year" },
                      { label: "Enrollment Date", key: "enrollment_date", type: "date" },
                      { label: "Academic Status", key: "academic_status", type: "select", options: ["Active", "Inactive", "Graduated"] },
                    ].map(field => (
                      <div key={field.key} style={{ flex: "1 1 200px", display: "flex", flexDirection: "column" }}>
                        <label style={{ fontWeight: "bold" }}>{field.label}</label>
                        {modalType === "view" ? (
                          <span>{selectedStudent[field.key] || "-"}</span>
                        ) : field.type === "select" ? (
                          <select value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })}>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : field.type === "date" ? (
                          <Input type="date" value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })} />
                        ) : (
                          <Input value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })} />
                        )}
                      </div>
                    ))}
                  </div>
                </SectionContainer>

                {/* Guardian Info */}
                <SectionContainer>
                  <SubTitle>Guardian Information</SubTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {[
                      { label: "Father Name", key: "father_name" },
                      { label: "Mother Name", key: "mother_name" },
                      { label: "Guardian Contact", key: "guardian_contact" },
                      { label: "Guardian Email", key: "guardian_email" },
                      { label: "Relation", key: "guardian_relation" },
                    ].map(field => (
                      <div key={field.key} style={{ flex: "1 1 200px", display: "flex", flexDirection: "column" }}>
                        <label style={{ fontWeight: "bold" }}>{field.label}</label>
                        {modalType === "view" ? <span>{selectedStudent[field.key] || "-"}</span> : <Input value={selectedStudent[field.key]} onChange={e => setSelectedStudent({ ...selectedStudent, [field.key]: e.target.value })} />}
                      </div>
                    ))}
                  </div>
                </SectionContainer>

                {/* Other Info */}
                <SectionContainer>
                  <SubTitle>Other Details</SubTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {["medical_condition", "extra_activities", "remarks"].map(field => (
                      <div key={field} style={{ flex: "1 1 300px", display: "flex", flexDirection: "column" }}>
                        <label style={{ fontWeight: "bold" }}>{field.replace("_", " ").toUpperCase()}</label>
                        {modalType === "view" ? <span>{selectedStudent[field] || "-"}</span> : <textarea value={selectedStudent[field]} onChange={e => setSelectedStudent({ ...selectedStudent, [field]: e.target.value })} rows={2} />}
                      </div>
                    ))}
                  </div>
                </SectionContainer>

                {modalType !== "view" && (
                  <Button
                    onClick={handleAddOrEditStudent}
                    bgColor="#38a169"
                    hoverColor="#2f855a"
                    style={{ marginTop: "25px", width: "100%" }}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Saving..."
                      : modalType === "edit"
                      ? "Update Student"
                      : "Register Student"}
                  </Button>
                )}
              </div>
            </ModalContent>
          </ModalBackground>
        )}

        {/* Manage Students Table */}
        <SectionContainer>
          <SubTitle>Manage Students</SubTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
            <Input placeholder="Search..." value={filter} onChange={(e) => setFilter(e.target.value)} style={{ flex: 1 }} />
            <FileInputLabel>
              Import CSV
              <input type="file" accept=".csv" onChange={handleImport} disabled={isLoading} />
            </FileInputLabel>
            <Button onClick={handleExport} disabled={students.length === 0} bgColor="#38a169" hoverColor="#2f855a">
              Export CSV
            </Button>
            <div>
              Rows:
              <select value={rowsPerPage} onChange={handleRowsChange} style={{ marginLeft: "5px", padding: "3px" }}>
                {[10, 25, 50, 100].map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
          </div>
          {errors.import && <ErrorText>{errors.import}</ErrorText>}
          {isLoading && <p style={{ color: "#3182ce" }}>Processing...</p>}
        </SectionContainer>

        <div style={{ overflowX: "auto" }}>
          <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>Admission No</TH>
                  <TH>Username</TH>
                  <TH>First Name</TH>
                  <TH>Last Name</TH>
                  <TH>Gender</TH>
                  <TH>Student ID</TH>
                  <TH>Phone</TH>
                  <TH>Email</TH>
                  <TH>Class / Section</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <tbody>
                {currentStudents.length > 0 ? currentStudents.map((s) => (
                  <TR key={s.id}>
                    <TD>{s.admission_no}</TD>
                    <TD>{s.username || "-"}</TD>
                    <TD>{s.first_name}</TD>
                    <TD>{s.last_name || "-"}</TD>
                    <TD>{s.gender || "-"}</TD>
                    <TD>{s.student_id || "-"}</TD>
                    <TD>{s.phone || "-"}</TD>
                    <TD>{s.email || "-"}</TD>
                    <TD>{s.class_section}</TD>
                    <TD style={{ display: "flex", gap: "6px" }}>
                      <Button onClick={() => openModal("view", s)} bgColor="#3182ce" hoverColor="#2b6cb0" style={{ padding: "5px" }} title="View"><FaEye /></Button>
                      <Button onClick={() => openModal("edit", s)} bgColor="#ed8936" hoverColor="#dd6b20" style={{ padding: "5px" }} title="Edit"><FaEdit /></Button>
                      <Button onClick={() => handleDeleteStudent(s.id)} bgColor="#f56565" hoverColor="#c53030" style={{ padding: "5px" }} title="Delete"><FaTrash /></Button>
                    </TD>
                  </TR>
                )) : (
                  <TR>
                    <TD colSpan="10" style={{ textAlign: "center", padding: "10px", color: "#718096" }}>
                      {filter ? "No students match your search criteria" : "No students found"}
                    </TD>
                  </TR>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </div>

        <p style={{ marginTop: "10px", color: "#4a5568" }}>
          Showing {currentStudents.length} of {filteredStudents.length} filtered students
        </p>
      </PageContainer>
    </Layout>
  );
};

export default StudentFile;
