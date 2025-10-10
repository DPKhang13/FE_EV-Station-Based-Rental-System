import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pro4Booking.css';

const Pro4Booking = () => {
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
            <div className="booking-container">
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
                            "VF 35 XZR 19 PRO",
                            "VF 38 KRX 27 PRO",
                            "VF 41 ZTL 63 PRO",
                            "VF 44 NXT 52 PRO",
                            "VF 47 QVX 08 PRO",
                            "VF 50 TRX 34 PRO",
                            "VF 53 BLX 71 PRO",
                            "VF 56 VTX 29 PRO",
                            "VF 59 GRZ 45 PRO",
                            "VF 62 DFX 66 PRO",
                        ].map((carName, index) => (
                            <div
                                key={carName}
                                className={`car-item ${index % 2 === 0 ? 'left' : 'right'}`}
                            >
                                <div className="car-image">
                                    <img src="src/assets/4pro.jpg" alt={carName} />
                                </div>
                                <div className="car-info">
                                    <h3 className="car-name">{carName}</h3>
                                    <div className="car-details">
                                        <p><strong>Engine:</strong> Electric Motor 200kW</p>
                                        <p><strong>Range:</strong> 400 km per charge</p>
                                        <p><strong>Seats:</strong> 4 passengers</p>
                                        <p><strong>Features:</strong> Premium comfort, Advanced safety, Smart connectivity</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button className="rent-now-btn" onClick={() => navigate('/booking/pro-4seat')}>
                Rent Now
            </button>
        </div>
    );
};

export default Pro4Booking;