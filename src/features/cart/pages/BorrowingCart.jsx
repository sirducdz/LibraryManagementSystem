import { useEffect, useState } from "react"; // Bỏ useState nếu không dùng cho cartItems nữa
import { Card, List, Button, Avatar, Typography, Divider, Empty, Modal, Form, Input, App } from "antd"; // Thêm App
import { DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext"; // *** Import useCart ***
import { PATHS } from "../../../routes/routePaths"; // *** Import PATHS nếu cần điều hướng ở Empty state ***

const { Title, Text } = Typography;
// Bỏ const { confirm } = Modal; vì sẽ dùng modalApi
const { TextArea } = Input;

const BorrowingCart = () => {
  // *** Bỏ useState cho cartItems ***
  // const [cartItems, setCartItems] = useState([])

  // *** Lấy state và actions từ CartContext ***
  const { cartItems, cartItemCount, removeFromCart: removeFromCartContext, clearCart: clearCartContext } = useCart();

  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // *** Sử dụng hook App.useApp() ***
  const { message: messageApi, modal: modalApi } = App.useApp();

  // *** Bỏ useEffect đọc localStorage("borrowingCart") ***
  // useEffect(() => { ... }, [])

  // *** Hàm removeFromCart gọi hàm từ context ***
  const handleRemoveItem = (bookId) => {
    removeFromCartContext(bookId); // Gọi hàm từ context
    // messageApi.success đã được xử lý trong context (nếu có) hoặc có thể thêm ở đây nếu muốn
  };

  // *** Hàm clearCart gọi hàm từ context và dùng modalApi ***
  const handleClearCart = () => {
    modalApi.confirm({ // Sử dụng modalApi
      title: "Clear Borrowing Cart?", // <-- English
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to remove all books from your borrowing cart? This action cannot be undone.", // <-- English
      okText: "Clear All", // <-- English
      cancelText: "Cancel", // <-- English
      onOk() {
        clearCartContext(); // Gọi hàm từ context
        // messageApi.success đã được xử lý trong context (nếu có)
      },
    });
  };

  const showRequestModal = () => {
    // Kiểm tra lại giới hạn trước khi mở modal (tùy chọn)
    if (cartItemCount > 5) {
         messageApi.warning("Your cart exceeds the maximum limit of 5 books. Please remove some items.");
         return;
    }
    if (cartItemCount === 0) {
         messageApi.warning("Your cart is empty. Please add books before requesting.");
         return;
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // *** Hàm handleSubmitRequest gọi clearCart từ context và dùng modalApi ***
  const handleSubmitRequest = (values) => {
    setLoading(true);

    // Giả lập API call
    setTimeout(() => {
      console.log("Borrowing request submitted:", {
        books: cartItems, // Lấy từ context
        note: values.note,
      });

      // *** Xóa giỏ mượn bằng hàm từ context sau khi gửi yêu cầu thành công ***
      clearCartContext();

      setLoading(false);
      setIsModalVisible(false);
      form.resetFields(); // Reset form sau khi submit

      // Hiển thị thông báo thành công bằng modalApi
      modalApi.success({ // Sử dụng modalApi
        title: "Borrowing request submitted successfully!", // <-- English
        content: "Your request has been sent to the librarian. Please wait for approval.", // <-- English
        onOk() {
          // Điều hướng đến trang quản lý yêu cầu mượn (ví dụ)
          navigate(PATHS.MY_REQUESTS || "/"); // <-- Sử dụng PATHS hoặc đường dẫn mặc định
        },
      });
    }, 1500);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen"> {/* Thêm style nền */}
      <Card bordered={false} className="shadow-lg"> {/* Thêm shadow, bỏ border */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4"> {/* Tăng mb, thêm gap */}
          <Title level={2} className="mb-0">Borrowing Cart</Title> {/* <-- English */}
          {/* Chỉ hiển thị nút Clear All khi có item */}
          {cartItemCount > 0 && (
            <Button danger onClick={handleClearCart}>
              Clear All {/* <-- English */}
            </Button>
          )}
        </div>

        {/* Sử dụng cartItemCount từ context để kiểm tra */}
        {cartItemCount > 0 ? (
          <>
            <List
              itemLayout="horizontal"
              dataSource={cartItems} // Sử dụng cartItems từ context
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveItem(item.id)}>
                      Remove {/* <-- English */}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.coverImage || '/placeholder-book.png'} shape="square" size={64} />} // Thêm fallback image
                    title={<Text strong>{item.title}</Text>} // In đậm title
                    description={
                      <div>
                        <Text type="secondary">Author: {item.author}</Text> {/* <-- English */}
                        <br />
                        <Text type="secondary">Category: {item.category}</Text> {/* <-- English */}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider className="my-6" /> {/* Tăng margin cho Divider */}

            <div className="flex flex-wrap justify-between items-center gap-4"> {/* Thêm flex-wrap, gap */}
              <div>
                {/* Sử dụng cartItemCount từ context */}
                <Text strong>Total books: {cartItemCount}/5</Text> {/* <-- English */}
                <br />
                {/* Cân nhắc đưa số ngày mượn thành biến/hằng số */}
                <Text type="secondary">Borrowing period: 14 days</Text> {/* <-- English */}
              </div>
              <Button
                type="primary"
                size="large"
                onClick={showRequestModal}
                // Disable nếu giỏ rỗng hoặc quá giới hạn (dù showRequestModal đã check)
                disabled={cartItemCount === 0 || cartItemCount > 5}
                className="min-w-[180px]" // Thêm chiều rộng tối thiểu
              >
                Submit Borrow Request {/* <-- English */}
              </Button>
            </div>

            <Modal
               title="Confirm Borrowing Request" // <-- English
               open={isModalVisible} // Sử dụng `open` thay `visible` cho Antd v5+
               onCancel={handleCancel}
               footer={null} // Tự tạo footer trong Form
               destroyOnClose // Reset Form state khi đóng Modal
            >
              <Form form={form} layout="vertical" onFinish={handleSubmitRequest}>
                <div className="mb-4">
                  {/* Sử dụng cartItemCount */}
                  <Text>You are requesting to borrow {cartItemCount} book(s):</Text> {/* <-- English */}
                  <ul className="list-disc list-inside mt-2 pl-4 max-h-40 overflow-y-auto"> {/* Style list, giới hạn chiều cao */}
                    {/* Sử dụng cartItems */}
                    {cartItems.map((item) => (
                      <li key={item.id} className="mb-1">{item.title}</li>
                    ))}
                  </ul>
                </div>

                <Form.Item name="note" label="Note (optional)"> {/* <-- English */}
                  <TextArea rows={4} placeholder="Enter a note for the librarian if needed..." /> {/* <-- English */}
                </Form.Item>

                <div className="flex justify-end gap-2 mt-4"> {/* Thêm mt-4 */}
                  <Button onClick={handleCancel}>Cancel</Button> {/* <-- English */}
                  <Button type="primary" htmlType="submit" loading={loading} icon={<CheckCircleOutlined />}>
                    Confirm & Send Request {/* <-- English */}
                  </Button>
                </div>
              </Form>
            </Modal>
          </>
        ) : (
           // Cập nhật Empty state
          <Empty description="Your borrowing cart is empty" image={Empty.PRESENTED_IMAGE_SIMPLE}> {/* <-- English */}
            <Button type="primary" onClick={() => navigate(PATHS.BOOK_CATALOG || "/books")}> {/* <-- English */}
               Find Books to Borrow {/* <-- Sử dụng PATHS */}
            </Button>
          </Empty>
        )}
      </Card>
    </div>
  );
};

export default BorrowingCart;