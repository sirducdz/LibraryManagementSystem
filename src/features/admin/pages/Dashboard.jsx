// Ví dụ: src/features/admin/pages/AdminDashboard.jsx

import React, { useMemo } from "react"; // Bỏ useState, useEffect nếu không dùng cho mock data nữa
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  List,
  Avatar,
  Progress,
  Typography,
  Spin,
  Alert,
  Skeleton,
} from "antd"; // Thêm Spin, Alert
import {
  BookOutlined,
  UserOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  BarChartOutlined,
  HistoryOutlined,
  EyeOutlined,
  CloseCircleOutlined, // Thêm các icons cần thiết
  TeamOutlined,
  StopOutlined, // Thêm icon
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate

// --- Sửa đường dẫn import ---
import { useGetDashboardDataQuery } from "../api/dashboardApiSlice"; // <<<=== Import hook RTK Query
import { PATHS } from "../../../routes/routePaths"; // <<<=== Sửa đường dẫn

const { Title, Text } = Typography; // Giữ lại Text nếu dùng

// --- Helper Functions (Cần định nghĩa hoặc import) ---
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
  } else {
    text = status?.charAt(0).toUpperCase() + status?.slice(1);
  }
  return (
    <Tag color={color} icon={icon} style={{ margin: 0 }}>
      {text}
    </Tag>
  );
};
// ========================================

