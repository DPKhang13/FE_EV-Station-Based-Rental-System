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
            <div className="about-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>🚗 About Our Company</h1>
                    <p className="hero-subtitle">Leading EV Rental Service in Vietnam</p>
                </div>
            </div>

            <div className="about-container">
                {/* Company Overview */}
                <section className="about-section">
                    <div className="section-header">
                        <div className="section-divider"></div>
                        <h2>Who We Are</h2>
                    </div>
                    <p className="section-text">
                        Welcome to <strong>EV Station-Based Rental System</strong>, your premier destination for electric vehicle rentals in Vietnam.
                        We are committed to providing sustainable, eco-friendly transportation solutions that combine convenience, affordability, and environmental responsibility.
                    </p>
                </section>

                {/* Our Mission */}
                <section className="about-section mission-section">
                    <div className="section-header">
                        <div className="section-divider"></div>
                        <h2>Our Mission</h2>
                    </div>
                    <div className="mission-grid">
                        <div className="mission-card">
                            <div className="mission-icon">🌱</div>
                            <h3>Sustainability</h3>
                            <p>Promoting green transportation to reduce carbon emissions and protect our environment for future generations.</p>
                        </div>
                        <div className="mission-card">
                            <div className="mission-icon">⚡</div>
                            <h3>Innovation</h3>
                            <p>Leveraging cutting-edge electric vehicle technology to provide the best driving experience.</p>
                        </div>
                        <div className="mission-card">
                            <div className="mission-icon">🤝</div>
                            <h3>Customer First</h3>
                            <p>Delivering exceptional service with convenient booking, competitive pricing, and 24/7 support.</p>
                        </div>
                    </div>
                </section>

                {/* What Sets Us Apart */}
                <section className="about-section features-section">
                    <div className="section-header">
                        <div className="section-divider"></div>
                        <h2>What Sets Us Apart</h2>
                    </div>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🚙</div>
                            <h3>Wide Vehicle Selection</h3>
                            <p>Choose from our extensive fleet of 4-seater and 7-seater electric vehicles, ranging from Air to Plus and Pro grades to match your needs and budget.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📍</div>
                            <h3>Strategic Locations</h3>
                            <p>Multiple rental stations conveniently located across major cities, making it easy to pick up and drop off your vehicle.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">💰</div>
                            <h3>Transparent Pricing</h3>
                            <p>No hidden fees! Our pricing is clear and competitive, with special discounts and coupon codes available for loyal customers.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔋</div>
                            <h3>Fully Charged EVs</h3>
                            <p>All our vehicles are fully charged and ready to go, with excellent range capabilities for your journey.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📱</div>
                            <h3>Easy Online Booking</h3>
                            <p>Book your vehicle in minutes through our user-friendly platform with real-time availability and instant confirmation.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">✅</div>
                            <h3>Quality Assurance</h3>
                            <p>Every vehicle undergoes rigorous maintenance and safety checks to ensure your peace of mind on the road.</p>
                        </div>
                    </div>
                </section>

                {/* Why Choose EV */}
                <section className="about-section why-ev-section">
                    <div className="section-header">
                        <div className="section-divider"></div>
                        <h2>Why Choose Electric Vehicles?</h2>
                    </div>
                    <div className="why-ev-content">
                        <div className="why-ev-image">
                            <div className="ev-placeholder">🔌⚡🚗</div>
                        </div>
                        <div className="why-ev-text">
                            <ul className="benefits-list">
                                <li>
                                    <strong>Zero Emissions:</strong> Help fight climate change by driving vehicles that produce no tailpipe emissions.
                                </li>
                                <li>
                                    <strong>Lower Operating Costs:</strong> Electric vehicles are cheaper to operate than gasoline cars, with no fuel costs and minimal maintenance.
                                </li>
                                <li>
                                    <strong>Quiet & Smooth:</strong> Enjoy a peaceful, smooth driving experience with instant torque and responsive acceleration.
                                </li>
                                <li>
                                    <strong>Advanced Technology:</strong> Experience the latest in automotive tech with smart features and modern interiors.
                                </li>
                                <li>
                                    <strong>Government Incentives:</strong> Take advantage of tax benefits and subsidies for EV usage in many regions.
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Our Commitment */}
                <section className="about-section commitment-section">
                    <div className="section-header">
                        <div className="section-divider"></div>
                        <h2>Our Commitment to You</h2>
                    </div>
                    <p className="section-text">
                        At <strong>EV Station-Based Rental System</strong>, we understand that renting a car should be a seamless and stress-free experience.
                        That's why we go above and beyond to ensure:
                    </p>
                    <div className="commitment-grid">
                        <div className="commitment-card">
                            <span className="commitment-number">01</span>
                            <h3>Convenience</h3>
                            <p>Easy booking, flexible rental periods, and hassle-free pickup/drop-off at our strategically located stations.</p>
                        </div>
                        <div className="commitment-card">
                            <span className="commitment-number">02</span>
                            <h3>Reliability</h3>
                            <p>Well-maintained vehicles that are always ready, with 24/7 customer support for any assistance you need.</p>
                        </div>
                        <div className="commitment-card">
                            <span className="commitment-number">03</span>
                            <h3>Safety</h3>
                            <p>Regular safety inspections, comprehensive insurance coverage, and strict hygiene protocols for your protection.</p>
                        </div>
                        <div className="commitment-card">
                            <span className="commitment-number">04</span>
                            <h3>Value</h3>
                            <p>Competitive pricing with no hidden fees, plus loyalty rewards and special offers for returning customers.</p>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="about-cta">
                    <h2>Ready to Experience the Future of Transportation?</h2>
                    <p>Book your electric vehicle today and join the green revolution!</p>
                    <div className="cta-buttons">
                        <button onClick={() => navigate('/location-select')} className="btn-book">
                            Book Now
                        </button>
                        <button onClick={() => navigate('/?scroll=contact')} className="btn-contact">
                            Contact Us
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
