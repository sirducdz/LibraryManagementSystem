// Ví dụ: src/features/requests/api/requestApiSlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
// Import baseQuery đã cấu hình (cần xác thực)
import { baseQuery } from "../../books/api/bookApiSlice"; // <<<=== Sửa đường dẫn baseQuery của bạn

// Helper function để chuyển đổi filter của Ant Table thành query params cho Status
// Giả định backend chỉ nhận 1 Status hoặc không nhận gì (null)
// Nếu backend nhận nhiều Status, cần sửa lại logic này
const getStatusParam = (statusFilters) => {
  if (Array.isArray(statusFilters) && statusFilters.length === 1) {
    return statusFilters[0]; // Chỉ lấy filter đầu tiên nếu người dùng chọn 1
  }
  // Nếu người dùng chọn nhiều filter hoặc không chọn gì, không gửi param Status
  return null;
};

export const requestApiSlice = createApi({
  reducerPath: "requestApi",
  baseQuery: baseQuery,
  tagTypes: ["BorrowRequest"], // Tag type cho request
  endpoints: (builder) => ({
    // --- Endpoint LẤY DANH SÁCH REQUEST ---
    getBorrowingRequests: builder.query({
      // args: { type: 'active' | 'history', page, pageSize, statusFilters, sorter }
      query: ({
        type,
        page = 1,
        pageSize = 10,
        statusFilters = null,
        sortBy = "DateRequested", // Mặc định sortBy
        sortOrder = "desc",
      }) => {
        const params = new URLSearchParams({
          // !!! Map tên param cho khớp backend !!!
          Page: page.toString(), // Chữ hoa P
          PageSize: pageSize.toString(), // Chữ hoa P, S
        });

        if (Array.isArray(statusFilters) && statusFilters.length > 0) {
          // Nếu người dùng chọn filter cụ thể trên bảng
          console.log(
            `[getBorrowingRequests] Using specific status filters:`,
            statusFilters
          );
          // Append từng status vào query string với key là "Statuses"
          statusFilters.forEach((status) => params.append("Statuses", status)); // <<<=== SỬ DỤNG KEY 'Statuses'
        } else {
          // Nếu không có filter nào được chọn, gửi các status mặc định cho tab
          console.log(
            `[getBorrowingRequests] No specific filters, using type: ${type}`
          );
          const defaultStatuses =
            type === "active"
              ? ["Waiting", "Approved"] // Trạng thái cho tab active
              : ["Returned", "Rejected", "Cancelled"]; // Trạng thái cho tab history
          defaultStatuses.forEach((status) =>
            params.append("Statuses", status)
          ); // <<<=== SỬ DỤNG KEY 'Statuses'
        }
        params.append("SortBy", sortBy);
        params.append("SortOrder", sortOrder);

        console.log("[getBorrowingRequests] Query Params:", params.toString());
        return `/Borrowings/my-requests?${params.toString()}`; // <<<=== Sửa path API nếu cần
      },
      // *** Xử lý response JSON từ backend ***
      transformResponse: (response) => {
        console.log("API Response (getBorrowingRequests):", response);
        if (
          response &&
          Array.isArray(response.items) &&
          typeof response.totalItems === "number"
        ) {
          const transformedRequests = response.items.map((req) => ({
            // Map các trường từ response API sang tên component dùng
            id: req.id,
            requestDate: req.dateRequested, // dateRequested -> requestDate
            status: req.status?.toLowerCase() || "unknown", // status -> status (lowercase)
            rejectionReason: req.rejectionReason,
            // !!! BACKEND CẦN TRẢ VỀ CÁC TRƯỜNG NÀY KHI CÓ !!!
            approvedDate: req.approvedDate,
            dueDate: req.dueDate,
            returnedDate: req.returnedDate,
            cancelledDate: req.cancelledDate, // Thêm nếu có
            // Map mảng 'details' thành 'books'
            books: Array.isArray(req.details)
              ? req.details.map((detail) => ({
                  id: detail.bookId, // bookId -> id
                  title: detail.bookTitle, // bookTitle -> title
                  // Thêm author nếu component modal cần (hiện tại đang lấy từ request gốc)
                  // author: req.requestorName, // Hoặc từ nguồn khác nếu có
                  isExtended: req.isExtended, // <<< !!! API HIỆN TẠI KHÔNG CÓ TRƯỜNG NÀY !!!
                }))
              : [],
            // Giữ lại các trường khác nếu cần: requestorId, requestorName
            requestorId: req.requestorId,
            requestorName: req.requestorName,
          }));
          return {
            requests: transformedRequests,
            totalCount: response.totalItems,
          };
        }
        return { requests: [], totalCount: 0 };
      },
      providesTags: (result, error, { type }) => {
        const listTag = {
          type: "BorrowRequest",
          id: `${type?.toUpperCase()}_LIST`,
        };
        if (result?.requests) {
          return [
            ...result.requests.map(({ id }) => ({ type: "BorrowRequest", id })),
            listTag,
          ];
        }
        return [listTag];
      },
    }),

    // --- Endpoint LẤY CHI TIẾT REQUEST theo ID ---
    getBorrowingRequestById: builder.query({
      query: (requestId) => `/Borrowings/${requestId}`, // <<<=== SỬA PATH API
      // Xử lý response cho một request đơn lẻ
      transformResponse: (response) => {
        console.log("API Response (getBorrowingRequestById):", response);
        if (response && typeof response === "object" && response.id) {
          return {
            // Map các trường tương tự như trong getBorrowingRequests
            id: response.id,
            requestDate: response.dateRequested,
            status: response.status?.toLowerCase() || "unknown",
            dueDate: response.dueDate,
            dateProcessed: response.dateProcessed, // Giữ lại để dùng cho timeline
            rejectionReason: response.rejectionReason,
            requestorId: response.requestorId,
            requestorFullName: response.requestorFullName,
            requestorEmail: response.requestorEmail,
            approverId: response.approverId,
            approverFullName: response.approverFullName,
            // Map details -> books
            books: Array.isArray(response.details)
              ? response.details.map((detail) => ({
                //   id: detail.bookId,
                  id: detail.detailId,           // <<<=== Lấy detailId làm ID chính
                  bookId: detail.bookId, 
                  title: detail.bookTitle,
                  author: detail.author, // API này có author
                  coverImage: detail.coverImageUrl, // API này có coverImageUrl
                  returnedDate: detail.returnedDate, // Có ngày trả của từng cuốn
                  isExtended: detail.isExtended ?? false, // <<<=== LẤY isExtended
                  dueDate: detail.dueDate,         // <<<=== LẤY dueDate của sách này
                  originalDate: detail.originalDate 
                }))
              : [],
            // Suy ra các trường ngày hoàn thành từ status và dateProcessed/book return dates
            // (Logic này có thể cần chính xác hơn dựa vào nghiệp vụ)
            approvedDate:
              response.status?.toLowerCase() === "approved"
                ? response.dateProcessed
                : null,
            rejectedDate:
              response.status?.toLowerCase() === "rejected"
                ? response.dateProcessed
                : null,
            cancelledDate:
              response.status?.toLowerCase() === "cancelled"
                ? response.dateProcessed
                : null,
            // Tính returnedDate tổng dựa trên tất cả sách đã trả? Hoặc dùng dateProcessed nếu status là Returned
            returnedDate:
              response.status?.toLowerCase() === "returned"
                ? response.dateProcessed
                : null,
          };
        }
        return null; // Trả về null nếu không tìm thấy
      },
      providesTags: (result, error, id) => [{ type: "BorrowRequest", id }],
    }),

    // --- Endpoint HỦY YÊU CẦU (Mutation) ---
    cancelBorrowingRequest: builder.mutation({
      query: (requestId) => ({
        url: `/Borrowings/${requestId}/cancel`, // <<<=== Sửa path API hủy request
        method: "PUT", // Hoặc PUT/PATCH/DELETE tùy backend
      }),
      // Làm mới request cụ thể đó và danh sách active
      invalidatesTags: (result, error, requestId) => [
        { type: "BorrowRequest", id: requestId },
        { type: "BorrowRequest", id: "ACTIVE_LIST" },
      ],
    }),

    getAllBorrowingRequests: builder.query({
      // args: { page, pageSize, statusFilters, sorter, ... }
      query: ({
        page = 1,
        pageSize = 10,
        statusFilters = null,
        sortBy = "DateRequested", // Mặc định sortBy
        sortOrder = "desc",
      }) => {
        const params = new URLSearchParams({
          Page: page.toString(),
          PageSize: pageSize.toString(),
        });

        params.append("SortBy", sortBy);
        params.append("SortOrder", sortOrder);

        // Xử lý Statuses Filter
        if (Array.isArray(statusFilters) && statusFilters.length > 0) {
          statusFilters.forEach((status) => params.append("Statuses", status)); // !!! VALUE status phải khớp backend
        }
        // Nếu không filter status, không gửi param Statuses, backend sẽ trả về tất cả

        // Thêm filter khác nếu cần (ví dụ: UserId, SearchTerm...)

        console.log(
          "[Admin - getAllBorrowingRequests] Query Params:",
          params.toString()
        );
        return `/Borrowings?${params.toString()}`; // <<<=== KIỂM TRA LẠI PATH API NÀY
      },
      // *** transformResponse ĐẦY ĐỦ ***
      transformResponse: (response) => {
        console.log("API Response Raw (getAllBorrowingRequests):", response);
        const defaultValue = { requests: [], totalCount: 0 };

        if (
          !response ||
          !Array.isArray(response.items) ||
          typeof response.totalItems !== "number"
        ) {
          console.warn(
            "[transformResponse] Received unexpected API structure:",
            response
          );
          return defaultValue;
        }

        try {
          const transformedRequests = response.items
            .map((req) => {
              if (!req || typeof req !== "object") return null;

              const lowerStatus = req.status?.toLowerCase() || "unknown";

              // Map mảng 'details' thành 'books'
              const mappedBooks = Array.isArray(req.details)
                ? req.details
                    .map((detail) => {
                      if (!detail || typeof detail !== "object") return null;
                      return {
                        id: detail.bookId, // bookId -> id
                        title: detail.bookTitle, // bookTitle -> title
                        author: detail.author, // Giữ nguyên author
                        coverImage: detail.coverImageUrl, // coverImageUrl -> coverImage
                        returnedDate: detail.returnedDate, // Giữ lại ngày trả từng cuốn
                      };
                    })
                    .filter(Boolean) // Lọc bỏ các book null nếu có detail lỗi
                : [];

                console.log("[transformResponse] Mapped Books:", mappedBooks);
                

              // Tạo object request đã được biến đổi
              const transformedReq = {
                id: req.id,
                requestDate: req.dateRequested, // Map tên trường
                status: lowerStatus, // Dùng status lowercase
                dueDate: req.dueDate, // Giữ nguyên
                dateProcessed: req.dateProcessed, // Giữ lại ngày xử lý gốc
                rejectionReason: req.rejectionReason,
                requestorId: req.requestorId,
                requestorName: req.requestorName, // Map tên trường
                requestorEmail: req.requestorEmail, // Giữ nguyên
                approverId: req.approverId,
                approverFullName: req.approverFullName, // Map tên trường
                books: mappedBooks, // Dùng mảng books đã map

                // Suy ra các trường ngày hoàn thành từ status và dateProcessed
                approvedDate:
                  lowerStatus === "approved" || lowerStatus === "returned"
                    ? req.dateProcessed
                    : null,
                rejectedDate:
                  lowerStatus === "rejected" ? req.dateProcessed : null,
                cancelledDate:
                  lowerStatus === "cancelled" ? req.dateProcessed : null,
                returnedDate:
                  lowerStatus === "returned" ? req.dateProcessed : null,
              };
              return transformedReq;
            })
            .filter(Boolean); // Lọc bỏ các request null nếu có item lỗi

          console.log("[transformResponse] Transformed Data:", {
            requests: transformedRequests,
            totalCount: response.totalItems,
          });
          return {
            requests: transformedRequests,
            totalCount: response.totalItems,
          };
        } catch (error) {
          console.error(
            "[transformResponse] Error processing response:",
            error
          );
          return defaultValue;
        }
      },
      // Cung cấp tag riêng cho danh sách admin
      providesTags: (result, error, arg) => {
        const listTag = { type: "BorrowRequest", id: "ADMIN_LIST" };
        if (result?.requests) {
          return [
            ...result.requests.map(({ id }) => ({ type: "BorrowRequest", id })),
            listTag,
          ];
        }
        return [listTag];
      },
    }),

    // --- Endpoint DUYỆT Request (Mutation) ---
    approveBorrowingRequest: builder.mutation({
      query: (requestId) => ({
        url: `/Borrowings/${requestId}/approve`, // <<<=== Path API Approve
        method: "PUT", // Hoặc PUT tùy backend
        // Có thể cần body nếu API yêu cầu (vd: đặt dueDate)
        // body: { customDueDate: ... }
      }),
      // Invalidate request cụ thể và các danh sách liên quan
      invalidatesTags: (result, error, requestId) => [
        { type: "BorrowRequest", id: requestId },
        { type: "BorrowRequest", id: "ADMIN_LIST" },
        { type: "BorrowRequest", id: "ACTIVE_LIST" }, // Cả list của user nếu cần
      ],
    }),

    // --- Endpoint TỪ CHỐI Request (Mutation) ---
    rejectBorrowingRequest: builder.mutation({
      // Nhận object chứa requestId và reason
      query: ({ requestId, reason }) => ({
        url: `/Borrowings/${requestId}/reject`, // <<<=== Path API Reject
        method: "PUT", // Hoặc PUT
        body: { reason }, // <<<=== Gửi reason trong body
      }),
      // Invalidate tương tự approve
      invalidatesTags: (result, error, { requestId }) => [
        { type: "BorrowRequest", id: requestId },
        { type: "BorrowRequest", id: "ADMIN_LIST" },
        { type: "BorrowRequest", id: "ACTIVE_LIST" },
      ],
    }),

    // --- Endpoint Gia hạn (Mutation) ---
    extendBorrowingRequest: builder.mutation({
        // Query function giờ nhận borrowingDetailId
       query: (args) => ({ // <<<=== Nhận ID của dòng chi tiết mượn
            // !!! URL và Method khớp với backend !!!
            url: `/Borrowings/details/${args.borrowingDetailId}/extend`, // <<<=== SỬA URL
            method: 'PUT', // <<<=== SỬA METHOD
            // Body có thể rỗng cho PUT dạng này
        }),
         // Invalidate request chứa chi tiết này và các list liên quan
         // Cần requestId để invalidate đúng request cha và list
         // => Cần truyền cả requestId và borrowingDetailId vào hook hoặc lấy requestId từ state
         // Tạm thời chỉ invalidate theo borrowingDetailId (nếu có tag riêng) và các list chung
         // Cách tốt hơn là invalidatesTags nhận thêm đối số thứ 3 là argument gốc { borrowingDetailId, requestId }
         invalidatesTags: (result, error, { requestId }) => [
            { type: 'BorrowRequest', id: requestId }, // <<<=== Invalidate request cụ thể
            { type: 'BorrowRequest', id: 'ACTIVE_LIST' },
            { type: 'BorrowRequest', id: 'ADMIN_LIST' }
        ],
   }),
  }),
});

// Export hooks
export const {
  useGetBorrowingRequestsQuery,
  useGetBorrowingRequestByIdQuery,
  useCancelBorrowingRequestMutation,
  useExtendBorrowingRequestMutation,
  useGetAllBorrowingRequestsQuery, // <<<=== Hook lấy TẤT CẢ requests
  useApproveBorrowingRequestMutation, // <<<=== Hook Approve
  useRejectBorrowingRequestMutation,
} = requestApiSlice; // Đặt tên slice phù hợp
