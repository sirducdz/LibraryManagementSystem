import { useState } from "react"
import { Layout, Input, Badge, Avatar, Dropdown, Button, Divider } from "antd"
import { useNavigate } from "react-router-dom"
import {
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons"

const { Header: AntHeader } = Layout

const Header = ({ collapsed, setCollapsed }) => {
  const [searchValue, setSearchValue] = useState("")
  const navigate = useNavigate()
  const userRole = localStorage.getItem("role") || "user"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ của tôi",
      onClick: () => navigate("/settings"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ]

  const notificationItems = [
    {
      key: "1",
      label: (
        <div>
          <p className="font-medium">Yêu cầu mượn sách đã được duyệt</p>
          <p className="text-xs text-gray-500">Yêu cầu mượn sách #123 của bạn đã được duyệt</p>
          <p className="text-xs text-gray-400 mt-1">2 giờ trước</p>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div>
          <p className="font-medium">Sắp đến hạn trả sách</p>
          <p className="text-xs text-gray-500">Bạn có 2 cuốn sách sẽ đến hạn trả vào ngày mai</p>
          <p className="text-xs text-gray-400 mt-1">1 ngày trước</p>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div>
          <p className="font-medium">Sách mới được thêm vào thư viện</p>
          <p className="text-xs text-gray-500">10 đầu sách mới đã được thêm vào danh mục</p>
          <p className="text-xs text-gray-400 mt-1">3 ngày trước</p>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "view-all",
      label: <div className="text-center text-blue-600">Xem tất cả thông báo</div>,
    },
  ]

  return (
    <AntHeader
      style={{
        padding: 0,
        background: "#fff",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="trigger-button ml-4"
          style={{ fontSize: "16px", width: 64, height: 64 }}
        />
        <div className="header-search ml-4 hidden md:block">
          <Input
            placeholder="Tìm kiếm sách, tác giả..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: 300 }}
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="header-right flex items-center mr-6">
        {userRole === "user" && (
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => navigate("/borrowing-cart")}
            className="mr-4"
          >
            Giỏ mượn
          </Button>
        )}

        <Dropdown
          menu={{ items: notificationItems }}
          placement="bottomRight"
          arrow={{ pointAtCenter: true }}
          trigger={["click"]}
        >
          <Badge count={3} className="mr-4 cursor-pointer">
            <Button type="text" icon={<BellOutlined />} size="large" />
          </Badge>
        </Dropdown>

        <Divider type="vertical" className="h-8 mx-2" />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow trigger={["click"]}>
          <div className="user-profile flex items-center cursor-pointer">
            <Avatar size="large" icon={<UserOutlined />} className="bg-blue-600" src="/avatar.jpg" />
            <div className="user-info ml-3 hidden md:block">
              <p className="font-medium text-gray-800 m-0">{userRole === "admin" ? "Admin" : "Người dùng"}</p>
              <p className="text-xs text-gray-500 m-0">
                {userRole === "admin" ? "Quản trị viên" : "Thành viên thư viện"}
              </p>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header
