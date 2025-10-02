import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import './Settings.css';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Profile state
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        bio: '',
        avatar: ''
    });

    // Settings state
    const [settings, setSettings] = useState({
        theme: 'light',
        language: 'english',
        notifications: {
            email: true,
            sms: false,
            push: true,
            newsletter: true
        },
        privacy: {
            profileVisible: true,
            activityStatus: true,
            emailSearchable: false
        },
        preferences: {
            autoSave: true,
            spellCheck: true,
            compactView: false,
            fontSize: 'medium'
        }
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        const savedSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
        const savedProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
        
        setUser(userData);
        setSettings(prev => ({ ...prev, ...savedSettings }));
        setProfile(prev => ({ ...prev, ...savedProfile, ...userData }));
        setLoading(false);
    }, []);

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSettingsChange = (category, field, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleSave = async (type) => {
        setSaving(true);
        setSaveMessage('');
        
        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (type === 'profile') {
                localStorage.setItem('userProfile', JSON.stringify(profile));
                // Update main user data
                const updatedUser = { ...user, ...profile };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                localStorage.setItem('userSettings', JSON.stringify(settings));
            }
            
            setSaveMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} settings saved successfully!`);
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Error saving settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfile(prev => ({ ...prev, avatar: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const resetToDefaults = () => {
        if (window.confirm('Are you sure you want to reset all settings to default?')) {
            const defaultSettings = {
                theme: 'light',
                language: 'english',
                notifications: {
                    email: true,
                    sms: false,
                    push: true,
                    newsletter: true
                },
                privacy: {
                    profileVisible: true,
                    activityStatus: true,
                    emailSearchable: false
                },
                preferences: {
                    autoSave: true,
                    spellCheck: true,
                    compactView: false,
                    fontSize: 'medium'
                }
            };
            setSettings(defaultSettings);
            localStorage.removeItem('userSettings');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="settings-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading settings...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="settings-container">
                {/* Header */}
                <div className="settings-header">
                    <h1>Education Platform Settings</h1>
                    <p>Manage your profile, preferences, and platform settings</p>
                    {saveMessage && (
                        <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                            {saveMessage}
                        </div>
                    )}
                </div>

                <div className="settings-content">
                    {/* Sidebar Navigation */}
                    <div className="settings-sidebar">
                        <div className="user-summary">
                            <div className="avatar-container">
                                <img 
                                    src={profile.avatar || `/api/placeholder/80/80`} 
                                    alt="Profile" 
                                    className="avatar"
                                />
                                <div className="avatar-overlay">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="avatar-upload"
                                    />
                                    <span>📷</span>
                                </div>
                            </div>
                            <div className="user-info">
                                <h3>{profile.firstName} {profile.lastName}</h3>
                                <p>{profile.position}</p>
                                <span className="user-role">{user?.role || 'User'}</span>
                            </div>
                        </div>

                        <nav className="settings-nav">
                            <button 
                                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                👤 Profile Settings
                            </button>
                            <button 
                                className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
                                onClick={() => setActiveTab('account')}
                            >
                                🔐 Account Security
                            </button>
                            <button 
                                className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                🔔 Notifications
                            </button>
                            <button 
                                className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
                                onClick={() => setActiveTab('privacy')}
                            >
                🛡️ Privacy & Security
                            </button>
                            <button 
                                className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                                onClick={() => setActiveTab('preferences')}
                            >
                                ⚙️ Preferences
                            </button>
                            <button 
                                className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                                onClick={() => setActiveTab('appearance')}
                            >
                                🎨 Appearance
                            </button>
                        </nav>

                        <div className="sidebar-actions">
                            <button 
                                className="btn-danger"
                                onClick={resetToDefaults}
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="settings-main">
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="settings-section">
                                <h2>Profile Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            value={profile.firstName}
                                            onChange={(e) => handleProfileChange('firstName', e.target.value)}
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            value={profile.lastName}
                                            onChange={(e) => handleProfileChange('lastName', e.target.value)}
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => handleProfileChange('email', e.target.value)}
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Position/Role</label>
                                        <input
                                            type="text"
                                            value={profile.position}
                                            onChange={(e) => handleProfileChange('position', e.target.value)}
                                            placeholder="e.g., Teacher, Administrator"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <select
                                            value={profile.department}
                                            onChange={(e) => handleProfileChange('department', e.target.value)}
                                        >
                                            <option value="">Select Department</option>
                                            <option value="elementary">Elementary Education</option>
                                            <option value="secondary">Secondary Education</option>
                                            <option value="special">Special Education</option>
                                            <option value="administration">Administration</option>
                                            <option value="support">Support Staff</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Bio/Description</label>
                                        <textarea
                                            value={profile.bio}
                                            onChange={(e) => handleProfileChange('bio', e.target.value)}
                                            placeholder="Tell us about yourself..."
                                            rows="4"
                                        />
                                    </div>
                                </div>
                                <div className="section-actions">
                                    <button 
                                        className="btn-primary"
                                        onClick={() => handleSave('profile')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Account Security */}
                        {activeTab === 'account' && (
                            <div className="settings-section">
                                <h2>Account Security</h2>
                                <div className="security-cards">
                                    <div className="security-card">
                                        <h3>Password</h3>
                                        <p>Last changed 3 months ago</p>
                                        <button className="btn-outline">Change Password</button>
                                    </div>
                                    <div className="security-card">
                                        <h3>Two-Factor Authentication</h3>
                                        <p>Add an extra layer of security</p>
                                        <button className="btn-outline">Enable 2FA</button>
                                    </div>
                                    <div className="security-card">
                                        <h3>Login Activity</h3>
                                        <p>View recent account activity</p>
                                        <button className="btn-outline">View Activity</button>
                                    </div>
                                    <div className="security-card">
                                        <h3>Connected Devices</h3>
                                        <p>Manage your active sessions</p>
                                        <button className="btn-outline">Manage Devices</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications */}
                        {activeTab === 'notifications' && (
                            <div className="settings-section">
                                <h2>Notification Preferences</h2>
                                <div className="preferences-grid">
                                    <div className="preference-item">
                                        <div>
                                            <h4>Email Notifications</h4>
                                            <p>Receive notifications via email</p>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.email}
                                                onChange={(e) => handleSettingsChange('notifications', 'email', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="preference-item">
                                        <div>
                                            <h4>SMS Alerts</h4>
                                            <p>Important alerts via text message</p>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.sms}
                                                onChange={(e) => handleSettingsChange('notifications', 'sms', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="preference-item">
                                        <div>
                                            <h4>Push Notifications</h4>
                                            <p>Notifications on your devices</p>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.push}
                                                onChange={(e) => handleSettingsChange('notifications', 'push', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="preference-item">
                                        <div>
                                            <h4>Newsletter</h4>
                                            <p>Educational updates and news</p>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={settings.notifications.newsletter}
                                                onChange={(e) => handleSettingsChange('notifications', 'newsletter', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="section-actions">
                                    <button 
                                        className="btn-primary"
                                        onClick={() => handleSave('notifications')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Privacy & Security */}
                        {activeTab === 'privacy' && (
                            <div className="settings-section">
                                <h2>Privacy & Security Settings</h2>
                                <div className="preferences-grid">
                                    <div className="preference-item">
                                        <div>
                                            <h4>Profile Visibility</h4>
                                            <p>Allow others to see your profile</p>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={settings.privacy.profileVisible}
                                                onChange={(e) => handleSettingsChange('privacy', 'profileVisible', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="preference-item">
                                        <div>
                                            <h4>Activity Status</h4>
                                            <p>Show when you're active on the platform</p>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={settings.privacy.activityStatus}
                                                onChange={(e) => handleSettingsChange('privacy', 'activityStatus', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="preference-item">
                                        <div>
                                            <h4>Email Searchable</h4>
                                            <p>Allow others to find you by email</p>
                                        </div>
                                        <label className="toggle">
                                            <input
                                                type="checkbox"
                                                checked={settings.privacy.emailSearchable}
                                                onChange={(e) => handleSettingsChange('privacy', 'emailSearchable', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                                <div className="privacy-actions">
                                    <button className="btn-outline">Download My Data</button>
                                    <button className="btn-danger">Delete Account</button>
                                </div>
                            </div>
                        )}

                        {/* Preferences */}
                        {activeTab === 'preferences' && (
                            <div className="settings-section">
                                <h2>Platform Preferences</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Auto-save Documents</label>
                                        <label className="toggle large">
                                            <input
                                                type="checkbox"
                                                checked={settings.preferences.autoSave}
                                                onChange={(e) => handleSettingsChange('preferences', 'autoSave', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label>Spell Check</label>
                                        <label className="toggle large">
                                            <input
                                                type="checkbox"
                                                checked={settings.preferences.spellCheck}
                                                onChange={(e) => handleSettingsChange('preferences', 'spellCheck', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label>Compact View</label>
                                        <label className="toggle large">
                                            <input
                                                type="checkbox"
                                                checked={settings.preferences.compactView}
                                                onChange={(e) => handleSettingsChange('preferences', 'compactView', e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label>Font Size</label>
                                        <select
                                            value={settings.preferences.fontSize}
                                            onChange={(e) => handleSettingsChange('preferences', 'fontSize', e.target.value)}
                                        >
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="xlarge">Extra Large</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="section-actions">
                                    <button 
                                        className="btn-primary"
                                        onClick={() => handleSave('preferences')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Appearance */}
                        {activeTab === 'appearance' && (
                            <div className="settings-section">
                                <h2>Appearance Settings</h2>
                                <div className="theme-selector">
                                    <h3>Theme</h3>
                                    <div className="theme-options">
                                        <div 
                                            className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                                            onClick={() => handleSettingsChange('theme', 'light')}
                                        >
                                            <div className="theme-preview light-theme"></div>
                                            <span>Light</span>
                                        </div>
                                        <div 
                                            className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                                            onClick={() => handleSettingsChange('theme', 'dark')}
                                        >
                                            <div className="theme-preview dark-theme"></div>
                                            <span>Dark</span>
                                        </div>
                                        <div 
                                            className={`theme-option ${settings.theme === 'auto' ? 'active' : ''}`}
                                            onClick={() => handleSettingsChange('theme', 'auto')}
                                        >
                                            <div className="theme-preview auto-theme"></div>
                                            <span>Auto</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="accent-color">
                                    <h3>Accent Color</h3>
                                    <div className="color-options">
                                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                                            <div
                                                key={color}
                                                className="color-option"
                                                style={{ backgroundColor: color }}
                                                onClick={() => handleSettingsChange('accentColor', color)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="section-actions">
                                    <button 
                                        className="btn-primary"
                                        onClick={() => handleSave('appearance')}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Apply Changes'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;