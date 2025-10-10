import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProPlus4Booking.css';

const ProPlus4Booking = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Smooth scroll to top instead of instant jump
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        const handleScroll = () => {
            const carItems = document.querySelectorAll('.car-item');
            carItems.forEach((item) => {
                const rect = item.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight - 100;

                if (isVisible && !item.classList.contains('animated')) {
                    item.classList.add('animated');
                    item.style.transform = 'translateX(0)';
                    item.style.opacity = '1';
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="booking-page">
            <div className="booking-container">
                {/* Back to Home Button */}
                <button className="back-home-btn" onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                        const element = document.getElementById('4-seater-cars');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 100);
                }}>
                    <span className="arrow-icon">←</span>
                    Back to Home
                </button>

                <div className="booking-form">
                    <h2>Rental Details</h2>
                    <form>
                        <div className="form-group">
                            <label>Pick-up Date:</label>
                            <input type="date" required />
                        </div>
                        <div className="form-group">
                            <label>Return Date:</label>
                            <input type="date" required />
                        </div>
                        <div className="form-group">
                            <label>Pick-up Location:</label>
                            <select required>
                                <option value="">Select Location</option>
                                <option value="airport">Airport</option>
                                <option value="downtown">Downtown</option>
                                <option value="hotel">Hotel</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Full Name:</label>
                            <input type="text" required />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input type="email" required />
                        </div>
                        <div className="form-group">
                            <label>Phone:</label>
                            <input type="tel" required />
                        </div>
                        <button type="submit" className="confirm-booking-btn">
                            Confirm Booking
                        </button>
                    </form>
                </div>

                {/* Car Selection Section */}
                <div className="car-selection">
                    <h2 className="section-title">Car Information</h2>
                    <div className="car-list">
                        {[
                            "VF 65 ZRX 77 PRO PLUS",
                            "VF 68 KTN 34 PRO PLUS",
                            "VF 70 XPL 11 PRO PLUS",
                            "VF 73 GTR 59 PRO PLUS",
                            "VF 75 VNX 83 PRO PLUS",
                            "VF 78 MQL 40 PRO PLUS",
                            "VF 80 ZTX 25 PRO PLUS",
                            "VF 83 RFX 91 PRO PLUS",
                            "VF 85 PZN 68 PRO PLUS",
                            "VF 88 CWL 36 PRO PLUS",
                        ].map((carName, index) => (
                            <div
                                key={carName}
                                className={`car-item ${index % 2 === 0 ? 'left' : 'right'}`}
                            >
                                <div className="car-image">
                                    <img src="src/assets/4proplus.jpg" alt={carName} />
                                </div>
                                <div className="car-info">
                                    <h3 className="car-name">{carName}</h3>
                                    <div className="car-details">
                                        <p><strong>Engine:</strong> Electric Motor 250kW</p>
                                        <p><strong>Range:</strong> 450 km per charge</p>
                                        <p><strong>Seats:</strong> 4 passengers</p>
                                        <p><strong>Features:</strong> Ultra comfort, Advanced safety, Premium connectivity</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rent Now Button */}
                <button className="rent-now-btn" onClick={() => navigate('/booking/proplus-4seat')}>
                    Rent Now
                </button>
            </div>
        </div>
    );
};

export default ProPlus4Booking;