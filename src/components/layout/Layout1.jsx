// src/layouts/MainLayout.jsx

import React, { useState, useEffect } from "react";
// Import Layout của Antd với alias để tránh trùng tên
import { Layout as AntLayout, ConfigProvider, theme } from "antd";
// Import Outlet từ react-router-dom
import { Outlet } from "react-router-dom";

// --- Điều chỉnh đường dẫn import cho đúng với cấu trúc dự án của bạn ---
// Giả sử Sidebar, Header, Footer nằm trong src/components/
import Sidebar from "./Sidebar1";
import Header from "./Header1";
import Footer from "./Footer1";
import { UseAuth } from "../../contexts/AuthContext";
// Component Layout chính (đã đổi tên thành MainLayout)
const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, user, isLoading } = UseAuth();
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 992; // Antd lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const calculateMarginLeft = () => {
    // Trên mobile, sidebar thường là overlay hoặc ẩn hoàn toàn khi collapse, không đẩy content
    if (isMobile && collapsed) return 0;
    // Trên desktop
    return collapsed ? 80 : 250; // Kích thước khi collapse/expand
  };
  const currentMarginLeft = calculateMarginLeft();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading Session..." />
      </div>
    );
  }
  return (
    // Thêm ConfigProvider để áp dụng theme Ant Design tùy chỉnh
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm, // Hoặc darkAlgorithm
        token: {
          colorPrimary: "#2563eb", // blue-600
          borderRadius: 6,
          fontFamily: "'Inter', sans-serif", // Đảm bảo font 'Inter' đã được load
        },
        components: {
          Layout: {
            bodyBg: "#f0f2f5", // Màu nền content area (ví dụ: xám nhạt)
            headerBg: "#ffffff",
            siderBg: "#1e3a8a", // blue-900
          },
          Menu: {
            darkItemBg: "#1e3a8a",
            darkItemColor: "rgba(255, 255, 255, 0.75)",
            darkItemHoverColor: "#ffffff",
            darkItemHoverBg: "#1e40af", // blue-800
            darkItemSelectedBg: "#2563eb", // blue-600
            darkItemSelectedColor: "#ffffff",
            darkSubMenuItemBg: "#1c3370",
          },
          // Thêm tùy chỉnh cho các component khác nếu cần
        },
      }}
    >
      <AntLayout style={{ minHeight: "100vh" }}>
        {/* Truyền props xuống Sidebar */}
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
          isAuthenticated={isAuthenticated}
          user={user}
        />
        {/* Layout chứa Header, Content, Footer */}
        <AntLayout
          style={{
            marginLeft: collapsed ? (isMobile ? 0 : 80) : 250,
            transition: "margin-left 0.2s", // Hiệu ứng khi sidebar thay đổi
            background: "#f0f2f5", // Nền cho layout này
          }}
        >
          {/* Truyền props xuống Header */}
          <Header
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            isAuthenticated={isAuthenticated}
            user={user}
          />
          {/* Content Area */}
          <AntLayout.Content
            style={{
              margin: "24px 16px", // Khoảng cách với Header/Footer/Sidebar
              padding: 24, // Padding bên trong vùng nội dung
              minHeight: 280, // Chiều cao tối thiểu
              background: "#fff", // Nền trắng cho nội dung
              borderRadius: "8px", // Bo góc
            }}
            // className="site-content" // Thêm class nếu bạn có style riêng trong CSS
          >
            {/* Thay thế {children} bằng <Outlet /> */}
            <Outlet />
          </AntLayout.Content>
          {/* Footer */}
          <Footer />
        </AntLayout>
      </AntLayout>
    </ConfigProvider>
  );
};

export default Layout; // Đổi tên export thành MainLayout
