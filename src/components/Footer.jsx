import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div>
                        <h3 className="footer-section-title">VỀ CARRENT</h3>
                        <p className="footer-description">
                            CarRent - Dịch vụ cho thuê xe hàng đầu với đa dạng lựa chọn, giá cả hợp lý và dịch vụ tận tâm. Khám phá ngay hôm nay!
                        </p>
                        <ul className="footer-links">
                            <li>
                                <a href="/about" onClick={e => {
                                    e.preventDefault();
                                    navigate('/about');
                                }}>
                                    Câu chuyện của chúng tôi
                                </a>
                            </li>
                            <li><a href="/">Chính sách bảo mật</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="footer-section-title">TIỆN ÍCH</h3>
                        <ul className="footer-links">
                            <li>
                                <a href="/" onClick={e => {
                                    e.preventDefault();
                                    navigate('/');
                                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                                }}>
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#4-seater-cars" onClick={e => {
                                    e.preventDefault();
                                    navigate('/?scroll=4-seater-cars');
                                }}>
                                    XE 4 CHỖ
                                </a>
                            </li>
                            <li>
                                <a href="#7-seater-cars" onClick={e => {
                                    e.preventDefault();
                                    navigate('/?scroll=7-seater-cars');
                                }}>
                                    XE 7 CHỖ
                                </a>
                            </li>
                            <li>
                                <a href="/location-select" onClick={e => {
                                    e.preventDefault();
                                    navigate('/location-select');
                                }}>
                                    DANH SÁCH XE
                                </a>
                            </li>
                            <li>
                                <a href="#contact" onClick={e => {
                                    e.preventDefault();
                                    navigate('/?scroll=contact');
                                }}>
                                    LIÊN HỆ VỚI CHÚNG TÔI
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="footer-section-title">LIÊN HỆ</h3>
                        <div className="footer-contact-list">
                            <div className="footer-contact-item">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>0347 649 369</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>carrent.hcm@gmail.com</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>333-222-444</span>
                            </div>
                            <div className="footer-contact-item">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>567-888-999</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="footer-section-title">DỊCH VỤ</h3>
                        <ul className="footer-links">
                            <li><a href="/">Đặt lịch hẹn dịch vụ</a></li>
                            <li><a href="/">Bảo hiểm xe</a></li>
                            <li><a href="/">Hỗ trợ khách hàng 24/7</a></li>
                            <li><a href="/">Chương trình ưu đãi</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">© 2025 CarRent. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
