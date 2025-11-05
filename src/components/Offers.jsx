import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { pricingRuleService } from '../services/pricingRuleService';
import './Offers.css';

const Offers = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [pricingRules, setPricingRules] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch pricing rules khi component mount
    useEffect(() => {
        const fetchPricingRules = async () => {
            try {
                setLoading(true);
                const rules = await pricingRuleService.getAll();
                console.log('✅ Pricing Rules:', rules);
                console.log('📋 First rule structure:', rules[0]);
                console.log('🔑 Available keys:', rules[0] ? Object.keys(rules[0]) : 'No rules');
                setPricingRules(rules);
            } catch (error) {
                console.error('❌ Lỗi khi lấy pricing rules:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPricingRules();
    }, []);

    // Hàm lấy giá extra_hour_price (giá mỗi giờ thêm)
    const getPricePerHour = (seatCount, variant) => {
        console.log(`🔍 getPricePerHour called: seatCount=${seatCount}, variant=${variant}`);
        console.log(`📊 State: loading=${loading}, pricingRules.length=${pricingRules.length}`);

        if (loading) {
            console.log('⏳ Still loading...');
            return null;
        }

        if (pricingRules.length === 0) {
            console.log('⚠️ No pricing rules available');
            return null;
        }

        const rule = pricingRules.find(
            r => r.seatCount === seatCount && r.variant === variant
        );

        console.log(`✅ Found rule:`, rule);

        if (!rule) {
            console.log('⚠️ No rule found');
            return null;
        }

        // Trả về extraHourPrice (giá mỗi giờ thêm)
        console.log(`💰 Returning: ${rule.extraHourPrice} VNĐ/giờ`);
        return rule.extraHourPrice;
    };

    const handleBooking = (path, gradeFilter) => {
        if (!user) {
            alert('Please login to book a vehicle!');
            navigate('/login');
            return;
        }
        navigate(path, { state: { gradeFilter } });
    };

    return (
        <section className="offers">
            <div className="offers-header">
                <h2 className="offers-title">OFFERS</h2>
                <div className="offers-divider"></div>
            </div>

            <div className="offers-container">
                {/* 4-Seater Cars Section */}
                <div id="4-seater-cars" className="offers-category-section">
                    <div className="offers-big-card">
                        <div className="category-header">
                            <h3 className="category-title">🚗 Xe 4 Chỗ</h3>
                            <p className="category-description">Hoàn hảo cho gia đình nhỏ hoặc du khách cá nhân</p>
                        </div>

                        <div className="offers-grid-horizontal">
                            <div className="offer-card" data-seater="4">
                                <img src="src/assets/4standard.jpg" alt="Air" className="offer-image" />
                                <div>
                                    <h3 className="offer-title">AIR</h3>
                                    <p className="offer-price">
                                        {(() => {
                                            const price = getPricePerHour(4, 'Air');
                                            return price ? (
                                                <><span>{price.toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                            ) : 'Đang cập nhật...';
                                        })()}
                                    </p>
                                    <p className="offer-description">Phiên bản cơ bản với các tính năng thiết yếu, phù hợp cho những chuyến đi thông thường</p>
                                    <button
                                        className="rent-now-button"
                                        onClick={() => handleBooking('/booking-4seater', 'Air')}
                                    >
                                        Thuê Ngay
                                    </button>
                                </div>
                            </div>

                            <div className="offer-card" data-seater="4">
                                <img src="src/assets/4standard.jpg" alt="Plus" className="offer-image" />
                                <div>
                                    <h3 className="offer-title">PLUS</h3>
                                    <p className="offer-price">
                                        {(() => {
                                            const price = getPricePerHour(4, 'Plus');
                                            return price ? (
                                                <><span>{price.toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                            ) : 'Đang cập nhật...';
                                        })()}
                                    </p>
                                    <p className="offer-description">Nâng cấp trải nghiệm với nhiều tính năng tiện nghi và an toàn cao hơn</p>
                                    <button
                                        className="rent-now-button"
                                        onClick={() => handleBooking('/booking-4seater', 'Plus')}
                                    >
                                        Thuê Ngay
                                    </button>
                                </div>
                            </div>

                            <div className="offer-card" data-seater="4">
                                <img src="src/assets/4standard.jpg" alt="Pro" className="offer-image" />
                                <div>
                                    <h3 className="offer-title">PRO</h3>
                                    <p className="offer-price">
                                        {(() => {
                                            const price = getPricePerHour(4, 'Pro');
                                            return price ? (
                                                <><span>{price.toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                            ) : 'Đang cập nhật...';
                                        })()}
                                    </p>
                                    <p className="offer-description">Phiên bản cao cấp nhất với đầy đủ tính năng hiện đại và sang trọng</p>
                                    <button
                                        className="rent-now-button"
                                        onClick={() => handleBooking('/booking-4seater', 'Pro')}
                                    >
                                        Thuê Ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7-Seater Cars Section */}
                <div id="7-seater-cars" className="offers-category-section">
                    <div className="offers-big-card">
                        <div className="category-header">
                            <h3 className="category-title">🚙 Xe 7 Chỗ</h3>
                            <p className="category-description">Lý tưởng cho gia đình lớn hoặc nhóm đông người</p>
                        </div>

                        <div className="offers-grid-horizontal">
                            <div className="offer-card" data-seater="7">
                                <img src="src/assets/7standard.jpg" alt="Air" className="offer-image" />
                                <div>
                                    <h3 className="offer-title">AIR</h3>
                                    <p className="offer-price">
                                        {(() => {
                                            const price = getPricePerHour(7, 'Air');
                                            return price ? (
                                                <><span>{price.toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                            ) : 'Đang cập nhật...';
                                        })()}
                                    </p>
                                    <p className="offer-description">Phiên bản cơ bản với không gian rộng rãi, phù hợp cho gia đình và nhóm đông người</p>
                                    <button
                                        className="rent-now-button"
                                        onClick={() => handleBooking('/booking-7seater', 'Air')}
                                    >
                                        Thuê Ngay
                                    </button>
                                </div>
                            </div>

                            <div className="offer-card" data-seater="7">
                                <img src="src/assets/7pro.jpg" alt="Plus" className="offer-image" />
                                <div>
                                    <h3 className="offer-title">PLUS</h3>
                                    <p className="offer-price">
                                        {(() => {
                                            const price = getPricePerHour(7, 'Plus');
                                            return price ? (
                                                <><span>{price.toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                            ) : 'Đang cập nhật...';
                                        })()}
                                    </p>
                                    <p className="offer-description">Nâng cấp tiện nghi với ghế ngồi cao cấp và hệ thống giải trí hiện đại</p>
                                    <button
                                        className="rent-now-button"
                                        onClick={() => handleBooking('/booking-7seater', 'Plus')}
                                    >
                                        Thuê Ngay
                                    </button>
                                </div>
                            </div>

                            <div className="offer-card" data-seater="7">
                                <img src="src/assets/7proplus.jpg" alt="Pro" className="offer-image" />
                                <div>
                                    <h3 className="offer-title">PRO</h3>
                                    <p className="offer-price">
                                        {(() => {
                                            const price = getPricePerHour(7, 'Pro');
                                            return price ? (
                                                <><span>{price.toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                            ) : 'Đang cập nhật...';
                                        })()}
                                    </p>
                                    <p className="offer-description">Dòng xe sang trọng nhất với đầy đủ tiện nghi và công nghệ tiên tiến</p>
                                    <button
                                        className="rent-now-button"
                                        onClick={() => handleBooking('/booking-7seater', 'Pro')}
                                    >
                                        Thuê Ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offers;
