import React, { useState, useEffect, useCallback } from 'react';
import './CarShowcase.css';
import logo from '../assets/logo2.png';

const CarShowcase = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Dữ liệu các slide với video và hình ảnh thực tế
    const slides = [
        {
            type: 'video',
            src: '/videos/hero-background.mp4',
            year: '2025',
            model: 'EV Rental Experience',
            title: 'TRẢI NGHIỆM XE ĐIỆN',
            description: 'Khám phá tương lai của việc di chuyển với dịch vụ cho thuê xe điện hiện đại, tiện lợi và thân thiện môi trường.',
            features: ['Tiết kiệm chi phí', 'Thân thiện môi trường', 'Công nghệ hiện đại']
        },
        {
            type: 'video',
            src: '/videos/tesla.mp4',
            year: '2025',
            model: 'Tesla Model S',
            title: 'HIỆU SUẤT VƯỢT TRỘI',
            description: 'Trải nghiệm sức mạnh điện thuần túy với tốc độ tăng tốc từ 0-100km/h chỉ trong 2.1 giây.',
            features: ['Tự lái cấp 2', 'Phạm vi 652km', 'Sạc nhanh 15 phút']
        },
        {
            type: 'video',
            src: '/videos/bmw.mp4',
            year: '2025',
            model: 'BMW iX',
            title: 'CÔNG NGHỆ THÔNG MINH',
            description: 'Xe điện thể thao với thiết kế độc đáo và công nghệ AI tiên tiến nhất.',
            features: ['5G Ready', 'iDrive 8.0', 'Vision Package']
        },
        {
            type: 'image',
            src: '/src/assets/teslaroad.jpg',
            year: '2025',
            model: 'Tesla Roadster',
            title: 'TỐC ĐỘ ĐỈNH CAO',
            description: 'Siêu xe điện mạnh mẽ nhất với hiệu suất không giới hạn và thiết kế thể thao ấn tượng.',
            features: ['0-100km/h: 1.9s', 'Tốc độ tối đa 400km/h', 'Phạm vi 1000km']
        },
        {
            type: 'image',
            src: '/src/assets/vinfastroad.jpg',
            year: '2025',
            model: 'VinFast VF e34',
            title: 'XE ĐIỆN VIỆT NAM',
            description: 'Tự hào sản phẩm xe điện Việt Nam với công nghệ hiện đại và thiết kế sang trọng.',
            features: ['Pin LFP an toàn', 'Phạm vi 285km', 'Bảo hành 10 năm']
        }
    ];

    const totalSlides = slides.length;
    const currentSlideData = slides[currentSlide];

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, [totalSlides]);

    // Auto play
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                nextSlide();
            }, 8000); // Chuyển slide mỗi 8 giây

            return () => clearInterval(interval);
        }
    }, [currentSlide, isPaused, nextSlide]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <section className="car-showcase">
            {/* Background Media (Video or Image) */}
            <div className="showcase-media">
                {currentSlideData.type === 'video' ? (
                    <video
                        key={currentSlide}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="showcase-video"
                    >
                        <source src={currentSlideData.src} type="video/mp4" />
                    </video>
                ) : (
                    <img
                        key={currentSlide}
                        src={currentSlideData.src}
                        alt={currentSlideData.model}
                        className="showcase-image"
                    />
                )}
                <div className="showcase-overlay"></div>
            </div>

            {/* Content */}
            <div className="showcase-content">
                <div className="showcase-info">
                    <p className="showcase-year">{currentSlideData.year}</p>
                    <h1 className="showcase-model">{currentSlideData.model}</h1>
                    <h2 className="showcase-title">{currentSlideData.title}</h2>
                    <p className="showcase-description">{currentSlideData.description}</p>
                    
                    {/* Features */}
                    <div className="showcase-features">
                        {currentSlideData.features.map((feature, index) => (
                            <span key={index} className="feature-tag">{feature}</span>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="showcase-actions">
                        <button className="btn-primary">ĐẶT XE NGAY</button>
                        <button className="btn-secondary">XEM CHI TIẾT</button>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="showcase-controls">
                {/* Play/Pause Button */}
                <button
                    className="control-btn pause-btn"
                    onClick={() => setIsPaused(!isPaused)}
                    title={isPaused ? 'Phát' : 'Tạm dừng'}
                >
                    {isPaused ? (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    )}
                </button>

                {/* Previous Button */}
                <button
                    className="control-btn prev-btn"
                    onClick={prevSlide}
                    title="Trước"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Slide Indicators */}
                <div className="slide-indicators">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            title={`Slide ${index + 1}`}
                        >
                            <span className="indicator-bar"></span>
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    className="control-btn next-btn"
                    onClick={nextSlide}
                    title="Tiếp theo"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Slide Counter */}
                <div className="slide-counter">
                    <span className="current-slide">{String(currentSlide + 1).padStart(2, '0')}</span>
                    <span className="divider">/</span>
                    <span className="total-slides">{String(totalSlides).padStart(2, '0')}</span>
                </div>
            </div>

            {/* Optional Features Notice */}
            <p className="optional-notice">*Tính năng và thông số có thể thay đổi</p>
        </section>
    );
};

export default CarShowcase;