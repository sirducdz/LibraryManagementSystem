// Example: src/features/admin/pages/BookManagementPage.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react"; // Added useCallback
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
  Popconfirm,
  Typography,
  App,
  Spin,
  Row,
  Col,
  Avatar,
  InputNumber, // Added Spin, App
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate

// --- Adjust Import Paths ---
import { PATHS } from "../../../routes/routePaths";
import {
  useGetCategoriesQuery,
  useGetBooksQuery,
  useAddBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
} from "../../books/api/bookApiSlice"; // <<<=== IMPORT RTK HOOKS

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Custom hook for debouncing (simple version)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};
// =================================

const BookManagement = () => {
  // States for modal, editing, form, and search
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null); // null for Add, book object for Edit
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState(""); // Immediate search input value
  const debouncedSearchTerm = useDebounce(searchText, 500); // Debounced value for API call (500ms delay)

  // State for table parameters (pagination, filter, sort)
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 }, // Default page size
    filters: {}, // Add filters if needed (e.g., by category)
    sorter: { field: "title", order: "ascend" }, // Default sort
  });

  // Antd hooks
  const { message: messageApi, modal: modalApi } = App.useApp();
  const navigate = useNavigate();

  // === RTK Query Hook Calls ===
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();

  // Prepare args for getBooks query based on tableParams and debounced search
  const bookQueryArgs = useMemo(
    () => ({
      query: debouncedSearchTerm,
      page: tableParams.pagination.current,
      pageSize: tableParams.pagination.pageSize,
      // Map sorter field/order for API (ensure backend understands 'title', 'author' etc.)
      sort: tableParams.sorter?.field,
      order:
        tableParams.sorter?.order === "ascend"
          ? "asc"
          : tableParams.sorter?.order === "descend"
          ? "desc"
          : undefined,
      // Add categoryId filter if implemented:
      // categoryId: tableParams.filters?.category?.length ? tableParams.filters.category[0] : null,
    }),
    [debouncedSearchTerm, tableParams]
  );

  const {
    data: booksResponse, // Should be { books: [], totalCount: number }
    isLoading: isLoadingBooks,
    isFetching,
    isError: isBooksError,
    error: booksErrorData,
  } = useGetBooksQuery(bookQueryArgs); // Pass calculated args

  // Mutation hooks
  const [addBook, { isLoading: isAdding }] = useAddBookMutation();
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();
  // ===========================

  // Process data from hooks
  const categories = useMemo(() => categoriesData || [], [categoriesData]);
  const booksData = useMemo(() => booksResponse?.books || [], [booksResponse]);
  const totalBookCount = useMemo(
    () => booksResponse?.totalCount || 0,
    [booksResponse]
  );

  // Combined loading state for table
  const isLoading = isLoadingBooks || isFetching;

  // --- Handlers ---
  // Modal control
  const showAddModal = () => {
    setEditingBook(null); // Clear editing state
    form.resetFields(); // Reset form fields
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    console.log("Editing book:", record);

    setEditingBook(record); // Set the book being edited
    // Set form fields (ensure names match Form.Item names)
    // Handle potential null values from API
    form.setFieldsValue({
      title: record.title || "",
      author: record.author || "",
      publisher: record.publisher || "",
      publicationYear: record.year, // Use 'year' field after transformResponse
      isbn: record.isbn || "",
      categoryId: record.categoryId, // Use categoryId
      // pages: record.pages || null,
      // language: record.language || "",
      description: record.description || "",
      // coverImageUrl: ??? // Handle file upload separately if needed
      // availableQuantity: record.copies // Assuming 'copies' field holds this after transform
      totalQuantity: record.totalQuantity, // Assuming 'copies' field holds this after transform
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBook(null); // Clear editing state on cancel
  };

  // Form Submission (Add or Edit)
  const handleSubmit = async (values) => {
    console.log("Form values submitted:", values);
    // Prepare data for API (map form field names to API field names if different)
    const bookDataPayload = {
      title: values.title,
      author: values.author,
      publisher: values.publisher,
      publicationYear: values.publicationYear, // Ensure type matches API (string or number)
      isbn: values.isbn,
      categoryId: values.categoryId,
      // pages: values.pages ? parseInt(values.pages, 10) : null, // Ensure number if needed
      // language: values.language,
      description: values.description,
      // Handle coverImageUrl - Requires separate upload logic usually
      // coverImageUrl: values.coverImage ? values.coverImage[0].response.url : (editingBook?.coverImage || null),
      // Handle availableQuantity/TotalQuantity if form includes them
      // availableQuantity: values.availableQuantity ? parseInt(values.availableQuantity) : 0,
      totalQuantity: values.totalQuantity ? parseInt(values.totalQuantity) : 0,
    };

    try {
      if (editingBook) {
        // Update existing book
        console.log("Updating book:", editingBook.id, bookDataPayload);
        await updateBook({ id: editingBook.id, ...bookDataPayload }).unwrap();
        messageApi.success(
          `Book "${bookDataPayload.title}" updated successfully!`
        );
      } else {
        // Add new book
        console.log("Adding new book:", bookDataPayload);
        // Backend might assign availableQuantity/totalQuantity or pass defaults
        // Add default values if needed and not handled by backend:
        // bookDataPayload.availableQuantity = bookDataPayload.totalQuantity || 1;
        // bookDataPayload.totalQuantity = bookDataPayload.totalQuantity || 1;
        await addBook(bookDataPayload).unwrap();
        messageApi.success(
          `Book "${bookDataPayload.title}" added successfully!`
        );
      }
      setIsModalVisible(false); // Close modal on success
      setEditingBook(null); // Reset editing state
      form.resetFields(); // Reset form fields
      // Data will refetch automatically due to cache invalidation
    } catch (err) {
      console.error("Failed to save book:", err);
      messageApi.error(
        err?.data?.message ||
          `Failed to ${editingBook ? "update" : "add"} book.`
      );
    }
  };

  // Delete Handler
  const handleDelete = async (id, title) => {
    // Receive title for message
    console.log("Deleting book ID:", id);
    try {
      await deleteBook(id).unwrap();
      messageApi.success(`Book "${title}" deleted successfully!`);
      // List refetches automatically
    } catch (err) {
      console.error("Failed to delete book:", err);
      messageApi.error(err?.data?.message || "Failed to delete book.");
    }
  };

  // Table change handler for server-side pagination, filter, sort
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      filters,
      sorter: { field: sorter.field, order: sorter.order },
    });
  };

  // --- Table Columns Definition ---
  const columns = [
    {
      title: "Cover",
      dataIndex: "coverImage",
      key: "coverImage",
      width: 80,
      render: (text) => (
        <Avatar
          shape="square"
          size={48}
          src={text || "/placeholder-book.png"}
          icon={<BookOutlined />}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: true,
      render: (text, record) => (
        <Link to={PATHS.BOOK_DETAIL.replace(":bookId", record.id)}>{text}</Link>
      ),
    }, // Assuming Book Detail exists
    { title: "Author", dataIndex: "author", key: "author", sorter: true },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      /* filters: categoryFilters, */ render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    }, // Add filters if needed
    { title: "ISBN", dataIndex: "isbn", key: "isbn" },
    { title: "Year", dataIndex: "year", key: "publishYear", sorter: true }, // Use 'year' after transformResponse
    {
      title: "Total", // Tiêu đề cột: Tổng số lượng
      dataIndex: "totalQuantity", // <<< Data index khớp với trường từ API (sau transform nếu có)
      key: "totalQuantity",
      align: "center",
      width: 80, // Độ rộng cột
      sorter: false, // Cho phép sort nếu backend hỗ trợ SortBy=TotalQuantity
    },
    {
      title: "Copies",
      dataIndex: "copies",
      key: "copies",
      align: "center",
      sorter: false,
    }, // Use 'copies' after transformResponse
    {
      title: "Status",
      dataIndex: "available",
      key: "available",
      /* filters: availableFilters, */ render: (available) => (
        <Tag color={available ? "green" : "red"}>
          {available ? "Available" : "Borrowed"}
        </Tag>
      ),
    }, // Add filters if needed
    {
      title: "Action",
      key: "action",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this book?"
            onConfirm={() => handleDelete(record.id, record.title)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={isDeleting}
            />{" "}
            {/* Add loading state */}
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- Render Component ---
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card bordered={false} className="shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <Title level={2} className="mb-0">
            Book Management
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add New Book
          </Button>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <Input
            placeholder="Search by Title, Author, ISBN..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)} // Update local state immediately
            style={{ width: 300 }}
          />
          {/* isFetching shows loading during debounce/API call */}
          {isFetching && !isLoading && (
            <Spin size="small" style={{ marginLeft: 8 }} />
          )}
        </div>

        {/* Error Alert */}
        {isBooksError && !isLoading && (
          <Alert
            message="Error Loading Books"
            description={
              booksErrorData?.data?.message ||
              booksErrorData?.error ||
              "Could not fetch books."
            }
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {/* Main Book Table */}
        <Table
          columns={columns}
          dataSource={booksData} // Use data from RTK Query
          rowKey="id"
          loading={isLoading || isFetching} // Show loading on initial load or refetch
          pagination={{
            // Configure pagination from RTK Query response
            current: tableParams.pagination.current,
            pageSize: tableParams.pagination.pageSize,
            total: totalBookCount, // Total items from API
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} books`,
          }}
          onChange={handleTableChange} // Handle server-side pagination/sort/filter
          scroll={{ x: "max-content" }} // Allow horizontal scroll
        />
      </Card>

      {/* Add/Edit Book Modal */}
      <Modal
        title={editingBook ? "Edit Book" : "Add New Book"}
        open={isModalVisible} // Use 'open'
        onCancel={handleCancel}
        footer={null} // Custom footer inside Form
        width={800} // Wider modal for more fields
        destroyOnClose // Reset form state when closing
      >
        {/* Form needs to be wrapped for form instance */}
        {/* Only render Form when modal is open OR keep it mounted with destroyOnClose */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          name="book_management_form"
        >
          <Row gutter={16}>
            {" "}
            {/* Use Row/Col for better layout */}
            <Col span={12}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter book title" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="author"
                label="Author"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter author name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="totalQuantity"
                label="Total Quantities"
                rules={[
                  { required: true, message: "Please enter total quantities" },
                  { type: "number", min: 0, message: "Must be 0 or more" },
                ]}
              >
                <InputNumber type="number" placeholder="Total physical quantities" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="publisher" label="Publisher">
                <Input placeholder="Enter publisher" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="publicationYear" label="Publication Year">
                <Input type="number" placeholder="Enter year (e.g., 2023)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isbn" label="ISBN">
                <Input placeholder="Enter ISBN" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Category"
                rules={[{ required: true }]}
              >
                {/* Load categories from RTK Query */}
                <Select
                  placeholder="Select category"
                  loading={isLoadingCategories}
                >
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item name="pages" label="Pages">
                <Input type="number" placeholder="Enter number of pages" />
              </Form.Item>
            </Col> */}
            {/* <Col span={12}>
              <Form.Item name="language" label="Language">
                <Input placeholder="Enter language" />
              </Form.Item>
            </Col> */}
            {/* Add fields for Total Copies / Available Copies if needed for Add/Edit */}
            {/* <Col span={12}>
              <Form.Item
                name="totalQuantity"
                label="Total Copies"
                rules={[{ required: true, type: "number", min: 0 }]}
              >
                <Input type="number" placeholder="Total physical copies" />
              </Form.Item>
            </Col> */}
            {/* Available Quantity is usually calculated, maybe not editable */}
            <Col span={24}>
              {/* Cover Image Upload - Needs proper handling logic */}
              <Form.Item name="coverImageFile" label="Cover Image">
                {/* Use Antd Upload component - Requires setup for file handling/upload API */}
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false /* Prevent auto upload */}
                >
                  <Button icon={<UploadOutlined />}>Upload Cover Image</Button>
                </Upload>
                {/* Display current image if editing */}
                {editingBook?.coverImage &&
                  !form.getFieldValue("coverImageFile") && (
                    <Avatar
                      shape="square"
                      size={64}
                      src={editingBook.coverImage}
                      className="mt-2"
                    />
                  )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="description" label="Description">
                <TextArea rows={4} placeholder="Enter book description" />
              </Form.Item>
            </Col>
          </Row>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCancel} disabled={isAdding || isUpdating}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isAdding || isUpdating}
            >
              {editingBook ? "Update Book" : "Add Book"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BookManagement;
