// src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// Import Layouts
// import Layout from "../components/layout/Layout";
import Layout from "../components/layout/Layout";
// Import Pages (Ví dụ đường dẫn, bạn cần điều chỉnh cho đúng)
import LoginPage from "../features/auth/pages/LoginPage"; // Giả sử bạn đặt Login vào features
// import RegisterPage from '../features/auth/pages/Register'; // Giả sử bạn đặt Register vào features
// import BookCatalog from "../features/books/pages/BookCatalog";
// import BookDetail from "../features/books/pages/BookDetail";
// import BorrowingCart from "../features/borrowing/pages/BorrowingCart";
// import MyRequests from "../features/borrowing/pages/MyRequests";
// import AdminDashboard from "../features/admin/pages/Dashboard";
// import BookManagement from "../features/admin/pages/BookManagement";
// import BorrowingRequestManagement from "../features/admin/pages/BorrowingRequestManagement";
// import UserManagement from "../features/admin/pages/UserManagement";
// import NotFoundPage from "../pages/NotFoundPage"; // Trang 404 chung
// import UnauthorizedPage from "../pages/UnauthorizedPage"; // Trang không có quyền chung

// Import Guards
import ProtectedRoute from "./ProtectedRoute";
// Import Paths Constants
// import { PATHS } from "./routes/routePaths"; // Đảm bảo bạn đã tạo file này
import { PATHS } from "./routePaths"; // Đảm bảo bạn đã tạo file này
import HomePage from "../pages/Homepage";
import BorrowingCart from "../features/cart/pages/BorrowingCart";
import BookCatalog from "../features/books/pages/BookCatalog";
import BookDetail from "../features/books/pages/BookDetail";
function AppRoutes() {
  return (
    // BrowserRouter thường được đặt ở đây hoặc trong main.jsx bao ngoài AppRoutes
    // Nếu đặt ở main.jsx thì không cần ở đây nữa. Giả sử đặt ở đây:
    <Routes>
      {/* === Public Routes === */}
      {/* Có thể nhóm trong AuthLayout nếu cần */}
      {/* <Route element={<AuthLayout />}> */}
      <Route path={PATHS.LOGIN} element={<LoginPage />} />
      <Route element={<Layout />}>
        {/* Áp dụng Layout */}
        {/* Trang chủ là public và dùng Layout */}
        <Route path={PATHS.HomePage} element={<HomePage />} />

        {/* Thêm các trang public khác cần Layout chính ở đây */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
        {/* <Route path="/contact" element={<ContactPage />} /> */}
        {/* Nếu muốn trang 404 cũng có layout và public thì đặt ở đây */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>
      {/* <Route path={PATHS.LOGIN1} element={<LoginPage1 />} /> */}
      {/* <Route path={PATHS.REGISTER} element={<RegisterPage />} /> */}
      {/* </Route> */}
      {/* <Route path={PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} /> */}
      {/* === Protected Routes === */}
      <Route element={<ProtectedRoute />}>
        {/* Cấp 1: Yêu cầu đăng nhập */}
        <Route element={<Layout />}>
          <Route path={PATHS.BOOKS_CATALOG} element={<BookCatalog />} />
          <Route path={PATHS.BORROWING_CART} element={<BorrowingCart />} />
          {/* Cấp 2: Áp dụng Layout chính */}
          {/* Routes for ALL Authenticated Users (Admin & Normal) */}
          {/* index: Route mặc định khi truy cập path của cha gần nhất ("/") */}
          {/* <Route index element={<Navigate replace to={PATHS.boo} />} /> */}
          {/* Chuyển về trang sách mặc định */}

          {/* <Route path={PATHS.BOOKS} element={<BookCatalog />} /> */}
          {/* Giả sử bạn định nghĩa PATHS.BOOK_DETAIL = "/books/:bookId" */}
          <Route path={PATHS.BOOK_DETAIL} element={<BookDetail />} />
          {/* <Route path={PATHS.BORROWING_CART} element={<BorrowingCart />} /> */}
          {/* <Route path={PATHS.MY_REQUESTS} element={<MyRequests />} /> */}
          {/* Thêm các route chung khác nếu có: Profile, Settings... */}
          {/* <Route path={PATHS.PROFILE} element={<ProfilePage />} /> */}
          {/* Routes ONLY for Admin */}
          {/* Cấp 3: Yêu cầu thêm vai trò 'admin' */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            {/* Lưu ý: path ở đây sẽ nối tiếp với path cha gần nhất không có index */}
            {/* Ví dụ, path="/" + "admin/dashboard" -> /admin/dashboard */}
            {/* Nếu MainLayout là element của Route path="/app" thì path sẽ là /app/admin/dashboard */}
            {/* Đảm bảo định nghĩa PATHS.ADMIN_... cho đúng */}
            {/* <Route
                path={PATHS.ADMIN_DASHBOARD}
                element={<AdminDashboard />}
              /> */}
            {/* <Route path={PATHS.ADMIN_BOOKS} element={<BookManagement />} /> */}
            {/* <Route
                path={PATHS.ADMIN_BORROWING_REQUESTS}
                element={<BorrowingRequestManagement />}
              /> */}
            {/* <Route path={PATHS.ADMIN_USERS} element={<UserManagement />} /> */}
            {/* Thêm các route admin khác */}
          </Route>
        </Route>
        {/* Kết thúc MainLayout */}
      </Route>
      {/* Kết thúc ProtectedRoute */}
      {/* === Not Found Route === */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default AppRoutes;
