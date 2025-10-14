import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
    const testimonials = [
        {
            name: 'Son Tung M-TP',
            text: "Muốn Ngồi ở vị trí mà không ai ngồi được, thì phải ngồi xe của công ty chúng tôi sản xuất. Nói vậy thôi chứ ai mua xe của chúng tôi cũng được ngồi mà.",
            avatar: '/src/assets/sontung.jpg'
        },
        {
            name: 'MR.BEAST',
            text: "Hi, I’m MrBeast — and today I’m gonna show you an electric car that can take you from ‘broke at the gas station’ to ‘rich from saving money’ in just 0.3 seconds!.",
            avatar: '/src/assets/mrbeast.webp'
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
                                    <img src={testimonial.avatar} alt={testimonial.name + ' avatar'} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
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

                {/* Thêm video YouTube bên dưới các testimonials */}
                <div className="testimonials-video" style={{ marginTop: '40px', textAlign: 'center' }}>
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/nejlAUY5gEw?si=dFEZtQMZ4jbjVILO"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
