// Ví dụ: src/pages/RequestDetailPage.jsx

import React, { useState, useMemo } from "react"; // Bỏ useEffect nếu không dùng
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Typography,
  Spin,
  Alert,
  Empty,
  Button,
  Row,
  Col,
  Tag,
  Divider,
  Timeline,
  List,
  Avatar,
  Modal,
  App,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";

// --- Sửa đường dẫn import ---
import { PATHS } from "../../../routes/routePaths";
import {
  useGetBorrowingRequestByIdQuery,
  useCancelBorrowingRequestMutation,
  useExtendBorrowingRequestMutation,
} from "../../requests/api/requestApiSlice.js"; // Import hook chi tiết và hủy, gia hạn

const { Title, Text, Paragraph } = Typography;

// --- Hàm Helper định dạng Ngày Giờ Việt Nam (giữ nguyên) ---
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  try {
    let stringToParse = dateString;
    if (
      stringToParse.includes("T") &&
      !stringToParse.endsWith("Z") &&
      !stringToParse.match(/[+-]\d{2}:\d{2}$/)
    ) {
      stringToParse += "Z";
    }
    const date = new Date(stringToParse);
    if (isNaN(date.getTime())) return dateString;
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    };
    return date.toLocaleString("vi-VN", options);
  } catch (e) {
    return dateString;
  }
};

// --- Hàm Helper render Tag Status (giữ nguyên) ---
const renderStatusTag = (status) => {
  let color = "default"; // Màu mặc định
  let icon = null; // Icon mặc định
  let text = status || "N/A"; // Text hiển thị, mặc định là status gốc hoặc N/A

  // Chuẩn hóa status về chữ thường để so sánh không phân biệt hoa thường
  const lowerStatus = status?.toLowerCase();

  // Xác định màu sắc, icon và text dựa trên status đã chuẩn hóa
  if (lowerStatus === "waiting") {
    color = "processing"; // Màu xanh dương cho trạng thái đang xử lý
    icon = <ClockCircleOutlined />;
    text = "Waiting";
  } else if (lowerStatus === "approved") {
    color = "success"; // Màu xanh lá cho trạng thái thành công
    icon = <CheckCircleOutlined />;
    text = "Approved";
  } else if (lowerStatus === "rejected") {
    color = "error"; // Màu đỏ cho trạng thái lỗi/từ chối
    icon = <CloseCircleOutlined />;
    text = "Rejected";
  } else if (lowerStatus === "returned") {
    color = "default"; // Màu xám/mặc định cho trạng thái đã hoàn thành
    icon = <CheckCircleOutlined />; // Có thể dùng icon khác nếu muốn
    text = "Returned";
  } else if (lowerStatus === "cancelled") {
    color = "warning"; // Màu vàng/cam cho trạng thái cảnh báo/hủy
    icon = <StopOutlined />; // Hoặc CloseCircleOutlined
    text = "Cancelled";
  }
  // Nếu có các status khác, bạn có thể thêm các điều kiện else if ở đây
  else {
    // Xử lý cho các status không xác định: viết hoa chữ cái đầu
    text = status?.charAt(0).toUpperCase() + status?.slice(1);
  }

  // Trả về component Tag đã được định dạng
  return (
    <Tag color={color} icon={icon} style={{ margin: 0 }}>
      {text}
    </Tag>
  );
};
// ========================================

