// Giả sử bạn lưu file này tại src/components/Sidebar.jsx (ghi đè file cũ nếu muốn dùng cách này)

import React, { useState, useEffect, useMemo } from "react"; // Import React
import { Layout, Menu, Button } from "antd";
// Giữ lại import hook từ react-router-dom
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOutlined,
  UserOutlined,
  HomeOutlined,
  BarChartOutlined,
  SwapOutlined,
  SettingOutlined,
  TeamOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TagsOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { UseAuth } from "../../contexts/AuthContext";
import { PATHS } from "../../routes/routePaths";

const { Sider } = Layout;

// Bỏ interface SidebarProps

// Bỏ : SidebarProps
const Sidebar = ({
  collapsed,
  setCollapsed,
  isMobile,
  isAuthenticated,
  user,
}) => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook để điều hướng
  // Bỏ <string[]>
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean); // Lọc bỏ phần tử rỗng
    const currentKey = `/${pathSegments[0] || ""}`; // Lấy key cấp 1
    setSelectedKeys([currentKey === "//" ? "/" : currentKey]); // Xử lý trường hợp chỉ có '/'
  }, [location.pathname]);

  const allMenuItems = useMemo(
    () => [
      {
        key: PATHS.HomePage, // <-- Key cho HomePage (phải khớp với route path)
        icon: <HomeOutlined />,
        label: "Trang Chủ",
        onClick: () => navigate("/homepage"),
        // Không có 'allowedRoles' => Public cho mọi người (trong layout này)
      },
      {
        key: "/about", // Ví dụ trang public khác
        icon: <InfoCircleOutlined />,
        label: "Giới thiệu",
        onClick: () => navigate("/about"),
      },
      {
        key: "/dashboard",
        icon: <DashboardOutlined />, // Thay icon nếu muốn
        label: "Dashboard",
        onClick: () => navigate("/dashboard"),
        allowedRoles: ["admin", "NormalUser"], // <-- Yêu cầu đăng nhập (ví dụ)
      },
      {
        key: "/books",
        icon: <BookOutlined />,
        label: "Books",
        onClick: () => navigate("/books"),
        allowedRoles: ["admin", "NormalUser"], // <-- Yêu cầu đăng nhập
      },
      {
        key: "/cart", // Ví dụ Cart
        icon: <ShoppingCartOutlined />,
        label: "Giỏ Mượn",
        onClick: () => navigate("/cart"), // Hoặc '/borrowing-cart'
        allowedRoles: ["NormalUser"], // <-- Chỉ user thường
      },
      // ... Thêm các mục protected khác với allowedRoles tương ứng ...
      {
        key: "/staff",
        icon: <SafetyCertificateOutlined />,
        label: "Staff Management",
        onClick: () => navigate("/staff"),
        allowedRoles: ["admin"], // <-- Chỉ Admin
      },
      {
        key: "/reports",
        icon: <BarChartOutlined />,
        label: "Reports",
        onClick: () => navigate("/reports"),
        allowedRoles: ["admin"], // <-- Chỉ Admin
      },
      {
        key: "/settings",
        icon: <SettingOutlined />,
        label: "Settings",
        onClick: () => navigate("/settings"),
        allowedRoles: ["admin", "NormalUser"], // <-- Yêu cầu đăng nhập
      },
    ],
    [navigate]
  );

  const filteredMenuItems = useMemo(() => {
    if (!isAuthenticated) {
      return allMenuItems.filter((item) => !item.allowedRoles);
    } else {
      // Logic lọc theo role cho người đã đăng nhập
      if (!user || !user.roles)
        return allMenuItems.filter((item) => !item.allowedRoles); // An toàn
      const userRoles = Array.isArray(user.roles)
        ? user.roles
        : user.role
        ? [user.role]
        : [];
      return allMenuItems.filter((item) => {
        if (!item.allowedRoles) return true;
        return item.allowedRoles.some((allowedRole) =>
          userRoles.includes(allowedRole)
        );
      });
    }
  }, [isAuthenticated, user, allMenuItems]); // Phụ thuộc vào trạng thái đăng nhập và danh sách gốc

  const menuItemsForRender = useMemo(() => {
    return filteredMenuItems.map((item) => {
      // Sử dụng destructuring và rest syntax:
      // Lấy ra thuộc tính `allowedRoles` (và các thuộc tính tùy chỉnh khác nếu có)
      // Giữ lại phần còn lại (`renderableProps`) chứa các props mà Antd Menu cần
      const { allowedRoles, ...renderableProps } = item;
      return renderableProps; // Trả về object chỉ chứa các props hợp lệ cho Antd Menu
    });
  }, [filteredMenuItems]); // Tính toán lại khi danh sách lọc thay đổi

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 80}
      width={250}
      theme="dark"
      // className="site-sidebar" // Thêm class nếu có style riêng
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000, // Đảm bảo Sider nằm trên
        boxShadow: "2px 0 6px rgba(0, 21, 41, 0.35)",
        transition: "width 0.2s, min-width 0.2s",
      }}
      onCollapse={(collapsed, type) => {
        // Chỉ set state nếu là do responsive để tránh ghi đè nút bấm
        if (type === "responsive") {
          setCollapsed(collapsed);
        }
      }}
    >
      {/* Phần Logo */}
      <div
        className="logo-container" // Cần CSS cho class này hoặc dùng style inline
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.05)",
          cursor: "pointer", // Thêm cursor pointer
        }}
        onClick={() => navigate("/homepage")} // Cho phép click logo về trang chủ
      >
        {/* Sử dụng thẻ img */}
        <img
          src={
            collapsed ? "/src/assets/logo-small.svg" : "/src/assets/logo.svg"
          } // Đảm bảo file có trong public
          alt="Library Logo"
          // Width và height có thể điều chỉnh bằng style để mượt hơn
          style={{
            height: "32px", // Giữ chiều cao cố định
            width: "auto", // Để chiều rộng tự động
            maxWidth: collapsed ? "32px" : "150px", // Giới hạn chiều rộng tối đa
            objectFit: "contain",
            transition: "max-width 0.2s", // Hiệu ứng khi thay đổi logo
          }}
        />
        {!collapsed && (
          <span
            style={{
              color: "white",
              marginLeft: "12px",
              fontWeight: "bold",
              fontSize: "18px",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            LibraryMS
          </span>
        )}
      </div>

      {/* Menu - Truyền items trực tiếp */}
      {/* Ant Design Menu tự động gọi hàm onClick trong item khi người dùng click */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItemsForRender}
        // className="sidebar-menu" // Thêm class nếu có style riêng
        style={{ borderRight: 0 }}
      />

      {/* Footer cho nút Collapse (Tùy chọn) */}
      {!isMobile && (
        <div
          className="sidebar-footer" // Cần CSS cho class này hoặc dùng style inline
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            padding: "16px",
            textAlign: collapsed ? "center" : "right", // Đổi textAlign khi collapse
            background: "rgba(0, 0, 0, 0.2)",
            transition: "text-align 0.2s",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            // className="collapse-button" // Thêm class nếu có style riêng
            style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "16px" }}
          />
        </div>
      )}
    </Sider>
  );
};

export default Sidebar;
