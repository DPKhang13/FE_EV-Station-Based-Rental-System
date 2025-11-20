import React, { useEffect } from 'react';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="privacy-page">
            {/* Red Hero Section */}
            <div className="privacy-hero">
                <div className="hero-content">
                    <h1>CHÍNH SÁCH THUÊ HÀNG</h1>
                    <p className="hero-subtitle">Quy định và điều khoản cho thuê xe điện</p>
                </div>
            </div>

            {/* White Content Section */}
            <div className="privacy-container">
                <section className="privacy-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>1. ĐIỀU KIỆN THUÊ XE</h2>
                    </div>
                    <div className="privacy-content">
                        <p className="privacy-text">
                            Để thuê xe tại CarRent, khách hàng cần đáp ứng các điều kiện sau:
                        </p>
                        <ul className="privacy-list">
                            <li>Độ tuổi: Từ 18 tuổi trở lên và có bằng lái xe hợp lệ</li>
                            <li>Bằng lái xe: Có bằng lái xe ô tô (B1, B2) còn hiệu lực ít nhất 6 tháng</li>
                            <li>Giấy tờ: CMND/CCCD hoặc hộ chiếu còn hiệu lực</li>
                            <li>Thanh toán: Đặt cọc 50% giá trị đơn hàng khi đặt xe</li>
                            <li>Xác thực: Hoàn tất quy trình xác thực danh tính tại trạm</li>
                        </ul>
                    </div>
                </section>

                <section className="privacy-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>2. QUY TRÌNH THUÊ XE</h2>
                    </div>
                    <div className="privacy-content">
                        <p className="privacy-text">
                            Quy trình thuê xe tại CarRent bao gồm các bước sau:
                        </p>
                        <ul className="privacy-list">
                            <li><strong>Bước 1:</strong> Đăng ký tài khoản và cung cấp thông tin cá nhân</li>
                            <li><strong>Bước 2:</strong> Chọn xe, thời gian và địa điểm nhận xe</li>
                            <li><strong>Bước 3:</strong> Thanh toán đặt cọc 50% giá trị đơn hàng</li>
                            <li><strong>Bước 4:</strong> Đến trạm với giấy tờ gốc để xác thực</li>
                            <li><strong>Bước 5:</strong> Thanh toán đủ 100% giá trị đơn hàng trước khi nhận xe</li>
                            <li><strong>Bước 6:</strong> Kiểm tra xe, ký hợp đồng và nhận xe</li>
                            <li><strong>Bước 7:</strong> Trả xe đúng thời gian và địa điểm đã thỏa thuận</li>
                        </ul>
                    </div>
                </section>

                <section className="privacy-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>3. TRÁCH NHIỆM CỦA KHÁCH HÀNG</h2>
                    </div>
                    <div className="privacy-content">
                        <p className="privacy-text">
                            Khách hàng có trách nhiệm:
                        </p>
                        <ul className="privacy-list">
                            <li>Sử dụng xe đúng mục đích và tuân thủ luật giao thông</li>
                            <li>Bảo quản xe cẩn thận, không để người khác lái xe nếu không được phép</li>
                            <li>Báo cáo ngay các sự cố, tai nạn hoặc hư hỏng xảy ra với xe</li>
                            <li>Trả xe đúng thời gian và địa điểm đã thỏa thuận</li>
                            <li>Trả xe trong tình trạng sạch sẽ, đầy đủ nhiên liệu (pin) như khi nhận</li>
                            <li>Chịu trách nhiệm về các vi phạm giao thông trong thời gian thuê xe</li>
                            <li>Bồi thường thiệt hại nếu gây ra hư hỏng hoặc mất mát cho xe</li>
                        </ul>
                    </div>
                </section>

                <section className="privacy-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>4. PHÍ VÀ THANH TOÁN</h2>
                    </div>
                    <div className="privacy-content">
                        <p className="privacy-text">
                            Quy định về phí và thanh toán:
                        </p>
                        <ul className="privacy-list">
                            <li><strong>Đặt cọc:</strong> 50% giá trị đơn hàng khi đặt xe (không hoàn lại nếu hủy sau 24h)</li>
                            <li><strong>Thanh toán đủ 100%:</strong> Phải thanh toán đủ 100% giá trị đơn hàng trước khi nhận xe tại trạm</li>
                            <li><strong>Phí trễ:</strong> 10% giá thuê/ngày nếu trả xe quá thời hạn</li>
                            <li><strong>Phí dịch vụ:</strong> Phí giao thông, sửa chữa, bảo dưỡng (nếu có) sẽ được tính thêm</li>
                            <li><strong>Phí hủy:</strong> Miễn phí nếu hủy trước 24h, phí 50% nếu hủy sau 24h</li>
                            <li><strong>Phương thức:</strong> Chấp nhận thanh toán bằng tiền mặt, thẻ, chuyển khoản</li>
                        </ul>
                    </div>
                </section>

                <section className="privacy-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>5. BẢO HIỂM VÀ TRÁCH NHIỆM</h2>
                    </div>
                    <div className="privacy-content">
                        <p className="privacy-text">
                            Về bảo hiểm và trách nhiệm:
                        </p>
                        <ul className="privacy-list">
                            <li>Xe đã được mua bảo hiểm dân sự bắt buộc theo quy định pháp luật</li>
                            <li>Khách hàng chịu trách nhiệm về các thiệt hại do lỗi của mình gây ra</li>
                            <li>Trong trường hợp tai nạn, khách hàng phải báo ngay cho CarRent và cơ quan chức năng</li>
                            <li>Khách hàng phải bồi thường toàn bộ thiệt hại nếu vi phạm điều khoản thuê xe</li>
                            <li>CarRent không chịu trách nhiệm về tài sản cá nhân để trong xe</li>
                            <li>Khách hàng có thể mua bảo hiểm bổ sung để giảm trách nhiệm bồi thường</li>
                        </ul>
                    </div>
                </section>

                <section className="privacy-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>6. ĐIỀU KIỆN HỦY VÀ HOÀN TIỀN</h2>
                    </div>
                    <div className="privacy-content">
                        <p className="privacy-text">
                            Quy định về hủy đơn và hoàn tiền:
                        </p>
                        <ul className="privacy-list">
                            <li><strong>Hủy trước 24h:</strong> Hoàn lại 100% số tiền đã đặt cọc</li>
                            <li><strong>Hủy sau 24h:</strong> Không hoàn lại tiền đặt cọc (50% giá trị đơn hàng)</li>
                            <li><strong>Hủy do lỗi CarRent:</strong> Hoàn lại 100% và bồi thường nếu có thiệt hại</li>
                            <li><strong>Thời gian hoàn tiền:</strong> 3-5 ngày làm việc kể từ ngày hủy</li>
                            <li><strong>Phương thức hoàn:</strong> Hoàn về tài khoản hoặc phương thức thanh toán ban đầu</li>
                        </ul>
                    </div>
                </section>

                <section className="privacy-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>7. QUY ĐỊNH SỬ DỤNG XE</h2>
                    </div>
                    <div className="privacy-content">
                        <p className="privacy-text">
                            Khách hàng phải tuân thủ các quy định sau khi sử dụng xe:
                        </p>
                        <ul className="privacy-list">
                            <li>Không được sử dụng xe để chở hàng cấm, chất nguy hiểm</li>
                            <li>Không được cho người khác thuê lại hoặc sử dụng xe cho mục đích thương mại</li>
                            <li>Không được lái xe khi đã uống rượu bia hoặc sử dụng chất kích thích</li>
                            <li>Phải bảo dưỡng và sạc pin đúng cách theo hướng dẫn</li>
                            <li>Không được tự ý sửa chữa hoặc thay đổi cấu hình xe</li>
                            <li>Phải báo cáo ngay các sự cố kỹ thuật hoặc cảnh báo từ hệ thống xe</li>
                        </ul>
                    </div>
                </section>

                <section className="privacy-section">
                    <div className="section-header">
                        <div className="red-line"></div>
                        <h2>8. LIÊN HỆ VÀ HỖ TRỢ</h2>
                    </div>
                    <div className="privacy-content">
                        <p className="privacy-text">
                            Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ về Chính sách Thuê Hàng, 
                            vui lòng liên hệ với chúng tôi:
                        </p>
                        <div className="contact-info">
                            <p><strong>Email:</strong> carrent.hcm@gmail.com</p>
                            <p><strong>Điện thoại:</strong> 0347 649 369</p>
                            <p><strong>Hotline hỗ trợ 24/7:</strong> 567-888-999</p>
                            <p><strong>Địa chỉ trụ sở:</strong> 333-222-444</p>
                        </div>
                        <p className="privacy-text" style={{ marginTop: '20px' }}>
                            Chúng tôi cam kết hỗ trợ khách hàng nhanh chóng và hiệu quả trong mọi tình huống.
                        </p>
                    </div>
                </section>

                <div className="privacy-footer-note">
                    <p>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;

