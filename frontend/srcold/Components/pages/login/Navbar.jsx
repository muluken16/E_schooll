import React from "react";
import {
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaBook,
  FaFlask,
  FaUser,
  FaBars,
  FaTimes,
  FaGraduationCap,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./homestyle.css";

const Navbar = ({ isMenuOpen, toggleMenu, activeSection, scrollToSection }) => {
  const navigate = useNavigate();

  const openLogin = () => {
    navigate("/login");
  };

  const goHome = () => {
    navigate("/"); // ✅ redirect to homepage
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* ✅ Logo clicks to homepage */}
        <div className="nav-logo" onClick={goHome} style={{ cursor: "pointer" }}>
          <FaGraduationCap />
          <h2>EduFuture</h2>
        </div>

        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          {/* ✅ Home nav also redirects */}
          <div
            className={`nav-item ${activeSection === "home" ? "active" : ""}`}
            onClick={goHome}
          >
            <FaHome className="nav-icon" />
            <span>Home</span>
          </div>

          <div
            className={`nav-item ${activeSection === "about" ? "active" : ""}`}
            onClick={() => scrollToSection("about")}
          >
            <FaInfoCircle className="nav-icon" />
            <span>About Us</span>
          </div>
          <div
            className={`nav-item ${activeSection === "contact" ? "active" : ""}`}
            onClick={() => scrollToSection("contact")}
          >
            <FaEnvelope className="nav-icon" />
            <span>Contact Us</span>
          </div>
          <div
            className={`nav-item ${activeSection === "library" ? "active" : ""}`}
            onClick={() => scrollToSection("library")}
          >
            <FaBook className="nav-icon" />
            <span>Digital Library</span>
          </div>
          <div
            className={`nav-item ${activeSection === "lab" ? "active" : ""}`}
            onClick={() => scrollToSection("lab")}
          >
            <FaFlask className="nav-icon" />
            <span>Digital Laboratory</span>
          </div>
        </div>

        <div className="nav-buttons">
          <button className="login-btn" onClick={openLogin}>
            <FaUser />
            <span>Login</span>
          </button>
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
