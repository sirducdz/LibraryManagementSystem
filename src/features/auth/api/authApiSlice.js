// src/features/auth/api/authApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Giả sử bạn có một slice khác để lưu trữ thông tin user và token
// import { setCredentials, logOut } from '../authSlice'; // Đường dẫn đến authSlice của bạn

// Hàm chuẩn bị header, lấy token từ state (nếu cần)
const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7144/api", // URL gốc cho API xác thực của bạn
  prepareHeaders: (headers, { getState }) => {
    // Lấy token từ state của Redux (ví dụ từ authSlice)
    const token = getState().auth?.token; // Điều chỉnh đường dẫn state cho đúng
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    // Bạn có thể set các header mặc định khác ở đây nếu cần
    // headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Tạo API slice
export const authApiSlice = createApi({
  reducerPath: "authApi", // Tên duy nhất cho slice này
  baseQuery: baseQuery, // Sử dụng baseQuery đã chuẩn bị header
  tagTypes: ["User"], // Định nghĩa tag type để invalidation cache (ví dụ)
  endpoints: (builder) => ({
    // Endpoint cho việc đăng nhập (Mutation)
    login: builder.mutation({
      query: (credentials) => ({
        url: "/Auth/login", // Đường dẫn tương đối -> https://your-api.com/api/auth/login
        method: "POST",
        body: credentials, // { email, password }
      }),
      transformResponse: (response) => {
        return response;
      },
      // Có thể dùng transformResponse để xử lý dữ liệu trả về trước khi vào cache
      // transformResponse: (response) => response.data,
      // Sau khi login thành công, có thể làm các việc khác như lưu token
      // bằng cách sử dụng `onQueryStarted` hoặc xử lý trong component
      // Ví dụ về invalidation (nếu cần thiết):
      // invalidatesTags: ['User'], // Ví dụ: làm mất hiệu lực cache của user cũ
    }),

    // Endpoint cho việc đăng ký (Mutation)
    register: builder.mutation({
      query: (userData) => ({
        url: "register",
        method: "POST",
        body: userData,
      }),
    }),

    // Endpoint để lấy thông tin người dùng hiện tại (Query)
    // Yêu cầu phải có token trong header (đã xử lý bởi prepareHeaders)
    getCurrentUser: builder.query({
      query: () => "me", // Đường dẫn tương đối -> https://your-api.com/api/auth/me
      providesTags: ["User"], // Cung cấp tag 'User' cho query này
    }),

    // Endpoint cho việc đăng xuất (Mutation) - ví dụ nếu cần gọi API
    logout: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
      }),
      // Sau khi logout thành công trên API, có thể dispatch action để xóa token/user state
      // async onQueryStarted(arg, { dispatch, queryFulfilled }) {
      //   try {
      //     await queryFulfilled;
      //     // Dispatch action từ authSlice để xóa token và user info
      //     dispatch(logOut());
      //     // Reset trạng thái API (tùy chọn)
      //     // dispatch(authApiSlice.util.resetApiState());
      //   } catch (err) {
      //     console.error('API logout failed: ', err);
      //   }
      // },
      invalidatesTags: ["User"], // Làm mất hiệu lực cache của user khi logout
    }),
    // Thêm các endpoints khác liên quan đến auth nếu cần...
  }),
});

// Export các hooks tương ứng để sử dụng trong components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation, // Export hook logout nếu có
} = authApiSlice;
