// Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services";
import './LoginPage.css';

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!isEmail(email)) return setMsg("Email không hợp lệ");
    if (password.length < 6) return setMsg("Mật khẩu phải ≥ 6 ký tự");

    try {
      setLoading(true);
      console.log('🚀 Đang gọi authService.login...');
      const data = await authService.login(email, password);

      console.log('✅ Login thành công:', data);

      if (data.needOtp || data.verifyUrl) {
        nav(data.verifyUrl || "/verify-otp", { state: { type: "LOGIN", email } });
        return;
      }

      // Store token and login
      login(data);

    nav("/"+data.role.toLowerCase());
    } catch (err) {
      console.error('❌ Login error:', err);
      const s = err.response?.status;
      setMsg(
        s === 400 ? "Sai email hoặc mật khẩu."
          : s === 401 ? "Phiên đăng nhập không hợp lệ."
            : s === 423 ? "Tài khoản bị khoá tạm."
              : s === 429 ? "Thử quá nhiều lần. Thử lại sau."
                : err.code === "ERR_NETWORK" ? "Không thể kết nối server."
                  : err.message || "Đăng nhập thất bại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={submit}>
        <h2>Đăng nhập</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu"
          required
        />
        <button disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        {msg && <p>{msg}</p>}
        <Link to="/forgot-password">Quên mật khẩu?</Link>
        <button
          type="button"
          className="home-button"
          onClick={() => nav("/")}
        >
          ← Quay lại Trang chủ
        </button>
      </form>
    </div>
  );
}