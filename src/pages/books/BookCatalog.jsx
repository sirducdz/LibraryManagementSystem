"use client"

import { useState, useEffect } from "react"
import { Card, Input, Select, Row, Col, Tag, Rate, Button, Pagination, Spin, Empty, Badge } from "antd"
import { SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"

const { Option } = Select
const { Meta } = Card

const BookCatalog = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [category, setCategory] = useState("all")
  const [availability, setAvailability] = useState("all")
  const [cartItems, setCartItems] = useState([])

  // Giả lập dữ liệu danh mục
  const categories = [
    { id: 1, name: "Tiểu thuyết" },
    { id: 2, name: "Khoa học" },
    { id: 3, name: "Lịch sử" },
    { id: 4, name: "Tâm lý học" },
    { id: 5, name: "Kinh tế" },
  ]

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockBooks = Array(16)
        .fill()
        .map((_, index) => ({
          id: index + 1,
          title: `Sách ${index + 1}`,
          author: `Tác giả ${(index % 5) + 1}`,
          category: categories[index % 5].name,
          categoryId: categories[index % 5].id,
          rating: (Math.random() * 3 + 2).toFixed(1),
          available: index % 3 !== 0,
          coverImage: `/placeholder.svg?height=200&width=150&text=Book ${index + 1}`,
          description: `Mô tả ngắn về cuốn sách ${index + 1}. Đây là một cuốn sách hay và đáng đọc.`,
        }))
      setBooks(mockBooks)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (value) => {
    setSearchText(value)
    // Trong thực tế, sẽ gọi API với tham số tìm kiếm
  }

  const handleCategoryChange = (value) => {
    setCategory(value)
    // Trong thực tế, sẽ gọi API với tham số lọc
  }

  const handleAvailabilityChange = (value) => {
    setAvailability(value)
    // Trong thực tế, sẽ gọi API với tham số lọc
  }

  const addToCart = (book) => {
    if (cartItems.some((item) => item.id === book.id)) {
      return
    }

    if (cartItems.length >= 5) {
      alert("Bạn chỉ có thể mượn tối đa 5 cuốn sách trong một lần!")
      return
    }

    setCartItems([...cartItems, book])
  }

  // Lọc sách theo điều kiện tìm kiếm (giả lập, thực tế sẽ xử lý ở backend)
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchText.toLowerCase()) ||
      book.author.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = category === "all" || book.categoryId.toString() === category
    const matchesAvailability =
      availability === "all" ||
      (availability === "available" && book.available) ||
      (availability === "unavailable" && !book.available)

    return matchesSearch && matchesCategory && matchesAvailability
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Danh mục sách</h1>
        <Link to="/borrowing-cart">
          <Badge count={cartItems.length} showZero>
            <Button type="primary" icon={<ShoppingCartOutlined />} size="large" className="flex items-center">
              Giỏ mượn
            </Button>
          </Badge>
        </Link>
      </div>

      {/* Thanh tìm kiếm và bộ lọc */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Tìm kiếm theo tên sách, tác giả..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            className="md:w-1/3"
            size="large"
          />

          <div className="flex flex-1 gap-4">
            <Select
              placeholder="Danh mục"
              style={{ width: "100%" }}
              onChange={handleCategoryChange}
              size="large"
              defaultValue="all"
            >
              <Option value="all">Tất cả danh mục</Option>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Tình trạng"
              style={{ width: "100%" }}
              onChange={handleAvailabilityChange}
              size="large"
              defaultValue="all"
            >
              <Option value="all">Tất cả</Option>
              <Option value="available">Có sẵn</Option>
              <Option value="unavailable">Đang mượn</Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Danh sách sách */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : filteredBooks.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {filteredBooks.map((book) => (
              <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                <Card
                  hoverable
                  cover={
                    <img alt={book.title} src={book.coverImage || "/placeholder.svg"} className="h-48 object-cover" />
                  }
                  actions={[
                    <Link to={`/books/${book.id}`} key="view">
                      Chi tiết
                    </Link>,
                    <Button
                      type="link"
                      key="borrow"
                      disabled={!book.available || cartItems.some((item) => item.id === book.id)}
                      onClick={() => addToCart(book)}
                    >
                      {cartItems.some((item) => item.id === book.id) ? "Đã thêm" : "Mượn sách"}
                    </Button>,
                  ]}
                  className="h-full flex flex-col"
                >
                  <div className="mb-2">
                    <Tag color={book.available ? "green" : "red"}>{book.available ? "Có sẵn" : "Đang mượn"}</Tag>
                    <Tag color="blue">{book.category}</Tag>
                  </div>
                  <Meta
                    title={
                      <Link to={`/books/${book.id}`} className="text-lg font-medium">
                        {book.title}
                      </Link>
                    }
                    description={
                      <div>
                        <p className="text-gray-500">{book.author}</p>
                        <div className="flex items-center mt-2">
                          <Rate disabled defaultValue={Number.parseFloat(book.rating)} allowHalf />
                          <span className="ml-2">{book.rating}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <div className="mt-6 flex justify-center">
            <Pagination defaultCurrent={1} total={50} />
          </div>
        </>
      ) : (
        <Empty description="Không tìm thấy sách phù hợp" />
      )}
    </div>
  )
}

export default BookCatalog
