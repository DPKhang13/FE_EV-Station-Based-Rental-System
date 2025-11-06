import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { feedbackService } from '../services';
import './FeedbackPage.css';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        if (!orderId) {
            alert('Không tìm thấy thông tin đơn hàng!');
            navigate('/my-bookings');
        }
    }, [orderId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            alert('Vui lòng nhập nhận xét của bạn!');
            return;
        }

        try {
            setLoading(true);

            const feedbackData = {
                orderId: orderId,
                rating: rating,
                comment: comment.trim()
            };

            console.log('📝 Submitting feedback:', feedbackData);

            await feedbackService.create(feedbackData);

            alert('✅ Cảm ơn bạn đã đánh giá! Phản hồi của bạn rất quan trọng với chúng tôi.');
            navigate('/my-bookings');

        } catch (err) {
            console.error('❌ Feedback submission error:', err);
            alert('Không thể gửi đánh giá: ' + (err.message || 'Vui lòng thử lại sau'));
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                className={`star-button ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
            >
                ⭐
            </button>
        ));
    };

    const getRatingText = (rating) => {
        const texts = {
            1: 'Rất tệ',
            2: 'Tệ',
            3: 'Bình thường',
            4: 'Tốt',
            5: 'Xuất sắc'
        };
        return texts[rating] || '';
    };

    if (!orderId) {
        return null;
    }

    return (
        <div className="feedback-page">
            <div className="feedback-container">
                <button
                    className="back-button"
                    onClick={() => navigate('/my-bookings')}
                >
                    ← Quay lại
                </button>

                <div className="feedback-card">
                    <div className="feedback-header">
                        <h1>📝 Đánh giá chuyến đi</h1>
                        <p className="order-info">Mã đơn hàng: <strong>{orderId}</strong></p>
                    </div>

                    <form onSubmit={handleSubmit} className="feedback-form">
                        {/* Rating */}
                        <div className="form-group">
                            <label className="form-label">
                                Bạn đánh giá như thế nào về dịch vụ của chúng tôi?
                            </label>
                            <div className="rating-container">
                                <div className="stars-wrapper">
                                    {renderStars()}
                                </div>
                                <span className="rating-text">
                                    {getRatingText(hoveredRating || rating)}
                                </span>
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="comment">
                                Chia sẻ trải nghiệm của bạn
                            </label>
                            <textarea
                                id="comment"
                                className="feedback-textarea"
                                placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng xe, dịch vụ, và trải nghiệm tổng thể..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="6"
                                maxLength="1000"
                                required
                            />
                            <div className="char-count">
                                {comment.length}/1000 ký tự
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => navigate('/my-bookings')}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </form>

                    <div className="feedback-footer">
                        <p>💚 Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
