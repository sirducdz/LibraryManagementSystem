import React, { useState, useEffect, useMemo } from "react"; // Added React import
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Button,
    Divider,
    Rate,
    Avatar,
    Form,
    Input,
    List,
    Skeleton,
    Empty, // Added Empty
    App, // Added App for useApp hook
} from "antd";
import {
    BookOutlined,
    UserOutlined,
    CalendarOutlined,
    TagOutlined,
    ShoppingCartOutlined,
    ArrowLeftOutlined, // Added for back button
    ExclamationCircleFilled, // Added for login modal
    SendOutlined, // Added for submit review button
    StarOutlined, // Added for review rating label
} from "@ant-design/icons";
import { useCart } from "../../../contexts/CartContext"; // <-- Import useCart
import { UseAuth } from "../../../contexts/AuthContext"; // <-- Import UseAuth
import { PATHS } from "../../../routes/routePaths"; // <-- Import PATHS

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// --- Component BookDetail ---
const BookDetail = () => {
    const { id: bookId } = useParams(); // Get book ID from URL
    const navigate = useNavigate();
    const [book, setBook] = useState(null); // State for book data
    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userRating, setUserRating] = useState(0); // State for new review rating
    const [userComment, setUserComment] = useState(""); // State for new review comment

    // --- Get data/functions from Contexts ---
    const { isAuthenticated, user } = UseAuth(); // Get auth state and user info
    const { cartItems, cartItemCount, addToCart, isInCart } = useCart(); // Get cart state and functions
    const { message: messageApi, modal: modalApi } = App.useApp(); // Get antd message/modal API

    // --- Fetch Book Data (Simulated) ---
    // useEffect(() => {
    //     setLoading(true);
    //     console.log("Fetching book details for ID:", bookId);
    //     // Simulate API call to get book details
    //     setTimeout(() => {
    //         // In a real app, you would fetch from your API: fetch(`/api/books/${bookId}`)
    //         // For now, generate mock data based on ID, similar to Catalog/Homepage
    //         // Ensure this mock data structure MATCHES the one used elsewhere
    //         const mockCategories = [ { id: 1, name: "Fiction" }, /* ... other categories */ ]; // Use categories if needed
    //         const parsedId = Number.parseInt(bookId);

    //          if (isNaN(parsedId) || parsedId <= 0 || parsedId > 55) { // Basic validation, adjust 55 based on your mock data size
    //               console.error("Invalid book ID:", bookId);
    //               setBook(null); // Set book to null if ID is invalid
    //               setLoading(false);
    //               return;
    //          }


    //         const mockBook = {
    //             id: parsedId,
    //             title: `Book ${parsedId} About Programming`, // Consistent title example
    //             author: `Author ${(parsedId % 7) + 1}`,
    //             publisher: "Publisher C", // Example publisher
    //             publishYear: `${2024 - (parsedId % 10)}`, // Example year
    //             isbn: `978-1-1111-999-${parsedId}`, // Example ISBN
    //             category: mockCategories[parsedId % mockCategories.length]?.name || "Unknown", // Example category
    //             categoryId: mockCategories[parsedId % mockCategories.length]?.id || 0,
    //             pages: 250 + (parsedId * 3), // Example pages
    //             language: "English", // Example language
    //             description: `This is a detailed description for Book ${parsedId}. It delves into fascinating concepts and offers practical insights. The author masterfully weaves narrative with instruction, making complex topics accessible and engaging for readers of all levels. A must-read for anyone interested in the subject matter.`, // Example description
    //             // Use a working placeholder service or local image
    //             coverImage: `https://placehold.co/300x400/EDEDED/AAAAAA/png?text=Book+${parsedId}`,
    //             rating: ((parsedId % 5) + 2.5) / 2, // Example consistent rating
    //             ratingCount: 10 + (parsedId * 3), // Example consistent rating count
    //             available: parsedId % 3 !== 0, // Example availability
    //             copies: parsedId % 3 !== 0 ? Math.floor(Math.random() * 5 + 1) : 0,
    //             // Example reviews
    //             reviews: Array.from({ length: Math.min(5, parsedId % 7) }).map((_, i) => ({
    //                 id: `rev-${parsedId}-${i}`, // Unique review ID
    //                 author: `User ${parsedId * i + i + 1}`,
    //                 avatar: `https://i.pravatar.cc/40?u=user${parsedId * i + i + 1}`, // Placeholder avatars
    //                 content: `This is review content number ${i + 1} for book ${parsedId}. It was quite insightful.`,
    //                 rating: ((parsedId + i) % 5) + 1,
    //                 datetime: `2024-0${(parsedId % 5) + 1}-${(i + 1) * 3 + 10}`, // Example date
    //             })),
    //         };
    //         setBook(mockBook);
    //         setLoading(false);
    //     }, 800); // Shorter delay for detail page

    // }, [bookId]); // Re-fetch if bookId changes
    useEffect(() => {
        setLoading(true);
        console.log("Fetching book details for ID:", bookId);
        // Simulate API call
        setTimeout(() => {
            const mockCategories = [ { id: 1, name: "Fiction" }, /* ... */ ];
            const parsedIdInput = Number.parseInt(bookId);
            let bookDataToSet = null; // Biến lưu trữ dữ liệu sách cuối cùng

            // Cố gắng parse ID, nếu không hợp lệ hoặc ngoài phạm vi mock, dùng ID=1 làm mặc định
            const isValidId = !isNaN(parsedIdInput) && parsedIdInput > 0 && parsedIdInput <= 55; // Điều chỉnh 55 nếu cần
            const finalId = isValidId ? parsedIdInput : 1; // Dùng ID hợp lệ hoặc ID=1

            if (!isValidId) {
                 console.warn(`Invalid book ID [${bookId}] from URL. Displaying default book (ID ${finalId}) for preview.`);
            } else {
                 console.log(`Using valid book ID [${finalId}] for mock data generation.`);
            }

            // *** LUÔN TẠO DỮ LIỆU MOCK (dùng finalId) ***
            bookDataToSet = {
                id: finalId,
                title: `Book ${finalId} About ${isValidId ? 'Programming' : 'Previewing'}`, // Thay đổi title nếu là default
                author: `Author ${(finalId % 7) + 1}`,
                publisher: "Preview Publisher",
                publishYear: `${2024 - (finalId % 10)}`,
                isbn: `PREVIEW-978-1-1111-999-${finalId}`,
                category: mockCategories[finalId % mockCategories.length]?.name || "Unknown",
                categoryId: mockCategories[finalId % mockCategories.length]?.id || 0,
                pages: 250 + (finalId * 3),
                language: "English",
                description: `This is a ${isValidId ? 'detailed' : 'PREVIEW'} description for Book ${finalId}. This content helps visualize the layout when actual book data is loaded. The structure includes various details about the publication.`,
                coverImage: `https://placehold.co/300x400/cccccc/888888/png?text=Book+${finalId}${isValidId ? '' : '+PREVIEW'}`, // Thay đổi ảnh preview
                rating: ((finalId % 5) + 2.5) / 2,
                ratingCount: 10 + (finalId * 3),
                available: finalId % 3 !== 0,
                copies: finalId % 3 !== 0 ? Math.floor(Math.random() * 5 + 1) : 0,
                // Tạo reviews giả
                reviews: Array.from({ length: Math.min(3, finalId % 4) }).map((_, i) => ({
                    id: `rev-preview-${finalId}-${i}`,
                    author: `Reviewer ${i + 1}`,
                    avatar: `https://i.pravatar.cc/40?u=reviewer${i + 1}`,
                    content: `This is preview review number ${i + 1}. The layout is being tested.`,
                    rating: ((finalId + i*2) % 5) + 1,
                    datetime: `2024-0${(finalId % 3) + 1}-${(i + 1) * 5 + 5}`,
                })),
            };

            // *** Luôn gọi setBook với dữ liệu đã tạo (mặc định hoặc theo ID) ***
            setBook(bookDataToSet);
            setLoading(false);
        }, 800); // Giữ delay

    }, [bookId]); // Vẫn chạy lại khi bookId thay đổi

    // --- Determine if book is in cart using context ---
    const isBookInCart = useMemo(() => {
        return book ? isInCart(book.id) : false;
    }, [book, isInCart]); // Recalculate when book loads or isInCart changes

    // --- Determine if cart is full using context ---
    const isCartFull = useMemo(() => cartItemCount >= 5, [cartItemCount]);

    // --- Handler to Add Book to Cart (integrates auth check) ---
    const handleAddToCartClick = () => {
        if (!book) return; // Should not happen if button is enabled

        if (!isAuthenticated) {
            // Use the reusable modal function
            showLoginRequiredModal(`add "${book.title}" to the cart`);
        } else {
            // Let the addToCart function in context handle limit checks & messages
            addToCart(book);
            // No need to set local inCart state
        }
    };

     // --- Reusable Login Modal Function ---
     const showLoginRequiredModal = (actionDescription = "perform this action") => {
        modalApi.confirm({
            title: "Login Required",
            icon: <ExclamationCircleFilled />,
            content: `You need to be logged in to ${actionDescription}. Do you want to go to the login page?`,
            okText: "Login", cancelText: "Cancel",
            onOk: () => navigate(PATHS.LOGIN),
            onCancel: () => console.log("Cancel confirmed, staying on page."),
        });
    };

    // --- Handler for Submitting Review ---
    const handleSubmitReview = () => {
        if (!isAuthenticated) {
            showLoginRequiredModal("submit a review");
            return;
        }
        if (!userRating || userRating === 0) {
            messageApi.error("Please select a star rating!"); // Use messageApi
            return;
        }
        if (!userComment.trim()) {
            messageApi.error("Please write your review comment!"); // Use messageApi
             return;
        }


        setSubmittingReview(true);
        console.log("Submitting review:", { bookId, rating: userRating, comment: userComment, userId: user?.id });

        // Simulate API call
        setTimeout(() => {
            const newReview = {
                id: `rev-new-${Date.now()}`, // Generate temp ID
                author: user?.username || "You", // Use logged-in user's name
                avatar: user?.avatarUrl || `https://i.pravatar.cc/40?u=${user?.id || 'guest'}`, // User avatar or default
                content: userComment,
                rating: userRating,
                datetime: new Date().toISOString().split("T")[0], // Current date
            };

            // Update local book state to show the new review immediately
            setBook((prevBook) => ({
                ...prevBook,
                reviews: [newReview, ...(prevBook?.reviews || [])],
                // Optionally update average rating and count (more complex)
            }));

            // Reset form state
            setUserComment("");
            setUserRating(0);
            setSubmittingReview(false);
            messageApi.success("Review submitted successfully!"); // Use messageApi
        }, 1000);
    };

    // --- Render Loading State ---
    if (loading) {
        return (
            <div className="p-6">
                <Card>
                    {/* Back button even when loading */}
                     <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)} // Go back to previous page
                        style={{ marginBottom: '20px' }}
                    >
                        Back
                    </Button>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                             <Skeleton.Image active style={{ width: '100%', height: 300 }} />
                             <Skeleton.Button active block style={{ marginTop: '16px' }} />
                        </Col>
                         <Col xs={24} md={16}>
                             <Skeleton active title={false} paragraph={{ rows: 8 }} />
                         </Col>
                     </Row>
                </Card>
            </div>
        );
    }

    // --- Render Not Found State ---
     if (!book) {
         return (
             <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-128px)]"> {/* Center content */}
                <Card className="w-full max-w-md text-center">
                    <Empty description="Sorry, the book you are looking for could not be found." />
                    <Button
                        type="primary"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(PATHS.BOOKS_CATALOG || '/books')} // Navigate to catalog
                        className="mt-4"
                    >
                        Back to Book Catalog
                    </Button>
                </Card>
             </div>
         );
     }

    // --- Render Book Details ---
    const canUserReview = isAuthenticated; // Simplified: Logged-in users can review (adjust based on real logic)
    const isAddToCartDisabled = !book.available || isBookInCart || isCartFull;
    let addToCartButtonText = "Add to Borrowing Cart";
    let addToCartButtonTitle = "Add this book to your borrowing cart";
    if (!book.available) {
        addToCartButtonText = "Currently Borrowed";
        addToCartButtonTitle = "This book is currently unavailable";
    } else if (isBookInCart) {
        addToCartButtonText = "Added to Cart";
        addToCartButtonTitle = "This book is already in your cart";
    } else if (isCartFull) {
        addToCartButtonText = "Borrowing Cart Full";
        addToCartButtonTitle = "Your borrowing cart is full (max 5 items)";
    }


    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Back Button */}
             <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)} // Go back to previous page
                style={{ marginBottom: '20px' }}
            >
                Back
            </Button>

            <Card variant={false} className="shadow-lg">
                <Row gutter={[24, 32]}> {/* Increased gutter */}
                    {/* Book Cover & Add to Cart Button */}
                    <Col xs={24} sm={10} md={8} lg={7} xl={6}>
                        <div className="flex flex-col items-center">
                            <img
                                src={book.coverImage || "/placeholder-book.png"} // Use fallback
                                alt={book.title}
                                className="w-full h-auto object-contain rounded-lg shadow-md mb-4 max-w-[300px]" // Max width
                                style={{ aspectRatio: '2 / 3' }} // Maintain aspect ratio
                            />
                            <div className="w-full mt-4">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ShoppingCartOutlined />}
                                    disabled={isAddToCartDisabled}
                                    onClick={handleAddToCartClick} // Use new handler
                                    block
                                    title={addToCartButtonTitle} // Add tooltip title
                                >
                                    {addToCartButtonText}
                                </Button>
                            </div>
                        </div>
                    </Col>

                    {/* Book Information */}
                    <Col xs={24} sm={14} md={16} lg={17} xl={18}>
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Tag color={book.available ? "green" : "red"}>{book.available ? "Available" : "Borrowed"}</Tag>
                                {book.category && <Tag color="blue">{book.category}</Tag>}
                                {book.language && <Tag>{book.language}</Tag>}
                            </div>

                            <Title level={2} className="mb-2">{book.title}</Title>

                            <div className="flex items-center flex-wrap mb-4 text-sm">
                                <Rate disabled defaultValue={book.rating} allowHalf style={{ marginRight: '8px' }}/>
                                <Text strong className="mr-1">{book.rating.toFixed(1)}</Text>
                                <Text type="secondary">({book.ratingCount} ratings)</Text>
                            </div>

                             <div className="text-base mb-4"> {/* Slightly larger text for author etc. */}
                                <Text>by </Text>
                                <Text strong className="text-blue-600">{book.author}</Text>
                                {book.publisher && <Text type="secondary"> | Publisher: {book.publisher}</Text>}
                            </div>


                            <Divider className="my-4"/>

                             {/* More Details Grid */}
                            <Row gutter={[16, 8]} className="mb-4 text-sm">
                                {book.publishYear && <Col xs={24} sm={12}><CalendarOutlined className="mr-2 text-gray-500" /> <Text strong>Published:</Text> <Text>{book.publishYear}</Text></Col>}
                                {book.isbn && <Col xs={24} sm={12}><TagOutlined className="mr-2 text-gray-500" /> <Text strong>ISBN:</Text> <Text>{book.isbn}</Text></Col>}
                                {book.pages && <Col xs={24} sm={12}><BookOutlined className="mr-2 text-gray-500" /> <Text strong>Pages:</Text> <Text>{book.pages}</Text></Col>}
                            </Row>

                            <Divider className="my-4"/>

                            <Title level={4}>Description</Title>
                            <Paragraph className="text-gray-700 leading-relaxed"> {/* Improved readability */}
                                 {book.description || "No description available."}
                            </Paragraph>
                        </div>
                    </Col>
                </Row>

                 {/* Separate Section for Reviews */}
                 <Divider className="mt-8 mb-6"/>
                <div className="mt-6">
                    <Title level={3} className="mb-6">Reader Reviews</Title>

                    {/* Review Submission Form */}
                    {canUserReview ? ( // Only show form if user is authenticated (simplification)
                        <Card variant={false} className="mb-6 bg-gray-50 rounded-lg p-4">
                            <Title level={4} className="mb-4">Write Your Review</Title>
                            <div className="mb-3 flex items-center gap-2">
                                <Text><StarOutlined className="mr-1" /> Your Rating:</Text>
                                <Rate value={userRating} onChange={setUserRating} />
                                {userRating > 0 && <Text strong className="ml-2 text-yellow-500">{userRating} Star{userRating > 1 ? 's' : ''}</Text>}
                            </div>
                             <Form onFinish={handleSubmitReview}> {/* Wrap TextArea in Form for potential future validation */}
                                 <Form.Item name="comment" noStyle>
                                     <TextArea
                                        rows={4}
                                        value={userComment}
                                        onChange={(e) => setUserComment(e.target.value)}
                                        placeholder="Share your thoughts about this book..."
                                        className="mb-3"
                                    />
                                </Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submittingReview}
                                    disabled={userRating === 0 || !userComment.trim()} // Disable if no rating or comment
                                    icon={<SendOutlined />}
                                >
                                    Submit Review
                                </Button>
                            </Form>
                        </Card>
                    ) : (
                         <div className="mb-6 p-4 border border-dashed rounded-md text-center">
                             <Text type="secondary">You need to be logged in to write a review.</Text>
                             <Button type="link" onClick={() => navigate(PATHS.LOGIN)} className="ml-1">Login Now</Button>
                         </div>
                     )}

                    {/* Review List */}
                    <List
                        className="comment-list"
                        header={<Text strong>{`${book.reviews?.length || 0} Review(s)`}</Text>}
                        itemLayout="horizontal"
                        dataSource={book.reviews || []}
                        locale={{ emptyText: <Empty description="No reviews yet for this book." image={Empty.PRESENTED_IMAGE_SIMPLE}/> }} // Handle empty reviews
                        renderItem={(item) => (
                            <List.Item key={item.id} className="!pl-0"> {/* Remove default padding */}
                                 {/* Rebuilding Comment Layout */}
                                <div className="flex items-start gap-4 w-full">
                                    <Avatar src={item.avatar} alt={item.author} icon={<UserOutlined />} />
                                    <div className="flex-grow">
                                         <div className="flex justify-between items-center mb-1">
                                             <Text strong>{item.author}</Text>
                                             <Text type="secondary" className="text-xs">{item.datetime}</Text>
                                         </div>
                                         <Rate disabled size="small" value={item.rating} className="mb-1"/> {/* Use value instead of defaultValue */}
                                         <Paragraph className="text-gray-700 mb-0">{item.content}</Paragraph>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
            </Card>
        </div>
    );
};

export default BookDetail;