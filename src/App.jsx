import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import Customer from "./pages/Customer";
import Staff from "./pages/Staff";
import Home from "./pages/Home";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/customer" element={<Customer />} />
      <Route path="/staff" element={<Staff />} />
    </Routes>
  );
};

export default App;
