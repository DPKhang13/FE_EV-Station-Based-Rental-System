import React from 'react';
import './Offers.css';

const Offers = () => {
    return (
        <section className="offers">
            <div className="offers-header">
                <h2 className="offers-title">OFFERS</h2>
                <div className="offers-divider"></div>
            </div>

            <div className="offers-container">
                {/* 4-Seater Cars Section */}
                <div className="offers-category">
                    <h3 className="category-title">4-Seater Cars</h3>
                    <p className="category-description">Perfect for small families or individual travelers looking for comfort and efficiency.</p>
                    <div className="offers-grid">
                        <div className="offer-card">
                            <img src="src/assets/4standard.jpg" alt="Standard" className="offer-image" />
                            <h3 className="offer-title">STANDARD</h3>
                            <p className="offer-price">Start from <span>$99</span> per day</p>
                            <p className="offer-description">Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>

                        <div className="offer-card">
                            <img src="src/assets/4pro.jpg" alt="Pro" className="offer-image" />
                            <h3 className="offer-title">PRO</h3>
                            <p className="offer-price">Start from <span>$199</span> per day</p>
                            <p className="offer-description">Upgrade your experience with our Pro package, offering enhanced features and comfort.</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>

                        <div className="offer-card">
                            <img src="src/assets/4proplus.jpg" alt="Pro Plus" className="offer-image" />
                            <h3 className="offer-title">PRO PLUS</h3>
                            <p className="offer-price">Start from <span>$299</span> per day</p>
                            <p className="offer-description">Enjoy premium features and top-notch comfort with our Pro Plus package.</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>

                        <div className="offer-card luxury">
                            <img src="src/assets/4luxury.jpg" alt="Luxury" className="offer-image" />
                            <h3 className="offer-title">LUXURY RENTALS</h3>
                            <p className="offer-price">Start from <span>$3000</span> per month</p>
                            <p className="offer-description">Experience the ultimate luxury with our premium car rentals. Perfect for special occasions or high-end business needs!</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>
                    </div>
                </div>

                {/* 7-Seater Cars Section */}
                <div className="offers-category">
                    <h3 className="category-title">7-Seater Cars</h3>
                    <p className="category-description">Ideal for larger families or groups who need extra space and comfort.</p>
                    <div className="offers-grid">
                        <div className="offer-card">
                            <img src="/path-to-standard-image.jpg" alt="Standard" className="offer-image" />
                            <h3 className="offer-title">STANDARD</h3>
                            <p className="offer-price">Start from <span>$149</span> per day</p>
                            <p className="offer-description">Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>

                        <div className="offer-card">
                            <img src="/path-to-pro-image.jpg" alt="Pro" className="offer-image" />
                            <h3 className="offer-title">PRO</h3>
                            <p className="offer-price">Start from <span>$249</span> per day</p>
                            <p className="offer-description">Upgrade your experience with our Pro package, offering enhanced features and comfort.</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>

                        <div className="offer-card">
                            <img src="/path-to-pro-plus-image.jpg" alt="Pro Plus" className="offer-image" />
                            <h3 className="offer-title">PRO PLUS</h3>
                            <p className="offer-price">Start from <span>$349</span> per day</p>
                            <p className="offer-description">Enjoy premium features and top-notch comfort with our Pro Plus package.</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>

                        <div className="offer-card luxury">
                            <img src="/path-to-luxury-image.jpg" alt="Luxury" className="offer-image" />
                            <h3 className="offer-title">LUXURY RENTALS</h3>
                            <p className="offer-price">Start from <span>$3500</span> per month</p>
                            <p className="offer-description">Experience the ultimate luxury with our premium car rentals. Perfect for special occasions or high-end business needs!</p>
                            <button className="rent-now-button">RENT NOW!</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offers;
