import React from 'react';
import './Contact.css';

const Contact = () => {
    return (
        <section id="contact" className="contact">
            <div className="contact-container">
                <div className="contact-grid">
                    <div className="contact-map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.2977104667387!2d-0.13414668422984308!3d51.50729897963519!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604d502268421%3A0x6a7d62889992f993!2sTrafalgar%20Square!5e0!3m2!1sen!2suk!4v1635789012345!5m2!1sen!2suk"
                            allowFullScreen=""
                            loading="lazy"
                            title="Location Map"
                        ></iframe>
                    </div>

                    <div>
                        <div className="contact-divider"></div>
                        <h2 className="contact-title">CONTACT US</h2>

                        <div className="contact-details">
                            <div className="contact-item">
                                <a href="mailto:contact@rentacar.com" className="contact-link">
                                    contact@rentacar.com
                                </a>
                            </div>

                            <div className="contact-item">
                                <a href="tel:123.456.7890" className="contact-link">
                                    123.456.7890
                                </a>
                            </div>

                            <div className="contact-item">
                                <div className="contact-address">
                                    1 Park Ln, London W1J 7BQ, UK
                                </div>
                            </div>
                        </div>

                        <button className="contact-button">
                            Contact Us
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