const AdminDashboard = () => {
  // *** Bỏ các useState cho mock data ***
  // const [loading, setLoading] = useState(true);
  // const [stats, setStats] = useState({});
  // const [recentRequests, setRecentRequests] = useState([]);
  // const [popularBooks, setPopularBooks] = useState([]);

  const navigate = useNavigate(); // Hook điều hướng

  // === Gọi RTK Query Hook ===
  const {
    data: dashboardData, // Data trả về từ API /Dashboard
    isLoading, // True khi fetch lần đầu
    isFetching, // True khi đang fetch (lần đầu hoặc refetch)
    isError, // True nếu có lỗi
    error, // Object lỗi
  } = useGetDashboardDataQuery(undefined, {
    // Không cần tham số
    pollingInterval: 300000, // Optional: Tự fetch lại sau mỗi 5 phút
    refetchOnMountOrArgChange: true, // Fetch lại khi component mount
  });
  // ==========================

  // *** Bỏ useEffect fetch mock data ***
  // useEffect(() => { ... }, [])

  // Xử lý data từ hook (dùng useMemo để tối ưu và xử lý data null/undefined)
  const stats = useMemo(() => dashboardData?.stats || {}, [dashboardData]);
  const recentRequests = useMemo(
    () => dashboardData?.recentRequests || [],
    [dashboardData]
  );
  const popularBooks = useMemo(
    () => dashboardData?.popularBooks || [],
    [dashboardData]
  );

  // --- Columns cho bảng Recent Requests ---
  const requestColumns = useMemo(
    () => [
      // Bọc useMemo
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 70,
        render: (id) => `#${id}`,
      },
      { title: "User", dataIndex: "userName", key: "userName", ellipsis: true }, // API trả về userName
      {
        title: "Date",
        dataIndex: "requestDate",
        key: "requestDate",
        render: formatDateTime,
        width: 180,
      }, // API trả về requestDate
      {
        title: "# Books",
        dataIndex: "booksCount",
        key: "booksCount",
        align: "center",
        width: 90,
      }, // API trả về booksCount
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: renderStatusTag,
        width: 120,
      }, // API trả về status
      {
        title: "Action",
        key: "action",
        align: "center",
        width: 90,
        render: (_, record) => (
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(
                `${PATHS.ADMIN_REQUEST_MANAGEMENT || "/admin/requests"}/${
                  record.id
                }`
              )
            }
          >
            View
          </Button>
        ),
      },
    ],
    [navigate]
  ); // Thêm navigate vào dependency

  // --- Columns cho bảng Popular Books ---
  const bookColumns = useMemo(
    () => [
      // Bọc useMemo
      {
        title: "Cover",
        dataIndex: "coverImageUrl",
        key: "cover",
        width: 60, // Dùng coverImageUrl từ API
        render: (imgUrl, record) => (
          <Avatar
            shape="square"
            size="large"
            src={imgUrl || "/placeholder-book.png"}
            alt={record.title}
            icon={<BookOutlined />}
          />
        ),
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        // Link tới trang chi tiết sách (trang user hay admin?)
        render: (text, record) => (
          <Link to={PATHS.BOOK_DETAIL.replace(":bookId", record.id)}>
            {text}
          </Link>
        ),
      },
      {
        title: "Author",
        dataIndex: "author",
        key: "author",
        responsive: ["md"],
      }, // Ẩn trên mobile
      {
        title: "Borrows",
        dataIndex: "borrowCount",
        key: "borrowCount",
        align: "center",
        sorter: (a, b) => a.borrowCount - b.borrowCount,
        defaultSortOrder: "descend",
      }, // Thêm sort
      {
        title: "Rating",
        dataIndex: "rating",
        key: "rating",
        align: "center",
        render: (rating) => (rating > 0 ? rating.toFixed(1) : "-"),
        sorter: (a, b) => a.rating - b.rating,
      }, // Thêm sort
    ],
    []
  ); // Không có dependency nếu không đổi

  // --- Render Loading State ---
  if (isLoading) {
    // Chỉ dùng isLoading cho lần tải đầu tiên
    return (
      <div className="p-8">
        <Skeleton active paragraph={{ rows: 1 }} className="mb-6" />
        <Row gutter={[16, 16]}>
          {[...Array(4)].map((_, i) => (
            <Col xs={24} sm={12} lg={6} key={`stat-skel-${i}`}>
              <Skeleton active paragraph={{ rows: 1 }} />
            </Col>
          ))}
          <Col span={24}>
            <Skeleton active paragraph={{ rows: 4 }} className="mt-6" />
          </Col>
          <Col span={24}>
            <Skeleton active paragraph={{ rows: 4 }} className="mt-6" />
          </Col>
        </Row>
      </div>
    );
  }

  // --- Render Error State ---
  if (isError) {
    return (
      <div className="p-8">
        <Alert
          message="Error Loading Dashboard Data"
          description={
            error?.data?.message ||
            error?.error ||
            "Could not load dashboard data. Please try refreshing."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  // --- Render Main Content ---
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <Title level={2} className="mb-0">
        Admin Dashboard
      </Title>

      {/* Hiển thị Spin nhỏ khi đang fetch lại dữ liệu */}
      {isFetching && (
        <div className="text-center">
          <Spin tip="Refreshing data..." />
        </div>
      )}

      {/* Statistics Section */}
      <Row gutter={[16, 16]}>
        {/* Dùng stats từ hook, thêm optional chaining và giá trị mặc định */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bordered={false}
            className="shadow hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Total Books"
              value={stats?.totalBooks ?? 0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bordered={false}
            className="shadow hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bordered={false}
            className="shadow hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Active Requests"
              value={stats?.activeRequests ?? 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{
                color: stats?.activeRequests > 0 ? "#faad14" : undefined,
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bordered={false}
            className="shadow hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Overdue Books"
              value={stats?.overdueBooks ?? 0}
              prefix={<WarningOutlined />}
              valueStyle={{
                color: stats?.overdueBooks > 0 ? "#f5222d" : undefined,
              }}
            />
          </Card>
        </Col>
        {/* Thêm các thẻ Stats khác nếu cần, ví dụ: */}
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bordered={false}
            className="shadow hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Requests (Month)"
              value={stats?.requestsThisMonth ?? 0}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card
            bordered={false}
            className="shadow hover:shadow-md transition-shadow"
          >
            <Statistic
              title="Returned (Month)"
              value={stats?.returnedThisMonth ?? 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Requests & Popular Books Section */}
      <Row gutter={[24, 24]}>
        {/* Recent Requests */}
        <Col xs={24} lg={14} xl={16}>
          <Card
            title={
              <Title level={4} className="mb-0">
                Recent Borrowing Requests
              </Title>
            }
            bordered={false}
            className="shadow hover:shadow-md transition-shadow h-full"
          >
            <Table
              columns={requestColumns}
              dataSource={recentRequests} // Dùng data từ hook
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5, hideOnSinglePage: true }} // Giới hạn 5 item, ẩn nếu ít hơn
              // Không cần loading ở đây vì dùng isFetching chung ở trên
              scroll={{ x: "max-content" }}
            />
            <div className="text-right mt-2">
              <Button
                type="link"
                onClick={() =>
                  navigate(PATHS.ADMIN_REQUEST_MANAGEMENT || "/admin/requests")
                }
              >
                View All Requests
              </Button>
            </div>
          </Card>
        </Col>

        {/* Popular Books */}
        <Col xs={24} lg={10} xl={8}>
          <Card
            title={
              <Title level={4} className="mb-0">
                Most Popular Books
              </Title>
            }
            bordered={false}
            className="shadow hover:shadow-md transition-shadow h-full"
          >
            <Table // Dùng Table thay List để có sort
              columns={bookColumns}
              dataSource={popularBooks} // Dùng data từ hook
              rowKey="id"
              size="small"
              pagination={false} // Không phân trang list top
            />
            <div className="text-right mt-2">
              <Button
                type="link"
                onClick={() =>
                  navigate(PATHS.ADMIN_BOOK_MANAGEMENT || "/admin/books")
                }
              >
                View All Books
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Các thống kê khác (Progress bars - Giữ nguyên JSX nếu muốn) */}
      {/* <Row gutter={[16, 16]} className="mt-6"> ... </Row> */}
    </div>
  );
};

export default AdminDashboard;
