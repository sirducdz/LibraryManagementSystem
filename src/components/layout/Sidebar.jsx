import { useState, useEffect } from "react"
import { Layout, Menu, Button } from "antd"
import { useLocation, useNavigate } from "react-router-dom"
import {
  BookOutlined,
  UserOutlined,
  HomeOutlined,
  BarChartOutlined,
  SwapOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  LogoutOutlined,
} from "@ant-design/icons"

const { Sider } = Layout

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedKeys, setSelectedKeys] = useState([])
  const [userRole, setUserRole] = useState("admin")

  useEffect(() => {
    const pathSegments = location.pathname.split("/")
    const currentPath = pathSegments.length > 1 ? pathSegments[1] : ""
    setSelectedKeys(currentPath ? [`/${currentPath}`] : ["/"])

    // Lấy vai trò người dùng từ localStorage
    const role = localStorage.getItem("role")
    if (role) {
      setUserRole(role)
    }
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  // Menu items cho người dùng thường
  const userMenuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Trang chủ",
      onClick: () => navigate("/"),
    },
    {
      key: "/books",
      icon: <BookOutlined />,
      label: "Danh mục sách",
      onClick: () => navigate("/books"),
    },
    {
      key: "/borrowing-cart",
      icon: <ShoppingCartOutlined />,
      label: "Giỏ mượn sách",
      onClick: () => navigate("/borrowing-cart"),
    },
    {
      key: "/my-requests",
      icon: <HistoryOutlined />,
      label: "Yêu cầu của tôi",
      onClick: () => navigate("/my-requests"),
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/settings"),
    },
    {
      key: "/help",
      icon: <QuestionCircleOutlined />,
      label: "Trợ giúp",
      onClick: () => navigate("/help"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ]

  // Menu items cho admin
  const adminMenuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Trang chủ",
      onClick: () => navigate("/"),
    },
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "/admin/books",
      icon: <BookOutlined />,
      label: "Quản lý sách",
      onClick: () => navigate("/admin/books"),
    },
    {
      key: "/admin/borrowing-requests",
      icon: <SwapOutlined />,
      label: "Quản lý mượn trả",
      onClick: () => navigate("/admin/borrowing-requests"),
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      onClick: () => navigate("/admin/users"),
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo thống kê",
      onClick: () => navigate("/reports"),
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
      onClick: () => navigate("/settings"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ]

  // Chọn menu items dựa vào vai trò
  const menuItems = userRole === "admin" ? adminMenuItems : userMenuItems

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      collapsedWidth={isMobile ? 0 : 80}
      width={250}
      theme="dark"
      className="site-sidebar"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <div className="logo-container">
        {collapsed ? (
          <div className="logo-small">
            <img src="/logo-small.svg" alt="Library Logo" width={40} height={40} />
          </div>
        ) : (
          <div className="logo">
            <img src="/logo.svg" alt="Library Logo" width={180} height={50} />
            <div className="logo-text">
              <h1>LibraryMS</h1>
            </div>
          </div>
        )}
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={selectedKeys} items={menuItems} className="sidebar-menu" />
      {!isMobile && (
        <div className="sidebar-footer">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-button"
          />
        </div>
      )}
    </Sider>
  )
}

export default Sidebar
