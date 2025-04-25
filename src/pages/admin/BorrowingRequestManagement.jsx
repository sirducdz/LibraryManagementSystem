import { useState, useEffect } from "react"
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Typography, Tabs, message, Tooltip, Badge } from "antd"
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  StopOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

const BorrowingRequestManagement = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectReason, setRejectReason] = useState("")
  const [activeTab, setActiveTab] = useState("waiting")

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockRequests = [
        {
          id: 1,
          userId: 101,
          userName: "Nguyễn Văn A",
          userEmail: "nguyenvana@example.com",
          requestDate: "2023-06-01",
          status: "waiting",
          books: [
            { id: 1, title: "Sách 1", author: "Tác giả 1", coverImage: "/placeholder.svg?height=50&width=40&text=1" },
            { id: 2, title: "Sách 2", author: "Tác giả 2", coverImage: "/placeholder.svg?height=50&width=40&text=2" },
          ],
        },
        {
          id: 2,
          userId: 102,
          userName: "Trần Thị B",
          userEmail: "tranthib@example.com",
          requestDate: "2023-06-05",
          status: "approved",
          approvedDate: "2023-06-06",
          approverId: 1,
          approverName: "Admin",
          dueDate: "2023-06-20",
          books: [
            { id: 3, title: "Sách 3", author: "Tác giả 3", coverImage: "/placeholder.svg?height=50&width=40&text=3" },
            { id: 4, title: "Sách 4", author: "Tác giả 4", coverImage: "/placeholder.svg?height=50&width=40&text=4" },
            { id: 5, title: "Sách 5", author: "Tác giả 5", coverImage: "/placeholder.svg?height=50&width=40&text=5" },
          ],
        },
        {
          id: 3,
          userId: 103,
          userName: "Lê Văn C",
          userEmail: "levanc@example.com",
          requestDate: "2023-05-10",
          status: "returned",
          approvedDate: "2023-05-11",
          approverId: 1,
          approverName: "Admin",
          returnedDate: "2023-05-20",
          books: [
            { id: 6, title: "Sách 6", author: "Tác giả 6", coverImage: "/placeholder.svg?height=50&width=40&text=6" },
            { id: 7, title: "Sách 7", author: "Tác giả 7", coverImage: "/placeholder.svg?height=50&width=40&text=7" },
          ],
        },
        {
          id: 4,
          userId: 104,
          userName: "Phạm Thị D",
          userEmail: "phamthid@example.com",
          requestDate: "2023-05-15",
          status: "rejected",
          rejectedDate: "2023-05-16",
          rejecterId: 1,
          rejecterName: "Admin",
          rejectedReason: "Người dùng đã vượt quá số lượng yêu cầu mượn trong tháng",
          books: [
            { id: 8, title: "Sách 8", author: "Tác giả 8", coverImage: "/placeholder.svg?height=50&width=40&text=8" },
          ],
        },
        {
          id: 5,
          userId: 105,
          userName: "Hoàng Văn E",
          userEmail: "hoangvane@example.com",
          requestDate: "2023-06-10",
          status: "waiting",
          books: [
            { id: 9, title: "Sách 9", author: "Tác giả 9", coverImage: "/placeholder.svg?height=50&width=40&text=9" },
            {
              id: 10,
              title: "Sách 10",
              author: "Tác giả 10",
              coverImage: "/placeholder.svg?height=50&width=40&text=10",
            },
          ],
        },
      ]

      setRequests(mockRequests)
      setLoading(false)
    }, 1000)
  }, [])

  const showDetailModal = (record) => {
    setSelectedRequest(record)
    setDetailModalVisible(true)
  }

  const showRejectModal = (record) => {
    setSelectedRequest(record)
    setRejectReason("")
    setRejectModalVisible(true)
  }

  const handleApproveRequest = (id) => {
    setLoading(true)
    // Giả lập API call
    setTimeout(() => {
      const updatedRequests = requests.map((req) => {
        if (req.id === id) {
          return {
            ...req,
            status: "approved",
            approvedDate: new Date().toISOString().split("T")[0],
            approverId: 1,
            approverName: "Admin",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split("T")[0],
          }
        }
        return req
      })

      setRequests(updatedRequests)
      setLoading(false)
      message.success("Đã duyệt yêu cầu mượn sách thành công!")
    }, 1000)
  }

  const handleRejectRequest = () => {
    if (!rejectReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối!")
      return
    }

    setLoading(true)
    // Giả lập API call
    setTimeout(() => {
      const updatedRequests = requests.map((req) => {
        if (req.id === selectedRequest.id) {
          return {
            ...req,
            status: "rejected",
            rejectedDate: new Date().toISOString().split("T")[0],
            rejecterId: 1,
            rejecterName: "Admin",
            rejectedReason: rejectReason,
          }
        }
        return req
      })

      setRequests(updatedRequests)
      setLoading(false)
      setRejectModalVisible(false)
      message.success("Đã từ chối yêu cầu mượn sách!")
    }, 1000)
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
  }

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "waiting") return req.status === "waiting"
    if (activeTab === "approved") return req.status === "approved"
    if (activeTab === "returned") return req.status === "returned"
    if (activeTab === "rejected") return req.status === "rejected"
    return true
  })

  const columns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
    },
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <div>
          <div>{record.userName}</div>
          <div className="text-gray-500 text-sm">{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
    },
    {
      title: "Số lượng sách",
      key: "bookCount",
      render: (_, record) => record.books.length,
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
        <Space size="small">
          <Button type="primary" icon={<EyeOutlined />} onClick={() => showDetailModal(record)}>
            Chi tiết
          </Button>

          {record.status === "waiting" && (
            <>
              <Tooltip title="Duyệt yêu cầu">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleApproveRequest(record.id)}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                />
              </Tooltip>

              <Tooltip title="Từ chối yêu cầu">
                <Button danger icon={<StopOutlined />} onClick={() => showRejectModal(record)} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card>
        <Title level={2}>Quản lý yêu cầu mượn sách</Title>

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <Badge count={requests.filter((r) => r.status === "waiting").length} offset={[10, 0]}>
                  <ClockCircleOutlined /> Đang chờ duyệt
                </Badge>
              </span>
            }
            key="waiting"
          />
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined /> Đã duyệt
              </span>
            }
            key="approved"
          />
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined /> Đã trả
              </span>
            }
            key="returned"
          />
          <TabPane
            tab={
              <span>
                <CloseCircleOutlined /> Đã từ chối
              </span>
            }
            key="rejected"
          />
          <TabPane tab={<span>Tất cả</span>} key="all" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal chi tiết yêu cầu */}
      <Modal
        title={`Chi tiết yêu cầu #${selectedRequest?.id}`}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedRequest && (
          <div>
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text strong>Người mượn:</Text>
                  <Text className="ml-2">{selectedRequest.userName}</Text>
                </div>

                <div>
                  <Text strong>Email:</Text>
                  <Text className="ml-2">{selectedRequest.userEmail}</Text>
                </div>

                <div>
                  <Text strong>Ngày yêu cầu:</Text>
                  <Text className="ml-2">{selectedRequest.requestDate}</Text>
                </div>

                <div>
                  <Text strong>Trạng thái:</Text>
                  <Tag
                    className="ml-2"
                    color={
                      selectedRequest.status === "waiting"
                        ? "blue"
                        : selectedRequest.status === "approved"
                          ? "green"
                          : selectedRequest.status === "returned"
                            ? "green"
                            : "red"
                    }
                  >
                    {selectedRequest.status === "waiting"
                      ? "Đang chờ duyệt"
                      : selectedRequest.status === "approved"
                        ? "Đã duyệt"
                        : selectedRequest.status === "returned"
                          ? "Đã trả"
                          : "Đã từ chối"}
                  </Tag>
                </div>

                {selectedRequest.approvedDate && (
                  <div>
                    <Text strong>Ngày duyệt:</Text>
                    <Text className="ml-2">{selectedRequest.approvedDate}</Text>
                  </div>
                )}

                {selectedRequest.approverId && (
                  <div>
                    <Text strong>Người duyệt:</Text>
                    <Text className="ml-2">{selectedRequest.approverName}</Text>
                  </div>
                )}

                {selectedRequest.dueDate && (
                  <div>
                    <Text strong>Hạn trả:</Text>
                    <Text className="ml-2">{selectedRequest.dueDate}</Text>
                  </div>
                )}

                {selectedRequest.returnedDate && (
                  <div>
                    <Text strong>Ngày trả:</Text>
                    <Text className="ml-2">{selectedRequest.returnedDate}</Text>
                  </div>
                )}

                {selectedRequest.rejectedDate && (
                  <div>
                    <Text strong>Ngày từ chối:</Text>
                    <Text className="ml-2">{selectedRequest.rejectedDate}</Text>
                  </div>
                )}

                {selectedRequest.rejecterId && (
                  <div>
                    <Text strong>Người từ chối:</Text>
                    <Text className="ml-2">{selectedRequest.rejecterName}</Text>
                  </div>
                )}
              </div>

              {selectedRequest.rejectedReason && (
                <div className="mt-4">
                  <Text strong>Lý do từ chối:</Text>
                  <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded">
                    {selectedRequest.rejectedReason}
                  </div>
                </div>
              )}
            </div>

            <Title level={4}>Danh sách sách</Title>
            <Table
              dataSource={selectedRequest.books}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: "Ảnh bìa",
                  dataIndex: "coverImage",
                  key: "coverImage",
                  render: (text) => <img src={text || "/placeholder.svg"} alt="Book cover" style={{ width: 40 }} />,
                },
                {
                  title: "Tên sách",
                  dataIndex: "title",
                  key: "title",
                  render: (text, record) => <Link to={`/admin/books/${record.id}`}>{text}</Link>,
                },
                {
                  title: "Tác giả",
                  dataIndex: "author",
                  key: "author",
                },
              ]}
            />

            {selectedRequest.status === "waiting" && (
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="primary"
                  onClick={() => handleApproveRequest(selectedRequest.id)}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Duyệt yêu cầu
                </Button>
                <Button
                  danger
                  onClick={() => {
                    setDetailModalVisible(false)
                    showRejectModal(selectedRequest)
                  }}
                >
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal từ chối yêu cầu */}
      <Modal
        title="Từ chối yêu cầu mượn sách"
        visible={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRejectModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" danger loading={loading} onClick={handleRejectRequest}>
            Xác nhận từ chối
          </Button>,
        ]}
      >
        {selectedRequest && (
          <div>
            <p>
              Bạn đang từ chối yêu cầu mượn sách #{selectedRequest.id} của {selectedRequest.userName}.
            </p>
            <Form layout="vertical">
              <Form.Item
                label="Lý do từ chối"
                required
                rules={[{ required: true, message: "Vui lòng nhập lý do từ chối!" }]}
              >
                <TextArea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối yêu cầu mượn sách..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default BorrowingRequestManagement
