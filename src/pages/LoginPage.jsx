// LoginPage.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { authService } from "../services";
import "./LoginPage.css";
import logo from "../assets/logo2.png";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
      const data = await authService.login(email, password);

      if (data.needOtp || data.verifyUrl) {
        return navigate(data.verifyUrl || "/verify-otp", {
          state: { type: "LOGIN", email },
        });
      }

      // ✅ Save token + user to context
      login(data);

      // ✅ Navigate by role
      const role = data.role?.toLowerCase();
      navigate(role === "customer" ? "/" : `/${role}`);
    } catch (err) {
      const s = err.response?.status;
let errorMsg = "Đăng nhập thất bại.";

if (s === 400) errorMsg = "Sai email hoặc mật khẩu.";
else if (s === 401) errorMsg = "Phiên đăng nhập không hợp lệ.";
else if (s === 404) {
  // lấy message trong response.data nếu có
  const backendMsg = err.response?.data?.message;
  errorMsg = backendMsg || "Không tìm thấy người dùng.";
} 
else if (s === 423) errorMsg = "Tài khoản bị khoá tạm thời.";
else if (s === 429) errorMsg = "Thử quá nhiều lần. Thử lại sau.";
else if (err.code === "ERR_NETWORK") errorMsg = "Không thể kết nối server.";

setMsg(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logo} alt="CarRent Logo" />
      </div>

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

        {msg && <p className="error-msg">{msg}</p>}

        <Link to="/forgot-password">Quên mật khẩu?</Link>

        <button
          type="button"
          className="home-button"
          onClick={() => navigate("/")}
        >
          ← Quay lại Trang chủ
        </button>
      </form>
    </div>
  );
}
