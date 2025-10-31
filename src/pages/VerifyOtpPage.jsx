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
    `http://localhost:8080/api/auth/verify?inputOtp=${otpCode}&email=${encodeURIComponent(email)}&type=${type}`
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

          <button
            type="submit"
            className="otp-button"
            disabled={loading || otp.join("").length < 6}
          >
            {loading ? "⏳ Đang xác thực..." : "Xác nhận"}
          </button>
        </form>

        {message && (
          <p className="otp-message">
            {String(message)}{" "}
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
