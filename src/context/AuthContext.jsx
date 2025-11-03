/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const [loading, setLoading] = useState(true); // ✅ Thêm biến loading

  // 🔹 Khôi phục user từ localStorage khi ứng dụng khởi động
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("accessToken");

    if (savedUser && !savedToken) {
      console.warn("⚠️ User data found but no token - clearing session");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setUser(null);
      setToken(null);
      setLoading(false); // ✅ kết thúc quá trình load
      return;
    }

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        console.log("✅ Restored user session:", parsedUser);
      } catch (e) {
        console.error("❌ Failed to parse saved user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
      }
    }

    setLoading(false); // ✅ Quan trọng: phải kết thúc loading trong mọi trường hợp
  }, []);

  // 🔹 Thiết lập token mặc định cho axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // 🔹 Hàm đăng nhập
  const login = (data) => {
    const userData = {
      userId: data.userId || data.customerId || data.id,
      name: data.fullName || data.username || data.name,
      email: data.email,
      role: data.role,
      phone: data.phone || data.phoneNumber,
      address: data.address,
      dateOfBirth: data.dateOfBirth || data.dob,
    };

    localStorage.setItem("accessToken", data.jwtToken);
    localStorage.setItem("role", data.role);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(data.jwtToken);
    setUser(userData);

    console.log("✅ User logged in:", userData);
  };

  // 🔹 Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    console.log("✅ User logged out");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
