import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  // Kiểm tra mật khẩu khớp
  if (password !== confirmPassword) {
    setMessage("❌ Mật khẩu xác nhận không khớp!");
    setSuccess(false);
    setLoading(false);
    return;
  }

  try {
    console.log("🚀 Đang gọi authService.register...");
    const res = await authService.register({ fullName, email, phone, password });

    console.log("✅ Register thành công:", res);

    // Nếu BE trả trạng thái NEED_OTP → điều hướng
    if (res.status === "NEED_OTP" || res.status === 200) {
      navigate("/verify-otp", { state: { email, type: "REGISTER" } });
    } else {
      setMessage(res.message || " Đăng ký thành công!");
      setSuccess(true);
    }
  } catch (err) {
    console.error("❌ Register error:", err);
    setMessage(err.message || " Đăng ký thất bại, vui lòng thử lại!");
    setSuccess(false);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Đăng ký</h2>

        {!success && (
          <form onSubmit={handleRegister} className="register-form">
            {/* Section: Tên người dùng */}
            <div className="form-section">
              <h3 className="section-title">Tên người dùng</h3>
              <p className="section-description">
                Tên người dùng được sử dụng để đăng nhập vào tài khoản của bạn. Chúng tôi sẽ gửi cho bạn mã xác nhận vào tên người dùng này để xác minh.
              </p>
              
              <input
                type="email"
                placeholder="Địa chỉ Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="register-input"
              />
            </div>

            {/* Section: Các thông tin cá nhân */}
            <div className="form-section">
              <h3 className="section-title">Các thông tin cá nhân</h3>
              
              <input
                type="text"
                placeholder="Họ tên *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="register-input"
              />

              <input
                type="text"
                placeholder="Số điện thoại *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="register-input"
              />

              <input
                type="password"
                placeholder="Mật khẩu *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="register-input"
              />

              <input
                type="password"
                placeholder="Xác nhận mật khẩu *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="register-input"
              />
            </div>

            <button disabled={loading} type="submit" className="register-btn">
              {loading ? "⏳ Vui lòng chờ..." : "Đăng ký"}
            </button>

            {/* Nút về trang chủ */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="home-button"
            >
              Quay lại trang chủ
            </button>
          </form>
        )}

        {message && (
          <p className={`register-message ${success ? "success" : "error"}`}>
            {message}
          </p>
        )}

        {success && (
          <button
            onClick={() => navigate("/login")}
            className="register-btn secondary"
          >
            Đi đến đăng nhập
          </button>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;