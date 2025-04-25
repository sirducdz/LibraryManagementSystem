import { useState, useEffect } from "react"
import { Layout as AntLayout } from "antd"
import { Outlet, useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"
import Footer from "./Footer"

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
    }

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [navigate])

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} isMobile={isMobile} />
      <AntLayout>
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <AntLayout.Content className="site-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </AntLayout.Content>
        <Footer />
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
