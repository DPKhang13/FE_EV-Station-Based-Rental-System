import React from 'react';
import './About.css';

const About = () => {
    return (
        <section id="about" className="about">
            <div className="about-container">
                {/* Header Section */}
                <div className="about-header">
                    <div className="red-accent-line"></div>
                    <h2 className="about-title">GIỚI THIỆU</h2>
                    <p className="about-subtitle">Dẫn đầu xu hướng di chuyển xanh - Tiết kiệm - Thân thiện môi trường</p>
                </div>

                {/* Main Content */}
                <div className="about-content">
                    {/* Our Story */}
                    <div className="story-section">
                        <h3 className="section-label">CÂU CHUYỆN CỦA CHÚNG TÔI</h3>
                        <div className="story-content">
                            <p className="story-text">
                                The electric vehicle rental project is launched to meet the growing demand for convenient and affordable transportation in the context of the rising cost of car ownership. There is an increasing demand for self-driving trips, especially for families and groups of friends, but hiring a private driver is not always the best choice.
                            </p>
                            <p className="story-text">
                                The electric vehicle service not only provides convenience, saving on fuel and maintenance costs, but also contributes to environmental protection by reducing emissions from traffic. With the goal of reducing environmental pollution (35% of pollution is caused by transportation and 12% by traffic emissions), this service promises to offer a clean and cost-effective travel solution.
                            </p>
                            <p className="story-text">
                                The project targets families, environmentally conscious individuals, and those living in urban areas where public transportation is still underdeveloped. The service comes with many features such as a mobile app for managing rentals, GPS for quick navigation, and charging stations at rental points.
                            </p>
                        </div>
                    </div>

                    {/* Three Column Features */}
                    <div className="features-grid">
                        {/* Feature 1 - Unique Value */}
                        <div className="feature-card">
                            <div className="feature-number">01</div>
                            <h4 className="feature-title">UNIQUE VALUE PROPOSITION</h4>
                            <div className="feature-content">
                                <p className="feature-description">
                                    Create a distinctive service experience with comprehensive features
                                </p>
                                <ul className="feature-list">
                                    <li>App management features</li>
                                    <li>Self-driving experience</li>
                                    <li>Environmental friendliness</li>
                                    <li>Car rental + GPS + Emergency support</li>
                                    <li>Loyal customer programs with attractive benefits</li>
                                    <li>Long-term rental packages</li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 2 - Safety & Support */}
                        <div className="feature-card">
                            <div className="feature-number">02</div>
                            <h4 className="feature-title">SAFETY & SUPPORT</h4>
                            <div className="feature-content">
                                <p className="feature-description">
                                    Comprehensive protection and 24/7 customer care
                                </p>
                                <ul className="feature-list">
                                    <li>Full insurance coverage</li>
                                    <li>24/7 roadside assistance</li>
                                    <li>Safe electric vehicle usage guidance</li>
                                    <li>Avoid improper charging</li>
                                    <li>Battery overload prevention</li>
                                    <li>Safety standards compliance</li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 3 - Eco-Friendly */}
                        <div className="feature-card">
                            <div className="feature-number">03</div>
                            <h4 className="feature-title">ECO-FRIENDLY FEATURES</h4>
                            <div className="feature-content">
                                <p className="feature-description">
                                    Contributing to environmental protection and sustainability
                                </p>
                                <ul className="feature-list">
                                    <li>Promote eco-friendly vehicle features</li>
                                    <li>Carbon offset program</li>
                                    <li>Tree planting contributions</li>
                                    <li>Conservation project participation</li>
                                    <li>Reduce 35% traffic pollution</li>
                                    <li>100% clean energy vehicles</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Future Expansion */}
                    <div className="expansion-section">
                        <h3 className="section-label">FUTURE EXPANSION</h3>
                        <div className="expansion-grid">
                            <div className="expansion-item">
                                <div className="expansion-icon">🎉</div>
                                <h5>Event Rentals</h5>
                                <p>Electric vehicle rentals for special events</p>
                            </div>
                            <div className="expansion-item">
                                <div className="expansion-icon">🏖️</div>
                                <h5>Tourist Destinations</h5>
                                <p>Service packages for tourism locations</p>
                            </div>
                            <div className="expansion-item">
                                <div className="expansion-icon">🏢</div>
                                <h5>Corporate Packages</h5>
                                <p>Customized solutions for organizations</p>
                            </div>
                            <div className="expansion-item">
                                <div className="expansion-icon">🌍</div>
                                <h5>Global Standards</h5>
                                <p>International safety and environmental compliance</p>
                            </div>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div className="target-section">
                        <h3 className="section-label">TARGET CUSTOMERS</h3>
                        <div className="target-tags">
                            <span className="tag">Families</span>
                            <span className="tag">Environmentally Conscious Individuals</span>
                            <span className="tag">Urban Residents</span>
                            <span className="tag">Organizations & Companies</span>
                            <span className="tag">Event Planners</span>
                            <span className="tag">Tourists</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
