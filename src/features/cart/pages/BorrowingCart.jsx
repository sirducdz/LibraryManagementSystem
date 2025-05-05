// src/features/cart/pages/BorrowingCart.jsx (hoặc vị trí file của bạn)

import React, { useState } from "react"; // Chỉ cần useState
import { Card, List, Button, Avatar, Typography, Divider, Empty, Modal, Form, Input, App, Tag } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom"; // Thêm Link

// Import Contexts và PATHS (Sửa đường dẫn nếu cần)
import { useCart } from "../../../contexts/CartContext";
import { UseAuth } from "../../../contexts/AuthContext"; // Vẫn có thể cần để lấy user info nếu cần
import { PATHS } from "../../../routes/routePaths";

// Import hook RTK Query (Sửa đường dẫn nếu cần)
import { useSubmitBorrowRequestMutation } from "../../books/api/bookApiSlice";

const { Title, Text } = Typography;
const { TextArea } = Input;

const BorrowingCart = () => {
    // Lấy state và actions từ CartContext
    const { cartItems, cartItemCount, removeFromCart: removeFromCartContext, clearCart: clearCartContext } = useCart();
    const { isAuthenticated } = UseAuth(); // Lấy trạng thái đăng nhập để kiểm tra (dù trang này thường đã được bảo vệ)

    // State cho Modal và Form
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // Hook Antd App
    const { message: messageApi, modal: modalApi } = App.useApp();

    // Hook RTK Query Mutation để gửi request
    const [submitRequest, { isLoading: isSubmittingRequest }] = useSubmitBorrowRequestMutation();

    // Hàm xóa item khỏi giỏ (dùng context)
    const handleRemoveItem = (bookId) => {
        removeFromCartContext(bookId);
        // messageApi.info('Book removed from cart.'); // Context có thể đã xử lý message
    };

    // Hàm xóa hết giỏ hàng (dùng context)
    const handleClearCart = () => {
        if (cartItemCount === 0) return; // Không làm gì nếu giỏ đã rỗng
        modalApi.confirm({
            title: "Clear Borrowing Cart?",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to remove all books from your borrowing cart?",
            okText: "Clear All",
            cancelText: "Cancel",
            onOk() {
                clearCartContext();
            },
        });
    };

    // Hàm mở modal xác nhận
    const showRequestModal = () => {
        if (!isAuthenticated) { // Kiểm tra lại phòng trường hợp truy cập bất thường
             modalApi.error({ title: 'Not Logged In', content: 'Please log in to submit a borrow request.' });
             return;
        }
        if (cartItemCount === 0) {
            messageApi.warning("Your cart is empty. Please add books first.");
            return;
        }
        if (cartItemCount > 5) { // Giới hạn cứng 5 cuốn
            messageApi.warning("You can only request up to 5 books at a time. Please remove some items.");
            return;
        }
        setIsModalVisible(true);
    };

    // Hàm đóng modal
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // Hàm xử lý Submit Request (Gọi API)
    const handleSubmitRequest = async (values) => {
        // Lấy danh sách bookIds từ cartItems
        const bookIds = cartItems.map(item => item.id);
        // Lấy note từ form (nhưng API hiện tại không dùng)
        const note = values.note;

        if (!bookIds || bookIds.length === 0) {
            messageApi.error("Cannot submit an empty request.");
            return;
        }

        console.log("Submitting Borrowing Request:", { bookIds });
        // console.log("Note (not sent to this API):", note);

        try {
            // Gọi mutation trigger chỉ với bookIds
            await submitRequest({ bookIds }).unwrap();

            // Xử lý khi API thành công
            clearCartContext(); // Xóa giỏ hàng sau khi gửi thành công
            setIsModalVisible(false);
            form.resetFields();

            // Hiển thị modal thành công và điều hướng
            modalApi.success({
                title: "Request Submitted!",
                content: "Your request has been sent to the librarian. You will be notified upon approval.",
                onOk() {
                    navigate(PATHS.MY_REQUESTS || "/my-requests"); // Điều hướng đến trang xem request
                },
            });

        } catch (err) {
            // Xử lý khi API thất bại
            console.error("Failed to submit borrowing request:", err);
            messageApi.error(err?.data?.message || "Failed to submit request. Please try again later.");
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <Card variant="borderless" className="shadow-lg max-w-4xl mx-auto"> {/* Giới hạn chiều rộng */}
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <Title level={2} className="mb-0">Borrowing Cart</Title>
                    {cartItemCount > 0 && (
                        <Button danger onClick={handleClearCart}>Clear All</Button>
                    )}
                </div>

                {cartItemCount > 0 ? (
                    <>
                        <List
                            itemLayout="horizontal"
                            dataSource={cartItems}
                            renderItem={(item, index) => (
                                <List.Item
                                    key={item.id || `cart-item-${index}`} // Thêm key dự phòng
                                    actions={[
                                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveItem(item.id)}> Remove </Button>,
                                    ]}
                                    className="border-b last:border-b-0" // Thêm border
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.coverImage || '/placeholder-book.png'} shape="square" size={64} />}
                                        title={<Link to={PATHS.BOOK_DETAIL.replace(':bookId', item.id)} className="text-base font-semibold hover:text-blue-600">{item.title}</Link>}
                                        description={
                                            <div>
                                                <Text type="secondary">Author: {item.author}</Text><br />
                                                {item.category && <Tag color="blue" className="mt-1">{item.category}</Tag>}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                        <Divider className="my-6" />

                        <div className="flex flex-wrap justify-between items-center gap-4 bg-gray-50 p-4 rounded-md"> {/* Thêm nền cho phần summary */}
                            <div>
                                <Text strong className="text-lg">Total books: {cartItemCount}/5</Text><br />
                                <Text type="secondary">Borrowing period: 14 days</Text> {/* Nên lấy từ cấu hình */}
                            </div>
                            <Button
                                type="primary" size="large"
                                onClick={showRequestModal}
                                disabled={cartItemCount === 0 || cartItemCount > 5}
                                className="min-w-[180px] shadow-md"
                                icon={<CheckCircleOutlined />} // Thêm icon
                            >
                                Submit Borrow Request
                            </Button>
                        </div>

                        <Modal
                            title="Confirm Borrowing Request"
                            open={isModalVisible}
                            onCancel={handleCancel}
                            footer={null} // Custom footer trong Form
                            destroyOnClose
                        >
                            <Form form={form} layout="vertical" onFinish={handleSubmitRequest}>
                                <div className="mb-4">
                                    <Text>You are requesting to borrow <Text strong>{cartItemCount}</Text> book(s):</Text>
                                    {/* Danh sách sách trong modal */}
                                    <List
                                        size="small"
                                        bordered
                                        dataSource={cartItems}
                                        renderItem={item => <List.Item>{item.title} <Text type="secondary" className="ml-2 text-xs">by {item.author}</Text></List.Item>}
                                        className="mt-2 max-h-40 overflow-y-auto bg-white" // Style list
                                     />
                                </div>
                                {/* Input Note (vẫn có trên UI nhưng không gửi đi theo API curl) */}
                                <Form.Item name="note" label="Note (optional)">
                                    <TextArea rows={3} placeholder="Enter a note for the librarian (e.g., preferred pickup time)..." />
                                </Form.Item>
                                {/* Nút xác nhận */}
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button onClick={handleCancel} disabled={isSubmittingRequest}>Cancel</Button>
                                    <Button type="primary" htmlType="submit" loading={isSubmittingRequest} icon={<SendOutlined />}>
                                        {isSubmittingRequest ? 'Submitting...' : 'Confirm & Send Request'}
                                    </Button>
                                </div>
                            </Form>
                        </Modal>
                    </>
                ) : (
                     <div className="text-center py-10"> {/* Thêm padding */}
                         <Empty description="Your borrowing cart is empty.">
                             <Button type="primary" size="large" onClick={() => navigate(PATHS.BOOK_CATALOG || "/books")}>
                                  Find Books to Borrow
                             </Button>
                         </Empty>
                     </div>
                 )}
            </Card>
        </div>
    );
};

export default BorrowingCart;