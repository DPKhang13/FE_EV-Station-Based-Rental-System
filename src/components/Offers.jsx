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

    useEffect(() => {
        const fetchPricingRules = async () => {
            try {
                setLoading(true);
                const rules = await pricingRuleService.getAll();
                console.log("📌 Pricing rules nè:", rules);
                setPricingRules(rules);
            } catch (error) {
                console.error("❌ Lỗi lấy pricing rules:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPricingRules();
    }, []);

    // 🔥 Mapping chuẩn theo backend của bạn
    const getCarModel = (seatCount, variant) => {
        if (seatCount === 4) {
            if (variant === "Air") return "B-SUV";
            if (variant === "Plus") return "C-SUV";
            if (variant === "Pro") return "D-SUV";
        }
        if (seatCount === 7) {
            if (variant === "Air") return "C-SUV";
            if (variant === "Plus") return "D-SUV";
            if (variant === "Pro") return "E-SUV";
        }
        return null;
    };

    // Lấy giá theo carmodel (chú ý key "carmodel")
    const findRule = (seatCount, variant) => {
        const model = getCarModel(seatCount, variant);
        return pricingRules.find(r => r.carmodel === model);
    };

    const getDailyPrice = (seatCount, variant) => {
        const rule = findRule(seatCount, variant);
        return rule?.dailyPrice ?? null;
    };

    const getHolidayPrice = (seatCount, variant) => {
        const rule = findRule(seatCount, variant);
        return rule?.holidayPrice ?? null;
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
                            {["Air", "Plus", "Pro"].map((variant, i) => (
                                <div className="offer-card" key={i}>
                                    <img
                                        src={
                                            i === 0
                                                ? "src/assets/4standard1.jpg"
                                                : i === 1
                                                    ? "src/assets/4standard2.jpg"
                                                    : "src/assets/4standard.jpg"
                                        }
                                        className="offer-image"
                                    />

                                    <div>
                                        <h3 className="offer-title">{variant}</h3>
                                        
                                        {/* Hiển thị carmodel */}
                                        <p className="offer-carmodel" style={{ 
                                            fontSize: '16px', 
                                            color: '#666', 
                                            marginTop: '4px',
                                            marginBottom: '8px',
                                            fontWeight: '600'
                                        }}>
                                            {getCarModel(4, variant) || ''}
                                        </p>

                                        <p className="offer-price">
                                            {(() => {
                                                const price = getDailyPrice(4, variant);
                                                return price
                                                    ? <>
                                                        <span>{price.toLocaleString("vi-VN")}</span> VNĐ/ngày
                                                    </>
                                                    : "Đang cập nhật...";
                                            })()}
                                        </p>

                                        <p className="offer-description">
                                            {variant === "Air"
                                                ? "Phiên bản tiết kiệm"
                                                : variant === "Plus"
                                                    ? "Nâng cấp tiện nghi"
                                                    : "Cao cấp nhất 4 chỗ"}
                                        </p>

                                        <div className="offer-subinfo">
                                            <p>
                                                Giá ngày lễ:{' '}
                                                <b>
                                                    {getHolidayPrice(4, variant)
                                                        ? getHolidayPrice(4, variant).toLocaleString("vi-VN")
                                                        : "..."}{' '}
                                                    VNĐ/ngày
                                                </b>
                                            </p>
                                        </div>

                                        <button
                                            className="rent-now-button"
                                            onClick={() => handleBooking("/booking-4seater", variant)}
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
                                Phù hợp nhóm lớn, gia đình đông người
                            </p>
                        </div>

                        <div className="offers-grid-horizontal">
                            {["Air", "Plus", "Pro"].map((variant, i) => (
                                <div className="offer-card" key={i}>
                                    <img
                                        src={
                                            i === 0
                                                ? "src/assets/vinfast7.jpg"
                                                : i === 1
                                                    ? "src/assets/tesla7.jpg"
                                                    : "src/assets/bmw7.jpg"
                                        }
                                        className="offer-image"
                                    />

                                    <div>
                                        <h3 className="offer-title">{variant}</h3>
                                        
                                        {/* Hiển thị carmodel */}
                                        <p className="offer-carmodel" style={{ 
                                            fontSize: '16px', 
                                            color: '#666', 
                                            marginTop: '4px',
                                            marginBottom: '8px',
                                            fontWeight: '600'
                                        }}>
                                            {getCarModel(7, variant) || ''}
                                        </p>

                                        <p className="offer-price">
                                            {(() => {
                                                const price = getDailyPrice(7, variant);
                                                return price
                                                    ? <>
                                                        <span>{price.toLocaleString("vi-VN")}</span> VNĐ/ngày
                                                    </>
                                                    : "Đang cập nhật...";
                                            })()}
                                        </p>

                                        <p className="offer-description">
                                            {variant === "Air"
                                                ? "Phiên bản tiết kiệm 7 chỗ"
                                                : variant === "Plus"
                                                    ? "Tiện nghi nâng cao"
                                                    : "Cao cấp nhất 7 chỗ"}
                                        </p>

                                        <div className="offer-subinfo">
                                            <p>
                                                Giá ngày lễ:{' '}
                                                <b>
                                                    {getHolidayPrice(7, variant)
                                                        ? getHolidayPrice(7, variant).toLocaleString("vi-VN")
                                                        : "..."}{' '}
                                                    VNĐ/ngày
                                                </b>
                                            </p>
                                        </div>

                                        <button
                                            className="rent-now-button"
                                            onClick={() => handleBooking("/booking-7seater", variant)}
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
