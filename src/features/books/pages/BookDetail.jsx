// Ví dụ: src/pages/BookDetail.jsx hoặc src/features/books/pages/BookDetail.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Divider,
  Rate,
  Avatar,
  Form,
  Input,
  List,
  Skeleton,
  Empty,
  App,
  Spin,
  Pagination, // Thêm Spin, Pagination
} from "antd";
import {
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  ExclamationCircleFilled,
  SendOutlined,
  StarOutlined,
} from "@ant-design/icons";

// Import Contexts và PATHS (Sửa đường dẫn nếu cần)
import { useCart } from "../../../contexts/CartContext";
import { UseAuth } from "../../../contexts/AuthContext";
import { PATHS } from "../../../routes/routePaths";

// Import RTK Query Hooks (Sửa đường dẫn nếu cần)
import {
  useGetBookByIdQuery,
  useGetBookReviewsQuery,
  useAddReviewMutation,
} from "../api/bookApiSlice";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// --- Component BookDetail ---
const BookDetail = () => {
  const { bookId: bookIdParam } = useParams(); // Lấy ID sách từ URL
  //   console.log(">>> Params từ URL:", useParams());
  const navigate = useNavigate();

  // State cho form review và phân trang review
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [reviewPage, setReviewPage] = useState(1); // Trang review hiện tại
  const REVIEW_PAGE_SIZE = 5; // Số lượng review mỗi trang

  // Lấy state và hàm từ Contexts
  const { isAuthenticated, user } = UseAuth();
  const { cartItemCount, addToCart, isInCart } = useCart();
  const { message: messageApi, modal: modalApi } = App.useApp();

  // === Gọi RTK Query Hooks ===
  const {
    data: book, // Dữ liệu sách chi tiết (đã qua transformResponse)
    isLoading: isLoadingBook,
    isFetching: isFetchingBook, // True khi đang fetch lại sách (ví dụ sau khi review)
    isError: isBookError,
    error: bookErrorData, // Thông tin lỗi nếu có
  } = useGetBookByIdQuery(bookIdParam, {
    skip: !bookIdParam, // Bỏ qua nếu ID không hợp lệ ban đầu
  });

  const {
    data: reviewsResponse, // Dữ liệu trả về là { reviews: [], totalItems: number }
    isLoading: isLoadingReviewsInitial, // Loading lần đầu cho reviews
    isFetching: isFetchingReviews, // Đang fetch lại reviews (kể cả đổi trang)
    isError: isReviewError,
  } = useGetBookReviewsQuery(
    { bookId: bookIdParam, page: reviewPage, pageSize: REVIEW_PAGE_SIZE },
    { skip: !bookIdParam || isBookError || !book } // Bỏ qua nếu ID sách không hợp lệ hoặc fetch sách lỗi
  );

  const [addReview, { isLoading: isSubmittingReviewApi }] =
    useAddReviewMutation();
  // ==========================

  // --- Xử lý data từ hooks ---
  // `book` đã là object sách chi tiết hoặc null/undefined
  const reviews = useMemo(
    () => reviewsResponse?.reviews || [],
    [reviewsResponse]
  );
  const totalReviewCount = useMemo(
    () => reviewsResponse?.totalItems || 0,
    [reviewsResponse]
  );

  // Loading tổng thể cho lần đầu tải trang
  const isLoading =
    isLoadingBook || (isLoadingReviewsInitial && !reviewsResponse); // Chỉ loading review nếu chưa có data review response
  // Fetching tổng thể để hiển thị Spin
  const isFetching = isFetchingBook || isFetchingReviews;

  // Các tính toán khác
  const isBookInCart = useMemo(
    () => (book ? isInCart(book.id) : false),
    [book, isInCart]
  );
  const isCartFull = useMemo(() => cartItemCount >= 5, [cartItemCount]);
  const canUserReview = isAuthenticated; // Logic đơn giản: chỉ cần đăng nhập là có thể review

  // --- Handlers ---
  const handleAddToCartClick = () => {
    if (!book) return;
    if (!isAuthenticated) {
      showLoginRequiredModal(`add "${book.title}" to the cart`);
    } else {
      addToCart(book); // Gọi hàm từ CartContext
    }
  };

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

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !book) return; // Cần đăng nhập và có thông tin sách
    if (!userRating) {
      messageApi.error("Please select a star rating!");
      return;
    }
    if (!userComment.trim()) {
      messageApi.error("Please write your review comment!");
      return;
    }

    try {
      console.log("Submitting review:", {
        bookId: book.id,
        starRating: userRating,
        comment: userComment,
      });
      // Gọi mutation, đảm bảo tên trường khớp API backend (`starRating`, `comment`)
      await addReview({
        bookId: book.id,
        rating: userRating, // Gửi đi giá trị rating người dùng chọn
        comment: userComment,
      }).unwrap();

      messageApi.success("Review submitted successfully!");
      setUserComment("");
      setUserRating(0);
      // Tự động fetch lại reviews và book detail nhờ `invalidatesTags`
    } catch (err) {
      console.error("Failed to submit review:", err);
      messageApi.error(err?.data?.message || "Failed to submit review.");
    }
  };

  // Handler đổi trang review
  const handleReviewPageChange = (page) => {
    setReviewPage(page);
  };

  // --- Render Loading State ---
  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <Button
            icon={<ArrowLeftOutlined />}
            disabled
            style={{ marginBottom: "20px" }}
          >
            Back
          </Button>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Skeleton.Image
                active
                style={{ width: "100%", height: 350, borderRadius: "8px" }}
              />
            </Col>{" "}
            {/* Tăng chiều cao skeleton ảnh */}
            <Col xs={24} md={16}>
              <Skeleton active title={false} paragraph={{ rows: 10 }} />
            </Col>{" "}
            {/* Tăng số dòng skeleton */}
          </Row>
        </Card>
      </div>
    );
  }

  // --- Render Not Found hoặc Error State ---
  if (isBookError || !book) {
    let errorMsg = "Sorry, the book you are looking for could not be found.";
    if (isBookError && bookErrorData?.data?.message) {
      errorMsg = bookErrorData.data.message;
    } else if (isBookError) {
      errorMsg = "An error occurred while loading book details.";
    }

    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-128px)]">
        <Card className="w-full max-w-md text-center">
          <Empty description={errorMsg} />
          {isBookError && (
            <Text type="secondary" className="text-xs mt-2">
              Error: {JSON.stringify(bookErrorData?.status)}
            </Text>
          )}{" "}
          {/* Hiển thị status lỗi nếu có */}
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(PATHS.BOOK_CATALOG || "/books")}
            className="mt-4"
          >
            Back to Book Catalog
          </Button>
        </Card>
      </div>
    );
  }

  // --- Render Book Details ---
  // Tính toán lại trạng thái nút Add to Cart dựa trên `book` từ hook
  const isAddToCartDisabled = !book?.available || isBookInCart || isCartFull;
  let addToCartButtonText = "Add to Borrowing Cart";
  let addToCartButtonTitle = "Add this book to your borrowing cart";
  if (!book?.available) {
    addToCartButtonText = "Currently Borrowed";
    addToCartButtonTitle = "This book is unavailable";
  } else if (isBookInCart) {
    addToCartButtonText = "Added to Cart";
    addToCartButtonTitle = "Already in your cart";
  } else if (isCartFull) {
    addToCartButtonText = "Borrowing Cart Full";
    addToCartButtonTitle = "Cart is full (max 5)";
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: "20px" }}
      >
        Back
      </Button>

      {/* Chỉ hiển thị Spin khi đang fetch lại, không phải lúc loading ban đầu */}
      {isFetching && !isLoading && (
        <div className="text-center my-4">
          <Spin tip="Updating..." />
        </div>
      )}

      <Card
        variant="borderless"
        className={`shadow-lg transition-opacity duration-300 ${
          isFetching ? "opacity-75" : "opacity-100"
        }`}
      >
        <Row gutter={[24, 32]}>
          {/* Cột Ảnh & Nút */}
          <Col xs={24} sm={10} md={8} lg={7} xl={6}>
            <div className="flex flex-col items-center sticky top-24">
              {" "}
              {/* Sticky top */}
              <img
                src={book.coverImage || "/placeholder-book.png"}
                alt={book.title}
                className="w-full h-auto object-contain rounded-lg shadow-md mb-4 max-w-[300px]"
                style={{ aspectRatio: "2 / 3" }}
              />
              <div className="w-full mt-4">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  disabled={isAddToCartDisabled}
                  onClick={handleAddToCartClick}
                  block
                  title={addToCartButtonTitle}
                >
                  {addToCartButtonText}
                </Button>
              </div>
            </div>
          </Col>

          {/* Cột Thông tin Sách */}
          <Col xs={24} sm={14} md={16} lg={17} xl={18}>
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {/* Sử dụng book.available đã được suy ra */}
                <Tag color={book.available ? "green" : "red"}>
                  {book.available ? "Available" : "Borrowed"}
                </Tag>
                {book.category && <Tag color="blue">{book.category}</Tag>}
                {book.language && <Tag>{book.language}</Tag>}
                {/* Hiển thị số lượng nếu có */}
                {book.available && typeof book.copies === "number" && (
                  <Tag color="geekblue">Copies: {book.copies}</Tag>
                )}
              </div>

              <Title level={2} className="mb-2">
                {book.title}
              </Title>

              <div className="flex items-center flex-wrap mb-4 text-sm">
                {/* Dùng book.rating đã map */}
                <Rate
                  disabled
                  value={book.rating}
                  allowHalf
                  style={{ marginRight: "8px" }}
                />
                <Text strong className="mr-1">
                  {book.rating?.toFixed(1)}
                </Text>
                {/* Dùng book.ratingCount */}
                <Text type="secondary">({book.ratingCount} ratings)</Text>
              </div>

              <div className="text-base mb-4">
                <Text>by </Text>
                <Text
                  strong
                  className="text-blue-600 hover:underline cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/catalog?query=${encodeURIComponent(book.author)}`
                    )
                  }
                >
                  {book.author}
                </Text>{" "}
                {/* Link tìm tác giả */}
                {book.publisher && (
                  <Text type="secondary"> | Publisher: {book.publisher}</Text>
                )}
              </div>

              <Divider className="my-4" />

              <Row gutter={[16, 8]} className="mb-4 text-sm">
                {/* Dùng book.year đã map */}
                {book.year && (
                  <Col xs={24} md={12}>
                    <CalendarOutlined className="mr-2 text-gray-500" />{" "}
                    <Text strong>Published:</Text> <Text>{book.year}</Text>
                  </Col>
                )}
                {book.isbn && (
                  <Col xs={24} md={12}>
                    <TagOutlined className="mr-2 text-gray-500" />{" "}
                    <Text strong>ISBN:</Text> <Text>{book.isbn}</Text>
                  </Col>
                )}
                {book.pages && (
                  <Col xs={24} md={12}>
                    <BookOutlined className="mr-2 text-gray-500" />{" "}
                    <Text strong>Pages:</Text> <Text>{book.pages}</Text>
                  </Col>
                )}
              </Row>

              <Divider className="my-4" />

              <Title level={4}>Description</Title>
              <Paragraph className="text-gray-700 leading-relaxed whitespace-pre-line">
                {" "}
                {/* Thêm whitespace-pre-line */}
                {book.description || "No description available."}
              </Paragraph>
            </div>
          </Col>
        </Row>

        {/* Phần Reviews */}
        <Divider className="mt-8 mb-6" />
        <div className="mt-6">
          <Title level={3} className="mb-6">
            Reader Reviews ({totalReviewCount})
          </Title>

          {/* Form gửi review */}
          {canUserReview ? (
            <Card
              variant="borderless"
              className="mb-6 bg-gray-50 rounded-lg p-4 shadow-sm"
            >
              <Title level={4} className="mb-4">
                Write Your Review
              </Title>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <Text>
                  <StarOutlined className="mr-1" /> Your Rating:
                </Text>
                <Rate value={userRating} onChange={setUserRating} />
                {userRating > 0 && (
                  <Text strong className="ml-2 text-yellow-500">
                    {userRating} Star{userRating > 1 ? "s" : ""}
                  </Text>
                )}
              </div>
              <Form onFinish={handleSubmitReview}>
                <Form.Item name="comment" noStyle>
                  <TextArea
                    rows={4}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="mb-3"
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isSubmittingReviewApi}
                  disabled={!userRating || !userComment.trim()}
                  icon={<SendOutlined />}
                >
                  Submit Review
                </Button>
              </Form>
            </Card>
          ) : (
            <div className="mb-6 p-4 border border-dashed rounded-md text-center bg-gray-50">
              <Text type="secondary">
                You must be logged in to write a review.
              </Text>
              <Button
                type="link"
                onClick={() => navigate(PATHS.LOGIN)}
                className="ml-1"
              >
                Login Now
              </Button>
            </div>
          )}

          {/* Danh sách reviews */}
          {isLoadingReviewsInitial && !isFetchingReviews ? (
            <Skeleton active paragraph={{ rows: 5 }} /> // Chỉ loading review khi load lần đầu
          ) : isReviewError ? (
            <Text type="danger">Could not load reviews.</Text>
          ) : (
            <>
              <List
                className="comment-list"
                // header={<Text strong>{`${totalReviewCount} Review(s)`}</Text>} // Đã đưa count lên Title
                itemLayout="horizontal"
                dataSource={reviews} // Dùng mảng reviews đã xử lý
                locale={{
                  emptyText: (
                    <Empty
                      description="Be the first to review this book!"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ),
                }}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    className="!pl-0 !py-4 border-b border-gray-200 last:border-b-0"
                  >
                    {" "}
                    {/* Style item */}
                    <div className="flex items-start gap-3 sm:gap-4 w-full">
                      <Avatar size="large" icon={<UserOutlined />} />{" "}
                      {/* Avatar mặc định */}
                      <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                          <Text strong className="text-base">
                            {item.author}
                          </Text>
                          {/* Format lại ngày tháng */}
                          <Text
                            type="secondary"
                            className="text-xs mt-1 sm:mt-0"
                          >
                            {item.datetime
                              ? new Date(item.datetime).toLocaleDateString(
                                  "en-GB"
                                )
                              : "N/A"}
                          </Text>
                        </div>
                        {/* Dùng item.rating */}
                        <Rate
                          disabled
                          size="small"
                          value={item.rating}
                          className="mb-1"
                        />
                        {/* Dùng item.content */}
                        <Paragraph className="text-gray-700 mb-0">
                          {item.content}
                        </Paragraph>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              {/* Phân trang cho reviews */}
              {totalReviewCount > REVIEW_PAGE_SIZE && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={reviewPage}
                    pageSize={REVIEW_PAGE_SIZE}
                    total={totalReviewCount}
                    onChange={handleReviewPageChange}
                    showSizeChanger={false}
                    size="small" // Kích thước nhỏ hơn cho phân trang review
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookDetail;
