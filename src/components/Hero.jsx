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
                        <li><span className="highlight-letter">S</span>ustainable - Bền vững với công nghệ thân thiện môi trường</li>
                        <li><span className="highlight-letter">I</span>ntelligent - Thông minh với hệ thống điều khiển tiên tiến</li>
                        <li><span className="highlight-letter">G</span>uaranteed - Chất lượng được đảm bảo theo tiêu chuẩn quốc tế</li>
                        <li>S<span className="highlight-letter">M</span>ooth - Vận hành êm ái, trơn tru trên mọi cung đường</li>
                        <li><span className="highlight-letter">A</span>ffordable - Giá cả hợp lý, phù hợp với mọi nhu cầu</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Hero;
