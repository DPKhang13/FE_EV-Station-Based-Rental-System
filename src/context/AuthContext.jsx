import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const [loading, setLoading] = useState(true);

  // ✅ Không xóa session nữa — thay vào đó load lại thông tin từ localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
      console.log("🔐 Session restored:", JSON.parse(savedUser));
    } else {
      console.log("🚫 No session found");
    }

    setLoading(false);
  }, []);

  // 🔹 Tự động thêm token vào axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // 🔹 Đăng nhập
  const login = (data) => {
  const userData = {
    userId: data.userId || data.customerId || data.id,
    name: data.fullName || data.username || data.name,
    email: data.email,
    role: data.role,
    phone: data.phone || data.phoneNumber,
    address: data.address,
    dateOfBirth: data.dateOfBirth || data.dob,
    stationId: data.stationId || data.tramId,
  };

  // ✅ Fix chỗ này — chọn token đúng key backend trả về
  const token = data.accessToken || data.jwtToken || data.token;
  if (!token) {
    console.error("❌ Không tìm thấy token hợp lệ trong login response:", data);
  }

  localStorage.setItem("accessToken", token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("user", JSON.stringify(userData));

  setToken(token);
  setUser(userData);

  console.log("✅ User logged in:", userData);
  console.log("🔑 Token saved:", token?.substring(0, 25) + "...");
};

  // 🔹 Đăng xuất
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    console.log("👋 User logged out");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
