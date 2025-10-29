import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./VerifyOtpPage.css"; // 👈 thêm dòng này

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const type = location.state?.type || "REGISTER";

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/auth/verify-otp", {
        otp,
        type,
      });

      const data = res.data;
      console.log("Verify response:", data);

      setMessage(data.message);

      if (data.redirect) {
        setCountdown(data.delaySeconds || 3);
        setTimeout(() => {
          navigate(data.redirect);
        }, (data.delaySeconds || 3) * 1000);
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
          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="otp-input"
            required
          />
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
