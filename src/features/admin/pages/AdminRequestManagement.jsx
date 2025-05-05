// Ví dụ: src/pages/AdminRequestManagement.jsx hoặc src/features/admin/pages/AdminRequestManagement.jsx

import React, { useState, useMemo } from "react";
import {
  Tabs,
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Modal,
  App,
  Spin,
  Avatar,
  Empty,
  Alert,
  Form,
  Input,
  Row,
  Col, // Thêm Form, Input, Row, Col
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  FieldTimeOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  StopOutlined, // Thêm StopOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

import { PATHS } from "../../../routes/routePaths";
import {
  // Hook lấy TẤT CẢ requests và các hooks mutation
  useGetAllBorrowingRequestsQuery,
  useApproveBorrowingRequestMutation,
  useRejectBorrowingRequestMutation,
  // Có thể cần cả hook cancel nếu admin có quyền hủy
  // useCancelBorrowingRequestMutation,
} from "../../requests/api/requestApiSlice"; // <<<=== SỬA ĐƯỜNG DẪN

const { Title, Text, Paragraph } = Typography; // Thêm Paragraph
const { TextArea } = Input;

const PAGE_SIZE = 15; // Page size cho Admin

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
  let color = "default";
  let icon = null;
  let text = status || "N/A";
  const lowerStatus = status?.toLowerCase();
  if (lowerStatus === "waiting") {
    color = "processing";
    icon = <ClockCircleOutlined />;
    text = "Waiting";
  } else if (lowerStatus === "approved") {
    color = "success";
    icon = <CheckCircleOutlined />;
    text = "Approved";
  } else if (lowerStatus === "rejected") {
    color = "error";
    icon = <CloseCircleOutlined />;
    text = "Rejected";
  } else if (lowerStatus === "returned") {
    color = "default";
    icon = <CheckCircleOutlined />;
    text = "Returned";
  } else if (lowerStatus === "cancelled") {
    color = "warning";
    icon = <StopOutlined />;
    text = "Cancelled";
  } // Đổi icon cho Cancelled
  else {
    text = status?.charAt(0).toUpperCase() + status?.slice(1);
  }
  return (
    <Tag color={color} icon={icon} style={{ margin: 0 }}>
      {text}
    </Tag>
  );
};
// ========================================

