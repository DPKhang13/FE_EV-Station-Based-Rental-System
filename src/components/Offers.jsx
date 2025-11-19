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
                setPricingRules(rules);
            } catch (error) {
                console.error('❌ Lỗi khi lấy pricing rules:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPricingRules();
    }, []);

    // 🔹 Hàm lấy giá thuê theo ngày (dailyPrice) theo seatCount + variant
    const getDailyPrice = (seatCount, variant) => {
        if (loading || pricingRules.length === 0) return null;
        const rule = pricingRules.find(
            (r) => r.seatCount === seatCount && r.variant === variant
        );
        return rule ? rule.dailyPrice : null;
    };

    // 🔹 Hàm lấy phụ phí trễ hạn (lateFeePerDay)
    // eslint-disable-next-line no-unused-vars
    const getLateFee = (seatCount, variant) => {
        const rule = pricingRules.find(
            (r) => r.seatCount === seatCount && r.variant === variant
        );
        return rule ? rule.lateFeePerDay : null;
    };

    // 🔹 Hàm lấy giá lễ tết (holidayPrice)
    const getHolidayPrice = (seatCount, variant) => {
        const rule = pricingRules.find(
            (r) => r.seatCount === seatCount && r.variant === variant
        );
        return rule ? rule.holidayPrice : null;
    };

    const handleBooking = (path, gradeFilter) => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Xác định seatCount từ path
        const seatCount = path.includes('4seater') ? 4 : 7;
        // Điều hướng đến LocationSelect với thông tin về loại xe và gradeFilter
        navigate('/location-select', { 
            state: { 
                gradeFilter,
                seatCount,
                bookingPath: path // Lưu path booking để điều hướng sau khi chọn trạm
            } 
        });
    };

    return (
        <section className="offers">
            <div className="offers-header">
                <h2 className="offers-title">BẢNG GIÁ THUÊ XE</h2>
                <div className="offers-divider"></div>
            </div>

            <div className="offers-container">
                {/* ==== XE 4 CHỖ ==== */}
                <div id="4-seater-cars" className="offers-category-section">
                    <div className="offers-big-card">
                        <div className="category-header">
                            <h3 className="category-title">XE 4 CHỖ</h3>
                            <p className="category-description">
                                Hoàn hảo cho gia đình nhỏ hoặc du khách cá nhân
                            </p>
                        </div>

                        <div className="offers-grid-horizontal">
                            {['Air', 'Plus', 'Pro'].map((variant, i) => (
                                <div className="offer-card" key={i}>
                                    <img
                                        src={
                                            i === 0
                                                ? 'src/assets/4standard1.jpg'
                                                : i === 1
                                                    ? 'src/assets/4standard2.jpg'
                                                    : 'src/assets/4standard.jpg'
                                        }
                                        alt={variant}
                                        className="offer-image"
                                    />

                                    <div>
                                        <h3 className="offer-title">{variant}</h3>
                                        <p className="offer-price">
                                            {(() => {
                                                const price = getDailyPrice(4, variant);
                                                return price ? (
                                                    <>
                                                        <span>{price.toLocaleString('vi-VN')}</span> VNĐ/ngày
                                                    </>
                                                ) : (
                                                    'Đang cập nhật...'
                                                );
                                            })()}
                                        </p>
                                        <p className="offer-description">
                                            {variant === 'Air'
                                                ? 'Phiên bản cơ bản, tiết kiệm cho các chuyến đi thông thường'
                                                : variant === 'Plus'
                                                    ? 'Nâng cấp tiện nghi, phù hợp cho chuyến đi dài'
                                                    : 'Cao cấp nhất, trang bị đầy đủ và sang trọng'}
                                        </p>

                                        <div className="offer-subinfo">

                                            <p>
                                                Giá ngày lễ:{' '}
                                                <b>
                                                    {getHolidayPrice(4, variant)
                                                        ? getHolidayPrice(4, variant).toLocaleString('vi-VN')
                                                        : '...'}{' '}
                                                    VNĐ/ngày
                                                </b>
                                            </p>
                                        </div>

                                        <button
                                            className="rent-now-button"
                                            onClick={() => handleBooking('/booking-4seater', variant)}
                                        >
                                            Thuê Ngay
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ==== XE 7 CHỖ ==== */}
                <div id="7-seater-cars" className="offers-category-section">
                    <div className="offers-big-card">
                        <div className="category-header">
                            <h3 className="category-title">XE 7 CHỖ</h3>
                            <p className="category-description">
                                Lý tưởng cho gia đình lớn hoặc nhóm bạn đông người
                            </p>
                        </div>

                        <div className="offers-grid-horizontal">
                            {['Air', 'Plus', 'Pro'].map((variant, i) => (
                                <div className="offer-card" key={i}>
                                    <img
                                        src={
                                            i === 0
                                                ? 'src/assets/vinfast7.jpg'
                                                : i === 1
                                                    ? 'src/assets/tesla7.jpg'
                                                    : 'src/assets/bmw7.jpg'
                                        }
                                        alt={variant}
                                        className="offer-image"
                                    />
                                    <div>
                                        <h3 className="offer-title">{variant}</h3>
                                        <p className="offer-price">
                                            {(() => {
                                                const price = getDailyPrice(7, variant);
                                                return price ? (
                                                    <>
                                                        <span>{price.toLocaleString('vi-VN')}</span> VNĐ/ngày
                                                    </>
                                                ) : (
                                                    'Đang cập nhật...'
                                                );
                                            })()}
                                        </p>
                                        <p className="offer-description">
                                            {variant === 'Air'
                                                ? 'Phiên bản cơ bản, không gian thoải mái cho gia đình'
                                                : variant === 'Plus'
                                                    ? 'Nâng cấp tiện nghi, chỗ ngồi sang trọng hơn'
                                                    : 'Dòng xe cao cấp nhất với công nghệ hiện đại'}
                                        </p>

                                        <div className="offer-subinfo">
                                           
                                            <p>
                                                 Giá ngày lễ:{' '}
                                                <b>
                                                    {getHolidayPrice(7, variant)
                                                        ? getHolidayPrice(7, variant).toLocaleString('vi-VN')
                                                        : '...'}{' '}
                                                    VNĐ/ngày
                                                </b>
                                            </p>
                                        </div>

                                        <button
                                            className="rent-now-button"
                                            onClick={() => handleBooking('/booking-7seater', variant)}
                                        >
                                            Thuê Ngay
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offers;
