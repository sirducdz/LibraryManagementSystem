import { useState, useEffect } from "react"
import { Card, List, Button, Avatar, Typography, Divider, Empty, Modal, Form, Input, message } from "antd"
import { DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const { Title, Text } = Typography
const { confirm } = Modal
const { TextArea } = Input

const BorrowingCart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  useEffect(() => {
    // Lấy giỏ mượn từ localStorage
    const storedCart = JSON.parse(localStorage.getItem("borrowingCart") || "[]")
    setCartItems(storedCart)
  }, [])

  const removeFromCart = (bookId) => {
    const updatedCart = cartItems.filter((item) => item.id !== bookId)
    setCartItems(updatedCart)
    localStorage.setItem("borrowingCart", JSON.stringify(updatedCart))
    message.success("Đã xóa sách khỏi giỏ mượn")
  }

  const clearCart = () => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa tất cả sách khỏi giỏ mượn?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác",
      onOk() {
        setCartItems([])
        localStorage.setItem("borrowingCart", JSON.stringify([]))
        message.success("Đã xóa tất cả sách khỏi giỏ mượn")
      },
    })
  }

  const showRequestModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleSubmitRequest = (values) => {
    setLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log("Borrowing request submitted:", {
        books: cartItems,
        note: values.note,
      })

      // Xóa giỏ mượn sau khi gửi yêu cầu thành công
      setCartItems([])
      localStorage.setItem("borrowingCart", JSON.stringify([]))

      setLoading(false)
      setIsModalVisible(false)

      // Hiển thị thông báo thành công
      Modal.success({
        title: "Gửi yêu cầu mượn sách thành công!",
        content: "Yêu cầu của bạn đã được gửi đến thủ thư. Vui lòng chờ phê duyệt.",
        onOk() {
          navigate("/my-requests")
        },
      })
    }, 1500)
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>Giỏ mượn sách</Title>
          {cartItems.length > 0 && (
            <Button danger onClick={clearCart}>
              Xóa tất cả
            </Button>
          )}
        </div>

        {cartItems.length > 0 ? (
          <>
            <List
              itemLayout="horizontal"
              dataSource={cartItems}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.id)}>
                      Xóa
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.coverImage} shape="square" size={64} />}
                    title={item.title}
                    description={
                      <div>
                        <Text type="secondary">Tác giả: {item.author}</Text>
                        <br />
                        <Text type="secondary">Danh mục: {item.category}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider />

            <div className="flex justify-between items-center">
              <div>
                <Text strong>Tổng số sách: {cartItems.length}/5</Text>
                <br />
                <Text type="secondary">Thời hạn mượn: 14 ngày</Text>
              </div>
              <Button type="primary" size="large" onClick={showRequestModal} disabled={cartItems.length === 0}>
                Gửi yêu cầu mượn
              </Button>
            </div>

            <Modal title="Xác nhận yêu cầu mượn sách" visible={isModalVisible} onCancel={handleCancel} footer={null}>
              <Form form={form} layout="vertical" onFinish={handleSubmitRequest}>
                <div className="mb-4">
                  <Text>Bạn đang yêu cầu mượn {cartItems.length} cuốn sách:</Text>
                  <ul className="mt-2">
                    {cartItems.map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                  </ul>
                </div>

                <Form.Item name="note" label="Ghi chú (không bắt buộc)">
                  <TextArea rows={4} placeholder="Nhập ghi chú cho thủ thư nếu cần..." />
                </Form.Item>

                <div className="flex justify-end gap-2">
                  <Button onClick={handleCancel}>Hủy</Button>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />}>
                    Xác nhận gửi yêu cầu
                  </Button>
                </div>
              </Form>
            </Modal>
          </>
        ) : (
          <Empty description="Giỏ mượn của bạn đang trống" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Button type="primary" onClick={() => navigate("/books")}>
              Tìm sách để mượn
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  )
}

export default BorrowingCart