const RequestDetailPage = () => {
  const { requestId } = useParams(); // Lấy requestId từ URL
  const navigate = useNavigate();
  const { message: messageApi, modal: modalApi } = App.useApp();

  // State cho modal gia hạn (nếu cần xử lý phức tạp hơn)
  const [extendingLoading, setExtendingLoading] = useState(false); // Vẫn có thể dùng state riêng nếu cần
  const [extendingDetailId, setExtendingDetailId] = useState(null); // Lưu ID chi tiết đang gia hạn
  // === Gọi RTK Query Hooks ===
  const {
    data: request, // Dữ liệu request chi tiết (đã qua transformResponse)
    isLoading,
    isFetching,
    isError,
    error,
    refetch, // Hàm để fetch lại thủ công nếu cần
  } = useGetBorrowingRequestByIdQuery(requestId, {
    skip: !requestId, // Bỏ qua nếu chưa có requestId
    refetchOnMountOrArgChange: true,
  });

  const [cancelRequest, { isLoading: isCancelling }] =
    useCancelBorrowingRequestMutation();
  const [extendRequest, { isLoading: isExtendingApiGlobal }] =
    useExtendBorrowingRequestMutation();

  const handleExtendBook = (borrowingDetailId, bookTitle) => {
    // Nhận borrowingDetailId (chính là bookRecord.id sau khi map)
    console.log("[handleExtendBook] Received borrowingDetailId:", borrowingDetailId);
    if (!request) return;

    modalApi.confirm({
      title: "Confirm Extension Request",
      icon: <ExclamationCircleOutlined />,
      content: `Submit a request to extend the due date for "${
        bookTitle || "this book"
      }"?`,
      okText: "Request Extension",
      cancelText: "Cancel",
      onOk: async () => {
        setExtendingDetailId(borrowingDetailId); // <<<=== Lưu ID chi tiết đang loading
        try {
          console.log("Extending borrowing detail via RTK:", {
            requestId: request.id,
            borrowingDetailId,
          });
          // *** Gọi mutation với object chứa cả requestId và borrowingDetailId ***
          await extendRequest({
            requestId: request.id,
            borrowingDetailId,
          }).unwrap(); // <<<=== TRUYỀN ĐỦ ARGS
          messageApi.success(
            `Extension requested successfully for "${bookTitle}"!`
          );
          // refetch(); // Có thể không cần nếu invalidatesTags hoạt động tốt
        } catch (err) {
          messageApi.error(
            err?.data?.message || "Failed to request extension."
          );
        } finally {
          setExtendingDetailId(null); // <<<=== Xóa ID đang loading
        }
      },
    });
  };
  // ==========================

  // --- Handlers ---
  // Hủy yêu cầu
  const handleCancelRequest = () => {
    if (!request || request.status !== "waiting") return;

    modalApi.confirm({
      title: "Confirm Request Cancellation",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to cancel this borrowing request?",
      okText: "Yes, Cancel",
      okButtonProps: { danger: true },
      cancelText: "No",
      onOk: async () => {
        try {
          await cancelRequest(requestId).unwrap();
          messageApi.success("Request cancelled successfully!");
          // Dữ liệu sẽ tự cập nhật nhờ invalidatesTags
          // Hoặc có thể điều hướng về trang trước / trang danh sách
          navigate(PATHS.MY_REQUESTS || "/my-requests");
        } catch (err) {
          messageApi.error(err?.data?.message || "Failed to cancel request.");
        }
      },
    });
  };

  // Đóng modal chi tiết sách trong bảng con (không cần thiết nếu không mở modal khác)
  // const handleCancelBookDetailModal = () => { /* ... */ };

  // --- Xây dựng Timeline Items ---
  const timelineItems = useMemo(() => {
    if (!request) return [];
    const items = [];
    // 1. Requested
    items.push({
      key: "requested",
      color: "blue",
      dot: <ClockCircleOutlined />,
      label: (
        <Text type="secondary">{formatDateTime(request.requestDate)}</Text>
      ),
      children: <Text strong>Request Submitted</Text>,
    });
    // 2. Processed (Approved/Rejected/Cancelled) - Dùng dateProcessed
    if (request.dateProcessed) {
      if (request.status === "approved" || request.status === "returned") {
        // Coi 'returned' cũng là đã từng 'approved'
        items.push({
          key: "processed-approved",
          color: "green",
          dot: <CheckCircleOutlined />,
          label: (
            <Text type="secondary">
              {formatDateTime(request.dateProcessed)}
            </Text>
          ),
          children: <Text strong>Request Approved</Text>,
        });
      } else if (request.status === "rejected") {
        items.push({
          key: "processed-rejected",
          color: "red",
          dot: <CloseCircleOutlined />,
          label: (
            <Text type="secondary">
              {formatDateTime(request.dateProcessed)}
            </Text>
          ),
          children: (
            <>
              <Text strong>Request Rejected</Text>
              {request.rejectionReason && (
                <>
                  <br />
                  <Text type="secondary">
                    Reason: {request.rejectionReason}
                  </Text>
                </>
              )}
            </>
          ),
        });
      } else if (request.status === "cancelled") {
        items.push({
          key: "processed-cancelled",
          color: "orange",
          dot: <StopOutlined />,
          label: (
            <Text type="secondary">
              {formatDateTime(request.dateProcessed)}
            </Text>
          ),
          children: <Text strong>Request Cancelled</Text>,
        });
      }
    }
    // 3. Due Date (Chỉ hiển thị nếu đã Approved)
    if (
      request.dueDate &&
      (request.status === "approved" || request.status === "returned")
    ) {
      items.push({
        key: "due",
        color: "gold",
        dot: <CalendarOutlined />,
        label: <Text type="secondary">{formatDateTime(request.dueDate)}</Text>,
        children: <Text strong>Due Date</Text>,
      });
    }
    // 4. Returned (Dùng dateProcessed nếu status là Returned)
    if (request.status === "returned" && request.dateProcessed) {
      // Kiểm tra xem ngày processed có sau ngày request không để chắc chắn
      if (
        !request.returnedDate ||
        new Date(request.dateProcessed) >= new Date(request.requestDate)
      ) {
        items.push({
          key: "returned",
          color: "default",
          dot: <CheckCircleOutlined />,
          label: (
            <Text type="secondary">
              {formatDateTime(request.dateProcessed)}
            </Text>
          ), // Dùng dateProcessed làm mốc
          children: <Text strong>Books Returned</Text>,
        });
      }
    }
    // Sắp xếp lại theo thời gian nếu cần (thường không cần nếu các bước logic đúng)
    // items.sort((a, b) => new Date(a.rawDate || 0) - new Date(b.rawDate || 0)); // Cần thêm rawDate nếu muốn sort
    return items;
  }, [request]);

  // --- Render Loading ---
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Spin size="large" tip="Loading Request Details..." />
      </div>
    );
  }

  // --- Render Error/Not Found ---
  if (isError || !request) {
    let title = "Error"; // Tiêu đề mặc định
    let message =
      "Could not load the request details. Please try again or go back."; // Thông báo mặc định

    // Trường hợp không có lỗi nhưng không có dữ liệu (API trả về null/rỗng) -> Not Found
    if (!isError && !request) {
      title = "Request Not Found";
      message =
        "Sorry, the borrowing request you are looking for could not be found.";
    }
    // Trường hợp có lỗi API
    else if (isError) {
      title = "Error Loading Request";
      // Cố gắng lấy thông báo lỗi cụ thể từ API response
      message =
        error?.data?.message || // Kiểm tra message trong data payload
        error?.error || // Kiểm tra lỗi chung từ RTK Query/fetchBaseQuery
        "An unexpected error occurred while fetching request details."; // Thông báo lỗi mặc định
    }

    return (
      // Dùng flex để căn giữa Card theo cả chiều dọc và ngang
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {" "}
        {/* Giảm min-height nếu cần */}
        <Card className="w-full max-w-lg text-center shadow-md rounded-lg p-6">
          {" "}
          {/* Thêm padding cho Card */}
          {/* Dùng Alert nếu có lỗi API */}
          {isError ? (
            <Alert
              message={<span className="font-semibold text-lg">{title}</span>} // Tăng cỡ chữ Title
              description={message}
              type="error"
              showIcon
              className="mb-6 text-left" // Căn trái text trong Alert
            />
          ) : (
            // Dùng Empty nếu chỉ là không tìm thấy
            <div className="py-6">
              <Empty description={message} />
            </div>
          )}
          {/* Nút quay lại danh sách */}
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            // Điều hướng về trang danh sách request
            onClick={() => navigate(PATHS.MY_REQUESTS || "/my-requests")}
            className="mt-4"
          >
            Back to My Requests
          </Button>
          {/* (Tùy chọn) Hiển thị chi tiết lỗi kỹ thuật để debug */}
          {isError && (
            <details className="text-left text-xs mt-6 bg-gray-100 p-2 rounded border">
              <summary className="cursor-pointer font-medium text-gray-600">
                Error Details (for debugging)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words text-red-700">
                {JSON.stringify(
                  { status: error?.status, data: error?.data },
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </Card>
      </div>
    );
  }

  // --- Render Main Content ---
  // Cột cho bảng sách chi tiết trong trang này
  const bookDetailsColumns = [
    {
      title: "Cover",
      dataIndex: "coverImage",
      key: "cover",
      width: 80,
      render: (cover, book) => (
        <Avatar
          shape="square"
          size={64}
          src={cover || "/placeholder-book.png"}
          alt={book.title}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, book) => (
        <Link to={PATHS.BOOK_DETAIL.replace(":bookId", book.id)}>{text}</Link>
      ),
    },
    { title: "Author", dataIndex: "author", key: "author" },

    {
        title: "Original Due", dataIndex: "originalDate", key: "originalDate",
        render: formatDateTime, align: 'center', width: 180
   },
    // --- THÊM CỘT CURRENT DUE ---
    {
        title: "Current Due", dataIndex: "dueDate", key: "dueDate",
        render: formatDateTime, align: 'center', width: 180
    },
    {
      title: "Returned On",
      dataIndex: "returnedDate",
      key: "returnedDate",
      render: formatDateTime,
      align: "center",
      width: 180,
    }, // Hiển thị ngày trả từng cuốn
    // Bỏ nút Gia hạn ở đây nếu API extend là cho cả request hoặc không có isExtended
    // Nếu API extend trả về trạng thái từng cuốn thì thêm lại cột này
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 120, // Tăng width nhẹ
      render: (_, bookRecord) => {
        // bookRecord ở đây là object book trong mảng request.books
        // Điều kiện để hiển thị nút Extend:
        const canExtend =
          request?.status === "approved" &&
          !bookRecord.returnedDate &&
          !bookRecord.isExtended; // Thêm check isExtended
// console.log("bookRecord", bookRecord.id);

        if (canExtend) {
          return (
            <Button
              size="small"
              type="primary"
              ghost
              icon={<FieldTimeOutlined />}
              // Gọi handleExtendBook với ID chi tiết mượn (bookRecord.id) và title
              onClick={() => handleExtendBook(bookRecord.id, bookRecord.title)}
              // Loading chỉ cho nút này
              loading={extendingDetailId === bookRecord.id}
              // Disable nếu đang có nút khác loading
              disabled={extendingDetailId !== null}
            >
              Extend
            </Button>
          );
        }

        // Hiển thị Tag nếu đã gia hạn
        if (request?.status === "approved" && bookRecord.isExtended) {
          return (
            <Tag color="purple" icon={<FieldTimeOutlined />}>
              Extended
            </Tag>
          );
        }

        // Không hiển thị gì hoặc dấu '-' nếu không thể gia hạn hoặc đã trả
        return <Text type="secondary">-</Text>;
      },
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        Back to My Requests
      </Button>

      {isFetching && (
        <div className="text-center mb-4">
          <Spin tip="Updating..." />
        </div>
      )}

      <Card
        variant="borderless"
        className={`shadow-lg transition-opacity duration-300 ${
          isFetching ? "opacity-75" : "opacity-100"
        }`}
      >
        <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
          <div>
            <Title level={2} className="mb-1">
              Request Details #{request.id}
            </Title>
            <Text type="secondary">
              Requested by: {request.requestorFullName} on{" "}
              {formatDateTime(request.requestDate)}
            </Text>
          </div>
          <div>{renderStatusTag(request.status)}</div>
        </div>

        <Row gutter={[32, 32]}>
          {/* Cột Timeline */}
          <Col xs={24} md={10} lg={8}>
            <Title level={4} className="mb-4">
              Request Timeline
            </Title>
            <Timeline items={timelineItems} mode="left" />
            {/* Nút Hủy */}
            {request.status === "waiting" && (
              <div className="mt-6">
                <Button
                  type="primary"
                  danger
                  icon={<StopOutlined />}
                  onClick={handleCancelRequest}
                  loading={isCancelling}
                >
                  Cancel This Request
                </Button>
                <Paragraph type="secondary" className="mt-2 text-xs">
                  Cancelling the request before approval.
                </Paragraph>
              </div>
            )}
          </Col>

          {/* Cột danh sách sách */}
          <Col xs={24} md={14} lg={16}>
            <Title level={4} className="mb-4">
              Requested Books ({request.books?.length || 0})
            </Title>
            <Table
              dataSource={request.books || []}
              columns={bookDetailsColumns} // Dùng columns mới
              rowKey="id"
              pagination={false} // Không cần phân trang cho list sách trong detail
              size="middle"
            />
            {/* Hiển thị các thông tin khác nếu cần */}
            {request.approverFullName && (
              <Paragraph className="mt-4">
                <Text strong>Processed by:</Text> {request.approverFullName}
              </Paragraph>
            )}
            {request.rejectionReason && (
              <div className="mt-4">
                <Text strong className="text-red-600">
                  Rejection Reason:
                </Text>
                <Paragraph type="danger" className="mt-1">
                  {request.rejectionReason}
                </Paragraph>
              </div>
            )}
          </Col>
        </Row>
      </Card>
      {/* Modal không cần thiết ở đây nữa trừ khi có hành động khác */}
    </div>
  );
};

export default RequestDetailPage;
