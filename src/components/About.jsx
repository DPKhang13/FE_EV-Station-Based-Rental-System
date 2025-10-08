import React from 'react';
import './About.css';

const About = () => {
    return (
        <section id="about" className="about">
            <div className="about-container">
                <div className="about-header">
                    <div className="about-divider"></div>
                    <h2 className="about-title">ABOUT YOUR COMPANY</h2>
                </div>

                <div className="about-content">
                    <p className="about-text">
                        Highlight your unique selling points. What sets your company apart from the competition? Do you have a wide range of vehicles to choose from, or do you specialize in luxury or eco-friendly options? Make sure to highlight these unique features in your description. Emphasize convenience and customer service. Renting a car should be a seamless and stress-free experience for customers. So let them know that your company goes above and beyond to make the process easy!
                    </p>
                </div>
            </div>
        </section>
    );
};

export default About;
