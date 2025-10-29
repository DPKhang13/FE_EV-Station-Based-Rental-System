import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./VerifyOtpPage.css";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const type = location.state?.type || "REGISTER";

  // Hàm xử lý nhập OTP từng ô
  const handleChange = (value, index) => {
    if (/[^0-9]/.test(value)) return; // chỉ cho nhập số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Nhấn Backspace để lùi lại
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    try {
      const res = await axios.post("http://localhost:8080/auth/verify-otp", {
        otp: otpCode,
        type,
      });

      const data = res.data;
      setMessage(data.message);

      if (data.redirect) {
        setCountdown(data.delaySeconds || 3);
        setTimeout(() => navigate(data.redirect), (data.delaySeconds || 3) * 1000);
      }
    } catch (err) {
      setMessage(err.response?.data || "❌ Lỗi xác thực OTP, vui lòng thử lại!");
    }
  };

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
        <h2 className="otp-title">🔐 Xác thực OTP ({type})</h2>

        <form onSubmit={handleVerify} className="otp-form">
          <div className="otp-input-group">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                ref={(el) => (inputsRef.current[i] = el)}
                className="otp-digit"
                required
              />
            ))}
          </div>

          <button type="submit" className="otp-button">
            Xác nhận
          </button>
        </form>

        {message && (
          <p className="otp-message">
            {message}{" "}
            {countdown !== null && countdown > 0 && (
              <span className="otp-countdown">(Chuyển sau {countdown}s)</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyOtpPage;
