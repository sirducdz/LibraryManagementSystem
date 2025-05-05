// Bỏ "use client"
import React, { useState } from "react"; // Import React
import { Layout, Input, Badge, Avatar, Dropdown, Button, Divider } from "antd";
import {
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ShoppingCartOutlined,
  LoginOutlined, // <-- Thêm icon
  UserAddOutlined, // <-- Thêm icon (tùy chọn)
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../../contexts/AuthContext";

// Bỏ import type { MenuProps } from "antd"
const { Header: AntHeader } = Layout;

// Bỏ interface HeaderProps

// Bỏ : HeaderProps
const Header = ({ collapsed, setCollapsed, isAuthenticated, user }) => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate(); // <-- Khởi tạo navigate
  const { logout: logoutContext } = UseAuth();
  const isNormalUser =
    user?.roles?.includes("NormalUser") || user?.role === "user";
  // --- Thêm các hàm xử lý sự kiện click cho Dropdown (Quan trọng) ---
  const handleUserMenuClick = (e) => {
    console.log("User menu click", e.key);
    if (e.key === "logout") {
      logoutContext();
      // Điều hướng về trang login (có thể không cần nếu AuthProvider tự xử lý)
      // navigate('/login');
      console.log("Logout action dispatched.");
    } else if (e.key === "profile") {
      navigate("/profile"); // Ví dụ điều hướng đến trang profile
    } else if (e.key === "settings") {
      navigate("/settings"); // Ví dụ điều hướng đến trang settings
    }
    // Xử lý các key khác (profile, settings)
  };

  const handleNotificationMenuClick = (e) => {
    console.log("Notification menu click", e.key);
    // Xử lý logic khi click vào thông báo hoặc "View All"
    if (e.key === "view-all") {
      alert("View all notifications action triggered!"); // Ví dụ
    }
  };
  // --- Kết thúc phần thêm hàm xử lý ---

  // Bỏ : MenuProps["items"]
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
    },
    // {
    //   key: "settings",
    //   icon: <SettingOutlined />,
    //   label: "Settings",
    // },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
    },
  ];

  // Bỏ : MenuProps["items"]
  const notificationItems = [
    {
      key: "1",
      label: (
        <div>
          <p className="font-medium">New Book Added</p>
          <p className="text-xs text-gray-500">
            The Great Gatsby has been added
          </p>
          <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div>
          <p className="font-medium">Overdue Return</p>
          <p className="text-xs text-gray-500">John Doe - 1984</p>
          <p className="text-xs text-gray-400 mt-1">1 day ago</p>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div>
          <p className="font-medium">New Member</p>
          <p className="text-xs text-gray-500">Sarah Johnson registered</p>
          <p className="text-xs text-gray-400 mt-1">3 days ago</p>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "view-all",
      label: (
        <div className="text-center text-blue-600 hover:text-blue-800">
          View All
        </div>
      ),
    },
  ];

  return (
    <AntHeader
      style={{
        padding: "0 24px", // Thêm padding ngang
        background: "#fff", // Giữ nền trắng
        boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)", // Giữ bóng đổ
        position: "sticky",
        top: 0,
        zIndex: 10, // Đảm bảo nằm trên
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64, // Chiều cao chuẩn
      }}
    >
      {/* Phần bên trái: Nút Collapse + Search (ẩn trên mobile) */}
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="trigger-button" // Class CSS tùy chỉnh nếu có
          style={{
            fontSize: "18px", // Tăng kích thước icon
            width: "auto", // Tự động chiều rộng
            height: 64, // Chiều cao bằng header
            marginRight: "16px", // Khoảng cách với search box
            color: "rgba(0, 0, 0, 0.65)", // Màu icon mặc định
          }}
        />

        <div className="header-search hidden md:block">
          {" "}
          {/* Ẩn search trên mobile */}
          <Input
            placeholder="Search..." // Placeholder ngắn gọn
            prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: 250 }} // Giảm chiều rộng một chút
            className="rounded-md" // Bo góc
            allowClear
          />
        </div>
      </div>

      {/* Phần bên phải: Icons + Profile */}
      <div className="header-right flex items-center gap-4">
        {/* Tăng gap */}
        {/* Nút Search chỉ hiện trên mobile */}
        <Button
          type="text"
          shape="circle"
          icon={<SearchOutlined />}
          className="md:hidden" // Chỉ hiện trên màn hình nhỏ hơn md
          style={{ color: "rgba(0, 0, 0, 0.65)" }}
          // onClick={() => { /* Thêm logic mở ô search */ }}
        />
        {isAuthenticated ? (
          // --- Đã đăng nhập ---
          <>
            {/* {isNormalUser && (
              <Button
                type="default"
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate('/cart')}
              >
                Giỏ mượn
              </Button>
            )} */}

            <Dropdown
              menu={{
                items: notificationItems,
                onClick: handleNotificationMenuClick,
              }}
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
              trigger={["click"]}
              overlayStyle={{ minWidth: "300px" }}
            >
              <Badge count={3} size="small" offset={[-2, 2]}>
                <BellOutlined
                  style={{
                    fontSize: 20,
                    color: "rgba(0, 0, 0, 0.65)",
                    cursor: "pointer",
                  }}
                />
              </Badge>
            </Dropdown>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
              arrow
              trigger={["click"]}
            >
              <div className="user-profile flex items-center cursor-pointer gap-2 px-2 h-[40px] rounded hover:bg-gray-100 transition-colors">
                <Avatar
                  size="default"
                  icon={<UserOutlined />}
                  src={user?.avatarUrl || undefined}
                >
                  {!user?.avatarUrl && user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <div className="user-info hidden lg:block">
                  <p className="font-medium text-gray-700 text-sm m-0 leading-tight">
                    {user?.username || user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 m-0 leading-tight">
                    {user?.roles?.[0] || user?.role || "Member"}
                  </p>
                </div>
              </div>
            </Dropdown>
          </>
        ) : (
          // --- Chưa đăng nhập ---
          <>
            <Button icon={<LoginOutlined />} onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
            {/* <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </Button> */}
          </>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;
