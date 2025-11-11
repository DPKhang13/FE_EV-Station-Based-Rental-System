import React, { useState } from "react";
import "./ForgotPage.css";
import logo from "../assets/logo2.png";
import { authService } from "../services";

const ForgotPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset password

  // --- Step 1: Gửi OTP ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email.trim()) return setMsg("Vui lòng nhập email!");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setMsg("✅ OTP đã được gửi! Kiểm tra hộp thư của bạn.");
      setStep(2);
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Không thể gửi OTP, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Xác thực OTP ---
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMsg("");
    if (otp.length !== 6) return setMsg("OTP phải gồm 6 số nha!");
    setLoading(true);
    try {
      await authService.verifyForgotPasswordOTP(email, otp);
      setMsg("✅ OTP hợp lệ! Hãy đặt lại mật khẩu mới.");
      setStep(3);
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ OTP không hợp lệ hoặc hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Đặt lại mật khẩu ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMsg("");
    if (password.length < 6) return setMsg("Mật khẩu phải có ít nhất 6 ký tự!");
    if (password !== confirm) return setMsg("Mật khẩu nhập lại không khớp!");
    setLoading(true);

    try {
      // backend cần OTP trong query param
      await authService.resetPassword(email, password, otp);
      setMsg("Đặt lại mật khẩu thành công! Quay lại đăng nhập nhé.");
      setStep(4); // step 4 = done
    } catch (err) {
      setMsg(err.response?.data?.message || " Không thể đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="login-logo">
        <img src={logo} alt="logo" />
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <form className="forgot-form" onSubmit={handleSendOTP}>
          <h2>Quên Mật Khẩu</h2>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi OTP"}
          </button>
          {msg && <p>{msg}</p>}
          <a href="/login">Quay lại đăng nhập</a>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form className="forgot-form" onSubmit={handleVerifyOTP}>
          <h2>Xác Thực OTP</h2>
          <input
            type="text"
            maxLength={6}
            placeholder="Nhập 6 số OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Đang xác thực..." : "Xác nhận OTP"}
          </button>
          {msg && <p>{msg}</p>}
          <a href="#" onClick={() => setStep(1)}>Gửi lại OTP khác</a>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <form className="forgot-form" onSubmit={handleResetPassword}>
          <h2>Đặt Lại Mật Khẩu</h2>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
          </button>
          {msg && <p>{msg}</p>}
        </form>
      )}

      {/* STEP 4: Done */}
      {step === 4 && (
        <div className="forgot-form">
          <h2>Hoàn Tất!</h2>
          <p>{msg}</p>
          <a href="/login">Quay lại trang đăng nhập</a>
        </div>
      )}
    </div>
  );
};

export default ForgotPage;
