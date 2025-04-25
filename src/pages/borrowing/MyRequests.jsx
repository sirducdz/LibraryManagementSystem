import { useState, useEffect } from "react"
import { Tabs, Card, Table, Tag, Button, Typography, Modal, message } from "antd"
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"

const { Title, Text } = Typography
const { TabPane } = Tabs

const MyRequests = () => {
  const [activeRequests, setActiveRequests] = useState([])
  const [historyRequests, setHistoryRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockActiveRequests = [
        {
          id: 1,
          requestDate: "2023-06-01",
          status: "waiting",
          books: [
            { id: 1, title: "Sách 1", author: "Tác giả 1" },
            { id: 2, title: "Sách 2", author: "Tác giả 2" },
          ],
        },
        {
          id: 2,
          requestDate: "2023-06-05",
          status: "approved",
          approvedDate: "2023-06-06",
          dueDate: "2023-06-20",
          books: [
            { id: 3, title: "Sách 3", author: "Tác giả 3" },
            { id: 4, title: "Sách 4", author: "Tác giả 4" },
            { id: 5, title: "Sách 5", author: "Tác giả 5" },
          ],
        },
      ]

      const mockHistoryRequests = [
        {
          id: 3,
          requestDate: "2023-05-10",
          status: "returned",
          approvedDate: "2023-05-11",
          returnedDate: "2023-05-20",
          books: [
            { id: 6, title: "Sách 6", author: "Tác giả 6", isExtended: false },
            { id: 7, title: "Sách 7", author: "Tác giả 7", isExtended: true },
          ],
        },
        {
          id: 4,
          requestDate: "2023-05-15",
          status: "rejected",
          rejectedDate: "2023-05-16",
          rejectedReason: "Bạn đã vượt quá số lượng yêu cầu mượn trong tháng",
          books: [{ id: 8, title: "Sách 8", author: "Tác giả 8" }],
        },
      ]

      setActiveRequests(mockActiveRequests)
      setHistoryRequests(mockHistoryRequests)
      setLoading(false)
    }, 1000)
  }, [])

  const showDetailModal = (record) => {
    setSelectedRequest(record)
    setDetailModalVisible(true)
  }

  const handleExtendBook = (requestId, bookId) => {
    // Giả lập API call
    setLoading(true)
    setTimeout(() => {
      message.success("Đã gửi yêu cầu gia hạn thành công!")
      setLoading(false)

      // Cập nhật UI
      const updatedRequests = activeRequests.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            books: req.books.map((book) => {
              if (book.id === bookId) {
                return { ...book, isExtended: true }
              }
              return book
            }),
          }
        }
        return req
      })

      setActiveRequests(updatedRequests)
    }, 1000)
  }

  const activeRequestColumns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
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
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        )
      },
    },
    {
      title: "Hạn trả",
      key: "dueDate",
      render: (_, record) => record.dueDate || "-",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="primary" icon={<EyeOutlined />} onClick={() => showDetailModal(record)}>
          Chi tiết
        </Button>
      ),
    },
  ]

  const historyRequestColumns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "id",
      key: "id",
      render: (id) => `#${id}`,
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
        let color = "green"
        let icon = <CheckCircleOutlined />
        let text = "Đã trả"

        if (status === "rejected") {
          color = "red"
          icon = <CloseCircleOutlined />
          text = "Đã từ chối"
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        )
      },
    },
    {
      title: "Ngày trả/từ chối",
      key: "completedDate",
      render: (_, record) => record.returnedDate || record.rejectedDate || "-",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="primary" icon={<EyeOutlined />} onClick={() => showDetailModal(record)}>
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Title level={2}>Yêu cầu mượn sách của tôi</Title>

      <Tabs defaultActiveKey="active">
        <TabPane
          tab={
            <span>
              <ClockCircleOutlined />
              Yêu cầu đang xử lý
            </span>
          }
          key="active"
        >
          <Card>
            <Table
              columns={activeRequestColumns}
              dataSource={activeRequests}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              Lịch sử yêu cầu
            </span>
          }
          key="history"
        >
          <Card>
            <Table
              columns={historyRequestColumns}
              dataSource={historyRequests}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>

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
                  title: "Tên sách",
                  dataIndex: "title",
                  key: "title",
                  render: (text, record) => <Link to={`/books/${record.id}`}>{text}</Link>,
                },
                {
                  title: "Tác giả",
                  dataIndex: "author",
                  key: "author",
                },
                {
                  title: "Trạng thái gia hạn",
                  key: "extension",
                  render: (_, record) => {
                    if (selectedRequest.status !== "approved") return "-"

                    return record.isExtended ? (
                      <Tag color="green">Đã gia hạn</Tag>
                    ) : (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => handleExtendBook(selectedRequest.id, record.id)}
                      >
                        Gia hạn
                      </Button>
                    )
                  },
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MyRequests
