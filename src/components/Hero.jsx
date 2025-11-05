import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        }}>
            <div className="hero-overlay"></div>

            <div className="hero-content">
                <div className="hero-content-inner">
                    <h1 className="hero-title">THUÊ NGAY 1 CHIẾC XE HƠI ĐIỆN ĐƯỢC LÁI BẰNG TAY</h1>
                    <div className="separator"></div>
                    <h5 className="about-title">Về Công Ty Chúng Tôi</h5>
                    <p className="about-text">
                        XE HƠI ĐIỆN CỦA CHÚNG TÔI ĐÁP ỨNG HOÀN TOÀN TIÊU CHÍ <span className="sigma-highlight">SIGMA</span>
                    </p>
                    <ul className="sigma-list">
                        <li><span className="highlight-letter">S</span>iêu tiết kiệm năng lượng</li>
                        <li>Vận hành êm á<span className="highlight-letter">I</span></li>
                        <li>Khôn<span className="highlight-letter">G</span> lo trục trặc</li>
                        <li>Bảo vệ <span className="highlight-letter">M</span>ôi trường</li>
                        <li><span className="highlight-letter">A</span>n toàn tuyệt đối</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Hero;
