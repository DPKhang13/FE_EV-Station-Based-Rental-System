import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
    const testimonials = [
        {
            name: 'BEULA REVES',
            text: "I've been using [Company Name] for all my business trips for the past year and I couldn't be happier. The cars are always in top condition and the staff is incredibly helpful and friendly. I highly recommend [Company Name] to anyone in need of a reliable rental car."
        },
        {
            name: 'BENNETT LEASE',
            text: "I recently took my family on a road trip and rented a van from [Company Name]. The experience was seamless and the van was in great condition. I will definitely be using [Company Name] for all my future rental needs."
        }
    ];

    return (
        <section id="testimonials" className="testimonials">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <div className="testimonials-divider"></div>
                    <h2 className="testimonials-title">TESTIMONIALS</h2>
                    <p className="testimonials-subtitle">Read what our customers have to say about our vehicles and services.</p>
                </div>

                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="testimonial-avatar">
                                <div className="testimonial-avatar-circle">
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            </div>

                            <p className="testimonial-text">
                                "{testimonial.text}"
                            </p>

                            <h4 className="testimonial-name">
                                {testimonial.name}
                            </h4>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
