import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            {/* Video Background */}
            <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="hero-video"
            >
                <source src="/videos/hero-background.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            
            <div className="hero-overlay"></div>

            <div className="hero-content">
                <div className="hero-content-inner">
                    {/* Hero content removed */}
                </div>
            </div>
        </section>
    );
};

export default Hero;
