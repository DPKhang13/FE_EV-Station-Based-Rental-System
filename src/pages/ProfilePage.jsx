import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { profileService } from '../services';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: ''
    });

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Check if user is logged in
        if (!user) {
            alert('Please login to view your profile');
            navigate('/login');
            return;
        }

        // Load user data from context/localStorage
        loadUserProfile();
    }, [user, navigate]);

    const loadUserProfile = () => {
        // Prioritize context user over localStorage
        if (user) {
            console.log('📥 Loading from context user:', user);
            setFormData({
                fullName: user.name || user.fullName || user.username || '',
                email: user.email || '',
                phone: user.phone || user.phoneNumber || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth || user.dob || ''
            });
            return;
        }

        // Fallback to localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                console.log('📥 Loading from localStorage:', parsedUser);

                setFormData({
                    fullName: parsedUser.name || parsedUser.fullName || parsedUser.username || '',
                    email: parsedUser.email || '',
                    phone: parsedUser.phone || parsedUser.phoneNumber || '',
                    address: parsedUser.address || '',
                    dateOfBirth: parsedUser.dateOfBirth || parsedUser.dob || ''
                });
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reload original data
            loadUserProfile();
        }
        setIsEditing(!isEditing);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('📤 Updating profile with:', formData);

            const response = await profileService.update(formData);
            console.log('✅ Profile updated:', response);

            // Update localStorage with new data
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                const updatedUser = {
                    ...parsedUser,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    dateOfBirth: formData.dateOfBirth
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error('❌ Error updating profile:', err);
            alert('Failed to update profile: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/');
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="page-header">
                    <h1>👤 My Profile</h1>
                    <p className="subtitle">Manage your personal information</p>
                </div>

                <div className="profile-content">
                    {/* Profile Card */}
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {formData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </div>

                        <div className="profile-info">
                            <h2>{formData.fullName || 'User'}</h2>
                            <p className="user-email">{formData.email}</p>
                        </div>

                        <div className="profile-actions">
                            <button
                                onClick={handleEditToggle}
                                className="btn-edit"
                            >
                                {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn-logout"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="profile-form-section">
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dateOfBirth">Date of Birth</label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>


                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn-save"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : '💾 Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Additional Info */}
                    <div className="profile-stats">
                        <div className="stat-card">
                            <div className="stat-icon">📋</div>
                            <div className="stat-info">
                                <h3>My Bookings</h3>
                                <button
                                    onClick={() => navigate('/my-bookings')}
                                    className="btn-view"
                                >
                                    View All Bookings →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
