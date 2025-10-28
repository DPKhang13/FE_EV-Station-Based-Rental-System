import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        }}>
            <div className="hero-overlay"></div>

            <div className="hero-content">
                <div className="hero-content-inner">
                    <h1 className="hero-title">RENT AN ELECTRIC CAR!</h1>
                    <div className="separator"></div>
                    <h2 className="about-title">About Our Company</h2>
                    <p className="about-text">
                        We are dedicated to providing top-notch car rental services with a wide range of vehicles to suit your needs. Whether you're looking for luxury, eco-friendly, or budget-friendly options, we have you covered. Our mission is to make your car rental experience seamless and stress-free.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Hero;
