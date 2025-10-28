import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Standard4Booking.css';

const Luxury4Booking = () => {
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

                <h1 className="booking-title">Book Your Luxury 4-Seater Car</h1>

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
                                <img src="src/assets/4standard.jpg" alt="VF 41 ZRX 88 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 41 ZRX 88 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 200kW</p>
                                    <p><strong>Range:</strong> 400 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Luxury package, Premium leather, Advanced safety</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 44 KRG 21 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 44 KRG 21 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 220kW</p>
                                    <p><strong>Range:</strong> 420 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Panoramic sunroof, Smart connectivity, Premium sound</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 46 LXT 56 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 46 LXT 56 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 210kW</p>
                                    <p><strong>Range:</strong> 410 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Advanced infotainment, Heated seats, Driver assist</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 48 RXT 09 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 48 RXT 09 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 230kW</p>
                                    <p><strong>Range:</strong> 430 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Luxury interior, Adaptive cruise control, Wireless charging</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 50 VXR 33 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 50 VXR 33 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 240kW</p>
                                    <p><strong>Range:</strong> 450 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Premium leather, Surround sound, Smart key</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 53 AZN 44 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 53 AZN 44 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 250kW</p>
                                    <p><strong>Range:</strong> 460 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Advanced safety, Panoramic roof, Luxury sound system</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 55 PRX 18 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 55 PRX 18 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 260kW</p>
                                    <p><strong>Range:</strong> 470 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Solar roof, Advanced efficiency, Luxury interior</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 57 KZX 72 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 57 KZX 72 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 270kW</p>
                                    <p><strong>Range:</strong> 480 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Advanced driver assist, Premium leather, Wireless charging</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item left">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 60 QNR 66 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 60 QNR 66 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 280kW</p>
                                    <p><strong>Range:</strong> 490 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Panoramic sunroof, Luxury sound, Adaptive cruise control</p>
                                </div>
                            </div>
                        </div>

                        <div className="car-item right">
                            <div className="car-image">
                                <img src="src/assets/4standard.jpg" alt="VF 63 TRX 99 LUX" />
                            </div>
                            <div className="car-info">
                                <h3 className="car-name">VF 63 TRX 99 LUX</h3>
                                <div className="car-details">
                                    <p><strong>Engine:</strong> Electric Motor 290kW</p>
                                    <p><strong>Range:</strong> 500 km per charge</p>
                                    <p><strong>Seats:</strong> 4 passengers</p>
                                    <p><strong>Features:</strong> Luxury package, Advanced efficiency, Premium leather</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Luxury4Booking;