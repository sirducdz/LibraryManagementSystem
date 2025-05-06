// Ví dụ: src/features/admin/api/dashboardApiSlice.js
import { createApi } from '@reduxjs/toolkit/query/react';
// Import baseQuery đã cấu hình (cần xác thực cho admin)
import { baseQuery } from "../../books/api/bookApiSlice"; // <<<=== Sửa đường dẫn baseQuery

export const dashboardApiSlice = createApi({
    reducerPath: 'dashboardApi', // Tên định danh duy nhất
    baseQuery: baseQuery,        // Dùng base query đã có prepareHeaders
    tagTypes: ['DashboardStats', 'BorrowRequest', 'Book'], // Tag type để quản lý cache
    endpoints: (builder) => ({

        // --- Endpoint LẤY DỮ LIỆU DASHBOARD ---
        getDashboardData: builder.query({
            query: () => '/Dashboard', // <<<=== Path API Dashboard
            // transformResponse không cần thiết nếu component có thể xử lý trực tiếp cấu trúc này
            // Nếu muốn đổi tên field ngay tại đây thì thêm transformResponse
            // Ví dụ: map coverImageUrl -> coverImage trong popularBooks
            transformResponse: (response) => {
                 console.log("API Response (getDashboardData):", response);
                 // Có thể thêm mapping ở đây nếu muốn component gọn hơn
                 // Ví dụ:
                 /*
                 return {
                     ...response,
                     popularBooks: response.popularBooks?.map(book => ({
                         ...book,
                         coverImage: book.coverImageUrl
                     })) || [],
                     recentRequests: response.recentRequests?.map(req => ({
                         ...req,
                         requestDate: req.requestDate // Đảm bảo Date format đúng
                     })) || []
                 }
                 */
                 return response; // Trả về nguyên gốc để component tự xử lý
             },
            // Cung cấp tag để có thể làm mới cache khi cần
            providesTags: ['DashboardStats', { type: 'BorrowRequest', id: 'RECENT_LIST' }, { type: 'Book', id: 'POPULAR_LIST' }],
        }),

    }),
});

// Export hook
export const {
    useGetDashboardDataQuery,
} = dashboardApiSlice;