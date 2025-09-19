import React, { useState } from "react";
import {
    FaArrowRight,
    FaComments,
    FaTimes,
    FaCalendarAlt,
    FaChalkboardTeacher,
    FaLaptop,
    FaGlobeAmericas,
    FaBook,
    FaFlask,
} from "react-icons/fa";
import Navbar from "./Navbar";
import "./homestyle.css";

const SchoolHomepage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("home");
    const [expandedSections, setExpandedSections] = useState({});
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help you with school information today?", sender: "bot" },
    ]);
    const [inputMessage, setInputMessage] = useState("");

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: "smooth" });
        setIsMenuOpen(false);
    };

    const toggleReadMore = (id) => {
        setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() === "") return;

        setMessages([...messages, { text: inputMessage, sender: "user" }]);

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { text: "Thanks for your message. Our staff will contact you soon with more information!", sender: "bot" },
            ]);
        }, 1000);

        setInputMessage("");
    };

    // Example Features + News (keep yours)
    const features = [
        {
            id: 1,
            icon: <FaChalkboardTeacher />,
            title: "Expert Faculty",
            summary: "Our teachers are highly qualified with years of experience.",
            fullContent: "80% of our teachers hold advanced degrees and bring real-world experience into the classroom.",
        },
        {
            id: 2,
            icon: <FaLaptop />,
            title: "Modern Facilities",
            summary: "We provide state-of-the-art labs and classrooms.",
            fullContent: "Our labs, library, and multimedia centers are equipped with the latest learning technology.",
        },
        {
            id: 3,
            icon: <FaGlobeAmericas />,
            title: "Global Curriculum",
            summary: "Internationally recognized programs for global careers.",
            fullContent: "Our programs include AP, IB, and global exchange opportunities for students.",
        },
    ];

    const newsItems = [
        {
            id: 1,
            date: "Oct 15, 2023",
            title: "Annual Science Fair",
            summary: "Students showcase innovative projects.",
            fullContent: "Theme: Sustainable Solutions for Tomorrow. Winners advance to regional competition.",
        },
        {
            id: 2,
            date: "Nov 5, 2023",
            title: "Sports Day",
            summary: "Annual school-wide sports competitions.",
            fullContent: "Track, field, and fun activities with awards for top performers.",
        },
    ];

    return (
        <div className="school-homepage">
            {/* ✅ Navbar Component */}
            <Navbar
                isMenuOpen={isMenuOpen}
                toggleMenu={toggleMenu}
                activeSection={activeSection}
                scrollToSection={scrollToSection}
            />

            {/* Hero Section */}
            <section id="home" className="hero">
                <div className="hero-content">
                    <h1>Welcome to EduFuture Academy</h1>
                    <p>Where we shape tomorrow's leaders through innovation and excellence in education</p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => scrollToSection('about')}>Learn More</button>
                        <button className="btn-secondary" onClick={() => scrollToSection('contact')}>Contact Us</button>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="placeholder-image">
                        <i className="fas fa-graduation-cap"></i>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="section">
                <h2 className="section-title">About EduFuture Academy</h2>
                <div className="section-content">
                    <div className="about-content">
                        <div className="about-text">
                            <h3>Our Mission</h3>
                            <p>At EduFuture Academy, our mission is to provide a transformative educational experience that prepares students for the challenges and opportunities of the future. We foster intellectual curiosity, critical thinking, and ethical leadership in a diverse and inclusive community.</p>

                            {expandedSections.about ? (
                                <>
                                    <p>Founded in 1995, EduFuture Academy has grown from a small community school to a leading educational institution serving over 1,200 students from diverse backgrounds. Our campus spans 25 acres with state-of-the-art facilities designed to support academic excellence and personal growth.</p>
                                    <p>We believe in educating the whole person—mind, body, and character. Our rigorous academic program is complemented by extensive offerings in arts, athletics, and community service. Our graduates are well-prepared for top universities and meaningful careers, with 98% of our seniors accepted to their first-choice colleges.</p>
                                    <button className="read-less-btn" onClick={() => toggleReadMore('about')}>
                                        Read Less <FaArrowRight />
                                    </button>
                                </>
                            ) : (
                                <button className="read-more-btn" onClick={() => toggleReadMore('about')}>
                                    Read More <FaArrowRight />
                                </button>
                            )}
                        </div>
                        <div className="about-stats">
                            <div className="stat">
                                <h4>25+</h4>
                                <p>Years of Excellence</p>
                            </div>
                            <div className="stat">
                                <h4>98%</h4>
                                <p>University Acceptance</p>
                            </div>
                            <div className="stat">
                                <h4>1,200+</h4>
                                <p>Students</p>
                            </div>
                            <div className="stat">
                                <h4>15:1</h4>
                                <p>Student-Teacher Ratio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="section-title">Why Choose EduFuture Academy?</h2>
                <div className="features-grid">
                    {features.map(feature => (
                        <div key={feature.id} className="feature-card">
                            <div className="feature-icon">
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.summary}</p>

                            {expandedSections[`feature-${feature.id}`] ? (
                                <>
                                    <p className="full-content">{feature.fullContent}</p>
                                    <button className="read-less-btn" onClick={() => toggleReadMore(`feature-${feature.id}`)}>
                                        Read Less <FaArrowRight />
                                    </button>
                                </>
                            ) : (
                                <button className="read-more-btn" onClick={() => toggleReadMore(`feature-${feature.id}`)}>
                                    Read More <FaArrowRight />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Digital Library Section */}
            <section id="library" className="section alt">
                <h2 className="section-title">Digital Library</h2>
                <div className="section-content">
                    <div className="library-content">
                        <div className="library-text">
                            <h3>Access World-Class Resources</h3>
                            <p>Our digital library provides students and faculty with 24/7 access to a vast collection of eBooks, academic journals, research databases, and multimedia resources.</p>

                            {expandedSections.library ? (
                                <>
                                    <p>With over 50,000 eBooks, 100+ academic databases, and subscriptions to leading journals across all disciplines, our digital library supports rigorous academic inquiry and independent learning. Our user-friendly platform allows for easy searching, citation generation, and collaboration on research projects.</p>
                                    <p>Students can access specialized resources for their courses, including video tutorials, interactive simulations, and primary source documents. Our librarians offer virtual research assistance and regularly conduct workshops on information literacy and research skills.</p>
                                    <button className="read-less-btn" onClick={() => toggleReadMore('library')}>
                                        Read Less <FaArrowRight />
                                    </button>
                                </>
                            ) : (
                                <button className="read-more-btn" onClick={() => toggleReadMore('library')}>
                                    Read More <FaArrowRight />
                                </button>
                            )}
                        </div>
                        <div className="library-image">
                            <div className="placeholder-image">
                                <FaBook />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Digital Laboratory Section */}
            <section id="lab" className="section">
                <h2 className="section-title">Digital Laboratory</h2>
                <div className="section-content">
                    <div className="lab-content">
                        <div className="lab-image">
                            <div className="placeholder-image">
                                <FaFlask />
                            </div>
                        </div>
                        <div className="lab-text">
                            <h3>Innovative Learning Spaces</h3>
                            <p>Our digital laboratories provide students with hands-on experience using cutting-edge technology and software across various disciplines.</p>

                            {expandedSections.lab ? (
                                <>
                                    <p>Our STEM labs are equipped with 3D printers, robotics kits, and equipment for physics, chemistry, and biology experiments. The computer science lab features high-performance workstations with professional development tools and environments. Our digital media lab offers professional-grade equipment for video production, graphic design, and music composition.</p>
                                    <p>All labs are supervised by experienced instructors who guide students through complex projects and experiments. Students have opportunities to work on real-world problems and develop portfolio-worthy projects that demonstrate their skills to college admissions officers and future employers.</p>
                                    <button className="read-less-btn" onClick={() => toggleReadMore('lab')}>
                                        Read Less <FaArrowRight />
                                    </button>
                                </>
                            ) : (
                                <button className="read-more-btn" onClick={() => toggleReadMore('lab')}>
                                    Read More <FaArrowRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="news">
                <h2 className="section-title">Latest News & Events</h2>
                <div className="news-grid">
                    {newsItems.map(item => (
                        <div key={item.id} className="news-card">
                            <div className="news-date">
                                <FaCalendarAlt /> {item.date}
                            </div>
                            <h3>{item.title}</h3>
                            <p>{item.summary}</p>

                            {expandedSections[`news-${item.id}`] ? (
                                <>
                                    <p className="full-content">{item.fullContent}</p>
                                    <button className="read-less-btn" onClick={() => toggleReadMore(`news-${item.id}`)}>
                                        Read Less <FaArrowRight />
                                    </button>
                                </>
                            ) : (
                                <button className="read-more-btn" onClick={() => toggleReadMore(`news-${item.id}`)}>
                                    Read More <FaArrowRight />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="section alt">
                <h2 className="section-title">Contact Us</h2>
                <div className="section-content">
                    <div className="contact-content">
                        <div className="contact-info">
                            <h3>Get in Touch</h3>
                            <p>We'd love to hear from you. Here's how you can reach us:</p>

                            <div className="contact-details">
                                <div className="contact-item">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <div>
                                        <h4>Address</h4>
                                        <p>123 Education Street, Knowledgetown, EF 12345</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fas fa-phone"></i>
                                    <div>
                                        <h4>Phone</h4>
                                        <p>(123) 456-7890</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fas fa-envelope"></i>
                                    <div>
                                        <h4>Email</h4>
                                        <p>info@edufuture.edu</p>
                                    </div>
                                </div>
                                <div className="contact-item">
                                    <i className="fas fa-clock"></i>
                                    <div>
                                        <h4>Office Hours</h4>
                                        <p>Monday-Friday: 8:00 AM - 5:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form">
                            <h3>Send us a Message</h3>
                            <form>
                                <div className="form-group">
                                    <input type="text" placeholder="Your Name" />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Your Email" />
                                </div>
                                <div className="form-group">
                                    <input type="text" placeholder="Subject" />
                                </div>
                                <div className="form-group">
                                    <textarea placeholder="Your Message" rows="5"></textarea>
                                </div>
                                <button type="submit" className="btn-primary">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>EduFuture Academy</h3>
                        <p>Preparing students for the future through innovative education and character development.</p>
                        <div className="social-icons">
                            <a href="#"><i className="fab fa-facebook"></i></a>
                            <a href="#"><i className="fab fa-twitter"></i></a>
                            <a href="#"><i className="fab fa-instagram"></i></a>
                            <a href="#"><i className="fab fa-linkedin"></i></a>
                            <a href="#"><i className="fab fa-youtube"></i></a>
                        </div>
                    </div>
                    <div className="footer-section">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="#" onClick={() => scrollToSection('home')}>Home</a></li>
                            <li><a href="#" onClick={() => scrollToSection('about')}>About Us</a></li>
                            <li><a href="#" onClick={() => scrollToSection('library')}>Digital Library</a></li>
                            <li><a href="#" onClick={() => scrollToSection('lab')}>Digital Laboratory</a></li>
                            <li><a href="#" onClick={() => scrollToSection('contact')}>Contact Us</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>Resources</h3>
                        <ul>
                            <li><a href="#">Admissions</a></li>
                            <li><a href="#">Academic Calendar</a></li>
                            <li><a href="#">Student Portal</a></li>
                            <li><a href="#">Parent Portal</a></li>
                            <li><a href="#">Faculty Directory</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} EduFuture Academy. All rights reserved.</p>
                </div>

            </footer>

            {/* Chatbot */}
            <div className={`chatbot ${isChatOpen ? 'open' : ''}`}>
                <div className="chat-header" onClick={toggleChat}>
                    <div className="chat-title">
                        <FaComments />
                        <span>School Assistant</span>
                    </div>
                    <button className="chat-toggle">
                        {isChatOpen ? <FaTimes /> : <FaComments />}
                    </button>
                </div>
                <div className="chat-body">
                    <div className="messages">
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                {message.text}
                            </div>
                        ))}
                    </div>
                    <form className="chat-input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message here..."
                        />
                        <button type="submit">
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>


        </div>
    );
};

export default SchoolHomepage;