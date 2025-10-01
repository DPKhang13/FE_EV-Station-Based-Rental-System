import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/register", {
        fullName,
        email,
        phoneNumber,
        password,
      });

      setMessage(res.data.message || "✅ Đăng ký thành công!");
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data || "❌ Đăng ký thất bại, vui lòng thử lại!");
      setSuccess(false);
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>

      {!success && (
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Đăng ký</button>
        </form>
      )}

      {message && <p>{message}</p>}

      {success && (
        <button
          onClick={() => navigate("/login")}
          style={{ marginTop: "10px", padding: "6px 12px" }}
        >
          Đi đến đăng nhập
        </button>
      )}
    </div>
  );
};

export default RegisterPage;
