// src/routes/routePaths.js

/**
 * Định nghĩa các hằng số đường dẫn cho ứng dụng.
 * Sử dụng các hằng số này thay vì chuỗi trực tiếp trong <Route path="..."> và <Link to="...">
 * để tránh lỗi gõ sai và dễ dàng thay đổi đường dẫn sau này.
 */
export const PATHS = {
    // --- Public Paths (Không cần đăng nhập) ---
    LOGIN: '/login',                             // Màn hình Đăng nhập [cite: 55]
    ABOUT: '/about',                             // Màn hình Đăng nhập [cite: 55]
    HomePage: '/homepage',                             // Màn hình Đăng nhập [cite: 55]
    REGISTER: '/register',                         // Màn hình Đăng ký (Thường đi kèm Login)
    FORGOT_PASSWORD: '/forgot-password',           // Màn hình Quên mật khẩu (Thường đi kèm Login)
    UNAUTHORIZED: '/unauthorized',                 // Màn hình báo lỗi không có quyền truy cập
  
    // --- User Authenticated Paths (Cần đăng nhập - Cả User và Admin) ---
    // Trang chủ mặc định sau khi đăng nhập có thể là Catalog sách
    HOME: '/',                                     // Thường sẽ redirect đến BOOKS hoặc ADMIN_DASHBOARD tùy role
    BOOKS_CATALOG: '/books',                       // Màn hình Danh mục Sách [cite: 56]
    BOOK_DETAIL: '/books/:bookId',                 // Màn hình Chi tiết Sách (với bookId động) [cite: 57]
    BORROWING_CART: '/borrowing-cart',             // Màn hình Giỏ mượn / Form Yêu cầu [cite: 60]
    MY_REQUESTS: '/my-requests',                   // Màn hình Yêu cầu của tôi [cite: 61]
    MY_REQUEST_DETAIL: '/my-request/:requestId',                   // Màn hình Yêu cầu của tôi [cite: 61]
    MY_BORROWED_BOOKS: '/my-borrowed-books',       // Màn hình Sách đã mượn [cite: 62]
    PROFILE: '/profile',                           // Màn hình Hồ sơ Người dùng [cite: 74]
    // SETTINGS: '/settings',                      // Ví dụ: Thêm màn hình Cài đặt nếu cần
  
    // --- Admin Only Paths (Chỉ Admin được truy cập) ---
    ADMIN_DASHBOARD: '/admin/dashboard',             // Màn hình Dashboard Admin [cite: 71]
    ADMIN_BOOK_MANAGEMENT: '/admin/books',             // Màn hình Dashboard Admin [cite: 71]
    ADMIN_CATEGORIES: '/admin/categories',           // Màn hình Quản lý Danh mục [cite: 64]
    ADMIN_BOOKS: '/admin/books',                   // Màn hình Quản lý Sách [cite: 66]
    ADMIN_REQUESTS: '/admin/requests',             // Màn hình Quản lý Yêu cầu Mượn [cite: 67]
    ADMIN_USERS: '/admin/users',                   // Màn hình Quản lý Người dùng [cite: 69]
    ADMIN_REPORTS: '/admin/reports',                 // Màn hình Báo cáo [cite: 72]
    // ADMIN_LOGS: '/admin/logs',                     // Màn hình Log Hoạt động [cite: 73]
  
    // Lưu ý: ':bookId' là một tham số động (dynamic parameter) trong URL.
    // Khi tạo link, bạn cần thay thế nó bằng ID thực tế.
    // Ví dụ dùng thư viện `react-router-dom`:
    // import { generatePath } from 'react-router-dom';
    // const bookDetailPath = generatePath(PATHS.BOOK_DETAIL, { bookId: 123 }); // -> "/books/123"
  };
  
