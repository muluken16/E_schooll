import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import './CapacityBuilding.css';

const CapacityBuilding = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeTab, setActiveTab] = useState('upcoming');
    const [trainings, setTrainings] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [schools, setSchools] = useState([]);
    const [showTrainingForm, setShowTrainingForm] = useState(false);

    // Mock data - replace with actual API calls
    useEffect(() => {
        const mockTrainings = [
            {
                id: 1,
                title: 'Digital Literacy Training',
                category: 'Technology',
                level: 'Primary School Teachers',
                date: '2024-02-15',
                duration: '3 days',
                venue: 'Wereda Education Office',
                facilitator: 'Dr. Alemayehu Tekle',
                status: 'upcoming',
                maxParticipants: 30,
                registeredParticipants: 18,
                objectives: [
                    'Improve digital skills for classroom teaching',
                    'Introduce educational software',
                    'Enhance online resource utilization'
                ]
            },
            {
                id: 2,
                title: 'Student Counseling Workshop',
                category: 'Guidance & Counseling',
                level: 'Secondary School Teachers',
                date: '2024-01-20',
                duration: '2 days',
                venue: 'Secondary School A',
                facilitator: 'Mrs. Selamawit Bekele',
                status: 'completed',
                maxParticipants: 25,
                registeredParticipants: 25,
                objectives: [
                    'Develop counseling skills',
                    'Address student mental health',
                    'Improve student guidance techniques'
                ]
            },
            {
                id: 3,
                title: 'Science Teaching Methodology',
                category: 'Pedagogy',
                level: 'Science Teachers',
                date: '2024-03-10',
                duration: '4 days',
                venue: 'Regional Education Bureau',
                facilitator: 'Prof. Michael Asrat',
                status: 'upcoming',
                maxParticipants: 40,
                registeredParticipants: 32,
                objectives: [
                    'Modern science teaching techniques',
                    'Laboratory safety protocols',
                    'Innovative experiment designs'
                ]
            }
        ];

        const mockParticipants = [
            { id: 1, name: 'Teacher A', school: 'Primary School A', trainingId: 1, status: 'registered' },
            { id: 2, name: 'Teacher B', school: 'Primary School B', trainingId: 1, status: 'registered' },
            { id: 3, name: 'Teacher C', school: 'Secondary School A', trainingId: 2, status: 'completed' },
        ];

        const mockSchools = [
            { id: 1, name: 'Primary School A', teachers: 25, participatedTrainings: 5 },
            { id: 2, name: 'Primary School B', teachers: 20, participatedTrainings: 3 },
            { id: 3, name: 'Secondary School A', teachers: 35, participatedTrainings: 8 },
            { id: 4, name: 'Secondary School B', teachers: 30, participatedTrainings: 6 },
        ];

        setTrainings(mockTrainings);
        setParticipants(mockParticipants);
        setSchools(mockSchools);
    }, []);

    const filteredTrainings = trainings.filter(training => 
        activeTab === 'all' ? true : training.status === activeTab
    );

    const getTrainingParticipants = (trainingId) => {
        return participants.filter(participant => participant.trainingId === trainingId);
    };

    const getSchoolParticipation = (schoolId) => {
        return participants.filter(participant => {
            const school = schools.find(s => s.name === participant.school);
            return school && school.id === schoolId;
        });
    };

    const handleRegisterParticipant = (trainingId, participantData) => {
        // Simulate registration - replace with API call
        const newParticipant = {
            id: participants.length + 1,
            ...participantData,
            trainingId,
            status: 'registered'
        };
        setParticipants([...participants, newParticipant]);
        
        // Update training registration count
        setTrainings(trainings.map(training => {
            if (training.id === trainingId) {
                return {
                    ...training,
                    registeredParticipants: training.registeredParticipants + 1
                };
            }
            return training;
        }));
    };

    const handleCreateTraining = (trainingData) => {
        // Simulate training creation - replace with API call
        const newTraining = {
            id: trainings.length + 1,
            ...trainingData,
            status: 'upcoming',
            registeredParticipants: 0
        };
        setTrainings([...trainings, newTraining]);
        setShowTrainingForm(false);
    };

    return (
        <Layout>
            <div className="capacity-building">
                <div className="page-header">
                    <h1>Training and Capacity Building</h1>
                    <p>Wereda Education Office - Teacher Development Program</p>
                </div>

                {/* User Info */}
                <div className="user-info">
                    <span>Welcome, {user?.name || 'Training Coordinator'}</span>
                    <span>Role: {user?.role || 'Capacity Building Officer'}</span>
                </div>

                {/* Statistics Overview */}
                <div className="stats-overview">
                    <div className="stat-card">
                        <h3>Total Trainings</h3>
                        <span className="stat-number">{trainings.length}</span>
                        <span className="stat-label">This Year</span>
                    </div>
                    <div className="stat-card">
                        <h3>Teachers Trained</h3>
                        <span className="stat-number">{participants.length}</span>
                        <span className="stat-label">Unique Participants</span>
                    </div>
                    <div className="stat-card">
                        <h3>Schools Involved</h3>
                        <span className="stat-number">{schools.length}</span>
                        <span className="stat-label">Active Participation</span>
                    </div>
                    <div className="stat-card">
                        <h3>Completion Rate</h3>
                        <span className="stat-number">
                            {((participants.filter(p => p.status === 'completed').length / participants.length) * 100 || 0).toFixed(1)}%
                        </span>
                        <span className="stat-label">Training Success</span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="tabs">
                    <button 
                        className={activeTab === 'upcoming' ? 'active' : ''}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming Trainings
                    </button>
                    <button 
                        className={activeTab === 'completed' ? 'active' : ''}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed Trainings
                    </button>
                    <button 
                        className={activeTab === 'schools' ? 'active' : ''}
                        onClick={() => setActiveTab('schools')}
                    >
                        School Participation
                    </button>
                    <button 
                        className={activeTab === 'all' ? 'active' : ''}
                        onClick={() => setActiveTab('all')}
                    >
                        All Trainings
                    </button>
                    <button 
                        className="primary-btn"
                        onClick={() => setShowTrainingForm(true)}
                    >
                        + New Training
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Trainings List */}
                    {(activeTab === 'upcoming' || activeTab === 'completed' || activeTab === 'all') && (
                        <div className="trainings-list">
                            <h3>{activeTab === 'upcoming' ? 'Upcoming' : activeTab === 'completed' ? 'Completed' : 'All'} Training Programs</h3>
                            <div className="trainings-grid">
                                {filteredTrainings.map(training => (
                                    <TrainingCard 
                                        key={training.id} 
                                        training={training} 
                                        participants={getTrainingParticipants(training.id)}
                                        onRegister={handleRegisterParticipant}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Schools Participation */}
                    {activeTab === 'schools' && (
                        <div className="schools-participation">
                            <h3>School Participation Overview</h3>
                            <div className="schools-grid">
                                {schools.map(school => (
                                    <div key={school.id} className="school-card">
                                        <h4>{school.name}</h4>
                                        <div className="school-info">
                                            <span>Teachers: {school.teachers}</span>
                                            <span>Trainings Attended: {school.participatedTrainings}</span>
                                        </div>
                                        <div className="participation-rate">
                                            Participation Rate: {((school.participatedTrainings / trainings.length) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Training Creation Modal */}
                {showTrainingForm && (
                    <TrainingForm 
                        onClose={() => setShowTrainingForm(false)}
                        onSubmit={handleCreateTraining}
                        schools={schools}
                    />
                )}
            </div>
        </Layout>
    );
};

// Training Card Component
const TrainingCard = ({ training, participants, onRegister }) => {
    const [showRegistration, setShowRegistration] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const registrationProgress = (training.registeredParticipants / training.maxParticipants) * 100;

    return (
        <div className={`training-card ${training.status}`}>
            <div className="training-header">
                <h4>{training.title}</h4>
                <span className={`status-badge ${training.status}`}>
                    {training.status}
                </span>
            </div>
            
            <div className="training-info">
                <div className="info-item">
                    <strong>Category:</strong> {training.category}
                </div>
                <div className="info-item">
                    <strong>Level:</strong> {training.level}
                </div>
                <div className="info-item">
                    <strong>Date:</strong> {training.date}
                </div>
                <div className="info-item">
                    <strong>Duration:</strong> {training.duration}
                </div>
                <div className="info-item">
                    <strong>Venue:</strong> {training.venue}
                </div>
                <div className="info-item">
                    <strong>Facilitator:</strong> {training.facilitator}
                </div>
            </div>

            {/* Registration Progress */}
            <div className="registration-progress">
                <div className="progress-info">
                    <span>Registration: {training.registeredParticipants}/{training.maxParticipants}</span>
                    <span>{registrationProgress.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${registrationProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="training-actions">
                <button 
                    className="secondary-btn"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? 'Hide Details' : 'View Details'}
                </button>
                {training.status === 'upcoming' && (
                    <button 
                        className="primary-btn"
                        onClick={() => setShowRegistration(true)}
                        disabled={training.registeredParticipants >= training.maxParticipants}
                    >
                        {training.registeredParticipants >= training.maxParticipants ? 'Full' : 'Register'}
                    </button>
                )}
            </div>

            {/* Training Details */}
            {showDetails && (
                <div className="training-details">
                    <h5>Training Objectives:</h5>
                    <ul>
                        {training.objectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                        ))}
                    </ul>
                    
                    {participants.length > 0 && (
                        <>
                            <h5>Registered Participants ({participants.length}):</h5>
                            <div className="participants-list">
                                {participants.map(participant => (
                                    <span key={participant.id} className="participant-tag">
                                        {participant.name} ({participant.school})
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Registration Modal */}
            {showRegistration && (
                <RegistrationForm 
                    training={training}
                    onClose={() => setShowRegistration(false)}
                    onRegister={onRegister}
                />
            )}
        </div>
    );
};

// Training Form Component
const TrainingForm = ({ onClose, onSubmit, schools }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        level: '',
        date: '',
        duration: '',
        venue: '',
        facilitator: '',
        maxParticipants: '',
        objectives: ['']
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const addObjective = () => {
        setFormData({
            ...formData,
            objectives: [...formData.objectives, '']
        });
    };

    const updateObjective = (index, value) => {
        const newObjectives = [...formData.objectives];
        newObjectives[index] = value;
        setFormData({ ...formData, objectives: newObjectives });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Create New Training Program</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Training Title *</label>
                            <input 
                                type="text" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Category *</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Technology">Technology</option>
                                <option value="Pedagogy">Pedagogy</option>
                                <option value="Guidance & Counseling">Guidance & Counseling</option>
                                <option value="Leadership">Leadership</option>
                                <option value="Subject Matter">Subject Matter</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Target Level *</label>
                            <select 
                                value={formData.level}
                                onChange={(e) => setFormData({...formData, level: e.target.value})}
                                required
                            >
                                <option value="">Select Level</option>
                                <option value="Primary School Teachers">Primary School Teachers</option>
                                <option value="Secondary School Teachers">Secondary School Teachers</option>
                                <option value="School Administrators">School Administrators</option>
                                <option value="All Teachers">All Teachers</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Date *</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration *</label>
                            <input 
                                type="text" 
                                value={formData.duration}
                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                placeholder="e.g., 3 days"
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Participants *</label>
                            <input 
                                type="number" 
                                value={formData.maxParticipants}
                                onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Venue *</label>
                        <input 
                            type="text" 
                            value={formData.venue}
                            onChange={(e) => setFormData({...formData, venue: e.target.value})}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Facilitator *</label>
                        <input 
                            type="text" 
                            value={formData.facilitator}
                            onChange={(e) => setFormData({...formData, facilitator: e.target.value})}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Training Objectives</label>
                        {formData.objectives.map((objective, index) => (
                            <input 
                                key={index}
                                type="text" 
                                value={objective}
                                onChange={(e) => updateObjective(index, e.target.value)}
                                placeholder={`Objective ${index + 1}`}
                            />
                        ))}
                        <button type="button" onClick={addObjective} className="add-objective-btn">
                            + Add Objective
                        </button>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="secondary-btn">
                            Cancel
                        </button>
                        <button type="submit" className="primary-btn">
                            Create Training
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Registration Form Component
const RegistrationForm = ({ training, onClose, onRegister }) => {
    const [formData, setFormData] = useState({
        name: '',
        school: '',
        email: '',
        phone: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(training.id, formData);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Register for {training.title}</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>School *</label>
                        <input 
                            type="text" 
                            value={formData.school}
                            onChange={(e) => setFormData({...formData, school: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="secondary-btn">
                            Cancel
                        </button>
                        <button type="submit" className="primary-btn">
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CapacityBuilding;