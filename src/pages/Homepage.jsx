import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Tag,
  Rate,
  Spin,
  Skeleton,
  Empty,
  Badge,
  App, // Import App để dùng useApp
} from "antd";
import {
  ArrowRightOutlined,
  BookOutlined,
  ReadOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  ExclamationCircleFilled, // For login modal icon
} from "@ant-design/icons";
import { useCart } from "../contexts/CartContext";
import { UseAuth } from "../contexts/AuthContext";
import { PATHS } from "../routes/routePaths";

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

// --- Component HomePage ---
const HomePage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]); // Sách nổi bật hiển thị
  const [allMockBooks, setAllMockBooks] = useState([]); // Lưu trữ toàn bộ sách mock để lọc
  const [categories, setCategories] = useState([]); // Danh mục mock
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // ID danh mục được chọn
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { isAuthenticated } = UseAuth();
  const { cartItems, cartItemCount, addToCart, isInCart } = useCart();
  const { message: messageApi, modal: modalApi } = App.useApp(); // Lấy message và modal

  // --- Giả lập Fetch dữ liệu Mock ---
  useEffect(() => {
    setLoading(true);
    // Fetch Categories Mock
    const mockCategories = [
      { id: 1, name: "Fiction" },
      { id: 2, name: "Science" },
      { id: 3, name: "History" },
      { id: 4, name: "Psychology" },
      { id: 5, name: "Economics" },
    ];
    setCategories(mockCategories);

    // Fetch Books Mock (Lấy toàn bộ rồi xử lý sau)
    // (Sử dụng lại logic tạo mock data giống BookCatalog)
    setTimeout(() => {
      const mockBooks = Array(55) // Tạo nhiều sách
        .fill()
        .map((_, index) => ({
          id: index + 1,
          title: `Book ${index + 1} about Design ${String.fromCharCode(
            65 + (index % 26)
          )}`,
          author: `Author ${(index % 7) + 1}`,
          category: mockCategories[index % mockCategories.length].name,
          categoryId: mockCategories[index % mockCategories.length].id,
          rating: (Math.random() * 3 + 2).toFixed(1),
          ratingCount: Math.floor(Math.random() * 250) + 5,
          available: index % 4 !== 0,
          copies: index % 4 !== 0 ? Math.floor(Math.random() * 5 + 1) : 0,
          coverImage: `https://placehold.co/150x200/EDEDED/AAAAAA/png?text=Book+${
            index + 1
          }`,
          description: `Short description about book ${index + 1}.`,
          year: 2024 - (index % 10),
        }));
      setAllMockBooks(mockBooks); // Lưu tất cả sách mock
      // Ban đầu hiển thị một phần sách làm "featured"
      setFeaturedBooks(mockBooks.slice(0, 8)); // Ví dụ: hiển thị 8 cuốn đầu
      setLoading(false);
    }, 1000);
  }, []); // Chỉ chạy 1 lần

  // --- Lọc sách nổi bật theo category ---
  const displayedBooks = useMemo(() => {
    if (!selectedCategoryId) {
      // Nếu không chọn category, trả về danh sách featured ban đầu (hoặc toàn bộ nếu muốn)
      return allMockBooks.slice(0, 8); // Giữ nguyên 8 cuốn đầu
    }
    // Lọc toàn bộ sách theo category đã chọn
    const filtered = allMockBooks.filter(
      (book) => book.categoryId === selectedCategoryId
    );
    return filtered.slice(0, 8); // Chỉ lấy tối đa 8 cuốn đã lọc
  }, [selectedCategoryId, allMockBooks]);

  // --- Handlers ---
  const handleCategoryClick = (categoryId) => {
    // Nếu nhấn lại category đang chọn thì bỏ chọn (hiển thị tất cả featured)
    setSelectedCategoryId((prevId) =>
      prevId === categoryId ? null : categoryId
    );
  };

  // --- Hàm hiển thị modal yêu cầu đăng nhập (Tái sử dụng) ---
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
      onCancel: () => console.log("Cancel confirmed, staying on page."),
    });
  };

  // Xử lý nút "Borrow" trên từng thẻ sách (Giống BookCatalog)
  const handleBorrowButtonClick = (book) => {
    if (isAuthenticated) {
      // Logic kiểm tra giỏ hàng đầy đã nằm trong addToCart của context
      addToCart(book);
    } else {
      showLoginRequiredModal(`add "${book.title}" to the cart`);
    }
  };

  // --- Render ---
  return (
    <div>
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 md:py-24 text-center">
        <div className="container px-4 mx-auto">
          <Title
            level={1}
            className="!text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Welcome to Your Library
          </Title>
          <Paragraph className="!text-indigo-100 text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Discover, borrow, and manage your favorite books with ease. Explore
            our vast collection today.
          </Paragraph>
          <div className="flex justify-center items-center flex-wrap gap-4">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(PATHS.BOOK_CATALOG)}
            >
              Browse All Books <ArrowRightOutlined />
            </Button>
            {/* Nút xem giỏ hàng */}
            <Badge count={cartItemCount} showZero>
              <Button
                size="large"
                type="default"
                onClick={() => navigate(PATHS.BORROWING_CART)}
              >
                View Borrowing Cart <ShoppingCartOutlined />
              </Button>
            </Badge>
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 mx-auto">
          <Title level={3} className="mb-6 text-center md:text-left">
            Explore by Category
          </Title>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {/* Nút xem tất cả */}
            <Button
              key="all-cat"
              type={selectedCategoryId === null ? "primary" : "default"}
              icon={<BookOutlined />}
              onClick={() => handleCategoryClick(null)} // Đặt selectedCategoryId về null
            >
              All Featured
            </Button>
            {/* Lặp qua các category */}
            {categories.map((category) => (
              <Button
                key={category.id}
                // Đổi 'type' thay vì 'variant' cho Ant Design
                type={
                  selectedCategoryId === category.id ? "primary" : "default"
                }
                icon={<TagOutlined />}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Books Section */}
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <Title level={3} className="mb-0">
              {selectedCategoryId
                ? `${
                    categories.find((c) => c.id === selectedCategoryId)?.name ||
                    "Selected"
                  } Books`
                : "Featured Books"}
            </Title>
            <Button type="dashed" onClick={() => navigate(PATHS.BOOK_CATALOG)}>
              View All Books <ArrowRightOutlined />
            </Button>
          </div>

          {loading ? (
            // Skeleton Loading (Giống BookCatalog)
            <Row gutter={[16, 24]}>
              {Array.from({ length: 8 }).map(
                (
                  _,
                  index // Hiển thị 8 skeleton
                ) => (
                  <Col xs={12} sm={12} md={8} lg={6} key={index}>
                    <Card>
                      <Skeleton active avatar paragraph={{ rows: 2 }} />
                    </Card>
                  </Col>
                )
              )}
            </Row>
          ) : displayedBooks.length === 0 ? (
            // Empty State
            <div className="col-span-full text-center py-12">
              <Empty
                description={`No books found ${
                  selectedCategoryId ? "in this category" : ""
                }.`}
              />
            </div>
          ) : (
            // Book Grid
            <Row gutter={[16, 24]}>
              {displayedBooks.map((book) => {
                const isBookInCart = isInCart(book.id);
                const isBorrowDisabled = !book.available || isBookInCart; // Không cần check cart full ở đây vì nút riêng biệt

                let borrowButtonTitle = "Add to borrowing cart";
                if (!book.available)
                  borrowButtonTitle = "Book is currently borrowed";
                else if (isBookInCart)
                  borrowButtonTitle = "Book is already in the cart";

                return (
                  <Col xs={12} sm={12} md={8} lg={6} key={book.id}>
                    {/* Sử dụng lại cấu trúc Card từ BookCatalog */}
                    <Badge.Ribbon
                      text={book.available ? "Available" : "Borrowed"}
                      color={book.available ? "green" : "red"}
                    >
                      <Card
                        hoverable
                        className="h-full flex flex-col book-card overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                        cover={
                          <div className="h-56 overflow-hidden p-4 bg-gray-100">
                            <Link to={`${PATHS.BOOK_DETAIL}/${book.id}`}>
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
                            to={`${PATHS.BOOK_DETAIL}/${book.id}`}
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
                              e.stopPropagation(); // Ngăn sự kiện click của Card
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
                              to={`${PATHS.BOOK_DETAIL}/${book.id}`}
                              className="hover:text-primary transition-colors duration-200 text-base font-semibold"
                            >
                              {book.title}
                            </Link>
                          } // Tăng font title
                          description={
                            <>
                              <p className="text-gray-600 mb-1 text-sm">
                                {book.author}
                              </p>
                              <div className="flex items-center flex-wrap mb-1 text-xs">
                                {" "}
                                {/* Giảm font size rating */}
                                <Rate
                                  allowHalf
                                  disabled
                                  defaultValue={parseFloat(book.rating)}
                                  style={{
                                    fontSize: "0.8rem",
                                    marginRight: "4px",
                                  }}
                                />
                                <span className="text-yellow-500 font-semibold mr-1">
                                  {book.rating}
                                </span>
                                <span className="text-gray-500 ml-1">
                                  ({book.ratingCount} reviews)
                                </span>
                              </div>
                              <Tag color="blue" className="mt-1">
                                {book.category}
                              </Tag>
                            </>
                          }
                        />
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </section>

      {/* 4. How It Works Section (Tái tạo với Ant Design và Tailwind) */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container px-4 mx-auto">
          {/* Tiêu đề chính màu trắng */}
          <Title level={2} className="!text-white text-center mb-12">
            How It Works
          </Title>
          <Row gutter={[32, 32]} justify="center">
            {/* Item 1 */}
            <Col xs={24} md={8} className="text-center">
              {/* Vòng tròn số thứ tự */}
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                {/* Số màu trắng */}
                <Text className="!text-white text-2xl font-bold">1</Text>
              </div>
              {/* Tiêu đề bước màu trắng */}
              <Title level={4} className="!text-white mb-2">
                Browse Books
              </Title>
              {/* Đoạn mô tả cũng màu trắng (thêm opacity nhẹ để phân cấp nếu muốn) */}
              <Paragraph className="!text-white opacity-95">
                {" "}
                {/* Đặt thành !text-white, có thể thêm opacity */}
                Explore our extensive collection of books across various
                categories.
              </Paragraph>
            </Col>
            {/* Item 2 */}
            <Col xs={24} md={8} className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                <Text className="!text-white text-2xl font-bold">2</Text>
              </div>
              <Title level={4} className="!text-white mb-2">
                Request to Borrow
              </Title>
              <Paragraph className="!text-white opacity-95">
                {" "}
                {/* Đặt thành !text-white, có thể thêm opacity */}
                Add up to 5 books to your borrowing cart and submit your request
                easily.
              </Paragraph>
            </Col>
            {/* Item 3 */}
            <Col xs={24} md={8} className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                <Text className="!text-white text-2xl font-bold">3</Text>
              </div>
              <Title level={4} className="!text-white mb-2">
                Read & Return
              </Title>
              <Paragraph className="!text-white opacity-95">
                {" "}
                {/* Đặt thành !text-white, có thể thêm opacity */}
                Enjoy your books for the designated period after librarian
                approval.
              </Paragraph>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
