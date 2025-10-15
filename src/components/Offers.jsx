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
                            <img src="src/assets/4standard.jpg" alt="4-Seater" className="offer-image" />
                            <h3 className="offer-title">4-SEATER RENTAL</h3>
                            <p className="offer-price">Start from <span>$15</span> per day</p>
                            <p className="offer-description">Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!</p>
                            <button
                                className="rent-now-button"
                                onClick={() => navigate('/booking-4seater')}
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
                            <img src="src/assets/7standard.jpg" alt="Air" className="offer-image" />
                            <h3 className="offer-title">AIR</h3>
                            <p className="offer-price">Start from <span>$27</span> per day</p>
                            <p className="offer-description">Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!</p>
                            <button
                                className="rent-now-button"
                                onClick={() => navigate('/booking-7seater', { state: { gradeFilter: 'Air' } })}
                            >
                                RENT NOW!
                            </button>
                        </div>

                        <div className="offer-card luxury" data-seater="7">
                            <img src="src/assets/7pro.jpg" alt="Plus" className="offer-image" />
                            <h3 className="offer-title">PLUS</h3>
                            <p className="offer-price">Start from <span>$63</span> per day</p>
                            <p className="offer-description">Upgrade your experience with our Plus package, offering enhanced features and comfort.</p>
                            <button
                                className="rent-now-button"
                                onClick={() => navigate('/booking-7seater', { state: { gradeFilter: 'Plus' } })}
                            >
                                RENT NOW!
                            </button>
                        </div>

                        <div className="offer-card luxury" data-seater="7">
                            <img src="src/assets/7proplus.jpg" alt="Pro" className="offer-image" />
                            <h3 className="offer-title">PRO</h3>
                            <p className="offer-price">Start from <span>$120</span> per day</p>
                            <p className="offer-description">Enjoy premium features and top-notch comfort with our Pro package.</p>
                            <button
                                className="rent-now-button"
                                onClick={() => navigate('/booking-7seater', { state: { gradeFilter: 'Pro' } })}
                            >
                                RENT NOW!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offers;
