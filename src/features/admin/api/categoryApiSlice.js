// Ví dụ: src/features/admin/api/categoryApiSlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
// Import baseQuery đã cấu hình (cần xác thực cho admin)
import { baseQuery } from "../../books/api/bookApiSlice"; // <<<=== Sửa đường dẫn baseQuery

export const categoryApiSlice = createApi({
  reducerPath: "categoryApi", // Tên định danh duy nhất
  baseQuery: baseQuery, // Base query đã có prepareHeaders
  tagTypes: ["Category"], // Tag type để quản lý cache
  endpoints: (builder) => ({
    // --- Endpoint LẤY DANH SÁCH CATEGORIES (Cho Admin - có search/sort/page) ---
    getCategoriesAdmin: builder.query({
      // args: { page, pageSize, searchTerm, sorter }
      query: ({ page = 1, pageSize = 10, searchTerm = "", sorter = null }) => {
        const params = new URLSearchParams({
          Page: page.toString(),
          PageSize: pageSize.toString(),
        });
        if (searchTerm) params.append("SearchTerm", searchTerm); // Backend dùng SearchTerm
        console.log("sorter", sorter);

        // Xử lý Sorter
        let sortBy = sorter?.field;
        let sortOrder =
          sorter === "asc" ? "asc" : sorter === "desc" ? "desc" : null;
        // Map tên cột sort nếu cần (ví dụ: 'name' -> 'Name', 'createdAt' -> 'CreatedAt')
        // Giả sử backend chấp nhận 'Name' và 'CreatedAt'
        if (sortBy === "name") sortBy = "Name";
        if (sortBy === "createdAt") sortBy = "CreatedAt";

        sortBy = sortBy || "Name"; // Default backend
        sortOrder = sortOrder || "asc"; // Default backend

        params.append("SortBy", sortBy);
        params.append("SortOrder", sortOrder);

        console.log("[getCategoriesAdmin] Query Params:", params.toString());
        // !!! Path API lấy categories CÓ filter/sort/page !!!
        // API bạn cung cấp là /Categories/all, có thể nó dùng cho public?
        // Cần xác nhận endpoint nào cho admin có đầy đủ tham số. Tạm dùng /Categories
        return `/Categories/all?${params.toString()}`; // <<<=== KIỂM TRA LẠI PATH NÀY
        // Hoặc nếu endpoint /Categories/all nhận params:
        // return `/Categories/all?${params.toString()}`;
      },
      // Xử lý response { items: Category[], totalItems: number, ... }
      transformResponse: (response) => {
        console.log("API Response (getCategoriesAdmin):", response);
        if (
          response &&
          Array.isArray(response.items) &&
          typeof response.totalItems === "number"
        ) {
          // Không cần map nhiều field, chỉ cần đảm bảo có id, name, description, createdAt, updatedAt
          return {
            categories: response.items, // Giữ nguyên items nếu component dùng đúng tên field
            totalCount: response.totalItems,
          };
        }
        return { categories: [], totalCount: 0 };
      },
      // Cung cấp tag cho danh sách và từng item
      providesTags: (result) =>
        result?.categories
          ? [
              ...result.categories.map(({ id }) => ({ type: "Category", id })),
              { type: "Category", id: "ADMIN_LIST" },
            ]
          : [{ type: "Category", id: "ADMIN_LIST" }],
    }),

    // --- Endpoint THÊM Category (Mutation) ---
    addCategory: builder.mutation({
      // data: { name, description }
      query: (newCategoryData) => ({
        url: "/Categories", // <<<=== Path API POST category
        method: "POST",
        body: newCategoryData, // Gửi { name, description }
      }),
      // Làm mới danh sách category sau khi thêm
      invalidatesTags: [{ type: "Category", id: "ADMIN_LIST" }],
    }),

    // --- Endpoint CẬP NHẬT Category (Mutation) ---
    updateCategory: builder.mutation({
      // data: { id, name, description }
      query: ({ id, ...updatedData }) => ({
        url: `/Categories/${id}`, // <<<=== Path API PUT category
        method: "PUT",
        body: updatedData, // Gửi { name, description }
      }),
      // Làm mới danh sách và cache của category cụ thể này
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id: "ADMIN_LIST" },
        { type: "Category", id },
      ],
    }),

    // --- Endpoint XÓA Category (Mutation) ---
    deleteCategory: builder.mutation({
      // Nhận id của category cần xóa
      query: (id) => ({
        url: `/Categories/${id}`, // <<<=== Path API DELETE category
        method: "DELETE",
      }),
      // Làm mới danh sách (item bị xóa sẽ tự biến mất khỏi cache LIST)
      invalidatesTags: (result, error, id) => [
        { type: "Category", id: "ADMIN_LIST" },
        { type: "Category", id },
      ],
    }),
  }),
});

// Export các hooks
export const {
  useGetCategoriesAdminQuery, // Đổi tên hook để phân biệt nếu cần
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice; // Đặt tên slice phù hợp
