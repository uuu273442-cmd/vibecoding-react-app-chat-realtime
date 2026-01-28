// Đường dẫn: src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

export default function ProtectedRoute({ children }) {
  // Kiểm tra user đã login chưa
  if (!isAuthenticated()) {
    // Chưa login -> redirect về trang login
    return <Navigate to="/login" replace />;
  }

  // Đã login -> cho phép truy cập
  return children;
}
