import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log('🚀 Đang gọi authService.register...');
      const res = await authService.register(fullName, email, phone, password);

      console.log('✅ Register thành công:', res);
      setMessage(res.message || "✅ Đăng ký thành công!");
      setSuccess(true);
    } catch (err) {
      console.error('❌ Register error:', err);
      setMessage(err.message || "❌ Đăng ký thất bại, vui lòng thử lại!");
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
            <input
              type="text"
              placeholder="Họ tên"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="register-input"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="register-input"
            />

            <input
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="register-input"
            />

            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="register-input"
            />

            <button disabled={loading} type="submit" className="register-btn">
              {loading ? "⏳ Vui lòng chờ..." : "Đăng ký"}
            </button>

            {/* Nút về trang chủ */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="home-button"
            >
              ⬅️ Quay lại trang chủ
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
