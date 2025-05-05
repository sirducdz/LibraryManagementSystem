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
  App,
  Divider, // Import App để dùng useApp
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
import {
  useGetCategoriesQuery,
  useGetBooksQuery,
} from "../features/books/api/bookApiSlice";
import { GoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; // Thư viện giải mã JWT
import { useGoogleSignInMutation } from "../features/auth/api/authApiSlice";
// --- Component HomePage ---
const HomePage = () => {
  // const [featuredBooks, setFeaturedBooks] = useState([]); // Sách nổi bật hiển thị
  // const [allMockBooks, setAllMockBooks] = useState([]); // Lưu trữ toàn bộ sách mock để lọc
  // const [categories, setCategories] = useState([]); // Danh mục mock
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // ID danh mục được chọn
  // const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { isAuthenticated, login: loginContext } = UseAuth(); // Lấy trạng thái đăng nhập
  const { cartItems, cartItemCount, addToCart, isInCart } = useCart();
  const { message: messageApi, modal: modalApi } = App.useApp(); // Lấy message và modal
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useGetCategoriesQuery();

  const {
    data: booksResponse, // Data trả về đã qua transformResponse (chỉ còn mảng sách)
    isLoading: isLoadingBooks,
    isError: isBooksError,
    error: booksErrorData, // Thông tin lỗi books nếu có
  } = useGetBooksQuery({
    // Gọi hook lấy sách
    categoryId: selectedCategoryId, // Truyền ID category đang chọn
    pageSize: 8, // Luôn lấy 8 cuốn cho trang chủ
  });

  const [googleSignIn, { isLoading: isGoogleSigningIn }] =
    useGoogleSignInMutation();
  const categories = useMemo(() => categoriesData || [], [categoriesData]);
  // booksData giờ đã là mảng sách nhờ transformResponse
  // const displayedBooks = useMemo(() => booksData || [], [booksData]);
  const displayedBooks = useMemo(
    () => booksResponse?.books || [],
    [booksResponse]
  );
  console.log("displayedBooks", booksResponse);

  const loading = isLoadingCategories || isLoadingBooks; // Loading tổng

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleCredential = credentialResponse.credential;
    if (!googleCredential) {
      messageApi.error("Google login failed: Missing credential.");
      return;
    }

    console.log("Google Credential Received:", googleCredential);
    // Set loading indicator (optional)
    // setLoading(true); // Có thể dùng state riêng hoặc isGoogleSigningIn

    try {
      // 1. Gọi API Backend để xác thực Google Token và lấy token của ứng dụng
      console.log("Sending Google credential to backend...");
      const backendResponse = await googleSignIn({
        credential: googleCredential,
      }).unwrap();
      console.log("Backend verification successful:", backendResponse);

      // 2. Lấy accessToken và refreshToken của *ỨNG DỤNG* từ backend response
      const { accessToken, refreshToken } = backendResponse;

      if (accessToken && refreshToken) {
        // --- SAO CHÉP LOGIC TỪ onFinish CỦA LOGIN PAGE ---
        let decodedUser = null;
        try {
          // 3. Decode accessToken của ỨNG DỤNG BẠN
          const decodedPayload = jwtDecode(accessToken);
          console.log("Decoded App Access Token Payload:", decodedPayload);
          // !!! Map tên trường cho khớp token của bạn !!!
          decodedUser = {
            id: decodedPayload.nameid || null,
            username: decodedPayload.unique_name || null,
            email: decodedPayload.email || null,
            roles: decodedPayload.role ? [decodedPayload.role] : [],
            name: decodedPayload.name || decodedPayload.unique_name,
            avatarUrl: decodedPayload.picture,
          };
          if (!decodedUser.id) {
            throw new Error("Missing user ID in app token");
          }
        } catch (decodeError) {
          console.error("Failed to decode app access token:", decodeError);
          messageApi.error("Login failed: Invalid application token received.");
          // setLoading(false); // Tắt loading nếu có
          return; // Dừng lại nếu không decode được
        }

        // 4. Lưu vào localStorage (RememberMe = true)
        try {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("userData", JSON.stringify(decodedUser));
          console.log(`Credentials from Google Sign-In saved to localStorage.`);
        } catch (storageError) {
          console.error("Failed to save to localStorage:", storageError);
          // Có thể không cần dừng hẳn, nhưng cần biết lỗi
        }

        // 5. Cập nhật AuthContext
        loginContext(decodedUser, accessToken); // <<<=== GỌI HÀM LOGIN CỦA CONTEXT

        messageApi.success(`Welcome, ${decodedUser.name}!`);
        // Không cần navigate, useEffect trong AuthContext hoặc LoginPage sẽ xử lý
      } else {
        console.error(
          "Backend response missing app tokens after Google Sign-In."
        );
        messageApi.error("Login failed: Invalid response from server.");
      }
    } catch (err) {
      console.error("Google Sign-In backend call failed:", err);
      messageApi.error(
        err?.data?.message || "Google Sign-In failed. Please try again."
      );
    } finally {
      // setLoading(false); // Tắt loading nếu có
    }
  };

  // Hàm xử lý lỗi từ Google
  const handleGoogleError = () => {
    console.error("Google Login Failed");
    messageApi.error("Google Sign-In failed. Please try again.");
  };

  // --- Hook cho Google One Tap ---
  // Sẽ tự động hiển thị prompt nếu user đang đăng nhập Google trên trình duyệt
  // và chưa đăng xuất khỏi web của bạn bằng Google trước đó.
  // Chỉ gọi hook này khi người dùng CHƯA đăng nhập vào hệ thống của bạn.
  useGoogleOneTapLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    disabled: isAuthenticated || isGoogleSigningIn, // <<<=== Vô hiệu hóa nếu đã đăng nhập
    // prompt_parent_id: 'oneTapContainer', // ID của div nếu muốn tùy chỉnh vị trí prompt
    // cancel_on_tap_outside: false, // Mặc định là false
  });

  const handleCategoryClick = (categoryId) => {
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

  // Xử lý nút "Borrow" trên từng thẻ sách
  const handleBorrowButtonClick = (book) => {
    if (isAuthenticated) {
      addToCart(book);
    } else {
      showLoginRequiredModal(`add "${book.title}" to the cart`);
    }
  };

  // --- **Hàm xử lý mới cho nút "Browse All Books"** ---
  const handleNavigateToCatalog = () => {
    if (isAuthenticated) {
      console.log("User is authenticated, navigating to catalog.");
      navigate(PATHS.BOOKS_CATALOG);
    } else {
      // Có thể bạn muốn cho phép duyệt sách mà không cần đăng nhập
      // Nếu vậy, chỉ cần gọi navigate trực tiếp ở đây:
      // navigate(PATHS.BOOK_CATALOG);
      // Nếu bắt buộc đăng nhập để duyệt, thì gọi modal:
      showLoginRequiredModal("browse all books");
    }
  };

  // --- **Hàm xử lý mới cho nút "View Borrowing Cart"** ---
  const handleNavigateToCart = () => {
    if (isAuthenticated) {
      navigate(PATHS.BORROWING_CART);
    } else {
      showLoginRequiredModal("view your borrowing cart");
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
              // --- **Sử dụng handler mới** ---
              onClick={handleNavigateToCatalog}
            >
              Browse All Books <ArrowRightOutlined />
            </Button>
            {/* Nút xem giỏ hàng */}
            <Badge count={cartItemCount} showZero>
              <Button
                size="large"
                type="default"
                // --- **Sử dụng handler mới** ---
                onClick={handleNavigateToCart}
              >
                View Borrowing Cart <ShoppingCartOutlined />
              </Button>
            </Badge>
          </div>
          {!isAuthenticated && (
            <div className="mt-10">
              <Divider className="!bg-white/30" /> {/* Thêm đường ngăn cách */}
              <Text className="!text-indigo-200 text-sm mb-4 block">
                Or sign in with
              </Text>
              <div className="flex justify-center items-center gap-4">
                {/* Nút Google Sign-In */}
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  // Tùy chỉnh giao diện nút nếu muốn
                  // theme="outline"
                  // size="large"
                  // shape="rectangular"
                  // width="250px"
                  useOneTap={false} // Không dùng One Tap cho nút
                  disabled={isGoogleSigningIn}
                />
                {isGoogleSigningIn && <Spin />}
                {/* Có thể thêm nút Đăng nhập/Đăng ký thông thường ở đây */}
                {/* <Button size="large" onClick={() => navigate(PATHS.LOGIN)} icon={<LoginOutlined />}> Login </Button> */}
                {/* <Button size="large" type="primary" ghost onClick={() => navigate(PATHS.REGISTER)} icon={<UserAddOutlined />}> Register </Button> */}
              </div>
              {/* Container cho One Tap (tùy chọn) */}
              {/* <div id="oneTapContainer" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1001 }}></div> */}
            </div>
          )}
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 mx-auto">
          <Title level={3} className="mb-6 text-center md:text-left">
            Explore by Category
          </Title>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <Button
              key="all-cat"
              type={selectedCategoryId === null ? "primary" : "default"}
              icon={<BookOutlined />}
              onClick={() => handleCategoryClick(null)}
            >
              All Featured
            </Button>
            {/* Hiển thị categories từ state `categories` */}
            {isLoadingCategories ? (
              <Spin size="small" />
            ) : (
              categories.map((category) => (
                <Button
                  key={category.id}
                  type={
                    selectedCategoryId === category.id ? "primary" : "default"
                  }
                  icon={<TagOutlined />}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </Button>
              ))
            )}
            {isCategoriesError && (
              <Text type="danger" className="ml-4">
                Error loading categories.
              </Text>
            )}
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
            <Button type="dashed" onClick={handleNavigateToCatalog}>
              View All Books <ArrowRightOutlined />
            </Button>
          </div>

          {/* Xử lý loading/error/empty cho books */}
          {loading ? (
            <Row gutter={[16, 24]}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Col xs={12} sm={12} md={8} lg={6} key={index}>
                  <Card>
                    <Skeleton active avatar paragraph={{ rows: 2 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : isBooksError ? (
            <div className="text-center py-12">
              <Empty description="Could not load books. Please try again later." />
            </div>
          ) : displayedBooks.length === 0 ? (
            <div className="text-center py-12">
              <Empty
                description={`No books found ${
                  selectedCategoryId ? "in this category" : ""
                }.`}
              />
            </div>
          ) : (
            // Render danh sách sách dùng `displayedBooks`
            <Row gutter={[16, 24]}>
              {displayedBooks.map((book) => {
                const isBookInCart = isInCart(book.id);
                // Nhớ kiểm tra book có tồn tại trước khi truy cập thuộc tính
                const isBorrowDisabled = !book?.available || isBookInCart;
                let borrowButtonTitle = "Add to borrowing cart";
                if (!book?.available)
                  borrowButtonTitle = "Book is currently borrowed";
                else if (isBookInCart)
                  borrowButtonTitle = "Book is already in the cart";

                return (
                  <Col xs={12} sm={12} md={8} lg={6} key={book.id}>
                    <Badge.Ribbon
                      text={book.available ? "Available" : "Borrowed"}
                      color={book.available ? "green" : "red"}
                    >
                      <Card
                        hoverable
                        className="h-full flex flex-col book-card overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                        cover={
                          <div className="h-56 overflow-hidden p-4 bg-gray-100">
                            {/* Sử dụng tên trường đã map: book.coverImage */}
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
                              {book.title}
                            </Link>
                          }
                          description={
                            <>
                              <p className="text-gray-600 mb-1 text-sm">
                                {book.author}
                              </p>
                              <div className="flex items-center flex-wrap mb-1 text-xs">
                                {/* Đảm bảo dùng book.rating, book.ratingCount */}
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
                                  {book.rating?.toFixed(1)}
                                </span>{" "}
                                {/* Thêm toFixed(1) nếu cần */}
                                <span className="text-gray-500 ml-1">
                                  ({book.ratingCount} reviews)
                                </span>
                              </div>
                              {/* Đảm bảo dùng book.category */}
                              <Tag color="blue" className="mt-1">
                                {book.category}
                              </Tag>
                              {book.available &&
                                typeof book.copies === "number" && (
                                  <Tag color="geekblue" className="mt-1 ml-1">
                                    {/* Thêm ml-1 để có khoảng cách */}
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
          )}
        </div>
      </section>
      {/* 4. How It Works Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container px-4 mx-auto">
          <Title level={2} className="!text-white text-center mb-12">
            How It Works
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8} className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                <Text className="!text-white text-2xl font-bold">1</Text>
              </div>
              <Title level={4} className="!text-white mb-2">
                Browse Books
              </Title>
              <Paragraph className="!text-white opacity-95">
                Explore our extensive collection of books across various
                categories.
              </Paragraph>
            </Col>
            <Col xs={24} md={8} className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                <Text className="!text-white text-2xl font-bold">2</Text>
              </div>
              <Title level={4} className="!text-white mb-2">
                Request to Borrow
              </Title>
              <Paragraph className="!text-white opacity-95">
                Add up to 5 books to your borrowing cart and submit your request
                easily.
              </Paragraph>
            </Col>
            <Col xs={24} md={8} className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
                <Text className="!text-white text-2xl font-bold">3</Text>
              </div>
              <Title level={4} className="!text-white mb-2">
                Read & Return
              </Title>
              <Paragraph className="!text-white opacity-95">
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
