import { useState, useEffect } from "react"
import { Card, Row, Col, Statistic, Table, Tag, Button, List, Avatar, Progress, Typography } from "antd"
import {
  BookOutlined,
  UserOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"

const { Title, Text } = Typography

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [recentRequests, setRecentRequests] = useState([])
  const [popularBooks, setPopularBooks] = useState([])

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockStats = {
        totalBooks: 2458,
        totalUsers: 842,
        activeRequests: 28,
        overdueBooks: 12,
        booksThisMonth: 124,
        usersThisMonth: 42,
        requestsThisMonth: 87,
        returnedThisMonth: 65,
      }

      const mockRecentRequests = [
        {
          id: 1,
          userId: 101,
          userName: "Nguyễn Văn A",
          requestDate: "2023-06-01",
          status: "waiting",
          books: 2,
        },
        {
          id: 2,
          userId: 102,
          userName: "Trần Thị B",
          requestDate: "2023-06-05",
          status: "approved",
          books: 3,
        },
        {
          id: 3,
          userId: 103,
          userName: "Lê Văn C",
          requestDate: "2023-05-10",
          status: "returned",
          books: 2,
        },
        {
          id: 4,
          userId: 104,
          userName: "Phạm Thị D",
          requestDate: "2023-05-15",
          status: "rejected",
          books: 1,
        },
        {
          id: 5,
          userId: 105,
          userName: "Hoàng Văn E",
          requestDate: "2023-06-10",
          status: "waiting",
          books: 2,
        },
      ]

      const mockPopularBooks = [
        {
          id: 1,
          title: "Sách 1",
          author: "Tác giả 1",
          borrowCount: 42,
          rating: 4.5,
          coverImage: "/placeholder.svg?height=50&width=40&text=1",
        },
        {
          id: 2,
          title: "Sách 2",
          author: "Tác giả 2",
          borrowCount: 38,
          rating: 4.2,
          coverImage: "/placeholder.svg?height=50&width=40&text=2",
        },
        {
          id: 3,
          title: "Sách 3",
          author: "Tác giả 3",
          borrowCount: 35,
          rating: 4.7,
          coverImage: "/placeholder.svg?height=50&width=40&text=3",
        },
        {
          id: 4,
          title: "Sách 4",
          author: "Tác giả 4",
          borrowCount: 30,
          rating: 4.0,
          coverImage: "/placeholder.svg?height=50&width=40&text=4",
        },
        {
          id: 5,
          title: "Sách 5",
          author: "Tác giả 5",
          borrowCount: 28,
          rating: 4.3,
          coverImage: "/placeholder.svg?height=50&width=40&text=5",
        },
      ]

      setStats(mockStats)
      setRecentRequests(mockRecentRequests)
      setPopularBooks(mockPopularBooks)
      setLoading(false)
    }, 1000)
  }, [])

  const requestColumns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
    },
    {
      title: "Người dùng",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
    },
    {
      title: "Số sách",
      dataIndex: "books",
      key: "books",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        let color = "blue"
        let icon = <ClockCircleOutlined />
        let text = "Đang chờ duyệt"

        if (status === "approved") {
          color = "green"
          icon = <CheckCircleOutlined />
          text = "Đã duyệt"
        } else if (status === "rejected") {
          color = "red"
          icon = <CloseCircleOutlined />
          text = "Đã từ chối"
        } else if (status === "returned") {
          color = "green"
          icon = <CheckCircleOutlined />
          text = "Đã trả"
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        )
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Link to={`/admin/requests/${record.id}`}>
          <Button type="link">Chi tiết</Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="dashboard-header mb-6">
        <Title level={2}>Dashboard</Title>
        <Text type="secondary">Tổng quan về hệ thống quản lý thư viện</Text>
      </div>

      {/* Thống kê */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Tổng số sách"
              value={stats.totalBooks}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#1e40af" }}
              loading={loading}
            />
            <div className="mt-2">
              <span className="text-green-500 text-sm">+{stats.booksThisMonth} </span>
              <span className="text-gray-500 text-sm">trong tháng này</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Tổng số người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#047857" }}
              loading={loading}
            />
            <div className="mt-2">
              <span className="text-green-500 text-sm">+{stats.usersThisMonth} </span>
              <span className="text-gray-500 text-sm">trong tháng này</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Yêu cầu đang chờ"
              value={stats.activeRequests}
              prefix={<SwapOutlined />}
              valueStyle={{ color: "#d97706" }}
              loading={loading}
            />
            <div className="mt-2">
              <span className="text-orange-500 text-sm">+{stats.requestsThisMonth} </span>
              <span className="text-gray-500 text-sm">yêu cầu trong tháng</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Sách quá hạn"
              value={stats.overdueBooks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#dc2626" }}
              loading={loading}
            />
            <div className="mt-2">
              <span className="text-red-500 text-sm">{stats.overdueBooks} </span>
              <span className="text-gray-500 text-sm">cần xử lý</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        {/* Yêu cầu gần đây */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex justify-between items-center">
                <span>Yêu cầu mượn sách gần đây</span>
                <Link to="/admin/requests">
                  <Button type="primary" size="small">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            }
            bordered={false}
            className="recent-books-card"
          >
            <Table
              columns={requestColumns}
              dataSource={recentRequests}
              rowKey="id"
              pagination={false}
              loading={loading}
              size="middle"
            />
          </Card>
        </Col>

        {/* Sách phổ biến */}
        <Col xs={24} lg={8}>
          <Card
            title="Sách được mượn nhiều nhất"
            bordered={false}
            className="active-members-card"
            extra={<Link to="/admin/books">Xem tất cả</Link>}
          >
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={popularBooks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.coverImage} shape="square" size={64} />}
                    title={<Link to={`/admin/books/${item.id}`}>{item.title}</Link>}
                    description={
                      <div>
                        <div className="text-gray-500 text-sm">{item.author}</div>
                        <div className="flex items-center mt-1">
                          <span className="text-blue-600 font-medium">{item.borrowCount}</span>
                          <span className="ml-1 text-xs text-gray-500">lượt mượn</span>
                          <span className="mx-2">|</span>
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{item.rating}</span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê hoạt động */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={12}>
          <Card title="Thống kê theo danh mục" bordered={false}>
            <div className="flex flex-col space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Tiểu thuyết</span>
                  <span className="text-sm text-gray-500">45%</span>
                </div>
                <Progress percent={45} strokeColor="#1e40af" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Khoa học</span>
                  <span className="text-sm text-gray-500">30%</span>
                </div>
                <Progress percent={30} strokeColor="#047857" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Lịch sử</span>
                  <span className="text-sm text-gray-500">15%</span>
                </div>
                <Progress percent={15} strokeColor="#d97706" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Tâm lý học</span>
                  <span className="text-sm text-gray-500">10%</span>
                </div>
                <Progress percent={10} strokeColor="#7c3aed" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Hoạt động trong tháng" bordered={false}>
            <div className="flex flex-col space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Sách được mượn</span>
                  <span className="text-sm text-gray-500">{stats.requestsThisMonth}</span>
                </div>
                <Progress percent={75} strokeColor="#1e40af" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Sách được trả</span>
                  <span className="text-sm text-gray-500">{stats.returnedThisMonth}</span>
                </div>
                <Progress percent={60} strokeColor="#047857" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Người dùng mới</span>
                  <span className="text-sm text-gray-500">{stats.usersThisMonth}</span>
                </div>
                <Progress percent={40} strokeColor="#d97706" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Sách quá hạn</span>
                  <span className="text-sm text-gray-500">{stats.overdueBooks}</span>
                </div>
                <Progress percent={25} strokeColor="#dc2626" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
