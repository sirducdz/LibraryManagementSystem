// src/routes/ProtectedRoute.jsx (Ví dụ cho Cách 1)
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UseAuth } from '../contexts/AuthContext'; // Sử dụng hook useAuth

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = UseAuth(); // Lấy state từ context
  const location = useLocation();

  // Quan trọng: Xử lý trạng thái loading ban đầu
  if (isLoading) {
    // Có thể hiển thị một spinner hoặc null trong khi chờ context khởi tạo
    return <div>Loading authentication state...</div>; // Hoặc return null;
  }

  // 1. Kiểm tra Authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Kiểm tra Authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
     // Cần kiểm tra user có tồn tại không trước khi truy cập user.role
     console.warn(`User with role '${user?.role}' tried access restricted route`);
     return <Navigate to="/unauthorized" replace />;
  }

  // 3. Cho phép truy cập
  return <Outlet />;
};

export default ProtectedRoute;