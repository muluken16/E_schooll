import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { getToken } from '../../utils/auth';
import { FaBook, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import './StudentLibrary.css';

const StudentLibrary = () => {
  const [libraryRecords, setLibraryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/student-self/"
    : "https://eschooladmin.etbur.com/api/student-self/";

  useEffect(() => {
    fetchLibraryRecords();
  }, []);

  const fetchLibraryRecords = async () => {
    try {
      const response = await fetch(`${API_URL}my_library_records/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLibraryRecords(data);
      } else {
        setError('Failed to load library records');
      }
    } catch (err) {
      setError('Error loading library records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (record) => {
    if (record.returned) return <FaCheckCircle className="status-icon returned" />;
    if (record.overdue) return <FaExclamationTriangle className="status-icon overdue" />;
    return <FaClock className="status-icon active" />;
  };

  const getStatusText = (record) => {
    if (record.returned) return 'Returned';
    if (record.overdue) return 'Overdue';
    return 'Active';
  };

  const getStatusClass = (record) => {
    if (record.returned) return 'returned';
    if (record.overdue) return 'overdue';
    return 'active';
  };

  if (loading) return <Layout><div className="loading">Loading library records...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  const activeBooks = libraryRecords.filter(record => !record.returned);
  const overdueBooks = libraryRecords.filter(record => record.overdue);
  const returnedBooks = libraryRecords.filter(record => record.returned);

  return (
    <Layout>
      <div className="student-library">
        <div className="library-header">
          <h1>My Library</h1>
          <p>Track your borrowed books and library activity</p>
        </div>

        {/* Library Statistics */}
        <div className="library-stats">
          <div className="stat-card active">
            <div className="stat-icon">
              <FaBook />
            </div>
            <div className="stat-content">
              <h3>Currently Borrowed</h3>
              <div className="stat-value">{activeBooks.length}</div>
            </div>
          </div>
          <div className="stat-card overdue">
            <div className="stat-icon">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <h3>Overdue Books</h3>
              <div className="stat-value">{overdueBooks.length}</div>
            </div>
          </div>
          <div className="stat-card returned">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <h3>Total Returned</h3>
              <div className="stat-value">{returnedBooks.length}</div>
            </div>
          </div>
          <div className="stat-card total">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>Total Borrowed</h3>
              <div className="stat-value">{libraryRecords.length}</div>
            </div>
          </div>
        </div>

        {/* Overdue Alert */}
        {overdueBooks.length > 0 && (
          <div className="overdue-alert">
            <div className="alert-icon">
              <FaExclamationTriangle />
            </div>
            <div className="alert-content">
              <h4>Overdue Books Alert</h4>
              <p>You have {overdueBooks.length} overdue book(s). Please return them as soon as possible to avoid penalties.</p>
            </div>
          </div>
        )}

        {/* Currently Borrowed Books */}
        {activeBooks.length > 0 && (
          <div className="books-section">
            <h3>Currently Borrowed Books</h3>
            <div className="books-grid">
              {activeBooks.map((record, index) => (
                <div key={index} className={`book-card ${getStatusClass(record)}`}>
                  <div className="book-header">
                    <div className="book-icon">
                      <FaBook />
                    </div>
                    <div className="book-status">
                      {getStatusIcon(record)}
                      <span className={`status-text ${getStatusClass(record)}`}>
                        {getStatusText(record)}
                      </span>
                    </div>
                  </div>
                  <div className="book-info">
                    <h4>{record.book_title}</h4>
                    <p className="book-author">by {record.book_author}</p>
                    <p className="book-isbn">ISBN: {record.book_isbn}</p>
                  </div>
                  <div className="book-dates">
                    <div className="date-item">
                      <span className="date-label">Borrowed:</span>
                      <span className="date-value">{new Date(record.borrow_date).toLocaleDateString()}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Due:</span>
                      <span className={`date-value ${record.overdue ? 'overdue' : ''}`}>
                        {new Date(record.expected_return_date).toLocaleDateString()}
                      </span>
                    </div>
                    {record.overdue && (
                      <div className="overdue-days">
                        {Math.ceil((new Date() - new Date(record.expected_return_date)) / (1000 * 60 * 60 * 24))} days overdue
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Library Records */}
        <div className="records-section">
          <h3>Library History</h3>
          <div className="records-table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Borrowed Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {libraryRecords.length > 0 ? libraryRecords.map((record, index) => (
                  <tr key={index} className={getStatusClass(record)}>
                    <td className="book-title">{record.book_title}</td>
                    <td className="book-author">{record.book_author}</td>
                    <td className="book-isbn">{record.book_isbn}</td>
                    <td className="date-cell">{new Date(record.borrow_date).toLocaleDateString()}</td>
                    <td className={`date-cell ${record.overdue ? 'overdue' : ''}`}>
                      {new Date(record.expected_return_date).toLocaleDateString()}
                    </td>
                    <td className="date-cell">
                      {record.actual_return_date ? new Date(record.actual_return_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusClass(record)}`}>
                        {getStatusIcon(record)}
                        {getStatusText(record)}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No library records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Library Guidelines */}
        <div className="guidelines-section">
          <h3>Library Guidelines</h3>
          <div className="guidelines-content">
            <div className="guideline-item">
              <h4>Borrowing Period</h4>
              <p>Books can be borrowed for up to 14 days from the date of issue.</p>
            </div>
            <div className="guideline-item">
              <h4>Renewal Policy</h4>
              <p>Books can be renewed once for an additional 7 days if no other student has reserved them.</p>
            </div>
            <div className="guideline-item">
              <h4>Overdue Penalties</h4>
              <p>A fine of $0.50 per day will be charged for overdue books.</p>
            </div>
            <div className="guideline-item">
              <h4>Lost Books</h4>
              <p>Students are responsible for the full replacement cost of lost or damaged books.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentLibrary;