// Ví dụ: src/features/admin/api/userAdminApiSlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../books/api/bookApiSlice"; // <<<=== Sửa đường dẫn baseQuery (cần auth)

// Helper map Role Name (Frontend) to Role ID (Backend) - Cần điều chỉnh theo ID thực tế
const mapRoleNameToId = (roleName) => {
  console.log("roleName", roleName);
  if (roleName?.toLowerCase() === "admin") return 1; // Ví dụ ID của Admin là 1
  if (
    roleName?.toLowerCase() === "user" ||
    roleName?.toLowerCase() === "normaluser"
  ) {
    return 2; // Ví dụ ID của User là 2
  }

  return 0; // Hoặc giá trị mặc định/lỗi khác
};
// Helper map Role ID (Backend) to Role Name (Frontend)
const mapRoleIdToName = (roleId) => {
  if (roleId === 1) return "Admin";
  if (roleId === 2) return "User";
  return "Unknown";
};
// Helper map Gender value (API) to Name
const mapGenderIdToName = (genderId) => {
  if (genderId === 0) return "Male";
  if (genderId === 1) return "Female";
  // if (genderId === 2) return 'Other';
  return "N/A";
};

export const userAdminApiSlice = createApi({
  reducerPath: "userAdminApi",
  baseQuery: baseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // --- Endpoint LẤY DANH SÁCH USER (Admin) ---
    getUsersAdmin: builder.query({
      query: ({
        page = 1,
        pageSize = 10,
        searchTerm = "",
        sortBy = "FullName", // Có thể đặt default ở đây nếu muốn
        sortOrder = "asc", // Có thể đặt default ở đây nếu muốn
        filters = {},
      }) => {
        const params = new URLSearchParams({
          Page: page.toString(),
          PageSize: pageSize.toString(),
        });
        if (searchTerm) params.append("SearchTerm", searchTerm);

        console.log("sortBy received in query:", sortBy); // DEBUG
        console.log("sortOrder received in query:", sortOrder); // DEBUG
        console.log("filters received in query:", filters); // DEBUG

        // === SỬ DỤNG TRỰC TIẾP sortBy, sortOrder ===
        // Không cần lấy từ sorter hay map tên nữa (đã làm ở component)
        if (sortBy && sortOrder) {
          // Chỉ gửi nếu có giá trị (hoặc bỏ if nếu luôn muốn gửi)
          params.append("SortBy", sortBy);
          params.append("SortOrder", sortOrder);
        }

        let roleId = null; // Giá trị mặc định nếu không có filter Role
        if (filters?.role?.length) {
          // Chỉ lấy giá trị đầu tiên nếu người dùng chỉ chọn 1 filter role
          const roleName = filters.role[0];
          console.log("Mapping Role Name:", roleName); // Ví dụ: "Admin"

          // Thực hiện map từ string ('Admin', 'User') sang số (1, 2, ...)
          // !!! Quan trọng: Thay đổi số 1, 2,... cho khớp với RoleId thực tế trong DB/backend của bạn !!!
          if (roleName?.toLowerCase() === "admin") {
            roleId = 1; // Ví dụ: ID của Admin là 1
          } else if (roleName?.toLowerCase() === "normaluser") {
            roleId = 2; // Ví dụ: ID của User là 2
          }
          // Thêm các else if khác nếu có nhiều role hơn
        }

        let isActiveValue = null; // Giá trị mặc định nếu không có filter Status
        if (filters?.status?.length) {
          // Chỉ lấy giá trị đầu tiên nếu người dùng chỉ chọn 1 filter status
          const statusName = filters.status[0];
          console.log("Mapping Status Name:", statusName); // Ví dụ: "Inactive"

          // Thực hiện map từ string ('Active', 'Inactive') sang boolean (true, false)
          if (statusName?.toLowerCase() === "active") {
            isActiveValue = true;
          } else if (statusName?.toLowerCase() === "inactive") {
            isActiveValue = false;
          }
        }

        // --- KẾT THÚC MAP FILTERS ---

        // Thêm tham số vào URL nếu giá trị map được khác null
        if (roleId !== null) {
          params.append("RoleId", roleId.toString()); // Gửi đi RoleId=1 hoặc RoleId=2
          console.log("Appended RoleId:", roleId);
        } else {
          console.log("RoleId is null, not appending."); // Không gửi nếu không filter role hoặc map bị lỗi
        }

        if (isActiveValue !== null) {
          // Gửi đi IsActive=true hoặc IsActive=false
          // Backend C# với bool? có thể nhận dạng chuỗi "true"/"false"
          params.append("IsActive", isActiveValue.toString());
          console.log("Appended IsActive:", isActiveValue.toString());
        } else {
          console.log("IsActive is null, not appending."); // Không gửi nếu không filter status hoặc map bị lỗi
        }

        // const queryString = params.toString();

        // Filter (ví dụ: Role, Status) - Backend cần hỗ trợ nhận tên param viết hoa
        // if (filters?.role?.length) {
        //   filters.role.forEach((r) => params.append("Role", r));
        // } // Giả sử backend nhận Role là string 'Admin'/'User'
        // if (filters?.status?.length) {
        //   filters.status.forEach((s) => params.append("Status", s));
        // } // Giả sử backend nhận Status là string 'active'/'inactive'

        return `/Users?${params.toString()}`; // <<<=== KIỂM TRA PATH API
      },
      transformResponse: (response) => {
        console.log("API Response Raw (getUsersAdmin):", response); // Log dữ liệu gốc
        if (
          response &&
          Array.isArray(response.items) &&
          typeof response.totalItems === "number"
        ) {
          return {
            users: response.items
              .map((user) => {
                if (!user) return null; // Bỏ qua nếu user không hợp lệ
                // Tạo object mới với tên trường chuẩn cho frontend
                return {
                  // Giữ lại các trường gốc cần thiết khác
                  id: user.id,
                  email: user.email,
                  phone: user.phone, // Giữ lại nếu có
                  userName: user.userName, // Giữ lại nếu cần
                  createdAt: user.createdAt,
                  gender: user.gender,
                  // ... các trường khác ...

                  // --- MAP CÁC TRƯỜNG KHÁC NHAU ---
                  name: user.fullName, // Map fullName -> name
                  role: user.roleName, // <<< Map roleName -> role (string)
                  status: user.isActive ? "Active" : "Inactive", // <<< Map isActive (boolean) -> status (string)
                  //=================================
                };
              })
              .filter(Boolean), // Lọc bỏ các user null
            totalCount: response.totalItems,
          };
        }
        console.warn(
          "Received unexpected structure from GET /Users API:",
          response
        );
        return { users: [], totalCount: 0 }; // Giá trị mặc định an toàn
      },
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // --- Endpoint THÊM User (Admin) ---
    addUserAdmin: builder.mutation({
      // Nhận object từ form (đã chứa gender, role dạng giá trị form)
      query: (userData) => ({
        url: "/Users", // <<<=== KIỂM TRA PATH API
        method: "POST",
        body: {
          // Map tên từ form sang API
          userName: userData.username, // form dùng username
          email: userData.email,
          fullName: userData.name, // form dùng name
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          // Map role string từ form sang roleID số cho API
          roleID: mapRoleNameToId(userData.role), // <<<=== MAP ROLE NAME -> ID
          // Map status boolean từ form sang boolean cho API
          isActive: userData.status ?? true, // Mặc định là active nếu form không có?
          gender: userData.gender, // form dùng gender (số 0 hoặc 1)
        },
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // --- Endpoint CẬP NHẬT User (Admin) ---
    updateUserAdmin: builder.mutation({
      // Nhận { id, ...dataToUpdate } (dataToUpdate chứa name, role, gender từ form)
      query: ({ id, ...dataToUpdate }) => ({
        url: `/Users/${id}`, // <<<=== KIỂM TRA PATH API
        method: "PUT",
        // Body chỉ chứa các trường API cho phép update
        body: {
          fullName: dataToUpdate.fullName, // Map name -> fullName
          roleID: mapRoleNameToId(dataToUpdate.role), // Map role -> roleID
          gender: dataToUpdate.gender,
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id: "LIST" },
        { type: "User", id },
      ],
    }),

    // --- Endpoint XÓA User (Admin) ---
    deleteUserAdmin: builder.mutation({
      query: (id) => ({
        url: `/Users/${id}`, // <<<=== KIỂM TRA PATH API
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id: "LIST" },
        { type: "User", id },
      ],
    }),

    // --- Endpoint CẬP NHẬT TRẠNG THÁI User (Admin) ---
    updateUserStatusAdmin: builder.mutation({
      // Nhận { id, isActive } (isActive là boolean)
      query: ({ id, isActive }) => ({
        url: `/Users/${id}/status`, // <<<=== KIỂM TRA PATH API
        method: "PUT", // Hoặc PATCH
        body: { isActive }, // Body chứa trạng thái mới
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id: "LIST" },
        { type: "User", id },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetUsersAdminQuery,
  useAddUserAdminMutation,
  useUpdateUserAdminMutation,
  useDeleteUserAdminMutation,
  useUpdateUserStatusAdminMutation, // <<<=== Hook cập nhật status
} = userAdminApiSlice; // Đặt tên slice phù hợp
