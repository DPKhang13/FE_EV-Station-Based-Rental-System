/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🧠 Đọc lại user & token từ localStorage (tránh mất khi F5)
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);

  // Gắn token vào axios header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // 🚀 Khi reload trang, xác minh token & lấy lại thông tin user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("⚠️ Lỗi /auth/me:", err);
        // Nếu backend lỗi, vẫn giữ cache user thay vì logout
        const cached = JSON.parse(localStorage.getItem("user"));
        if (cached) setUser(cached);
      }
    };

    fetchUser();
  }, []);

  // 🔑 Đăng nhập
  const login = (data) => {
    const token = data.jwtToken || data.accessToken;

    localStorage.setItem("accessToken", token);
    localStorage.setItem("role", data.role);

    const newUser = {
      id: data.id,
      name: data.fullName,
      email: data.email,
      role: data.role,
      stationId: data.stationId,
    };

    setToken(token);
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser)); // ✅ cache user
  };

  // 🚪 Đăng xuất
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
