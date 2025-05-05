// src/features/books/api/bookApiSlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
// Import baseQuery đã cấu hình (có thể từ authApiSlice hoặc định nghĩa riêng)
// Đảm bảo baseQuery này có prepareHeaders nếu cần token để gọi API lấy sách/danh mục
// Ví dụ import từ authApiSlice (nếu bạn muốn dùng chung và có xử lý re-auth nếu cần)
// import { baseQueryWithReauth as baseQuery } from '../../auth/api/authApiSlice';

// Hoặc định nghĩa một baseQuery mới/đơn giản hơn nếu không cần phức tạp như auth
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { jwtDecode } from "jwt-decode";

export const baseQuery = fetchBaseQuery({
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
    // getBooks: builder.query({
    //   query: ({ categoryId = null, page = 1, pageSize = 8 } = {}) => {
    //       const params = new URLSearchParams({
    //           page: page.toString(),
    //           pageSize: pageSize.toString(),
    //       });
    //       if (categoryId) {
    //           params.append('categoryId', categoryId);
    //       }
    //       // params.append('isFeatured', 'true'); // Thêm nếu cần
    //       return `/Books?${params.toString()}`; // <<<=== Path API lấy books
    //   },
    getBooks: builder.query({
      query: ({
        query = "",
        categoryId = "all",
        available = "all",
        sort = "title", // Mặc định title ở frontend
        order = "asc", // Mặc định asc ở frontend
        page = 1,
        pageSize = 12, // PageSize Catalog có thể khác HomePage
      } = {}) => {
        const params = new URLSearchParams();
        params.append("Page", page.toString()); // <-- Backend dùng 'Page' (viết hoa)
        params.append("PageSize", pageSize.toString()); // <-- Backend dùng 'PageSize'

        // *** SỬA TÊN PARAM THÀNH SearchTerm ***
        if (query) {
          params.append("SearchTerm", query); // <<<=== SỬA Ở ĐÂY
        }
        // Giữ nguyên logic CategoryId
        if (categoryId && categoryId !== "all") {
          params.append("CategoryId", categoryId);
        }
        // Giữ nguyên logic IsAvailable
        if (available && available !== "all") {
          params.append("IsAvailable", (available === "available").toString());
        }
        // *** Gửi SortBy và SortOrder trực tiếp ***
        // Giả định backend có thể xử lý các giá trị sort từ frontend
        // Nếu backend yêu cầu tên cụ thể như "AverageRating", bạn cần thêm mapping ở đây
        if (sort) {
          // Nếu frontend gửi 'createdAt', backend có thể cần map sang tên cột DB thực tế
          params.append("SortBy", sort); // <<<=== SỬA Ở ĐÂY (Gửi thẳng giá trị sort)
        }
        if (order) {
          params.append("SortOrder", order); // <<<=== SỬA Ở ĐÂY (Gửi thẳng giá trị order)
        }

        console.log("[getBooks Query Params]:", params.toString());
        return `/Books?${params.toString()}`; // <<<=== Path API books
      },
      // *** Thêm transformResponse để xử lý cấu trúc JSON mới ***
      transformResponse: (response) => {
        // console.log("API Response (getBooks):", response); // Log để kiểm tra cấu trúc gốc
        // // Kiểm tra xem response có đúng dạng và có thuộc tính 'items' là mảng không
        // if (response && Array.isArray(response.items)) {
        //   // Trích xuất và chuyển đổi dữ liệu sách nếu cần
        //   const transformedBooks = response.items.map((book) => ({
        //     ...book, // Giữ lại các trường gốc
        //     // Đổi tên coverImageUrl thành coverImage
        //     coverImage: book.coverImageUrl,
        //     // Đổi tên publicationYear thành year (nếu component dùng year)
        //     year: book.publicationYear,
        //     // Xóa các trường gốc đã đổi tên nếu muốn (tùy chọn)
        //     // coverImageUrl: undefined,
        //     // publicationYear: undefined,
        //   }));
        //   console.log("Transformed Books:", transformedBooks);
        //   return transformedBooks; // Chỉ trả về mảng sách đã xử lý
        // }
        // // Nếu cấu trúc không đúng, trả về mảng rỗng để tránh lỗi component
        // console.warn(
        //   "Received unexpected structure from /Books API:",
        //   response
        // );
        // return [];

        if (
          response &&
          Array.isArray(response.items) &&
          typeof response.totalItems === "number"
        ) {
          const transformedBooks = response.items.map((book) => ({
            ...book,
            coverImage: book.coverImageUrl,
            year: book.publicationYear,
          }));
          return { books: transformedBooks, totalCount: response.totalItems };
        }
        return { books: [], totalCount: 0 };
      },
      // Cập nhật providesTags nếu cần (vẫn hoạt động với mảng trả về)
      providesTags: (result, error, arg) =>
        result?.books
          ? [
              ...result.books.map(({ id }) => ({ type: "Book", id })),
              { type: "Book", id: "LIST" },
            ]
          : [{ type: "Book", id: "LIST" }],
    }),

    getBookById: builder.query({
      query: (bookId) => `/Books/${bookId}`, // Path API chi tiết sách
      // *** Xử lý response từ /Books/{id} ***
      transformResponse: (response) => {
        console.log("API Response (getBookById):", response);
        if (response && typeof response === "object" && response.id) {
          // Suy ra 'available' và map các trường cần thiết
          const transformedBook = {
            ...response,
            // Các trường component đang dùng:
            coverImage: response.coverImageUrl,
            rating: response.averageRating, // Map từ averageRating
            ratingCount: response.ratingCount, // Giữ nguyên
            available: response.availableQuantity > 0, // Suy ra từ availableQuantity
            copies: response.availableQuantity, // copies là số lượng còn lại
            year: response.publicationYear, // Map từ publicationYear
            // Giữ lại các trường khác component cần: id, title, author, category, categoryId, isbn, publisher, description, pages, language...
            // Xóa các trường không dùng hoặc đã đổi tên nếu muốn
          };
          //   delete transformedBook.coverImageUrl;
          // delete transformedBook.averageRating;
          // delete transformedBook.publicationYear;
          // delete transformedBook.availableQuantity;
          // delete transformedBook.totalQuantity;
          console.log("Transformed Book (Detail):", transformedBook);
          return transformedBook; // Trả về object sách đã xử lý
        }
        console.warn(
          "Received unexpected structure or book not found from /Books/{id} API:",
          response
        );
        return null; // Trả về null nếu không tìm thấy hoặc lỗi
      },
      providesTags: (result, error, id) => [{ type: "Book", id }],
    }),

    // --- Endpoint MỚI để LẤY REVIEWS cho sách ---
    getBookReviews: builder.query({
      // Nhận bookId và các tham số phân trang (nếu cần)
      query: (
        { bookId, page = 1, pageSize = 10 } // Mặc định lấy 10 review trang 1
      ) => `/book-ratings/book/${bookId}?page=${page}&pageSize=${pageSize}`, // <<<=== Path API lấy reviews
      // *** Xử lý response JSON có cấu trúc { items: [...], totalItems: ... } ***
      transformResponse: (response) => {
        console.log("API Response (getBookReviews):", response);
        if (response && Array.isArray(response.items)) {
          const transformedReviews = response.items.map((review) => ({
            // Map các trường từ API review sang tên component đang dùng
            id: review.id,
            author: review.userFullName, // userFullName -> author
            avatar: null, // API không có avatar, trả về null
            content: review.comment, // comment -> content
            rating: review.starRating, // starRating -> rating
            datetime: review.ratingDate, // ratingDate -> datetime
          }));
          console.log("Transformed Reviews:", transformedReviews);
          return {
            reviews: transformedReviews,
            totalItems: response.totalItems ?? response.items.length, // Lấy totalItems hoặc length nếu API không trả về
            // Thêm các thông tin phân trang khác nếu cần
          };
        }
        console.warn(
          "Received unexpected structure from /book-ratings API:",
          response
        );
        return { reviews: [], totalItems: 0 }; // Trả về mặc định
      },
      // Cung cấp tag để có thể invalidate khi có review mới hoặc liên kết với sách
      providesTags: (result, error, { bookId }) => [
        // Tag chung cho danh sách review của sách này (có thể thêm page nếu phân trang)
        { type: "Review", id: `LIST-BOOK-${bookId}` },
        // Liên kết với tag của sách để nếu sách bị xóa/cập nhật thì review cũng mất cache
        { type: "Book", id: bookId },
      ],
    }),

    // --- Endpoint GỬI REVIEW (Sửa lại) ---
    addReview: builder.mutation({
      query: ({ bookId, rating, comment }) => ({
        url: `/book-ratings`, // <<<=== Path API tạo review (ví dụ)
        method: "POST",
        body: {
          bookId: bookId,
          // !!! Đảm bảo tên trường khớp với backend yêu cầu !!!
          starRating: rating, // Frontend dùng `rating`, map sang `starRating`
          comment: comment, // Frontend dùng `comment`, API cũng dùng `comment`
        },
      }),
      // Làm mất hiệu lực cache của danh sách review cho sách này
      // và cache của chính sách đó (để cập nhật ratingCount/averageRating)
      invalidatesTags: (result, error, { bookId }) => [
        { type: "Review", id: `LIST-BOOK-${bookId}` },
        { type: "Book", id: bookId }, // Invalidate sách để load lại rating/count
      ],
    }),

    submitBorrowRequest: builder.mutation({
      query: ({ bookIds }) => ({
        // Chỉ cần bookIds
        url: "/Borrowings", // <<<=== Sửa path API tạo request
        method: "POST",
        body: {
          // !!! Backend yêu cầu bookIds !!!
          bookIds: bookIds,
          // Không gửi note
        },
      }),
      // Invalidate danh sách request đang chờ của user (nếu có endpoint đó)
      invalidatesTags: [{ type: "BorrowRequest", id: "ACTIVE_LIST" }],
    }),

    addBook: builder.mutation({
      // newBookData từ component sẽ chứa các giá trị form
      query: (newBookData) => ({
        url: "/Books", // <<<=== Path API POST sách
        method: "POST",
        // *** Body khớp với cấu trúc API yêu cầu ***
        body: {
          title: newBookData.title,
          author: newBookData.author,
          isbn: newBookData.isbn,
          publisher: newBookData.publisher,
          // Chuyển đổi năm sang số nếu cần và API yêu cầu số
          publicationYear: newBookData.publicationYear
            ? parseInt(newBookData.publicationYear, 10)
            : null,
          description: newBookData.description,
          // Xử lý coverImageUrl: cần lấy URL sau khi upload, tạm thời gửi null hoặc string rỗng
          coverImageUrl: newBookData.coverImageUrl || null, // Hoặc lấy từ logic upload file
          categoryID: newBookData.categoryId, // Map từ categoryId của form
          // Lấy totalQuantity từ form (component cần thêm field này)
          totalQuantity: newBookData.totalQuantity
            ? parseInt(newBookData.totalQuantity, 10)
            : 0, // Mặc định là 0 nếu không nhập
        },
      }),
      // Làm mới danh sách sách sau khi thêm
      invalidatesTags: [{ type: "Book", id: "LIST" }],
    }),

    // --- Update Existing Book (CẬP NHẬT) ---
    updateBook: builder.mutation({
      // Nhận object { id, ...updatedData } từ component
      query: ({ id, ...updatedData }) => ({
        url: `/Books/${id}`, // <<<=== Path API PUT sách
        method: "PUT",
        // *** Body khớp với cấu trúc API yêu cầu ***
        body: {
          title: updatedData.title,
          author: updatedData.author,
          isbn: updatedData.isbn,
          publisher: updatedData.publisher,
          publicationYear: updatedData.publicationYear
            ? parseInt(updatedData.publicationYear, 10)
            : null,
          description: updatedData.description,
          coverImageUrl: updatedData.coverImageUrl || null, // Xử lý cover image URL
          categoryID: updatedData.categoryId, // Map từ categoryId
          totalQuantity: updatedData.totalQuantity
            ? parseInt(updatedData.totalQuantity, 10)
            : 0, // Lấy totalQuantity
        },
      }),
      // Làm mới danh sách và cache của sách cụ thể này
      invalidatesTags: (result, error, { id }) => [
        { type: "Book", id: "LIST" },
        { type: "Book", id },
      ],
    }),

    // --- Delete Book (CẬP NHẬT) ---
    deleteBook: builder.mutation({
      // Nhận id của sách cần xóa
      query: (id) => ({
        url: `/Books/${id}`, // <<<=== Path API DELETE sách
        method: "DELETE",
        // Không cần body
      }),
      // Làm mới danh sách và xóa cache của sách cụ thể này
      // Lưu ý: invalidatesTags không tự xóa item khỏi cache, nó chỉ đánh dấu là cũ
      // để lần gọi getBooks/getBookById tiếp theo sẽ fetch lại.
      // RTK Query sẽ tự động xóa item khỏi cache nếu query getBookById(id) bị unsubscribe.
      // Nếu muốn xóa ngay lập tức khỏi list trên UI mà không cần fetch lại list, cần xử lý phức tạp hơn bằng `onQueryStarted` và `updateQueryData`.
      // Cách đơn giản là để invalidateTags làm mới LIST.
      invalidatesTags: (result, error, id) => [
        { type: "Book", id: "LIST" },
        { type: "Book", id },
      ],
    }),
    // ... các endpoints khác ...
  }),
});

export const {
  useGetCategoriesQuery,
  useGetBooksQuery,
  useGetBookByIdQuery,
  useGetBookReviewsQuery,
  useAddReviewMutation,
  useSubmitBorrowRequestMutation,
  useAddBookMutation, // <<<=== Hook thêm sách
  useUpdateBookMutation, // <<<=== Hook sửa sách
  useDeleteBookMutation, // <<<=== Hook xóa sách
} = bookApiSlice;
