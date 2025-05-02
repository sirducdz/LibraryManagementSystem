// src/features/books/api/bookApiSlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
// Import baseQuery đã cấu hình (có thể từ authApiSlice hoặc định nghĩa riêng)
// Đảm bảo baseQuery này có prepareHeaders nếu cần token để gọi API lấy sách/danh mục
// Ví dụ import từ authApiSlice (nếu bạn muốn dùng chung và có xử lý re-auth nếu cần)
// import { baseQueryWithReauth as baseQuery } from '../../auth/api/authApiSlice';

// Hoặc định nghĩa một baseQuery mới/đơn giản hơn nếu không cần phức tạp như auth
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7144/api", // <<<=== THAY THẾ URL API CỦA BẠN
  prepareHeaders: (headers, { getState }) => {
    // Lấy token từ state nếu các endpoint này cần xác thực
    const token = getState().auth?.accessToken; // Giả sử state auth lưu token
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
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
      // args là object chứa các tham số: { categoryId, page, pageSize, etc. }
      query: ({ categoryId = null, page = 1, pageSize = 8 } = {}) => {
        // Tạo URLSearchParams để quản lý query params dễ dàng
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("pageSize", pageSize.toString());

        // Thêm categoryId nếu có giá trị (khác null/undefined)
        if (categoryId) {
          params.append("categoryId", categoryId);
        }

        // Có thể thêm các tham số khác: isFeatured, sortBy, searchQuery,...
        // params.append('isFeatured', 'true'); // Ví dụ nếu API hỗ trợ lấy sách nổi bật

        // Trả về URL cuối cùng
        return `/Books?${params.toString()}`; // <<<=== Sửa lại path API lấy books của bạn
      },
      // Cung cấp tags để quản lý cache hiệu quả
      providesTags: (result, error, arg) =>
        result // Giả sử result là một mảng sách [{id: 1,...}, {id: 2,...}]
          ? [
              ...result.map(({ id }) => ({ type: "Book", id })), // Gắn tag cho từng cuốn sách
              { type: "Book", id: "LIST" }, // Gắn tag chung cho danh sách
            ]
          : [{ type: "Book", id: "LIST" }], // Tag mặc định nếu lỗi hoặc không có kết quả
      // Ví dụ: Nếu API trả về dạng { data: [...], totalCount: ... }
      // transformResponse: (response) => ({ books: response.data, totalCount: response.totalCount }),
    }),

    // Có thể thêm endpoint lấy chi tiết sách ở đây nếu chưa có
    // getBookById: builder.query({ ... }),
  }),
});

// Export các hooks để sử dụng trong component
export const {
  useGetCategoriesQuery,
  useGetBooksQuery,
  // useGetBookByIdQuery,
} = bookApiSlice;
