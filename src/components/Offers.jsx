import React from 'react';
import './Offers.css';

const Offers = () => {
    const offers = [
        {
            title: 'DAILY RENTAL',
            price: '$99',
            period: 'per day',
            description: 'Rent for a day and save big with our daily specials! Book Now and enjoy a stress-free drive today!',
            image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            title: 'WEEKEND OFFER',
            price: '$249',
            period: 'per weekend',
            description: 'Take a break from the hustle and bustle with our weekend getaway package. Book now and get ready for an adventure!',
            image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        },
        {
            title: 'WEEK RENTALS',
            price: '$500',
            period: 'per week',
            description: 'Drive in style with our weekly rental deals. Book your next vacation today and enjoy the freedom of the open road!',
            image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        }
    ];

    return (
        <section id="offers" className="offers">
            <div className="offers-container">
                <div className="offers-header">
                    <div className="offers-divider"></div>
                    <h2 className="offers-title">OFFERS</h2>
                    <p className="offers-subtitle">See our special offers and get our vehicles for affordable prices.</p>
                </div>

                <div className="offers-grid">
                    {offers.map((offer, index) => (
                        <div key={index} className="offer-card">
                            <div className="offer-image">
                                <img
                                    src={offer.image}
                                    alt={offer.title}
                                />
                            </div>

                            <div className="offer-content">
                                <h3 className="offer-title">{offer.title}</h3>
                                <div className="offer-price">
                                    <span className="offer-price-amount">now {offer.price}</span>
                                    <span className="offer-price-period">{offer.period}</span>
                                </div>
                                <p className="offer-description">
                                    {offer.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="offers-buttons">
                    <button className="offers-button offers-button-primary">
                        Make a reservation
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                    <button className="offers-button offers-button-secondary">
                        View Fleet
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12m-7 5h7" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Offers;