const AdminRequestManagement = () => {
  const [activeTabKey, setActiveTabKey] = useState("all"); // Bắt đầu với tab 'all' hoặc 'waiting'
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: PAGE_SIZE },
    filters: {}, // { status: ['Waiting'] } // Có thể lọc Waiting mặc định
    sorter: { field: "DateRequested", order: "descend" },
  });
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentRequestToProcess, setCurrentRequestToProcess] = useState(null);

  const { message: messageApi, modal: modalApi } = App.useApp();
  const navigate = useNavigate();

  // === Gọi RTK Query Hook ===
  const queryArgs = useMemo(
    () => ({
      page: tableParams.pagination.current,
      pageSize: tableParams.pagination.pageSize,
      statusFilters: tableParams.filters?.status || null, // Lấy filter status
      // Map tên cột sort nếu cần
      sortBy:
        tableParams.sorter?.field === "requestDate"
          ? "DateRequested"
          : tableParams.sorter?.field,
      sortOrder:
        tableParams.sorter?.order === "ascend"
          ? "asc"
          : tableParams.sorter?.order === "descend"
          ? "desc"
          : undefined,
      // Không cần gửi 'type' nếu backend không dùng
    }),
    [tableParams]
  );

  const {
    data: requestsResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetAllBorrowingRequestsQuery(queryArgs); // Gọi hook lấy TẤT CẢ request

  const [approveRequest, { isLoading: isApproving }] =
    useApproveBorrowingRequestMutation();
  const [rejectRequest, { isLoading: isRejecting }] =
    useRejectBorrowingRequestMutation();
  // ==========================

  // Xử lý data
  const requestsData = useMemo(
    () => requestsResponse?.requests || [],
    [requestsResponse]
  );
  const totalItems = useMemo(
    () => requestsResponse?.totalCount || 0,
    [requestsResponse]
  );

  // --- Handlers ---
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      filters,
      sorter: { field: sorter.field, order: sorter.order },
    });
  };

  // Approve Request
  const handleApprove = (requestId) => {
    modalApi.confirm({
      title: "Confirm Approval",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      content: `Approve request #${requestId}?`,
      okText: "Approve",
      onOk: async () => {
        try {
          await approveRequest(requestId).unwrap();
          messageApi.success(`Request #${requestId} approved!`);
        } catch (err) {
          messageApi.error(err?.data?.message || "Failed to approve.");
        }
      },
    });
  };

  // Reject Request (Modal Control & Submission)
  const showRejectModal = (record) => {
    setCurrentRequestToProcess(record);
    setIsRejectModalVisible(true);
    setRejectReason("");
  };
  const handleRejectCancel = () => {
    setIsRejectModalVisible(false);
    setCurrentRequestToProcess(null);
    setRejectReason("");
  };
  const handleRejectOk = async () => {
    if (!currentRequestToProcess || !rejectReason.trim()) {
      messageApi.error("Please provide a rejection reason.");
      return;
    }
    const requestId = currentRequestToProcess.id;
    try {
      await rejectRequest({ requestId, reason: rejectReason }).unwrap();
      messageApi.success(`Request #${requestId} rejected.`);
      handleRejectCancel();
    } catch (err) {
      messageApi.error(err?.data?.message || "Failed to reject.");
    }
  };

  // --- Định nghĩa Cột ---
  const adminRequestColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
      width: 80,
    },
    {
      title: "Requestor",
      dataIndex: "requestorName",
      key: "requestorName",
      width: 150,
    }, // Thêm cột người yêu cầu
    {
      title: "Requested",
      dataIndex: "requestDate",
      key: "requestDate",
      sorter: true,
      render: formatDateTime,
      width: 180,
      defaultSortOrder: "descend",
    },
    {
      title: "# Books",
      key: "bookCount",
      render: (_, r) => r.books?.length || 0,
      align: "center",
      width: 90,
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 120,
      render: renderStatusTag,
      // Filter cho tất cả trạng thái
      filters: [
        { text: "Waiting", value: "Waiting" },
        { text: "Approved", value: "Approved" },
        { text: "Returned", value: "Returned" },
        { text: "Rejected", value: "Rejected" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      filteredValue: tableParams.filters?.status || null,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: formatDateTime,
      width: 180,
    },
    {
      title: "Processed",
      dataIndex: "dateProcessed",
      key: "dateProcessed",
      render: formatDateTime,
      width: 180,
    }, // Thêm ngày xử lý
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 180,
      fixed: "right", // Tăng width
      render: (_, record) => (
        <div className="flex gap-1 justify-center flex-wrap">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
            //   console.log("Navigating to admin request detail:", PATHS.MY_REQUEST_DETAIL);
              const detailPath = PATHS.MY_REQUEST_DETAIL.replace(':requestId', record.id);
              navigate(detailPath); // Gọi navigate khi nhấn nút
            }}
            // Có thể thêm type="link" hoặc ghost nếu muốn style khác
          >
            Details
          </Button>
          {/* Nút Approve/Reject chỉ hiện khi status là Waiting */}
          {record.status === "waiting" && (
            <>
              <Button
                size="small"
                type="primary"
                ghost
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record.id)}
                loading={
                  isApproving && currentRequestToProcess?.id === record.id
                }
              >
                {" "}
                Approve{" "}
              </Button>
              <Button
                size="small"
                danger
                ghost
                icon={<CloseCircleOutlined />}
                onClick={() => showRejectModal(record)}
              >
                {" "}
                Reject{" "}
              </Button>
            </>
          )}
          {/* Có thể thêm nút xem chi tiết nếu cần, dẫn đến trang khác hoặc modal khác */}
          {/* <Button size="small" icon={<EyeOutlined />}>Details</Button> */}
        </div>
      ),
    },
  ];

  // --- Render Component ---
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={2} className="mb-6">
        Borrowing Request Management
      </Title>

      {isError && !isLoading && (
        <Alert
          message="Error Loading Requests"
          description={"Error"}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {/* *** SỬA CARD Ở ĐÂY *** */}
      <Card variant="borderless" className="shadow-md">
        {/* Bỏ Tabs nếu chỉ có 1 bảng hiển thị tất cả */}
        <Table
          columns={adminRequestColumns}
          dataSource={requestsData}
          rowKey="id"
          loading={isLoading || isFetching}
          pagination={{
            current: tableParams.pagination.current,
            pageSize: tableParams.pagination.pageSize, // Lấy pageSize từ state
            total: totalItems,
            showSizeChanger: true, // Cho phép đổi pageSize
            pageSizeOptions: ["10", "15", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} requests`,
          }}
          onChange={handleTableChange} // Gắn handler
          scroll={{ x: "max-content" }}
        />
        {/* Nếu muốn giữ Tabs, bạn cần tạo tabItems và dùng cấu trúc Tabs như MyRequests cũ */}
        {/* <Tabs defaultActiveKey="all" type="card" items={tabItems} onChange={handleTabChange} /> */}
      </Card>

      {/* Modal Nhập Lý do Từ chối */}
      <Modal
        title={
          <>
            <CloseCircleOutlined className="text-red-500 mr-2" /> Reject Request
            #{currentRequestToProcess?.id}
          </>
        }
        open={isRejectModalVisible}
        onOk={handleRejectOk}
        onCancel={handleRejectCancel}
        confirmLoading={isRejecting} // Dùng state loading của reject mutation
        okText="Confirm Rejection"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        {/* Hiển thị thông tin cơ bản của request bị reject */}
        {currentRequestToProcess && (
          <div className="mb-4 p-3 bg-gray-50 rounded border">
            <Text strong>Requestor:</Text>{" "}
            {currentRequestToProcess.requestorName} <br />
            <Text strong>Date:</Text>{" "}
            {formatDateTime(currentRequestToProcess.requestDate)}
            <br />
            <Text strong>Books:</Text>{" "}
            {currentRequestToProcess.books?.map((b) => b.title).join(", ")}
          </div>
        )}
        {/* Dùng Form của Antd để dễ dàng lấy giá trị */}
        <Form layout="vertical" id="rejectReasonForm" onFinish={handleRejectOk}>
          <Form.Item
            label="Reason for Rejection"
            name="rejectionReasonInput" // Tên field trong form
            rules={[{ required: true, message: "Please provide a reason!" }]}
          >
            <TextArea
              rows={4}
              value={rejectReason} // Controlled component
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why the request is being rejected..."
            />
          </Form.Item>
          {/* Nút submit sẽ là nút OK của Modal */}
        </Form>
      </Modal>

      {/* Modal chi tiết (nếu bạn dùng nút Details thay vì trang riêng) */}
      {/* <Modal title={`Request Details #${selectedRequest?.id}`} open={detailModalVisible} ...> ... </Modal> */}
    </div>
  );
};

export default AdminRequestManagement;
