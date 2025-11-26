import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || null);
  const [loading, setLoading] = useState(true);

  // 🔹 Tự động thêm token vào axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // ✅ Chỉ cần 1 tick để đánh dấu đã load session từ localStorage (đã gán ngay trong useState)
  useEffect(() => {
    setLoading(false);
  }, []);

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
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    // Clear cookies
    document.cookie = 'AccessToken=; path=/; max-age=0';
    document.cookie = 'RefreshToken=; path=/; max-age=0';
    setToken(null);
    setUser(null);
    console.log("👋 User logged out");
  };

  // 🔹 Cập nhật thông tin user
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    console.log("✅ User updated:", updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};