import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // lấy type từ LoginPage hoặc mặc định REGISTER
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

  // giảm countdown hiển thị cho user
  useEffect(() => {
    if (countdown === null) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <div>
      <h2>Xác thực OTP ({type})</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Nhập OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Xác nhận</button>
      </form>

      {message && (
        <p>
          {message}{" "}
          {countdown !== null && countdown > 0 && (
            <span>(Tự động chuyển sau {countdown}s)</span>
          )}
        </p>
      )}
    </div>
  );
};

export default VerifyOtpPage;
