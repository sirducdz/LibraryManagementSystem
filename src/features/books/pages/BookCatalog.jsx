// Đổi tên file thành: src/features/books/pages/BookCatalog.jsx
import React, { useState, useEffect, useMemo } from "react"; // Thêm useMemo
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
  Modal, // <-- Giữ lại import Modal
} from "antd";
// Dùng Ant Design Icons cho nhất quán
import {
  SearchOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  ReadOutlined,
  AppstoreOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
// import { api } from '../../services/api'; // Tạm thời không dùng api thật
import { useCart } from "../contexts/CartContext"; // <-- Import useCart (Kiểm tra đường dẫn)
import { UseAuth } from "../contexts/AuthContext";
import { PATHS } from "../routes/routePaths"; // <-- Sử dụng PATHS

const { Meta } = Card;
const { Option } = Select;

// --- Component BookCatalog ---
const BookCatalog = () => {
  // <-- Đổi tên component
  // --- State ---
  const [allBooks, setAllBooks] = useState([]); // Lưu trữ toàn bộ sách mock
  const [categories, setCategories] = useState([]); // Danh mục mock
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({
    page: 1,
    pageSize: 12, // Số sách mỗi trang
    query: "",
    categoryId: "all", // Dùng 'all' thay vì undefined cho dễ xử lý filter
    available: "all", // Dùng 'all', 'available', 'unavailable'
    sort: "title",
  });
  // !!! Bỏ state cartItems cục bộ !!!
  // const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated } = UseAuth(); // <-- Lấy trạng thái đăng nhập
  const navigate = useNavigate(); // <-- Hook để điều hướng
  // --- Lấy từ CartContext ---
  const { cartItems, addToCart, isInCart } = useCart(); // Lấy state và hàm từ context
  const { message: messageApi, notification, modal } = App.useApp(); // Lấy modal từ đây

  // --- Giả lập Fetch dữ liệu Mock ---
  useEffect(() => {
    // Fetch Categories Mock
    const mockCategories = [
      { id: 1, name: "Fiction" }, // <-- English UI Text
      { id: 2, name: "Science" }, // <-- English UI Text
      { id: 3, name: "History" }, // <-- English UI Text
      { id: 4, name: "Psychology" }, // <-- English UI Text
      { id: 5, name: "Economics" }, // <-- English UI Text
    ];
    setCategories(mockCategories);

    // Fetch Books Mock
    setLoading(true);
    setTimeout(() => {
      const mockBooks = Array(55) // Tạo nhiều sách hơn để test pagination
        .fill()
        .map((_, index) => ({
          id: index + 1,
          title: `Book ${index + 1} about Programming ${String.fromCharCode( // <-- English UI Text
            65 + (index % 26)
          )}`,
          author: `Author ${(index % 7) + 1}`, // <-- English UI Text
          category: mockCategories[index % mockCategories.length].name, // Lấy tên tiếng Anh đã đổi
          categoryId: mockCategories[index % mockCategories.length].id,
          rating: (Math.random() * 3 + 2).toFixed(1),
          ratingCount: Math.floor(Math.random() * 250) + 5,
          available: index % 4 !== 0, // Cứ 4 cuốn thì 1 cuốn hết
          copies: index % 4 !== 0 ? Math.floor(Math.random() * 5 + 1) : 0, // Số lượng giả
          coverImage: `https://placehold.co/150x200/EDEDED/AAAAAA/png?text=Book+${ // Sử dụng placehold.co
            index + 1
          }`, // Ảnh placeholder
          description: `Short description about book ${index + 1}.`, // <-- English UI Text
          year: 2024 - (index % 10), // Năm giả
        }));
      setAllBooks(mockBooks);
      setLoading(false);
    }, 1000);
  }, []); // Chỉ chạy 1 lần

  // --- Logic Lọc, Sắp xếp, Phân trang phía Client ---
  const processedBooks = useMemo(() => {
    let filtered = [...allBooks];

    // 1. Lọc (Filter)
    if (params.query) {
      const lowerQuery = params.query.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(lowerQuery) ||
          book.author.toLowerCase().includes(lowerQuery)
      );
    }
    if (params.categoryId && params.categoryId !== "all") {
      filtered = filtered.filter(
        (book) => book.categoryId === parseInt(params.categoryId, 10)
      );
    }
    if (params.available && params.available !== "all") {
      const isAvailable = params.available === "available";
      filtered = filtered.filter((book) => book.available === isAvailable);
    }

    // 2. Sắp xếp (Sort)
    const sortField = params.sort;
    filtered.sort((a, b) => {
      if (sortField === "title" || sortField === "author") {
        return a[sortField].localeCompare(b[sortField]);
      }
      if (sortField === "rating") {
        // Sắp xếp rating giảm dần (cao nhất trước)
        return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      }
      if (sortField === "year") {
        // Sắp xếp năm giảm dần (mới nhất trước)
        return (b.year || 0) - (a.year || 0);
      }
      if (sortField === "createdAt_desc") {
        // Giả lập sort theo ID giảm dần (coi như mới nhất)
        return b.id - a.id;
      }
      // Thêm các trường hợp sort khác nếu cần
      return 0;
    });

    return filtered;
  }, [
    allBooks,
    params.query,
    params.categoryId,
    params.available,
    params.sort,
  ]); // Chạy lại khi dữ liệu hoặc bộ lọc/sắp xếp thay đổi

  // 3. Phân trang (Paginate) - Lấy slice cho trang hiện tại
  const paginatedBooks = useMemo(() => {
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    return processedBooks.slice(startIndex, endIndex);
  }, [processedBooks, params.page, params.pageSize]); // Chạy lại khi sách đã xử lý hoặc trang/kích thước trang thay đổi

  // --- Handlers ---
  const handleParamChange = (key, value) => {
    const shouldResetPage = key !== "page";
    setParams((prevParams) => ({
      ...prevParams,
      [key]: value,
      ...(shouldResetPage && { page: 1 }),
    }));
  };

  // Các handler cụ thể giữ nguyên, chỉ gọi handleParamChange
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
  const handlePageChange = (page) => {
    handleParamChange("page", page);
  };

  // --- Hàm hiển thị modal yêu cầu đăng nhập (Tái sử dụng) ---
  const showLoginRequiredModal = (actionDescription = "perform this action") => {
    console.log("User not logged in, showing confirmation modal.");
    modal.confirm({
      title: 'Login Required',
      icon: <ExclamationCircleFilled />,
      content: `You need to be logged in to ${actionDescription}. Do you want to go to the login page?`, // Mô tả hành động cụ thể hơn
      okText: 'Login',
      cancelText: 'Cancel',
      onOk() {
        console.log('OK confirmed, navigating to login.');
        navigate(PATHS.LOGIN);
      },
      onCancel() {
        console.log('Cancel confirmed, staying on page.');
      },
    });
  }

  // Xử lý nút Giỏ hàng chính
  const handleCartButtonClick = () => {
    if (isAuthenticated) {
      console.log("User logged in, navigating to cart.");
      navigate(PATHS.BORROWING_CART); // <-- Sử dụng PATHS
    } else {
      showLoginRequiredModal('view your borrowing cart'); // Gọi hàm tái sử dụng
    }
  };

  // Sử dụng addToCart từ context (chỉ khi đã đăng nhập)
  const handleAddToCart = (book) => {
    addToCart(book); // Gọi hàm từ context
  };

  // Xử lý nút "Borrow" trên từng thẻ sách
  const handleBorrowButtonClick = (book) => {
    if (isAuthenticated) {
      handleAddToCart(book); // Nếu đã đăng nhập, thêm vào giỏ
    } else {
      showLoginRequiredModal(`add "${book.title}" to the cart`); // Nếu chưa đăng nhập, hiển thị modal
    }
  }

  // --- Render ---
  return (
    <div>
      {/* Phần Header và Bộ lọc */}
      <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center whitespace-nowrap">
            <AppstoreOutlined className="mr-2 text-primary" />
            Book Catalog {/* <-- English UI Text */}
          </h1>
          <Badge count={cartItems?.length || 0} showZero>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="large"
              className="flex items-center"
              onClick={handleCartButtonClick} // <-- Gắn hàm xử lý onClick
            >
              Borrowing Cart {/* <-- English UI Text */}
            </Button>
          </Badge>
        </div>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Search books, authors..." // <-- English UI Text
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              onChange={(e) => handleSearch(e.target.value)} // Tìm khi gõ (có thể thêm debounce)
              // onPressEnter={(e) => handleSearch(e.target.value)} // Hoặc tìm khi Enter
              size="large"
            />
          </div>
          <div>
            <Select
              placeholder="Category" // <-- English UI Text
              onChange={handleCategoryChange}
              allowClear
              className="w-full"
              size="large"
              value={params.categoryId} // Controlled
              loading={!categories.length && loading} // Loading nếu chưa có categories
            >
              <Option value="all">All Categories</Option> {/* <-- English UI Text */}
              {categories.map((category) => (
                <Option key={category.id} value={category.id.toString()}>
                  {category.name} {/* Hiển thị tên tiếng Anh đã đổi */}
                </Option> // Chuyển value sang string nếu cần
              ))}
            </Select>
          </div>
          <div>
            <Select
              placeholder="Status" // <-- English UI Text
              onChange={handleAvailabilityChange}
              className="w-full"
              size="large"
              value={params.available} // Controlled
            >
              <Option value="all">All</Option> {/* <-- English UI Text */}
              <Option value="available">Available</Option> {/* <-- English UI Text */}
              <Option value="unavailable">Borrowed</Option> {/* <-- English UI Text */}
            </Select>
          </div>
        </div>
        {/* Sort & Count */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="mr-2 text-sm text-gray-600">Sort by:</span> {/* <-- English UI Text */}
            <Select
              onChange={handleSortChange}
              className="w-40"
              value={params.sort}
            >
              <Option value="title">Title</Option> {/* <-- English UI Text */}
              <Option value="author">Author</Option> {/* <-- English UI Text */}
              <Option value="rating">Rating (High-Low)</Option> {/* <-- English UI Text */}
              <Option value="year">Year (New-Old)</Option> {/* <-- English UI Text */}
              <Option value="createdAt_desc">Newest (ID)</Option> {/* <-- English UI Text */}
            </Select>
          </div>
          <div className="text-sm text-gray-500">
            {/* Hiển thị số lượng sách đã lọc */}
            {!loading && `Found ${processedBooks.length} books`} {/* <-- English UI Text */}
          </div>
        </div>
      </div>

      {/* Danh sách sách */}
      {loading ? (
        // Skeleton loading
        <Row gutter={[16, 16]}>
          {Array.from({ length: params.pageSize }).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
              {/* SỬA LỖI BADGE: Đặt Skeleton bên trong Card để duy trì cấu trúc */}
              <Card className="h-full book-card">
                <Skeleton active />
              </Card>
            </Col>
          ))}
        </Row>
      ) : processedBooks.length === 0 ? (
        // Empty state
        <Empty description="No matching books found." /> // <-- English UI Text
      ) : (
        // Hiển thị sách đã phân trang
        <>
          <Row gutter={[16, 16]} className="mb-6">
            {paginatedBooks.map(
              (
                book // <-- Dùng paginatedBooks
              ) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  key={book.id}
                  className="mb-4"
                >
                  {/* SỬA LỖI BADGE: Badge.Ribbon bao bọc Card */}
                  <Badge.Ribbon
                    text={book.available ? "Available" : "Borrowed"} // <-- English UI Text
                    color={book.available ? "green" : "red"}
                    // placement="start" // Hoặc 'end', 'topRight', etc. tùy ý
                  >
                    <Card
                      hoverable
                      className="h-full flex flex-col book-card overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                      // Phần cover tách biệt với actions và meta nên ribbon sẽ không đè meta
                      cover={
                        <div className="h-56 overflow-hidden p-4 bg-gray-100">
                          <Link to={`${PATHS.BOOK_DETAIL}/${book.id}`}> {/* <-- Sử dụng PATHS */}
                            <img
                              alt={book.title}
                              src={book.coverImage || "/placeholder-book.png"}
                              className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                            />
                          </Link>
                        </div>
                      }
                      actions={[
                        <Link to={`${PATHS.BOOK_DETAIL}/${book.id}`} key="details"> {/* <-- Sử dụng PATHS */}
                          <ReadOutlined /> Details {/* <-- English UI Text */}
                        </Link>,
                        <Button
                          type="link"
                          key="borrow"
                          icon={<ShoppingCartOutlined />}
                          // Disable dựa vào book.available và isInCart từ context
                          disabled={!book.available || isInCart(book.id)}
                          // SỬA LỖI LOGIN CHECK: Gọi hàm xử lý mới
                          onClick={() => handleBorrowButtonClick(book)}
                          title={
                            !book.available
                              ? "Book is currently borrowed" // <-- English UI Text
                              : isInCart(book.id)
                              ? "Book is already in the cart" // <-- English UI Text
                              : "Add to borrowing cart" // <-- English UI Text
                          }
                        >
                          {isInCart(book.id) ? "Added" : "Borrow"} {/* <-- English UI Text */}
                        </Button>,
                      ]}
                    >
                      {/* Meta bây giờ nằm bên trong Card, không bị Badge đè */}
                       <Meta
                         // Thêm padding top nhỏ để tránh bị gần ribbon quá nếu cần
                         // style={{ paddingTop: '8px' }}
                         title={<Link to={`${PATHS.BOOK_DETAIL}/${book.id}`} className="hover:text-primary transition-colors duration-200">{book.title}</Link>}
                         description={
                           <>
                             <p className="text-gray-600 mb-1">{book.author}</p>
                             <div className="flex items-center mb-1">
                               <Rate allowHalf disabled defaultValue={parseFloat(book.rating)} style={{ fontSize: '1rem', marginRight: '8px' }} />
                               <span className="text-yellow-500 font-semibold">{book.rating}</span>
                               <span className="text-gray-500 ml-2"> ({book.ratingCount})</span>
                             </div>
                             <Tag color="blue">{book.category}</Tag>
                             {/* Optionally show number of copies if available */}
                             {book.available && <Tag color="geekblue" className="ml-1">Copies: {book.copies}</Tag>}
                           </>
                         }
                       />
                    </Card>
                  </Badge.Ribbon>
                </Col>
              )
            )}
          </Row>

          {/* Phân trang */}
          {/* Total lấy từ tổng số sách đã lọc */}
          {processedBooks.length > params.pageSize && (
            <div className="flex justify-center my-6">
              <Pagination
                current={params.page} // Lấy từ state params
                pageSize={params.pageSize} // Lấy từ state params
                total={processedBooks.length} // <-- Tổng là số sách ĐÃ LỌC
                onChange={handlePageChange} // Gọi hàm xử lý đổi trang
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} books` // <-- English UI Text format
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookCatalog; // <-- Đổi tên export