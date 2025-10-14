import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.jpg';

const Navbar = () => {
    const [activeNav, setActiveNav] = useState('home');
    const [activeCars, setActiveCars] = useState('');
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
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
                                    setActiveCars('');
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
                                List Car
                            </a>
                        </li>
                        <li>
                            <a href="#about" className={activeNav === 'about' ? 'dropdown nav-selected' : 'dropdown'}
                                onClick={e => {
                                    e.preventDefault();
                                    setActiveNav('about');
                                    setActiveCars('');
                                }}>
                                ABOUT US
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
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
                            <a href="#booking" className={activeNav === 'booking' ? 'nav-selected' : ''}
                                onClick={e => {
                                    e.preventDefault();
                                    setActiveNav('booking');
                                    setActiveCars('');
                                }}>
                                MY BOOKING
                            </a>
                        </li>
                    </ul>

                    <div className="navbar-buttons">
                        <button className="login-button">Login</button>
                        <button className="register-button">Register</button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;