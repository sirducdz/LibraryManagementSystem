import { useState, useEffect } from "react"
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Switch,
  message,
  Popconfirm,
  Typography,
} from "antd"
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"

const { Title } = Typography
const { Option } = Select

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockUsers = [
        {
          id: 1,
          name: "Nguyễn Văn A",
          email: "nguyenvana@example.com",
          phone: "0901234567",
          role: "admin",
          status: "active",
          createdAt: "2023-01-15",
        },
        {
          id: 2,
          name: "Trần Thị B",
          email: "tranthib@example.com",
          phone: "0912345678",
          role: "user",
          status: "active",
          createdAt: "2023-02-20",
        },
        {
          id: 3,
          name: "Lê Văn C",
          email: "levanc@example.com",
          phone: "0923456789",
          role: "user",
          status: "active",
          createdAt: "2023-03-10",
        },
        {
          id: 4,
          name: "Phạm Thị D",
          email: "phamthid@example.com",
          phone: "0934567890",
          role: "user",
          status: "inactive",
          createdAt: "2023-04-05",
        },
        {
          id: 5,
          name: "Hoàng Văn E",
          email: "hoangvane@example.com",
          phone: "0945678901",
          role: "user",
          status: "active",
          createdAt: "2023-05-12",
        },
      ]

      setUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  const showAddModal = () => {
    setEditingUser(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (record) => {
    setEditingUser(record)
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
      status: record.status === "active",
    })
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleDelete = (id) => {
    setLoading(true)
    // Giả lập API call
    setTimeout(() => {
      setUsers(users.filter((user) => user.id !== id))
      setLoading(false)
      message.success("Xóa người dùng thành công!")
    }, 1000)
  }

  const handleToggleStatus = (id, currentStatus) => {
    setLoading(true)
    // Giả lập API call
    setTimeout(() => {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      const updatedUsers = users.map((user) => {
        if (user.id === id) {
          return { ...user, status: newStatus }
        }
        return user
      })
      setUsers(updatedUsers)
      setLoading(false)
      message.success(`Người dùng đã được ${newStatus === "active" ? "kích hoạt" : "vô hiệu hóa"}!`)
    }, 1000)
  }

  const handleSubmit = (values) => {
    setLoading(true)

    // Giả lập API call
    setTimeout(() => {
      if (editingUser) {
        // Cập nhật người dùng
        const updatedUsers = users.map((user) => {
          if (user.id === editingUser.id) {
            return {
              ...user,
              ...values,
              status: values.status ? "active" : "inactive",
            }
          }
          return user
        })
        setUsers(updatedUsers)
        message.success("Cập nhật người dùng thành công!")
      } else {
        // Thêm người dùng mới
        const newUser = {
          id: users.length + 1,
          ...values,
          status: values.status ? "active" : "inactive",
          createdAt: new Date().toISOString().split("T")[0],
        }
        setUsers([...users, newUser])
        message.success("Thêm người dùng mới thành công!")
      }

      setLoading(false)
      setIsModalVisible(false)
    }, 1000)
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.phone.includes(searchText),
  )

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "purple" : "blue"}>{role === "admin" ? "Quản trị viên" : "Người dùng"}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang hoạt động" : "Đã vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />

          <Button
            type={record.status === "active" ? "default" : "primary"}
            icon={record.status === "active" ? <LockOutlined /> : <UnlockOutlined />}
            onClick={() => handleToggleStatus(record.id, record.status)}
            danger={record.status === "active"}
          />

          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2}>Quản lý người dùng</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm người dùng mới
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
            <Select placeholder="Chọn vai trò">
              <Option value="admin">Quản trị viên</Option>
              <Option value="user">Người dùng</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Vô hiệu hóa" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingUser ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
