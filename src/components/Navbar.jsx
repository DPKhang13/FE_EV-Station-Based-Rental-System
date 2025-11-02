import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';
import logo from '../assets/logo.jpg';

const Navbar = () => {
    const [activeNav, setActiveNav] = useState('home');
    const [activeCars, setActiveCars] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="Logo" />
                </div>

                <div className="navbar-right">
                    <ul className="navbar-menu">
                        <li>
                            <a href="/" className={activeNav === 'home' ? 'active nav-selected' : ''}
                                onClick={e => {
                                    e.preventDefault();
                                    setActiveNav('home');
                                    setActiveCars('');
                                    navigate('/');
                                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                }}>
                                HOME
                            </a>
                        </li>
                        <li className="dropdown-container">
                            <a href="#offers" className={activeNav === 'offers' ? 'dropdown nav-selected' : 'dropdown'}
                                onClick={e => {
                                    e.preventDefault();
                                    setActiveNav('offers');
                                    setActiveCars('4');
                                    navigate('/?scroll=4-seater-cars');
                                }}>
                                OFFER
                                <svg className="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </a>
                            <ul className="dropdown-list">
                                <li className="dropdown-item" data-seater="4">
                                    <a href="#4-seater-cars" className="sub-dropdown"
                                        onClick={e => {
                                            e.preventDefault();
                                            setActiveNav('offers');
                                            setActiveCars('4');
                                            navigate('/?scroll=4-seater-cars');
                                        }}>
                                        4-Seater Cars
                                    </a>
                                </li>
                                <li className="dropdown-item" data-seater="7">
                                    <a href="#7-seater-cars" className="sub-dropdown"
                                        onClick={e => {
                                            e.preventDefault();
                                            setActiveNav('offers');
                                            setActiveCars('7');
                                            navigate('/?scroll=7-seater-cars');
                                        }}>
                                        7-Seater Cars
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="/location-select" className={activeNav === 'listcar' ? 'nav-selected' : ''}
                                onClick={e => {
                                    e.preventDefault();
                                    setActiveNav('listcar');
                                    setActiveCars('');
                                    navigate('/location-select');
                                }}>
                                LIST CAR
                            </a>
                        </li>
                        <li>
                            <a href="/about" className={activeNav === 'about' ? 'nav-selected' : ''}
                                onClick={e => {
                                    e.preventDefault();
                                    setActiveNav('about');
                                    setActiveCars('');
                                    navigate('/about');
                                }}>
                                ABOUT US
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className={activeNav === 'contact' ? 'nav-selected' : ''}
                                onClick={e => {
                                    e.preventDefault();
                                    setActiveNav('contact');
                                    setActiveCars('');
                                    navigate('/?scroll=contact');
                                }}>
                                CONTACT US
                            </a>
                        </li>
                        <li>
                            <a href="/my-bookings" className={activeNav === 'booking' ? 'nav-selected' : ''}
                                onClick={e => {
                                    e.preventDefault();

                                    // Check if user is logged in
                                    if (!user) {
                                        alert('Please login to view your bookings!');
                                        navigate('/login');
                                        return;
                                    }

                                    setActiveNav('booking');
                                    setActiveCars('');
                                    navigate('/my-bookings');
                                }}>
                                MY BOOKING
                            </a>
                        </li>
                    </ul>

                    <div className="navbar-buttons">
                        {user ? (
                            // User logged in - show user menu
                            <div className="user-menu">
                                <button
                                    className="user-button"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <span className="user-avatar">👤</span>
                                    <span className="user-name">{user.name || 'User'}</span>
                                    <svg className="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showDropdown && (
                                    <div className="user-dropdown">
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                navigate('/profile');
                                            }}
                                            className="dropdown-item"
                                        >
                                            👤 My Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                navigate('/my-bookings');
                                            }}
                                            className="dropdown-item"
                                        >
                                            � My Bookings
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                logout();
                                                navigate('/');
                                            }}
                                            className="dropdown-item logout"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // User not logged in - show login/register buttons
                            <>
                                <Link to="/login" className="login-button">Login</Link>
                                <Link to="/register" className="register-button">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;