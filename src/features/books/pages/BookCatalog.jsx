// src/features/books/pages/BookCatalog.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Input,
  Card,
  Select,
  Empty,
  Pagination,
  Spin,
  Skeleton,
  Tag,
  Badge,
  Rate,
  Row,
  Col,
  Button,
  App,
  Modal,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  ReadOutlined,
  AppstoreOutlined,
  ExclamationCircleFilled,
  SortAscendingOutlined,
  SortDescendingOutlined, // Icons for Sort Order (Optional)
} from "@ant-design/icons";
import { useCart } from "../../../contexts/CartContext"; // Adjust path if needed
import { UseAuth } from "../../../contexts/AuthContext"; // Adjust path if needed
import { PATHS } from "../../../routes/routePaths"; // Adjust path if needed

// --- Import RTK Query Hooks ---
import { useGetCategoriesQuery, useGetBooksQuery } from "../api/bookApiSlice"; // <<<=== IMPORT HOOKS

const { Meta } = Card;
const { Option } = Select;

// --- Component BookCatalog ---
const BookCatalog = () => {
  // State cho params filter/sort/page/order
  const [params, setParams] = useState({
    page: 1,
    pageSize: 12, // Số sách mỗi trang (khớp với API call)
    query: "", // Tương ứng SearchTerm backend
    categoryId: "all", // Tương ứng CategoryId backend (null khi là 'all')
    available: "all", // Tương ứng IsAvailable backend (null khi là 'all')
    sort: "title", // Tương ứng SortBy backend
    order: "asc", // Tương ứng SortOrder backend
  });

  // Hooks và Contexts
  const navigate = useNavigate();
  const { isAuthenticated } = UseAuth();
  const { cartItemCount, addToCart, isInCart } = useCart(); // Lấy cartItemCount để check giỏ đầy nếu cần
  const { modal: modalApi, message: messageApi } = App.useApp();

  // === Gọi RTK Query Hooks ===
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useGetCategoriesQuery();

  const {
    data: booksResponse, // Data trả về là { books: Book[], totalCount: number } từ transformResponse
    isLoading: isLoadingBooks, // True khi load lần đầu
    isFetching, // True khi đang fetch (cả lần đầu và fetch lại)
    isError: isBooksError, // Có lỗi khi fetch books không
    error: booksErrorData, // Thông tin lỗi chi tiết
  } = useGetBooksQuery(params); // <<<=== Truyền toàn bộ object params vào hook
  // ==========================

  // --- Xử lý data từ hooks ---
  const categories = useMemo(() => categoriesData || [], [categoriesData]);
  const displayedBooks = useMemo(
    () => booksResponse?.books || [],
    [booksResponse]
  );
  const totalBookCount = useMemo(
    () => booksResponse?.totalCount || 0,
    [booksResponse]
  );

  // Xác định trạng thái loading (cho lần tải đầu)
  const initialLoading = isLoadingCategories || isLoadingBooks;

  // --- Handlers ---
  // const handleParamChange = (key, value) => {
  //     const shouldResetPage = key !== "page";
  //     const shouldResetOrder = key === 'sort';
  //     setParams((prevParams) => ({
  //         ...prevParams,
  //         [key]: value,
  //         ...(shouldResetPage && { page: 1 }),
  //         ...(shouldResetOrder && { order: 'asc' }),
  //     }));
  //     // Không cần gọi API lại ở đây, RTK Query hook sẽ tự làm
  // };
  const handleParamChange = useCallback((key, value) => {
    const shouldResetPage = key !== "page";
    const shouldResetOrder = key === "sort";
    setParams((prevParams) => {
      // Chỉ cập nhật nếu giá trị mới thực sự khác giá trị cũ (tối ưu nhỏ)
      if (prevParams[key] === value && key !== "page") return prevParams;

      return {
        ...prevParams,
        [key]: value,
        ...(shouldResetPage && { page: 1 }),
        ...(shouldResetOrder && { order: "asc" }),
      };
    });
  }, []); // useCallback vì handleParamChange không phụ thuộc vào gì ngoài setParams (stable)


  const [inputValue, setInputValue] = useState('');
  // *** useEffect ĐỂ IMPLEMENT DEBOUNCE CHO SEARCH ***
  useEffect(() => {
    // console.log(`Input value changed: "${inputValue}"`);
    // Đặt một timer. Sau 1000ms (1 giây), nó sẽ cập nhật params.query
    const timerId = setTimeout(() => {
      // Chỉ gọi cập nhật nếu giá trị input khác với query hiện tại trong params
      // để tránh gọi lại khi không cần thiết (ví dụ: khi component re-render)
      if (inputValue !== params.query) {
        console.log(
          `Debounce Timer Fired! Updating query param to: "${inputValue}"`
        );
        handleParamChange("query", inputValue); // Cập nhật query param -> trigger RTK fetch
      }
    }, 600); // Độ trễ 1 giây

    // Cleanup function: Rất quan trọng!
    // Nó sẽ chạy mỗi khi inputValue thay đổi *trước khi* effect mới chạy,
    // hoặc khi component unmount.
    return () => {
      // console.log(`Clearing timeout for: "${inputValue}"`);
      clearTimeout(timerId); // Hủy bỏ timer cũ
    };
  }, [inputValue, params.query, handleParamChange]); // Chạy lại effect khi inputValue thay đổi
  // Thêm params.query và handleParamChange vào dependency để đảm bảo logic đúng và ESLint không báo lỗi

  // Các handler cụ thể
  const handleSearch = (value) => {
    handleParamChange("query", value);
  };
  const handleCategoryChange = (value) => {
    handleParamChange("categoryId", value);
  };
  const handleAvailabilityChange = (value) => {
    handleParamChange("available", value);
  };
  const handleSortChange = (value) => {
    handleParamChange("sort", value);
  };
  const handleOrderChange = (value) => {
    handleParamChange("order", value);
  };
  const handlePageChange = (page, pageSize) => {
    handleParamChange("page", page);
  };

  // Handler cho modal login (giữ nguyên)
  const showLoginRequiredModal = (
    actionDescription = "perform this action"
  ) => {
    modalApi.confirm({
      title: "Login Required",
      icon: <ExclamationCircleFilled />,
      content: `You need to be logged in to ${actionDescription}. Do you want to go to the login page?`,
      okText: "Login",
      cancelText: "Cancel",
      onOk: () => navigate(PATHS.LOGIN),
    });
  };

  // Handler cho nút Cart chính (giữ nguyên)
  const handleCartButtonClick = () => {
    if (isAuthenticated) {
      navigate(PATHS.BORROWING_CART);
    } else {
      showLoginRequiredModal("view your borrowing cart");
    }
  };

  // Handler cho nút Borrow trên Card (giữ nguyên)
  const handleBorrowButtonClick = (book) => {
    if (!book) return; // Check an toàn
    if (isAuthenticated) {
      // Gọi addToCart từ context (đã có xử lý message, giới hạn bên trong)
      addToCart(book);
    } else {
      showLoginRequiredModal(`add "${book.title}" to the cart`);
    }
  };

  // --- Render ---
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {" "}
      {/* Thêm padding chung */}
      {/* Phần Header và Bộ lọc */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center whitespace-nowrap">
            <AppstoreOutlined className="mr-2 text-primary" />
            Book Catalog
          </h1>
          <Badge count={cartItemCount} showZero>
            {" "}
            {/* Dùng cartItemCount từ context */}
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="large"
              className="flex items-center"
              onClick={handleCartButtonClick}
            >
              Borrowing Cart
            </Button>
          </Badge>
        </div>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {" "}
          {/* Responsive grid */}
          <div className="sm:col-span-2">
            {" "}
            {/* Search chiếm 2 cột trên sm+ */}
            <Input
              placeholder="Search books, authors..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              // Cân nhắc dùng debounce hoặc search khi nhấn Enter/Button
              // onChange={(e) => handleSearch(e.target.value)}
              size="large"
              // value={params.query} // Controlled component
              onChange={(e) => setInputValue(e.target.value)}
              // Giá trị của Input được điều khiển bởi inputValue
              value={inputValue}
              
            />
          </div>
          <div>
            <Select
              placeholder="Category"
              onChange={handleCategoryChange}
              allowClear
              className="w-full"
              size="large"
              value={params.categoryId}
              loading={isLoadingCategories} // Loading icon khi đang fetch categories
            >
              <Option value="all">All Categories</Option>
              {categories.map((category) => (
                <Option key={category.id} value={category.id.toString()}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              placeholder="Status"
              onChange={handleAvailabilityChange}
              className="w-full"
              size="large"
              value={params.available}
            >
              <Option value="all">All</Option>
              <Option value="available">Available</Option>
              <Option value="unavailable">Borrowed</Option>
            </Select>
          </div>
        </div>
        {/* Sort & Count & Order */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select
              onChange={handleSortChange}
              className="w-36 sm:w-40"
              value={params.sort}
              size="middle"
            >
              <Option value="title">Title</Option>
              <Option value="author">Author</Option>
              <Option value="rating">Rating</Option>
              <Option value="year">Year</Option>
              <Option value="ratingCount">Rating Count</Option>
              {/* Giả sử backend hỗ trợ sort theo ID giảm dần là 'id' + order 'desc' */}
              <Option value="id">Newest</Option>
            </Select>
            <span className="text-sm text-gray-600 ml-1 sm:ml-2">Order:</span>
            <Select
              onChange={handleOrderChange}
              className="w-28 sm:w-32"
              value={params.order}
              size="middle"
            >
              <Option value="asc">Ascending</Option>
              <Option value="desc">Descending</Option>
            </Select>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            {/* Hiển thị Spin khi đang fetch lại dữ liệu */}
            {isFetching && <Spin size="small" />}
            {/* Chỉ hiển thị số lượng khi không loading lần đầu */}
            {!initialLoading && `Found ${totalBookCount} books`}
          </div>
        </div>
      </div>
      {/* Danh sách sách */}
      {initialLoading ? (
        // Skeleton loading cho lần tải đầu
        <Row gutter={[16, 24]}>
          {Array.from({ length: params.pageSize }).map((_, index) => (
            <Col xs={12} sm={12} md={8} lg={6} key={index}>
              <Card>
                {" "}
                <Skeleton active avatar paragraph={{ rows: 2 }} />{" "}
              </Card>
            </Col>
          ))}
        </Row>
      ) : isBooksError ? (
        // Hiển thị lỗi
        <div className="text-center py-12">
          <Empty description="Failed to load books. Please try again." />
          {/* Optional: Show error details for debugging */}
          {/* <pre className="text-xs text-red-500 mt-2">{JSON.stringify(booksErrorData, null, 2)}</pre> */}
        </div>
      ) : totalBookCount === 0 ? (
        // Hiển thị khi không có sách nào khớp
        <Empty description="No books found matching your criteria." />
      ) : (
        // Hiển thị danh sách sách và phân trang
        <>
          <Row gutter={[16, 24]} className="mb-6">
            {/* Lặp qua displayedBooks lấy từ hook */}
            {displayedBooks.map((book) => {
              const isBookInCart = isInCart(book?.id);
              const isCartFull = cartItemCount >= 5; // Check giỏ đầy
              const isBorrowDisabled =
                !book?.available || isBookInCart || isCartFull;

              let borrowButtonTitle = "Add to borrowing cart";
              if (!book?.available)
                borrowButtonTitle = "Book is currently borrowed";
              else if (isBookInCart)
                borrowButtonTitle = "Book is already in the cart";
              else if (isCartFull)
                borrowButtonTitle = "Borrowing cart is full (max 5)";

              return (
                <Col
                  xs={12}
                  sm={12}
                  md={8}
                  lg={6}
                  key={book.id}
                  className="mb-4"
                >
                  <Badge.Ribbon
                    text={book.available ? "Available" : "Borrowed"}
                    color={book.available ? "green" : "red"}
                  >
                    <Card
                      hoverable
                      className="h-full flex flex-col book-card overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                      cover={
                        <div className="h-56 overflow-hidden p-4 bg-gray-100">
                          <Link
                            to={PATHS.BOOK_DETAIL.replace(":bookId", book.id)}
                          >
                            <img
                              alt={book.title}
                              src={book.coverImage || "/placeholder-book.png"}
                              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                            />
                          </Link>
                        </div>
                      }
                      actions={[
                        <Link
                          to={PATHS.BOOK_DETAIL.replace(":bookId", book.id)}
                          key="details"
                          title="View Details"
                        >
                          <ReadOutlined /> Details
                        </Link>,
                        <Button
                          type="link"
                          key="borrow"
                          icon={<ShoppingCartOutlined />}
                          disabled={isBorrowDisabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBorrowButtonClick(book);
                          }}
                          title={borrowButtonTitle}
                        >
                          {isBookInCart ? "Added" : "Borrow"}
                        </Button>,
                      ]}
                    >
                      <Meta
                        title={
                          <Link
                            to={PATHS.BOOK_DETAIL.replace(":bookId", book.id)}
                            className="hover:text-primary transition-colors duration-200 text-base font-semibold"
                          >
                            {book.title || "No Title"}
                          </Link>
                        }
                        description={
                          <>
                            <p className="text-gray-600 mb-1 text-sm truncate">
                              {book.author || "Unknown Author"}
                            </p>{" "}
                            {/* Thêm truncate */}
                            <div className="flex items-center flex-wrap mb-1 text-xs">
                              <Rate
                                allowHalf
                                disabled
                                value={parseFloat(book.rating)}
                                style={{
                                  fontSize: "0.8rem",
                                  marginRight: "4px",
                                }}
                              />{" "}
                              {/* Dùng value */}
                              <span className="text-yellow-500 font-semibold mr-1">
                                {book.rating?.toFixed(1)}
                              </span>
                              {/* Thêm kiểm tra ratingCount > 0 */}
                              {book.ratingCount > 0 && (
                                <span className="text-gray-500 ml-1">
                                  ({book.ratingCount} reviews)
                                </span>
                              )}
                            </div>
                            {/* Thêm kiểm tra category */}
                            {book.category && (
                              <Tag color="blue" className="mt-1">
                                {book.category}
                              </Tag>
                            )}
                            {/* Hiển thị copies */}
                            {book.available &&
                              typeof book.copies === "number" && (
                                <Tag color="geekblue" className="mt-1 ml-1">
                                  Copies: {book.copies}
                                </Tag>
                              )}
                          </>
                        }
                      />
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>

          {/* Phân trang */}
          {totalBookCount > params.pageSize && ( // Chỉ hiển thị nếu tổng số sách lớn hơn số sách trên 1 trang
            <div className="flex justify-center my-6">
              <Pagination
                current={params.page}
                pageSize={params.pageSize}
                total={totalBookCount} // Lấy tổng số từ hook response
                onChange={handlePageChange}
                showSizeChanger={false} // Ẩn nếu không muốn đổi PageSize
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} books`
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookCatalog;
