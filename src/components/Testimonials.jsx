import React, { useState, useEffect } from 'react';
import { feedbackService } from '../services';
import './Testimonials.css';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTestimonials = async () => {
            try {
                setLoading(true);
                const feedbacks = await feedbackService.getAll();

                // Transform API data sang format hiển thị
                const transformedFeedbacks = feedbacks
                    .filter(fb => fb.rating >= 4) // Chỉ lấy feedback 4-5 sao
                    .slice(0, 6) // Lấy tối đa 6 feedback
                    .map(fb => ({
                        name: fb.customerName || fb.fullName || 'Khách hàng',
                        text: fb.comment || fb.message || 'Dịch vụ tuyệt vời!',
                        avatar: fb.avatar || '/src/assets/default-avatar.jpg',
                        rating: fb.rating
                    }));

                // Hardcoded testimonials - Luôn hiển thị Sơn Tùng và MrBeast
                const hardcodedTestimonials = [
                    {
                        name: 'Son Tung M-TP',
                        text: "Muốn Ngồi ở vị trí mà không ai ngồi được, thì phải ngồi xe của công ty chúng tôi sản xuất. Nói vậy thôi chứ ai mua xe của chúng tôi cũng được ngồi mà.",
                        avatar: '/src/assets/sontung.jpg',
                        rating: 5
                    },
                    {
                        name: 'MR.BEAST',
                        text: "Hi, I'm MrBeast — and today I'm gonna show you an electric car that can take you from 'broke at the gas station' to 'rich from saving money' in just 0.3 seconds!.",
                        avatar: '/src/assets/mrbeast.webp',
                        rating: 5
                    }
                ];

                // Kết hợp hardcoded với API data (nếu có)
                const allTestimonials = [...hardcodedTestimonials, ...transformedFeedbacks];
                setTestimonials(allTestimonials);

                console.log('✅ Loaded testimonials:', allTestimonials.length, '(2 hardcoded + API)');
            } catch (error) {
                console.error('❌ Error loading testimonials:', error);
                // Nếu API lỗi, vẫn hiện 2 hardcoded testimonials
                setTestimonials([
                    {
                        name: 'Son Tung M-TP',
                        text: "Muốn Ngồi ở vị trí mà không ai ngồi được, thì phải ngồi xe của công ty chúng tôi sản xuất. Nói vậy thôi chứ ai mua xe của chúng tôi cũng được ngồi mà.",
                        avatar: '/src/assets/sontung.jpg',
                        rating: 5
                    },
                    {
                        name: 'MR.BEAST',
                        text: "Hi, I'm MrBeast — and today I'm gonna show you an electric car that can take you from 'broke at the gas station' to 'rich from saving money' in just 0.3 seconds!.",
                        avatar: '/src/assets/mrbeast.webp',
                        rating: 5
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadTestimonials();
    }, []);

    return (
        <section id="testimonials" className="testimonials">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <div className="testimonials-divider"></div>
                    <h2 className="testimonials-title">ĐÁNH GIÁ</h2>
                    <p className="testimonials-subtitle">Đọc những gì khách hàng của chúng tôi nói về xe cộ và dịch vụ của chúng tôi.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p>Đang tải đánh giá...</p>
                    </div>
                ) : (
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
                                {testimonial.rating && (
                                    <div className="testimonial-rating">
                                        {'⭐'.repeat(testimonial.rating)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

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
