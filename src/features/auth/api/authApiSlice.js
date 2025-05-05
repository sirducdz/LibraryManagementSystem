// src/features/auth/api/authApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { jwtDecode } from "jwt-decode";

// Giả sử bạn có một slice khác để lưu trữ thông tin user và token
// import { setCredentials, logOut } from '../authSlice'; // Đường dẫn đến authSlice của bạn

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

    console.log(
      `[prepareHeaders] Attempting to read token from ${source}. Found: ${!!token}`
    );

    if (token) {
      // (Tùy chọn nhưng nên có): Kiểm tra hạn token phía client trước khi gửi
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp > currentTime) {
          headers.set("authorization", `Bearer ${token}`);
          console.log(
            `[prepareHeaders] Token from ${source} is valid. Authorization header set.`
          );
        } else {
          console.warn(
            `[prepareHeaders] Token from ${source} is expired. Header NOT set.`
          );
          // Không gắn header nếu token hết hạn
        }
      } catch (e) {
        console.error(
          `[prepareHeaders] Invalid token found in ${source}. Header NOT set.`,
          e
        );
        // Không gắn header nếu token không hợp lệ
      }
    } else {
      console.log(
        "[prepareHeaders] No token found in either storage. Header NOT set."
      );
    }
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
      // userData nhận từ component sẽ chứa: { fullName, username, email, password, confirmPassword, gender }
      query: (userData) => ({
        url: "/Auth/register", // <<<=== KIỂM TRA LẠI PATH NẾU CẦN
        method: "POST",
        // *** Tạo body khớp với yêu cầu API backend ***
        body: {
          userName: userData.userName, // Map username -> userName
          email: userData.email,
          fullName: userData.fullName,
          password: userData.password,
          confirmPassword: userData.confirmPassword, // <<<=== GỬI confirmPassword
          gender: userData.gender, // <<<=== GỬI gender
        },
      }),
      // Không cần onQueryStarted ở đây nếu chỉ cần báo thành công/thất bại
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
        url: "/Auth/logout",
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

    googleSignIn: builder.mutation({
      query: ({ credential }) => ({
        // Nhận credential từ component
        url: "/Auth/google-signin", // <<<=== Path API backend
        method: "POST",
        body: { credential }, // Gửi credential trong body
      }),
      // Xử lý response trả về từ backend SAU KHI backend xác thực Google thành công
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          // Chờ backend trả về accessToken và refreshToken của ứng dụng bạn
          const { data } = await queryFulfilled;
          console.log("Backend Google Sign-In Response:", data);
          const { accessToken, refreshToken } = data; // Lấy token của ứng dụng

          if (accessToken && refreshToken) {
            let decodedUser = null;
            try {
              // Decode accessToken của ỨNG DỤNG BẠN
              const decodedPayload = jwtDecode(accessToken);
              console.log("Decoded App Access Token Payload:", decodedPayload);
              // !!! Map tên trường cho khớp với token của bạn !!!
              decodedUser = {
                id: decodedPayload.nameid || null,
                username: decodedPayload.unique_name || null,
                email: decodedPayload.email || null,
                roles: decodedPayload.role ? [decodedPayload.role] : [],
                name: decodedPayload.name || decodedPayload.unique_name, // Thêm các trường cần thiết khác
                avatarUrl: decodedPayload.picture, // Nếu token app có chứa ảnh từ google
              };
              if (!decodedUser.id)
                throw new Error("Missing user ID in app token");
            } catch (decodeError) {
              console.error("Failed to decode app access token:", decodeError);
              throw new Error(
                "Invalid application token received after Google Sign-In."
              );
            }

            // --- Cập nhật State và Storage ---
            // LƯU Ý: Phần này mô phỏng logic trong onFinish cũ,
            // nhưng thực hiện tập trung ở đây thay vì ở component.
            // **Luôn lưu vào localStorage** cho Google Sign-In/One Tap.
            const storage = localStorage;
            try {
              storage.setItem("accessToken", accessToken);
              storage.setItem("refreshToken", refreshToken);
              storage.setItem("userData", JSON.stringify(decodedUser));
              console.log(
                `Credentials from Google Sign-In saved to localStorage.`
              );

              // *** QUAN TRỌNG: Cập nhật trạng thái ứng dụng ***
              // Cách 1: Nếu bạn dùng Redux Slice (`authSlice`) làm nguồn chính:
              // dispatch(setCredentials({ user: decodedUser, accessToken, refreshToken, rememberMe: true })); // rememberMe=true để slice lưu vào localStorage

              // Cách 2: Nếu bạn dùng AuthContext (với useReducer) làm nguồn chính:
              // Chúng ta không thể dispatch trực tiếp vào reducer của context từ đây.
              // => Cách tốt nhất là vẫn dispatch vào Redux Slice (Cách 1) và để AuthContext đọc từ Redux.
              // => Nếu BẮT BUỘC phải dùng AuthContext cũ: Logic lưu storage và gọi loginContext phải chuyển về component HomePage (như bước dưới).
            } catch (storageError) {
              console.error(
                "Failed to save credentials to storage:",
                storageError
              );
              // Có thể throw lỗi hoặc xử lý khác
            }
          } else {
            throw new Error(
              "Backend response missing app tokens after Google Sign-In."
            );
          }
        } catch (err) {
          console.error("Google Sign-In Process Failed (RTK Query):", err);
          // Dispatch logout để đảm bảo trạng thái sạch nếu quá trình thất bại
          // dispatch(logOut()); // Nếu dùng Redux Slice
        }
      },
    }),

    getProfile: builder.query({
      query: () => "/users/me", // <<<=== Path API lấy profile
      // Xử lý response nếu cần map tên trường
      transformResponse: (response) => {
        if (response && typeof response === "object") {
          console.log("Get Profile Response:", response);
          // Map userName -> username nếu cần cho nhất quán frontend
          return { ...response, username: response.userName };
        }
        return response;
      },
      providesTags: ["UserProfile"], // Cung cấp tag riêng cho profile
    }),

    // --- Endpoint CẬP NHẬT Profile User hiện tại ---
    updateProfile: builder.mutation({
      // dataToUpdate là object chứa các trường cần cập nhật, ví dụ: { fullName, gender }
      query: (dataToUpdate) => ({
        url: "/users/me", // <<<=== Path API cập nhật profile
        method: "PUT",
        body: dataToUpdate, // Gửi object chứa các trường cần cập nhật
      }),

      // Làm mất hiệu lực cache của profile để query getProfile fetch lại
      invalidatesTags: ["UserProfile"],
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
  useGoogleSignInMutation,
  useGetProfileQuery, // <<<=== Hook lấy Profile
  useUpdateProfileMutation, // <<<=== Hook cập nhật Profile
} = authApiSlice;
