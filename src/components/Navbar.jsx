import React from 'react';
import './Navbar.css';
import logo from '../assets/logo.jpg';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src={logo} alt="Logo" />
                </div>

                <div className="navbar-right">
                    <ul className="navbar-menu">
                        <li>
                            <a href="#start" className="active">HOME</a>
                        </li>
                        <li>
                            <a href="#reservation">RESERVATION</a>
                        </li>
                        <li>
                            <a href="#about" className="dropdown">
                                ABOUT US
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </a>
                        </li>
                        <li>
                            <a href="#contact">CONTACT US</a>
                        </li>
                        <li>
                            <a href="#booking">MY BOOKING</a>
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
