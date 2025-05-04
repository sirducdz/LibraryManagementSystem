// src/features/books/api/bookApiSlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
// Import baseQuery đã cấu hình (có thể từ authApiSlice hoặc định nghĩa riêng)
// Đảm bảo baseQuery này có prepareHeaders nếu cần token để gọi API lấy sách/danh mục
// Ví dụ import từ authApiSlice (nếu bạn muốn dùng chung và có xử lý re-auth nếu cần)
// import { baseQueryWithReauth as baseQuery } from '../../auth/api/authApiSlice';

// Hoặc định nghĩa một baseQuery mới/đơn giản hơn nếu không cần phức tạp như auth
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { jwtDecode } from "jwt-decode";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7144/api", // <<<=== URL API CỦA BẠN
  prepareHeaders: (headers, { getState }) => {
      // *** THAY ĐỔI QUAN TRỌNG: Đọc token trực tiếp từ Storage ***
      // Ưu tiên đọc từ localStorage trước (nếu người dùng chọn "Remember me")
      let token = localStorage.getItem("accessToken");
      let source = "localStorage";
      // Nếu không có trong localStorage, thử đọc từ sessionStorage
      if (!token) {
          token = sessionStorage.getItem("accessToken");
          source = "sessionStorage";
      }

      console.log(`[prepareHeaders] Attempting to read token from ${source}. Found: ${!!token}`);

      if (token) {
          // (Tùy chọn nhưng nên có): Kiểm tra hạn token phía client trước khi gửi
           try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp && decoded.exp > currentTime) {
                     headers.set("authorization", `Bearer ${token}`);
                     console.log(`[prepareHeaders] Token from ${source} is valid. Authorization header set.`);
                } else {
                     console.warn(`[prepareHeaders] Token from ${source} is expired. Header NOT set.`);
                     // Không gắn header nếu token hết hạn
                }
           } catch(e) {
                console.error(`[prepareHeaders] Invalid token found in ${source}. Header NOT set.`, e);
                // Không gắn header nếu token không hợp lệ
           }
      } else {
           console.log("[prepareHeaders] No token found in either storage. Header NOT set.");
      }
      return headers;
  },
});

export const bookApiSlice = createApi({
  reducerPath: "bookApi", // Tên định danh duy nhất
  baseQuery: baseQuery, // Sử dụng baseQuery đã chuẩn bị
  tagTypes: ["Book", "Category"], // Dùng cho caching
  endpoints: (builder) => ({
    // --- Endpoint để lấy danh sách Categories ---
    getCategories: builder.query({
      query: () => "/Categories", // <<<=== Sửa lại path API lấy categories của bạn
      providesTags: ["Category"], // Cung cấp tag để cache
      // Ví dụ: Nếu API trả về dạng { data: [...] }
      // transformResponse: (response) => response.data,
    }),

    // --- Endpoint để lấy danh sách Books ---
    // Có thể nhận tham số để lọc, phân trang
    getBooks: builder.query({
      query: ({ categoryId = null, page = 1, pageSize = 8 } = {}) => {
          const params = new URLSearchParams({
              page: page.toString(),
              pageSize: pageSize.toString(),
          });
          if (categoryId) {
              params.append('categoryId', categoryId);
          }
          // params.append('isFeatured', 'true'); // Thêm nếu cần
          return `/Books?${params.toString()}`; // <<<=== Path API lấy books
      },
      // *** Thêm transformResponse để xử lý cấu trúc JSON mới ***
      transformResponse: (response) => {
          console.log("API Response (getBooks):", response); // Log để kiểm tra cấu trúc gốc
          // Kiểm tra xem response có đúng dạng và có thuộc tính 'items' là mảng không
          if (response && Array.isArray(response.items)) {
               // Trích xuất và chuyển đổi dữ liệu sách nếu cần
               const transformedBooks = response.items.map(book => ({
                   ...book, // Giữ lại các trường gốc
                   // Đổi tên coverImageUrl thành coverImage
                   coverImage: book.coverImageUrl,
                   // Đổi tên publicationYear thành year (nếu component dùng year)
                   year: book.publicationYear,
                   // Xóa các trường gốc đã đổi tên nếu muốn (tùy chọn)
                   // coverImageUrl: undefined,
                   // publicationYear: undefined,
               }));
               console.log("Transformed Books:", transformedBooks);
               return transformedBooks; // Chỉ trả về mảng sách đã xử lý
          }
           // Nếu cấu trúc không đúng, trả về mảng rỗng để tránh lỗi component
          console.warn("Received unexpected structure from /Books API:", response);
          return [];
           // ---- HOẶC ----
           // Nếu bạn muốn component nhận cả thông tin phân trang:
           /*
           const transformedBooks = (response?.items || []).map(book => ({
               ...book,
               coverImage: book.coverImageUrl,
               year: book.publicationYear,
           }));
           return {
               books: transformedBooks,
               page: response.page,
               pageSize: response.pageSize,
               totalItems: response.totalItems,
               totalPages: response.totalPages,
           };
           */
      },
      // Cập nhật providesTags nếu cần (vẫn hoạt động với mảng trả về)
      providesTags: (result, error, arg) =>
          result
              ? [...result.map(({ id }) => ({ type: 'Book', id })), { type: 'Book', id: 'LIST' }]
              : [{ type: 'Book', id: 'LIST' }],
  }),
  // ... các endpoints khác ...
}),
});

export const {
useGetCategoriesQuery,
useGetBooksQuery,
} = bookApiSlice;