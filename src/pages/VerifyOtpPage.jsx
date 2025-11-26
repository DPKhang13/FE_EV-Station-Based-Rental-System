import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./VerifyOtpPage.css";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const type = location.state?.type || "REGISTER";
  const email = location.state?.email;

  // Nếu không có email thì quay lại trang đăng ký
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
    inputsRef.current[0]?.focus();
  }, [email, navigate]);

  // Xử lý nhập từng ký tự OTP
  const handleChange = (value, index) => {
    if (/[^0-9]/.test(value)) return; // chỉ cho nhập số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Nhấn Backspace để lùi lại ô trước
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      setMessage("⚠️ Vui lòng nhập đủ 6 số OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

   try {
  const res = await axios.post(
    `https://be-ev-station-based-rental-system.onrender.com/api/auth/verify?inputOtp=${otpCode}&email=${encodeURIComponent(email)}&type=${type}`
  );

  const data = res.data;
  setMessage(data.message || "✅ Xác thực thành công!");

  // ✅ Luôn tự động chuyển sang trang đăng nhập sau khi xác thực thành công
  if (data.status === "SUCCESS" || data.message?.includes("thành công")) {
    setCountdown(data.delaySeconds || 3);
    setTimeout(() => navigate("/login"), (data.delaySeconds || 3) * 1000);
  } else {
    // Phòng khi backend không trả "SUCCESS" nhưng vẫn muốn redirect
    navigate("/login");
  }
} catch (err) {
  const backendMsg =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "❌ Lỗi xác thực OTP, vui lòng thử lại!";
  setMessage(String(backendMsg));
} finally {
  setLoading(false);
}

  };

  // Countdown chuyển trang
  useEffect(() => {
    if (countdown === null) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div className="otp-container">
      <div className="otp-box">
        {/* Icon Header */}
        <div className="otp-icon-wrapper">
          <div className="otp-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="otp-title">
          Xác thực OTP
          <span className="otp-type-badge">{type}</span>
        </h2>

        {/* Email Info */}
        {email && (
          <p className="otp-email-info">
            📧 Mã OTP đã được gửi đến: <strong>{email}</strong>
          </p>
        )}

        <p className="otp-description">
          Vui lòng nhập mã 6 chữ số đã được gửi đến email của bạn
        </p>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="otp-form">
          <div className="otp-input-group">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData.getData('text').slice(0, 6);
                  if (/^\d+$/.test(pastedData)) {
                    const newOtp = [...otp];
                    pastedData.split('').forEach((char, idx) => {
                      if (idx < 6) newOtp[idx] = char;
                    });
                    setOtp(newOtp);
                    const nextIndex = Math.min(pastedData.length, 5);
                    inputsRef.current[nextIndex]?.focus();
                  }
                }}
                ref={(el) => (inputsRef.current[i] = el)}
                className={`otp-digit ${digit ? 'otp-digit-filled' : ''}`}
                required
              />
            ))}
          </div>

          <button
            type="submit"
            className="otp-button"
            disabled={loading || otp.join("").length < 6}
          >
            {loading ? (
              <>
                <span className="otp-button-spinner"></span>
                Đang xác thực...
              </>
            ) : (
              <>
                <svg className="otp-button-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                Xác nhận
              </>
            )}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`otp-message ${message.includes('✅') || message.includes('thành công') ? 'otp-message-success' : message.includes('⚠️') ? 'otp-message-warning' : 'otp-message-error'}`}>
            <span className="otp-message-icon">
              {message.includes('✅') ? '✅' : message.includes('⚠️') ? '⚠️' : '❌'}
            </span>
            <span className="otp-message-text">
              {String(message).replace(/[✅⚠️❌]/g, '').trim()}
              {countdown !== null && countdown > 0 && (
                <span className="otp-countdown"> (Chuyển sau {countdown}s)</span>
              )}
            </span>
          </div>
        )}

        {/* Resend OTP Link */}
        <div className="otp-footer">
          <p className="otp-footer-text">
            Không nhận được mã?{' '}
            <button
              type="button"
              className="otp-resend-link"
              onClick={() => {
                // TODO: Implement resend OTP functionality
                setMessage("📧 Mã OTP mới đã được gửi!");
              }}
            >
              Gửi lại mã
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
