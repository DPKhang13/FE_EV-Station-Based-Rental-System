import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="about-page">
            {/* Red Hero Section */}
            <div className="about-hero">
                <div className="hero-content">
                    <h1>GIỚI THIỆU</h1>
                    <p className="hero-subtitle">Dẫn đầu xu hướng di chuyển xanh - Tiết kiệm - Thân thiện môi trường</p>
                </div>
            </div>

            {/* White Content Section */}
            <div className="about-container">
                {/* Our Story */}
                <section className="about-section story-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>CÂU CHUYỆN CỦA CHÚNG TÔI</h2>
                    </div>
                    <div className="story-content">
                        <p className="story-text">
                            Dự án cho thuê xe điện ra đời nhằm đáp ứng nhu cầu ngày càng tăng về phương tiện di chuyển tiện lợi và tiết kiệm chi phí trong bối cảnh giá thành sở hữu ô tô ngày càng cao. Nhu cầu tự lái du lịch ngày càng tăng, đặc biệt cho các gia đình và nhóm bạn bè, nhưng việc thuê tài xế riêng không phải lúc nào cũng là lựa chọn tối ưu.
                        </p>
                        <p className="story-text">
                            Dịch vụ xe điện không chỉ mang lại sự tiện lợi, tiết kiệm chi phí nhiên liệu và bảo trì, mà còn góp phần bảo vệ môi trường bằng cách giảm thiểu khí thải từ giao thông. Với mục tiêu giảm ô nhiễm môi trường (35% ô nhiễm đến từ giao thông và 12% từ khí thải xe cộ), dịch vụ này hứa hẹn mang đến giải pháp di chuyển sạch và tiết kiệm chi phí.
                        </p>
                        <p className="story-text">
                            Dự án hướng đến các gia đình, những người quan tâm đến môi trường và những người sống ở khu vực đô thị nơi giao thông công cộng còn chưa phát triển. Dịch vụ đi kèm với nhiều tính năng như ứng dụng di động để quản lý thuê xe, GPS để định vị nhanh chóng và các trạm sạc tại điểm cho thuê.
                        </p>
                    </div>
                </section>

                {/* Three Column Features */}
                <section className="about-section features-main-section">
                    <div className="features-grid-main">
                        {/* Feature 1 - Unique Value */}
                        <div className="feature-card-main">
                            <div className="feature-number-main">01</div>
                            <h4 className="feature-title-main">GIÁ TRỊ ĐỘC ĐÁO</h4>
                            <div className="feature-content-main">
                                <p className="feature-description-main">
                                    Tạo trải nghiệm dịch vụ đặc biệt với các tính năng toàn diện
                                </p>
                                <ul className="feature-list-main">
                                    <li>Tính năng quản lý qua ứng dụng</li>
                                    <li>Trải nghiệm tự lái</li>
                                    <li>Thân thiện với môi trường</li>
                                    <li>Cho thuê xe + GPS + Hỗ trợ khẩn cấp</li>
                                    <li>Chương trình khách hàng thân thiết với ưu đãi hấp dẫn</li>
                                    <li>Gói thuê dài hạn</li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 2 - Safety & Support */}
                        <div className="feature-card-main">
                            <div className="feature-number-main">02</div>
                            <h4 className="feature-title-main">AN TOÀN & HỖ TRỢ</h4>
                            <div className="feature-content-main">
                                <p className="feature-description-main">
                                    Bảo vệ toàn diện và chăm sóc khách hàng 24/7
                                </p>
                                <ul className="feature-list-main">
                                    <li>Bảo hiểm đầy đủ</li>
                                    <li>Hỗ trợ khẩn cấp 24/7 trên đường</li>
                                    <li>Hướng dẫn sử dụng xe điện an toàn</li>
                                    <li>Tránh sạc không đúng cách</li>
                                    <li>Ngăn chặn quá tải pin</li>
                                    <li>Tuân thủ tiêu chuẩn an toàn</li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 3 - Eco-Friendly */}
                        <div className="feature-card-main">
                            <div className="feature-number-main">03</div>
                            <h4 className="feature-title-main">TÍNH NĂNG THÂN THIỆN MÔI TRƯỜNG</h4>
                            <div className="feature-content-main">
                                <p className="feature-description-main">
                                    Đóng góp cho việc bảo vệ môi trường và phát triển bền vững
                                </p>
                                <ul className="feature-list-main">
                                    <li>Thúc đẩy các tính năng xe thân thiện môi trường</li>
                                    <li>Chương trình bù đắp carbon</li>
                                    <li>Đóng góp trồng cây xanh</li>
                                    <li>Tham gia các dự án bảo tồn</li>
                                    <li>Giảm 35% ô nhiễm giao thông</li>
                                    <li>Xe sử dụng 100% năng lượng sạch</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Future Expansion */}
                <section className="about-section expansion-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>MỞ RỘNG TƯƠNG LAI</h2>
                    </div>
                    <div className="expansion-grid-about">
                        <div className="expansion-item-about">
                            <div className="expansion-icon-about">🎉</div>
                            <h5>Cho Thuê Sự Kiện</h5>
                            <p>Cho thuê xe điện cho các sự kiện đặc biệt</p>
                        </div>
                        <div className="expansion-item-about">
                            <div className="expansion-icon-about">🏖️</div>
                            <h5>Điểm Đến Du Lịch</h5>
                            <p>Gói dịch vụ cho các địa điểm du lịch</p>
                        </div>
                        <div className="expansion-item-about">
                            <div className="expansion-icon-about">🏢</div>
                            <h5>Gói Doanh Nghiệp</h5>
                            <p>Giải pháp tùy chỉnh cho tổ chức</p>
                        </div>
                        <div className="expansion-item-about">
                            <div className="expansion-icon-about">🌍</div>
                            <h5>Tiêu Chuẩn Toàn Cầu</h5>
                            <p>Tuân thủ an toàn và môi trường quốc tế</p>
                        </div>
                    </div>
                </section>

                {/* Target Audience */}
                <section className="about-section target-section-about">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>ĐỐI TƯỢNG KHÁCH HÀNG</h2>
                    </div>
                    <div className="target-tags-about">
                        <span className="tag-about">Gia Đình</span>
                        <span className="tag-about">Người Quan Tâm Môi Trường</span>
                        <span className="tag-about">Cư Dân Đô Thị</span>
                        <span className="tag-about">Tổ Chức & Công Ty</span>
                        <span className="tag-about">Nhà Tổ Chức Sự Kiện</span>
                        <span className="tag-about">Du Khách</span>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="about-cta">
                    <h2>Sẵn sàng trải nghiệm tương lai của giao thông vận tải?</h2>
                    <p>Đặt xe điện của bạn ngay hôm nay và tham gia cuộc cách mạng xanh!</p>
                    <div className="cta-buttons">
                        <button onClick={() => navigate('/location-select')} className="btn-book">
                            ĐẶT XE NGAY
                        </button>
                        <button onClick={() => navigate('/?scroll=contact')} className="btn-contact">
                            LIÊN HỆ CHÚNG TÔI
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
