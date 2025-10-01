import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });

      const data = res.data;

      if (data.token) {
        console.log("✅ Login thành công:", data);
        login(data); 
        navigate(data.redirect || "/");
      } else if (data.verifyUrl) {
        console.log("⚠️ Cần OTP:", data);
        setMessage(data.message || "Cần OTP xác thực!");
        navigate(data.verifyUrl, { state: { type: "LOGIN" } });
      } else {
        setMessage(data.message || "❌ Đăng nhập thất bại!");
      }
    } catch (err) {
      console.error("Login error:", err.response);

      const errorMsg =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "❌ Đăng nhập thất bại!";

      setMessage(errorMsg);
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Đăng nhập</button>
      </form>

      {message && <p style={{ color: "red" }}>{message}</p>}

      <p style={{ marginTop: "10px" }}>
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};

export default Login;
