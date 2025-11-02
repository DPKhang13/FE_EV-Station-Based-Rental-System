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

    // Hàm lấy giá theo seatCount và variant
    const getPrice = (seatCount, variant) => {
        console.log(`🔍 getPrice called: seatCount=${seatCount}, variant=${variant}`);
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

        // Backend trả về baseHoursPrice (giá cho baseHours giờ đầu)
        // Tính giá/giờ = baseHoursPrice / baseHours
        if (!rule) {
            console.log('⚠️ No rule found, returning 0');
            return 0;
        }

        const pricePerHour = rule.baseHours > 0
            ? Math.round(rule.baseHoursPrice / rule.baseHours)
            : rule.baseHoursPrice;

        console.log(`💰 Returning price: ${pricePerHour} (from baseHoursPrice=${rule.baseHoursPrice}, baseHours=${rule.baseHours})`);
        return pricePerHour;
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
                {/* Two Column Layout for 4-Seater and 7-Seater */}
                <div className="offers-row">
                    {/* 4-Seater Cars Section */}
                    <div id="4-seater-cars" className="offers-category half-width">
                        <h3 className="category-title">4-Seater Cars</h3>
                        <p className="category-description">Perfect for small families or individual travelers looking for comfort and efficiency.</p>
                        <div className="offers-grid vertical">
                            <div className="offer-card luxury" data-seater="4">
                                <img src="src/assets/4standard.jpg" alt="Air" className="offer-image" />
                                <h3 className="offer-title">AIR</h3>
                                <p className="offer-price">
                                    {getPrice(4, 'Air') !== null && getPrice(4, 'Air') > 0
                                        ? <><span>{getPrice(4, 'Air').toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                        : 'Đang cập nhật...'}
                                </p>
                                <p className="offer-description">Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!</p>
                                <button
                                    className="rent-now-button"
                                    onClick={() => handleBooking('/booking-4seater', 'Air')}
                                >
                                    RENT NOW!
                                </button>
                            </div>

                            <div className="offer-card luxury" data-seater="4">
                                <img src="src/assets/4standard.jpg" alt="Plus" className="offer-image" />
                                <h3 className="offer-title">PLUS</h3>
                                <p className="offer-price">
                                    {getPrice(4, 'Plus') !== null && getPrice(4, 'Plus') > 0
                                        ? <><span>{getPrice(4, 'Plus').toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                        : 'Đang cập nhật...'}
                                </p>
                                <p className="offer-description">Upgrade your experience with our Plus package, offering enhanced features and comfort.</p>
                                <button
                                    className="rent-now-button"
                                    onClick={() => handleBooking('/booking-4seater', 'Plus')}
                                >
                                    RENT NOW!
                                </button>
                            </div>

                            <div className="offer-card luxury" data-seater="4">
                                <img src="src/assets/4standard.jpg" alt="Pro" className="offer-image" />
                                <h3 className="offer-title">PRO</h3>
                                <p className="offer-price">
                                    {getPrice(4, 'Pro') !== null && getPrice(4, 'Pro') > 0
                                        ? <><span>{getPrice(4, 'Pro').toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                        : 'Đang cập nhật...'}
                                </p>
                                <p className="offer-description">Enjoy premium features and top-notch comfort with our Pro package.</p>
                                <button
                                    className="rent-now-button"
                                    onClick={() => handleBooking('/booking-4seater', 'Pro')}
                                >
                                    RENT NOW!
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 7-Seater Cars Section */}
                    <div id="7-seater-cars" className="offers-category half-width">
                        <h3 className="category-title">7-Seater Cars</h3>
                        <p className="category-description">Ideal for larger families or groups who need extra space and comfort.</p>
                        <div className="offers-grid vertical">
                            <div className="offer-card luxury" data-seater="7">
                                <img src="src/assets/7standard.jpg" alt="Air" className="offer-image" />
                                <h3 className="offer-title">AIR</h3>
                                <p className="offer-price">
                                    {getPrice(7, 'Air') !== null && getPrice(7, 'Air') > 0
                                        ? <><span>{getPrice(7, 'Air').toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                        : 'Đang cập nhật...'}
                                </p>
                                <p className="offer-description">Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!</p>
                                <button
                                    className="rent-now-button"
                                    onClick={() => handleBooking('/booking-7seater', 'Air')}
                                >
                                    RENT NOW!
                                </button>
                            </div>

                            <div className="offer-card luxury" data-seater="7">
                                <img src="src/assets/7pro.jpg" alt="Plus" className="offer-image" />
                                <h3 className="offer-title">PLUS</h3>
                                <p className="offer-price">
                                    {getPrice(7, 'Plus') !== null && getPrice(7, 'Plus') > 0
                                        ? <><span>{getPrice(7, 'Plus').toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                        : 'Đang cập nhật...'}
                                </p>
                                <p className="offer-description">Upgrade your experience with our Plus package, offering enhanced features and comfort.</p>
                                <button
                                    className="rent-now-button"
                                    onClick={() => handleBooking('/booking-7seater', 'Plus')}
                                >
                                    RENT NOW!
                                </button>
                            </div>

                            <div className="offer-card luxury" data-seater="7">
                                <img src="src/assets/7proplus.jpg" alt="Pro" className="offer-image" />
                                <h3 className="offer-title">PRO</h3>
                                <p className="offer-price">
                                    {getPrice(7, 'Pro') !== null && getPrice(7, 'Pro') > 0
                                        ? <><span>{getPrice(7, 'Pro').toLocaleString('vi-VN')}</span> VNĐ/giờ</>
                                        : 'Đang cập nhật...'}
                                </p>
                                <p className="offer-description">Enjoy premium features and top-notch comfort with our Pro package.</p>
                                <button
                                    className="rent-now-button"
                                    onClick={() => handleBooking('/booking-7seater', 'Pro')}
                                >
                                    RENT NOW!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offers;
