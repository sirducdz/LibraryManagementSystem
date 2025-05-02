import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Divider,
  Rate,
  // Comment,
  Avatar,
  Form,
  Input,
  List,
  message,
  Skeleton,
} from "antd"
import { BookOutlined, UserOutlined, CalendarOutlined, TagOutlined, ShoppingCartOutlined } from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const BookDetail = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [canReview, setCanReview] = useState(false)
  const [inCart, setInCart] = useState(false)

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      const mockBook = {
        id: Number.parseInt(id),
        title: `Sách ${id}`,
        author: `Tác giả ${(id % 5) + 1}`,
        publisher: "NXB Trẻ",
        publishYear: "2022",
        isbn: `978-123456789-${id}`,
        category: "Tiểu thuyết",
        pages: 320,
        language: "Tiếng Việt",
        description: `Đây là mô tả chi tiết về cuốn sách ${id}. Cuốn sách này kể về những câu chuyện thú vị và hấp dẫn. Nó mang đến cho người đọc những trải nghiệm tuyệt vời và bài học quý giá về cuộc sống. Tác giả đã khéo léo lồng ghép những thông điệp ý nghĩa thông qua các tình huống và nhân vật trong sách.`,
        coverImage: `/placeholder.svg?height=400&width=300&text=Book ${id}`,
        rating: 4.5,
        ratingCount: 28,
        available: id % 3 !== 0,
        reviews: [
          {
            author: "Người dùng 1",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg",
            content: "Cuốn sách rất hay và ý nghĩa. Tôi đã học được rất nhiều điều từ nó.",
            rating: 5,
            datetime: "2023-05-15",
          },
          {
            author: "Người dùng 2",
            avatar: "https://randomuser.me/api/portraits/women/2.jpg",
            content: "Nội dung khá thú vị nhưng hơi dài dòng ở một số chương.",
            rating: 4,
            datetime: "2023-04-22",
          },
          {
            author: "Người dùng 3",
            avatar: "https://randomuser.me/api/portraits/men/3.jpg",
            content: "Sách hay, đáng đọc!",
            rating: 5,
            datetime: "2023-03-10",
          },
        ],
      }
      setBook(mockBook)
      setLoading(false)

      // Kiểm tra xem người dùng có thể đánh giá không (đã mượn và trả sách)
      setCanReview(true)

      // Kiểm tra xem sách đã có trong giỏ mượn chưa
      setInCart(false)
    }, 1000)
  }, [id])

  const handleAddToCart = () => {
    // Kiểm tra số lượng sách trong giỏ
    const currentCart = JSON.parse(localStorage.getItem("borrowingCart") || "[]")
    if (currentCart.length >= 5) {
      message.error("Bạn chỉ có thể mượn tối đa 5 cuốn sách trong một lần!")
      return
    }

    // Thêm sách vào giỏ
    const updatedCart = [...currentCart, book]
    localStorage.setItem("borrowingCart", JSON.stringify(updatedCart))
    setInCart(true)
    message.success("Đã thêm sách vào giỏ mượn!")
  }

  const handleSubmitReview = () => {
    if (userRating === 0) {
      message.error("Vui lòng chọn số sao đánh giá!")
      return
    }

    setSubmitting(true)

    // Giả lập API call
    setTimeout(() => {
      const newReview = {
        author: "Bạn",
        avatar: "https://randomuser.me/api/portraits/men/5.jpg",
        content: userComment,
        rating: userRating,
        datetime: new Date().toISOString().split("T")[0],
      }

      setBook({
        ...book,
        reviews: [newReview, ...book.reviews],
      })

      setUserComment("")
      setUserRating(0)
      setSubmitting(false)
      message.success("Đã gửi đánh giá thành công!")
    }, 1000)
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card>
        <Row gutter={[24, 24]}>
          {/* Thông tin sách */}
          <Col xs={24} md={8}>
            <div className="flex flex-col items-center">
              <img
                src={book.coverImage || "/placeholder.svg"}
                alt={book.title}
                className="w-full max-w-xs rounded-lg shadow-md mb-4"
              />
              <div className="w-full flex justify-center mt-4">
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  disabled={!book.available || inCart}
                  onClick={handleAddToCart}
                  block
                >
                  {inCart ? "Đã thêm vào giỏ" : book.available ? "Thêm vào giỏ mượn" : "Sách đang được mượn"}
                </Button>
              </div>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Tag color={book.available ? "green" : "red"}>{book.available ? "Có sẵn" : "Đang mượn"}</Tag>
                <Tag color="blue">{book.category}</Tag>
              </div>

              <Title level={2}>{book.title}</Title>

              <div className="flex items-center mb-4">
                <Rate disabled defaultValue={book.rating} allowHalf />
                <Text className="ml-2">
                  {book.rating} ({book.ratingCount} đánh giá)
                </Text>
              </div>

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <UserOutlined className="mr-2 text-gray-500" />
                  <Text strong>Tác giả:</Text>
                  <Text className="ml-2">{book.author}</Text>
                </div>

                <div className="flex items-center">
                  <BookOutlined className="mr-2 text-gray-500" />
                  <Text strong>Nhà xuất bản:</Text>
                  <Text className="ml-2">{book.publisher}</Text>
                </div>

                <div className="flex items-center">
                  <CalendarOutlined className="mr-2 text-gray-500" />
                  <Text strong>Năm xuất bản:</Text>
                  <Text className="ml-2">{book.publishYear}</Text>
                </div>

                <div className="flex items-center">
                  <TagOutlined className="mr-2 text-gray-500" />
                  <Text strong>ISBN:</Text>
                  <Text className="ml-2">{book.isbn}</Text>
                </div>

                <div className="flex items-center">
                  <BookOutlined className="mr-2 text-gray-500" />
                  <Text strong>Số trang:</Text>
                  <Text className="ml-2">{book.pages}</Text>
                </div>

                <div className="flex items-center">
                  <BookOutlined className="mr-2 text-gray-500" />
                  <Text strong>Ngôn ngữ:</Text>
                  <Text className="ml-2">{book.language}</Text>
                </div>
              </div>

              <Divider />

              <Title level={4}>Mô tả</Title>
              <Paragraph>{book.description}</Paragraph>
            </div>
          </Col>
        </Row>

        <Divider />

        {/* Phần đánh giá */}
        <div>
          <Title level={3}>Đánh giá từ độc giả</Title>

          {canReview && (
            <Card className="mb-4">
              <Title level={4}>Viết đánh giá của bạn</Title>
              <div className="mb-3">
                <Text>Đánh giá của bạn:</Text>
                <Rate value={userRating} onChange={setUserRating} />
              </div>
              <Form.Item>
                <TextArea
                  rows={4}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                />
              </Form.Item>
              <Button type="primary" onClick={handleSubmitReview} loading={submitting} disabled={userRating === 0}>
                Gửi đánh giá
              </Button>
            </Card>
          )}

          <List
            className="comment-list"
            header={`${book.reviews.length} đánh giá`}
            itemLayout="horizontal"
            dataSource={book.reviews}
            renderItem={(item) => (
              <li>
                <Comment
                  author={item.author}
                  avatar={<Avatar src={item.avatar} alt={item.author} />}
                  content={
                    <div>
                      <Rate disabled defaultValue={item.rating} />
                      <p>{item.content}</p>
                    </div>
                  }
                  datetime={item.datetime}
                />
              </li>
            )}
          />
        </div>
      </Card>
    </div>
  )
}

export default BookDetail
