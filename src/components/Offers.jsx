import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Offers.css';

const Offers = () => {
    const navigate = useNavigate();

    return (
        <section className="offers">
            <div className="offers-header">
                <h2 className="offers-title">OFFERS</h2>
                <div className="offers-divider"></div>
            </div>

            <div className="offers-container">
                {/* 4-Seater Cars Section */}
                <div id="4-seater-cars" className="offers-category">
                    <h3 className="category-title">4-Seater Cars</h3>
                    <p className="category-description">Perfect for small families or individual travelers looking for comfort and efficiency.</p>
                    <div className="offers-grid vertical">
                        <div className="offer-card luxury" data-seater="4">
                            <img src="src/assets/4standard.jpg" alt="Standard" className="offer-image" />
                            <h3 className="offer-title">STANDARD</h3>
                            <p className="offer-price">Start from <span>$15</span> per day</p>
                            <p className="offer-description">Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!</p>
                            <button
                                className="rent-now-button"
                                onClick={() => navigate('/booking/standard-4seat')}
                            >
                                RENT NOW!
                            </button>
                        </div>

                        <div className="offer-card luxury" data-seater="4">
                            <img src="src/assets/4pro.jpg" alt="Air Pro" className="offer-image" />
                            <h3 className="offer-title">AIR PRO</h3>
                            <p className="offer-price">Start from <span>$35</span> per day</p>
                            <p className="offer-description">Upgrade your experience with our Air Pro package, offering enhanced features and comfort.</p>
                            <button
                                className="rent-now-button"
                                onClick={() => navigate('/booking/pro-4seat')}
                            >
                                RENT NOW!
                            </button>
                        </div>

                        <div className="offer-card luxury" data-seater="4">
                            <img src="src/assets/4proplus.jpg" alt="Air Pro Plus" className="offer-image" />
                            <h3 className="offer-title">AIR PRO PLUS</h3>
                            <p className="offer-price">Start from <span>$60</span> per day</p>
                            <p className="offer-description">Enjoy premium features and top-notch comfort with our Air Pro Plus package.</p>
                            <button
                                className="rent-now-button"
                                onClick={() => navigate('/booking/proplus-4seat')}
                            >
                                RENT NOW!
                            </button>
                        </div>
                    </div>
                </div>

                {/* 7-Seater Cars Section */}
                <div id="7-seater-cars" className="offers-category">
                    <h3 className="category-title">7-Seater Cars</h3>
                    <p className="category-description">Ideal for larger families or groups who need extra space and comfort.</p>
                    <div className="offers-grid vertical">
                        <div className="offer-card luxury" data-seater="7">
                            <img src="src/assets/7standard.jpg" alt="Standard" className="offer-image" />
                            <h3 className="offer-title">STANDARD</h3>
                            <p className="offer-price">Start from <span>$27</span> per day</p>
                            <p className="offer-description">Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>

                        <div className="offer-card luxury" data-seater="7">
                            <img src="src/assets/7pro.jpg" alt="Air Pro" className="offer-image" />
                            <h3 className="offer-title">AIR PRO</h3>
                            <p className="offer-price">Start from <span>$63</span> per day</p>
                            <p className="offer-description">Upgrade your experience with our Air Pro package, offering enhanced features and comfort.</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>

                        <div className="offer-card luxury" data-seater="7">
                            <img src="src/assets/7proplus.jpg" alt="Air Pro Plus" className="offer-image" />
                            <h3 className="offer-title">AIR PRO PLUS</h3>
                            <p className="offer-price">Start from <span>$120</span> per day</p>
                            <p className="offer-description">Enjoy premium features and top-notch comfort with our Air Pro Plus package.</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offers;
