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
  Upload,
  message,
  Popconfirm,
  Typography,
} from "antd"
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const BookManagement = () => {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockCategories = [
        { id: 1, name: "Tiểu thuyết" },
        { id: 2, name: "Khoa học" },
        { id: 3, name: "Lịch sử" },
        { id: 4, name: "Tâm lý học" },
        { id: 5, name: "Kinh tế" },
      ]

      const mockBooks = Array(20)
        .fill()
        .map((_, index) => ({
          id: index + 1,
          title: `Sách ${index + 1}`,
          author: `Tác giả ${(index % 5) + 1}`,
          publisher: "NXB Trẻ",
          publishYear: "2022",
          isbn: `978-123456789-${index}`,
          categoryId: mockCategories[index % 5].id,
          category: mockCategories[index % 5].name,
          pages: 320,
          language: "Tiếng Việt",
          available: index % 3 !== 0,
          coverImage: `/placeholder.svg?height=50&width=40&text=${index + 1}`,
        }))

      setCategories(mockCategories)
      setBooks(mockBooks)
      setLoading(false)
    }, 1000)
  }, [])

  const showAddModal = () => {
    setEditingBook(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (record) => {
    setEditingBook(record)
    form.setFieldsValue({
      title: record.title,
      author: record.author,
      publisher: record.publisher,
      publishYear: record.publishYear,
      isbn: record.isbn,
      categoryId: record.categoryId,
      pages: record.pages,
      language: record.language,
      description: record.description || "",
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
      setBooks(books.filter((book) => book.id !== id))
      setLoading(false)
      message.success("Xóa sách thành công!")
    }, 1000)
  }

  const handleSubmit = (values) => {
    setLoading(true)

    // Giả lập API call
    setTimeout(() => {
      if (editingBook) {
        // Cập nhật sách
        const updatedBooks = books.map((book) => {
          if (book.id === editingBook.id) {
            return {
              ...book,
              ...values,
              category: categories.find((c) => c.id === values.categoryId)?.name,
            }
          }
          return book
        })
        setBooks(updatedBooks)
        message.success("Cập nhật sách thành công!")
      } else {
        // Thêm sách mới
        const newBook = {
          id: books.length + 1,
          ...values,
          category: categories.find((c) => c.id === values.categoryId)?.name,
          available: true,
          coverImage: `/placeholder.svg?height=50&width=40&text=${books.length + 1}`,
        }
        setBooks([...books, newBook])
        message.success("Thêm sách mới thành công!")
      }

      setLoading(false)
      setIsModalVisible(false)
    }, 1000)
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchText.toLowerCase()) ||
      book.author.toLowerCase().includes(searchText.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchText.toLowerCase()),
  )

  const columns = [
    {
      title: "Ảnh bìa",
      dataIndex: "coverImage",
      key: "coverImage",
      render: (text) => <img src={text || "/placeholder.svg"} alt="Book cover" style={{ width: 40 }} />,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text, record) => <Link to={`/admin/books/${record.id}`}>{text}</Link>,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "ISBN",
      dataIndex: "isbn",
      key: "isbn",
    },
    {
      title: "Năm XB",
      dataIndex: "publishYear",
      key: "publishYear",
    },
    {
      title: "Tình trạng",
      dataIndex: "available",
      key: "available",
      render: (available) => <Tag color={available ? "green" : "red"}>{available ? "Có sẵn" : "Đang mượn"}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sách này?"
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
          <Title level={2}>Quản lý sách</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm sách mới
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm theo tên sách, tác giả, ISBN..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredBooks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingBook ? "Chỉnh sửa sách" : "Thêm sách mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề sách!" }]}
            >
              <Input placeholder="Nhập tiêu đề sách" />
            </Form.Item>

            <Form.Item
              name="author"
              label="Tác giả"
              rules={[{ required: true, message: "Vui lòng nhập tên tác giả!" }]}
            >
              <Input placeholder="Nhập tên tác giả" />
            </Form.Item>

            <Form.Item
              name="publisher"
              label="Nhà xuất bản"
              rules={[{ required: true, message: "Vui lòng nhập tên nhà xuất bản!" }]}
            >
              <Input placeholder="Nhập tên nhà xuất bản" />
            </Form.Item>

            <Form.Item
              name="publishYear"
              label="Năm xuất bản"
              rules={[{ required: true, message: "Vui lòng nhập năm xuất bản!" }]}
            >
              <Input placeholder="Nhập năm xuất bản" />
            </Form.Item>

            <Form.Item name="isbn" label="ISBN" rules={[{ required: true, message: "Vui lòng nhập mã ISBN!" }]}>
              <Input placeholder="Nhập mã ISBN" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
            >
              <Select placeholder="Chọn danh mục">
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="pages" label="Số trang" rules={[{ required: true, message: "Vui lòng nhập số trang!" }]}>
              <Input type="number" placeholder="Nhập số trang" />
            </Form.Item>

            <Form.Item
              name="language"
              label="Ngôn ngữ"
              rules={[{ required: true, message: "Vui lòng nhập ngôn ngữ!" }]}
            >
              <Input placeholder="Nhập ngôn ngữ" />
            </Form.Item>

            <Form.Item name="coverImage" label="Ảnh bìa">
              <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                <Button icon={<UploadOutlined />}>Tải lên ảnh bìa</Button>
              </Upload>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Nhập mô tả sách" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingBook ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default BookManagement
