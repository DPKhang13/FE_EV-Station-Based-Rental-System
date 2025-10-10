import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Standard4Booking.css';

const Standard4Booking = () => {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate('/');
        setTimeout(() => {
            const element = document.getElementById('4-seater-cars');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

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
                <button className="back-home-btn" onClick={handleBackToHome}>
                    <span className="arrow-icon">←</span>
                    Back to Home
                </button>

                <h1 className="booking-title">Book Your Standard 4-Seater Car</h1>

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
                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 11 MXW 88 STD" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 11 MXW 88 STD</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 150kW</p>
                                    <p><strong>Range:</strong> 285 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Auto AC, Smart infotainment, Safety package</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 14 LXG 21 URB" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 14 LXG 21 URB</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 170kW</p>
                                    <p><strong>Range:</strong> 320 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Urban package, LED lights, Smart connectivity</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 17 QTR 56 ECO" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 17 QTR 56 ECO</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 140kW</p>
                                    <p><strong>Range:</strong> 380 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Eco mode, Energy efficient, Regenerative braking</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 20 ZYN 09 BAS" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 20 ZYN 09 BAS</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 120kW</p>
                                    <p><strong>Range:</strong> 250 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Basic package, Manual AC, Standard safety</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 22 PXC 33 STD" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 22 PXC 33 STD</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 155kW</p>
                                    <p><strong>Range:</strong> 290 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Standard comfort, Bluetooth, Cruise control</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 25 MWK 44 URB" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 25 MWK 44 URB</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 175kW</p>
                                    <p><strong>Range:</strong> 315 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Urban comfort, Premium sound system, Navigation</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 27 KLT 18 ECO" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 27 KLT 18 ECO</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 145kW</p>
                                    <p><strong>Range:</strong> 400 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Eco plus, Solar roof, Advanced efficiency</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 29 HYJ 50 STD" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 29 HYJ 50 STD</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 160kW</p>
                                    <p><strong>Range:</strong> 295 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Standard plus, Wireless charging, Smart key</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 30 CRN 72 URB" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 30 CRN 72 URB</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 180kW</p>
                                    <p><strong>Range:</strong> 325 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Urban premium, Panoramic roof, Advanced driver assist</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 32 PLX 66 BAS" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 32 PLX 66 BAS</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 125kW</p>
                                    <p><strong>Range:</strong> 260 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Basic comfort, Standard safety, Manual controls</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Standard4Booking;