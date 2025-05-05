// Ví dụ: src/pages/MyRequests.jsx hoặc src/features/requests/pages/MyRequests.jsx

import React, { useState, useEffect, useMemo } from "react"; // Thêm useMemo
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
  Pagination,
  Row,
  Col,
} from "antd"; // Thêm các component cần thiết
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
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

// --- Sửa đường dẫn import nếu cần ---
import { PATHS } from "../../../routes/routePaths";
import {
  useGetBorrowingRequestsQuery,
  useExtendBorrowingRequestMutation,
} from "../../requests/api/requestApiSlice.js"; // Đảm bảo đúng tên slice và hook

const { Title, Text } = Typography;
// const { TabPane } = Tabs; // Không dùng

const PAGE_SIZE = 10; // Kích thước trang mặc định

const MyRequests = () => {
  const [activeTabKey, setActiveTabKey] = useState("active");
  // State cho params của Table (pagination, filters, sorter) cho từng tab
  const [tableParams, setTableParams] = useState({
    active: {
      pagination: { current: 1, pageSize: PAGE_SIZE },
      filters: {},
      sorter: { field: "DateRequested", order: "descend" },
    },
    history: {
      pagination: { current: 1, pageSize: PAGE_SIZE },
      filters: {},
      sorter: { field: "DateRequested", order: "descend" },
    },
  });
  // State cho modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Hooks
  const { message: messageApi, modal: modalApi } = App.useApp();
  const navigate = useNavigate();

  // === Gọi RTK Query Hook ===
  const currentTableParams = tableParams[activeTabKey]; // Lấy params của tab hiện tại
  const {
    data: requestsResponse,
    isLoading, // Loading lần đầu (cho cả 2 tab khi component mount)
    isFetching, // True khi đang fetch lại dữ liệu (đổi tab, trang, filter, sort)
    isError, // Có lỗi fetch không
    error, // Chi tiết lỗi
  } = useGetBorrowingRequestsQuery(
    {
      type: activeTabKey,
      page: currentTableParams.pagination.current,
      pageSize: currentTableParams.pagination.pageSize,
      statusFilters: currentTableParams.filters?.status || null, // Lấy mảng status hoặc null
      // Map tên cột sort từ Table (vd: requestDate) sang tên backend (vd: DateRequested)
      sortBy:
        currentTableParams.sorter?.field === "requestDate"
          ? "DateRequested"
          : currentTableParams.sorter?.field,
      sortOrder:
        currentTableParams.sorter?.order === "ascend"
          ? "asc"
          : currentTableParams.sorter?.order === "descend"
          ? "desc"
          : "desc", // Mặc định desc nếu ko có sorter
    },
    {
    //   refetchOnMountOrArgChange: 15, // Mặc định
      refetchOnMountOrArgChange: true, // Mặc định
    }
  );

  console.log("currentTableParams.sorter?.order:", currentTableParams.sorter?.order);
  

  // Hook mutation gia hạn
  const [extendRequest, { isLoading: isExtendingApi }] =
    useExtendBorrowingRequestMutation();
  // ==========================

  // Xử lý data trả về từ hook query
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
    // pagination trả về { current, pageSize, total }
    // filters trả về { dataIndex: [value1, value2] } ví dụ: { status: ['Waiting', 'Approved'] }
    // sorter trả về { field, order: 'ascend' | 'descend' | null }
    console.log(`Table Change [${activeTabKey}]:`, {
      pagination,
      filters,
      sorter,
    });
    setTableParams((prev) => ({
      ...prev,
      [activeTabKey]: {
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
        },
        filters: filters,
        sorter: { field: sorter.field, order: sorter.order },
      },
    }));
  };

  const showDetailModal = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };
  const handleCancelDetailModal = () => {
    setDetailModalVisible(false);
  };

  const handleExtendBook = (requestId, bookId) => {
    modalApi.confirm({
      title: "Confirm Extension Request",
      icon: <ExclamationCircleOutlined />,
      content: `Submit a request to extend the due date for this book?`,
      okText: "Request Extension",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await extendRequest({ requestId, bookId }).unwrap();
          messageApi.success("Extension request submitted successfully!");
        } catch (err) {
          messageApi.error(
            err?.data?.message || "Failed to request extension."
          );
        }
      },
    });
  };

  // --- Định nghĩa cột ---
  // Hàm helper tạo Tag Status
  const renderStatusTag = (status) => {
    let color = "default";
    let icon = null;
    let text = status || "N/A";
    const lowerStatus = status?.toLowerCase(); // Chuẩn hóa về chữ thường để so sánh

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
      icon = <CloseCircleOutlined />;
      text = "Cancelled";
    }

    return (
      <Tag color={color} icon={icon} style={{ margin: 0 }}>
        {text}
      </Tag>
    );
  };

  // Hàm helper format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        let stringToParse = dateString;

        // --- THÊM LOGIC XỬ LÝ CHUỖI KHÔNG CÓ MÚI GIỜ ---
        // Kiểm tra đơn giản: Nếu có chữ 'T' nhưng không kết thúc bằng 'Z' hoặc offset (+/-HH:MM)
        if (stringToParse.includes('T') && !stringToParse.endsWith('Z') && !stringToParse.match(/[+-]\d{2}:\d{2}$/)) {
            //  console.warn(`formatDateTime: Input string "${dateString}" lacks timezone info. Assuming UTC and appending 'Z'.`);
             stringToParse += 'Z'; // Thêm 'Z' để new Date() hiểu là UTC
         }
         // ---------------------------------------------

        // Parse chuỗi đã được chuẩn hóa (hoặc chuỗi gốc nếu đã có Z/offset)
        const date = new Date(stringToParse);

        if (isNaN(date.getTime())) {
            console.warn(`formatDateTime: Could not parse date string: "${stringToParse}"`);
            return dateString;
        }

        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh' // Luôn chuyển về múi giờ VN
        };

        const formatted = date.toLocaleString('vi-VN', options);
        // console.log(`Formatted "${stringToParse}" to "${formatted}" (Target: Asia/Ho_Chi_Minh)`);
        return formatted;

    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString;
    }
  };
  //   const formatDateTime = (dateString) => {
  //     if (!dateString) return "-"; // Trả về '-' nếu không có ngày
  //     try {
  //         const date = new Date(dateString);
  //         // Kiểm tra xem date có hợp lệ không sau khi parse
  //         if (isNaN(date.getTime())) {
  //             return dateString; // Trả về chuỗi gốc nếu không parse được
  //         }
  //         // Sử dụng toLocaleString với options để có Ngày/Tháng/Năm Giờ:Phút:Giây
  //         // Locale 'vi-VN' hoặc 'en-GB' thường cho định dạng dd/MM/yyyy
  //         const options = {
  //             year: 'numeric', month: '2-digit', day: '2-digit',
  //             hour: '2-digit', minute: '2-digit', second: '2-digit',
  //             hour12: false // Sử dụng định dạng 24 giờ
  //         };
  //         return date.toLocaleString('vi-VN', options); // Hoặc 'en-GB'
  //     } catch (e) {
  //         console.error("Error formatting date:", dateString, e);
  //         return dateString; // Trả về chuỗi gốc nếu có lỗi
  //     }
  // };

  const activeRequestColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
      width: 80,
    },
    {
      title: "Requested",
      dataIndex: "requestDate",
      key: "requestDate",
      sorter: true,
      render: formatDate,
      width: 130,
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
      render: renderStatusTag, // Dùng hàm helper
      // !!! VALUE filter phải khớp giá trị backend mong đợi (viết hoa?) !!!
      filters: [
        { text: "Waiting", value: "Waiting" },
        { text: "Approved", value: "Approved" },
      ],
      filteredValue: tableParams.active.filters?.status || null,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: formatDate,
      width: 130,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 100,
      render: (_, record) => {
        // *** SỬA onClick ĐỂ NAVIGATE ***
        // Tạo đường dẫn đến trang chi tiết request
        // Giả sử PATHS.MY_REQUESTS là '/my-requests'
        // Hoặc bạn có thể định nghĩa PATHS.MY_REQUEST_DETAIL = '/my-request/:requestId'
        // const detailPath = (PATHS.MY_REQUESTS || '/my-requests') + `/${record.id}`;
        // Hoặc nếu dùng PATHS.MY_REQUEST_DETAIL = '/my-request/:requestId'
        const detailPath = PATHS.MY_REQUEST_DETAIL.replace(':requestId', record.id);

        return (
             <Button
                 size="small"
                 icon={<EyeOutlined />}
                 onClick={() => navigate(detailPath)} // <<<=== GỌI NAVIGATE
             >
                 Details
             </Button>
        );
        // =============================
     }
    },
  ];

  const historyRequestColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
      width: 80,
    },
    {
      title: "Requested",
      dataIndex: "requestDate",
      key: "requestDate",
      sorter: true,
      render: formatDate,
      width: 130,
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
      // !!! VALUE filter phải khớp giá trị backend mong đợi (viết hoa?) !!!
      filters: [
        { text: "Returned", value: "Returned" },
        { text: "Rejected", value: "Rejected" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      filteredValue: tableParams.history.filters?.status || null,
    },
    {
      title: "Completed",
      key: "completedDate",
      render: (_, r) =>
        formatDate(r.returnedDate || r.rejectedDate || r.cancelledDate),
      width: 130,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 100,
      render: (_, record) => {
        // *** SỬA onClick ĐỂ NAVIGATE ***
        // Tạo đường dẫn đến trang chi tiết request
        // Giả sử PATHS.MY_REQUESTS là '/my-requests'
        // Hoặc bạn có thể định nghĩa PATHS.MY_REQUEST_DETAIL = '/my-request/:requestId'
        // const detailPath = (PATHS.MY_REQUESTS || '/my-requests') + `/${record.id}`;
        // Hoặc nếu dùng PATHS.MY_REQUEST_DETAIL = '/my-request/:requestId'
        const detailPath = PATHS.MY_REQUEST_DETAIL.replace(':requestId', record.id);

        return (
             <Button
                 size="small"
                 icon={<EyeOutlined />}
                 onClick={() => navigate(detailPath)} // <<<=== GỌI NAVIGATE
             >
                 Details
             </Button>
        );
        // =============================
     }
    },
  ];

  // Cột trong Modal (bỏ cột Extension)
  const modalBookColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Link
          to={PATHS.BOOK_DETAIL.replace(":bookId", record.id)}
          onClick={handleCancelDetailModal}
        >
          {text}
        </Link>
      ),
    },
    // { title: "Author", dataIndex: "author", key: "author" }, // Bỏ nếu book object trong request không có author
  ];

  // --- Tạo items cho Tabs ---
  const createTabContent = (type) => {
    const currentParams = tableParams[type];
    // Kiểm tra xem tab hiện tại có phải là tab đang active không
    // Chỉ truyền dataSource nếu đúng là tab đang active để tránh lỗi state không khớp
    const isActiveTab = activeTabKey === type;
    return (
      <Table
        columns={
          type === "active" ? activeRequestColumns : historyRequestColumns
        }
        // Chỉ truyền dataSource nếu tab này đang active và không có lỗi
        dataSource={isActiveTab && !isError ? requestsData : []}
        rowKey="id"
        // Loading nếu là lần đầu hoặc đang fetch lại cho ĐÚNG tab này
        loading={isLoading || (isFetching && isActiveTab)}
        pagination={{
          current: currentParams.pagination.current,
          pageSize: PAGE_SIZE,
          total: isActiveTab ? totalItems : 0, // Chỉ hiển thị total cho tab active
          showSizeChanger: false,
          hideOnSinglePage: true,
        }}
        onChange={(p, f, s) => handleTableChange(p, f, s, type)}
        scroll={{ x: "max-content" }}
      />
    );
  };

  const tabItems = [
    {
      key: "active",
      // Hiển thị totalItems khi không loading và tab đang active
      label: `Active Requests (${
        !isLoading && activeTabKey === "active" ? totalItems : "..."
      })`,
      children: createTabContent("active"),
    },
    {
      key: "history",
      label: `Request History (${
        !isLoading && activeTabKey === "history" ? totalItems : "..."
      })`,
      children: createTabContent("history"),
    },
  ];

  // --- Render Component ---
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Title level={2} className="mb-6">
        My Borrowing Requests
      </Title>

      {/* Alert lỗi chung */}
      {isError && !isLoading && (
        <Alert
          message="Error Loading Data"
          description={
            error?.data?.message ||
            error?.error ||
            "Could not fetch borrowing requests. Please refresh or try again later."
          }
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Card variant="borderless" className="shadow-md">
        <Tabs
          activeKey={activeTabKey}
          type="card"
          onChange={setActiveTabKey} // Đổi tab active khi người dùng click
          items={tabItems}
        />
      </Card>

      {/* Modal chi tiết */}
      <Modal
        title={`Request Details #${selectedRequest?.id}`}
        open={detailModalVisible}
        onCancel={handleCancelDetailModal}
        footer={[
          <Button key="close" onClick={handleCancelDetailModal}>
            {" "}
            Close{" "}
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        {/* Spin bao ngoài nội dung modal khi đang gia hạn */}
        <Spin spinning={isExtendingApi} tip="Processing...">
          {selectedRequest && (
            <div>
              <div className="mb-6">
                <Title level={4} className="mb-3">
                  Request Information
                </Title>
                <Row gutter={[16, 10]}>
                  <Col xs={24} sm={12}>
                    <Text strong>Request Date:</Text>{" "}
                    <Text>{formatDate(selectedRequest.requestDate)}</Text>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text strong>Status:</Text>{" "}
                    <span className="ml-2">
                      {renderStatusTag(selectedRequest.status)}
                    </span>
                  </Col>
                  {selectedRequest.approvedDate && (
                    <Col xs={24} sm={12}>
                      <Text strong>Approved:</Text>{" "}
                      <Text>{formatDate(selectedRequest.approvedDate)}</Text>
                    </Col>
                  )}
                  {selectedRequest.dueDate && (
                    <Col xs={24} sm={12}>
                      <Text strong>Due:</Text>{" "}
                      <Text>{formatDate(selectedRequest.dueDate)}</Text>
                    </Col>
                  )}
                  {selectedRequest.returnedDate && (
                    <Col xs={24} sm={12}>
                      <Text strong>Returned:</Text>{" "}
                      <Text>{formatDate(selectedRequest.returnedDate)}</Text>
                    </Col>
                  )}
                  {selectedRequest.rejectedDate && (
                    <Col xs={24} sm={12}>
                      <Text strong>Rejected:</Text>{" "}
                      <Text>{formatDate(selectedRequest.rejectedDate)}</Text>
                    </Col>
                  )}
                  {selectedRequest.cancelledDate && (
                    <Col xs={24} sm={12}>
                      <Text strong>Cancelled:</Text>{" "}
                      <Text>{formatDate(selectedRequest.cancelledDate)}</Text>
                    </Col>
                  )}
                </Row>
                {selectedRequest.rejectionReason && (
                  <div className="mt-4">
                    <Text strong>Rejection Reason:</Text>
                    <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                      {selectedRequest.rejectionReason}
                    </div>
                  </div>
                )}
              </div>
              <Title level={4} className="mb-3">
                Requested Books
              </Title>
              <Table
                dataSource={selectedRequest.books || []}
                columns={modalBookColumns} // Đã bỏ cột Extension
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default MyRequests;
