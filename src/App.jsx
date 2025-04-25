import { Routes, Route, Navigate } from "react-router-dom"
import { ConfigProvider, theme } from "antd"
import { useState, useEffect } from "react"

import Layout from "./components/layout/Layout"
// import Dashboard from "./pages/Dashboard"
// import Categories from "./pages/Categories"
// import Members from "./pages/Members"
// import Transactions from "./pages/Transactions"
// import Reservations from "./pages/Reservations"
// import Reports from "./pages/Reports"
// import Staff from "./pages/Staff"
// import Settings from "./pages/Settings"
// import Help from "./pages/Help"

// Các trang mới
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import BookCatalog from "./pages/books/BookCatalog"
import BookDetail from "./pages/books/BookDetail"
import BorrowingCart from "./pages/borrowing/BorrowingCart"
import MyRequests from "./pages/borrowing/MyRequests"
import AdminDashboard from "./pages/admin/Dashboard"
import BookManagement from "./pages/admin/BookManagement"
import BorrowingRequestManagement from "./pages/admin/BorrowingRequestManagement"
import UserManagement from "./pages/admin/UserManagement"

function App() {
  console.log("App component rendered");
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (token) {
      setIsAuthenticated(true)
      setUserRole(role || "user")
    }
  }, [])

  // Bảo vệ route - chỉ cho phép người dùng đã đăng nhập truy cập
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />
    }

    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/" />
    }

    return children
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1e40af", // blue-800
          borderRadius: 6,
          fontFamily: "'Inter', sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#f8fafc", // slate-50
            headerBg: "#ffffff",
            siderBg: "#1e3a8a", // blue-900
          },
          Menu: {
            darkItemBg: "#1e3a8a", // blue-900
            darkItemColor: "rgba(255, 255, 255, 0.65)",
            darkItemHoverBg: "#1e40af", // blue-800
            darkItemSelectedBg: "#2563eb", // blue-600
            darkItemSelectedColor: "#ffffff",
          },
        },
      }}
    >
      <Routes>
        {/* Các route công khai */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Các route cho người dùng đã đăng nhập */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Route cho cả admin và user */}
          <Route index element={<BookCatalog />} />
          <Route path="books" element={<BookCatalog />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="borrowing-cart" element={<BorrowingCart />} />
          <Route path="my-requests" element={<MyRequests />} />

          {/* Route chỉ dành cho admin */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/books"
            element={
              <ProtectedRoute requiredRole="admin">
                <BookManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/borrowing-requests"
            element={
              <ProtectedRoute requiredRole="admin">
                <BorrowingRequestManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Các route cũ */}
          {/* <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="members" element={<Members />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="reports" element={<Reports />} />
          <Route path="staff" element={<Staff />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} /> */}
        </Route>
      </Routes>
    </ConfigProvider>
  )
}

export default App
