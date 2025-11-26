
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';
import logo from '../assets/logo2.png';
import React, { useState, useContext, useEffect } from 'react';


const Navbar = () => {
    const [activeNav, setActiveNav] = useState('home');
    const [, setActiveCars] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    
    // ✅ Tự động set activeNav dựa trên URL hiện tại
    useEffect(() => {
        const path = location.pathname;
        const search = location.search;
        
        if (path === '/my-bookings') {
            setActiveNav('booking');
            setActiveCars('');
        } else if (path.startsWith('/order-detail-cus/')) {
            // Trang chi tiết đơn hàng của customer
            setActiveNav('booking');
            setActiveCars('');
        } else if (path === '/location-select') {
            setActiveNav('listcar');
            setActiveCars('');
        } else if (path === '/pricing') {
            setActiveNav('pricing');
            setActiveCars('');
        } else if (path === '/about') {
            setActiveNav('about');
            setActiveCars('');
        } else if (path === '/' && search.includes('scroll=contact')) {
            setActiveNav('contact');
            setActiveCars('');
        } else if (path === '/' && (search.includes('scroll=4-seater-cars') || search.includes('scroll=7-seater-cars'))) {
            setActiveNav('offers');
            if (search.includes('scroll=4-seater-cars')) {
                setActiveCars('4');
            } else if (search.includes('scroll=7-seater-cars')) {
                setActiveCars('7');
            }
        } else if (path === '/') {
            setActiveNav('home');
            setActiveCars('');
        } else {
            // Reset về home nếu không match
            setActiveNav('home');
            setActiveCars('');
        }
    }, [location.pathname, location.search]);
    
    // ✅ Chỉ redirect staff/admin về trang của họ khi ở trang chủ hoặc các trang không quan trọng
    useEffect(() => {
        if (user) {
            const path = location.pathname;
            // Không redirect nếu đang ở các trang quan trọng
            const protectedPaths = [
                '/order-detail-cus',
                '/my-bookings',
                '/confirm-booking',
                '/booking-4seater',
                '/booking-7seater',
                '/location-select',
                '/profile'
            ];
            
            const isProtectedPath = protectedPaths.some(protectedPath => path.startsWith(protectedPath));
            
            if (!isProtectedPath) {
                if (user.role === "staff") {
                    navigate("/staff");
                } else if (user.role === "admin") {
                    navigate("/admin");
                }
            }
        }
    }, [user, navigate, location.pathname]);


    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={logo} alt="Logo" />
                    <span className="logo-text">CarRent</span>
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
                                TRANG CHỦ
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
                                LOẠI XE
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
                                        XE 4 CHỖ
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
                                        XE 7 CHỖ
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
                                DANH SÁCH XE
                            </a>
                        </li>
                        <li>
                            <a href="/pricing" className={activeNav === 'pricing' ? 'nav-selected' : ''}
                                onClick={e => {
                                    e.preventDefault();
                                    setActiveNav('pricing');
                                    setActiveCars('');
                                    navigate('/pricing');
                                }}>
                                BẢNG GIÁ
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
                                GIỚI THIỆU
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
                                LIÊN HỆ
                            </a>
                        </li>
                        <li>
                            <a href="/my-bookings" className={activeNav === 'booking' ? 'nav-selected' : ''}
                                onClick={e => {
                                    e.preventDefault();

                                    // Check if user is logged in
                                    if (!user) {
                                        navigate('/login');
                                        return;
                                    }

                                    setActiveNav('booking');
                                    setActiveCars('');
                                    navigate('/my-bookings');
                                }}>
                                ĐƠN ĐẶT
                            </a>
                        </li>
                    </ul>

                    <div className="navbar-buttons">
                        {user ? (
                            <>
                                {user.role === "customer" && (
                                    <div className="user-menu">
                                        <button
                                            className="user-button"
                                            onClick={() => setShowDropdown(!showDropdown)}
                                        >
                                            <span className="user-avatar">👤</span>
                                            <span className="user-name">{user.name || 'Người dùng'}</span>
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
                                                    Hồ Sơ Của Tôi
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDropdown(false);
                                                        navigate('/my-bookings');
                                                    }}
                                                    className="dropdown-item"
                                                >
                                                    Đơn Đặt
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
                                                    Đăng Xuất
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 🧩 Điều hướng cho STAFF và ADMIN */}
                                {user.role === "staff" && (
                                    <button
                                        className="dashboard-button"
                                        onClick={() => navigate('/staff')}
                                    >
                                        Trang Nhân Viên
                                    </button>
                                )}

                                {user.role === "admin" && (
                                    <button
                                        className="dashboard-button"
                                        onClick={() => navigate('/admin')}
                                    >
                                        Trang Quản Trị
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="login-button">Đăng Nhập</Link>
                                <Link to="/register" className="register-button">Đăng Ký</Link>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;