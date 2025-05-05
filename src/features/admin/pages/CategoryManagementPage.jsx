// Ví dụ: src/features/admin/pages/CategoryManagementPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Popconfirm,
  Typography,
  App,
  Spin,
  Alert,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  TagsOutlined, // Icon chính
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Không cần Link ở đây

// --- Sửa đường dẫn import ---
import { PATHS } from "../../../routes/routePaths";
import {
  useGetCategoriesAdminQuery, // Hook lấy categories cho admin
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../api/categoryApiSlice"; // <<<=== IMPORT HOOKS (Sửa path)

const { Title } = Typography;
const { TextArea } = Input;

// Hook debounce (giữ nguyên)
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

const PAGE_SIZE_OPTIONS_CATEGORY = ["10", "20", "50"];
const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  try {
    let stringToParse = dateString;
    if (
      stringToParse.includes("T") &&
      !stringToParse.endsWith("Z") &&
      !stringToParse.match(/[+-]\d{2}:\d{2}$/)
    ) {
      stringToParse += "Z";
    }
    const date = new Date(stringToParse);
    if (isNaN(date.getTime())) return dateString;
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    };
    return date.toLocaleString("vi-VN", options);
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString;
  }
};
const CategoryManagementPage = () => {
  // States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null: Add, object: Edit
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const debouncedSearchTerm = useDebounce(searchText, 500);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {}, // Chưa dùng filters ở đây
    sorter: { field: "Name", order: "ascend" }, // Mặc định sort theo Name
  });

  const { message: messageApi } = App.useApp();
  const navigate = useNavigate();

  // === RTK Query Hook Calls ===
  const queryArgs = useMemo(
    () => ({
      searchTerm: debouncedSearchTerm,
      page: tableParams.pagination.current,
      pageSize: tableParams.pagination.pageSize,
      // Map sorter field/order (đảm bảo backend nhận Name, CreatedAt)
      sortBy:
        tableParams.sorter?.field === "name"
          ? "Name"
          : tableParams.sorter?.field === "createdAt"
          ? "CreatedAt"
          : "Name", // Default Name
      order:
        tableParams.sorter?.order === "ascend"
          ? "asc"
          : tableParams.sorter?.order === "descend"
          ? "desc"
          : "asc", // Default asc
    }),
    [debouncedSearchTerm, tableParams]
  );

  const {
    data: categoriesResponse, // Là { categories: [], totalCount: number }
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetCategoriesAdminQuery(queryArgs); // <<<=== Gọi hook lấy categories admin

  // Mutation hooks
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  // ===========================

  // Process data
  const categoriesData = useMemo(
    () => categoriesResponse?.categories || [],
    [categoriesResponse]
  );
  const totalCategoryCount = useMemo(
    () => categoriesResponse?.totalCount || 0,
    [categoriesResponse]
  );
  const tableLoading = isLoading || isFetching;

  // --- Handlers ---
  const showAddModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  const showEditModal = (record) => {
    setEditingCategory(record);
    form.setFieldsValue({
      // Đặt giá trị cho form edit
      name: record.name,
      description: record.description || "",
    });
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
  };

  // Submit form Add/Edit
  const handleSubmit = async (values) => {
    const categoryData = { name: values.name, description: values.description };
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          ...categoryData,
        }).unwrap();
        messageApi.success(`Category "${categoryData.name}" updated!`);
      } else {
        await addCategory(categoryData).unwrap();
        messageApi.success(`Category "${categoryData.name}" added!`);
      }
      setIsModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (err) {
      messageApi.error(err?.data?.message || `Failed.`);
    }
  };

  // Delete Handler
  const handleDelete = async (id, name) => {
    try {
      await deleteCategory(id).unwrap();
      messageApi.success(`Category "${name}" deleted!`);
    } catch (err) {
      messageApi.error(err?.data?.message || "Failed.");
    }
  };

  // Table change handler
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
  const columns = useMemo(
    () => [
      // Bọc useMemo
      { title: "ID", dataIndex: "id", key: "id", width: 80 },
      {
        title: "Category Name",
        dataIndex: "name",
        key: "name",
        sorter: true, // Cho phép sort theo tên
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        ellipsis: true,
      }, // Thêm ellipsis nếu mô tả dài
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        render: formatDateTime, // Format ngày giờ
        sorter: true, // Cho phép sort theo ngày tạo
        width: 180,
      },
      // { title: "Updated At", dataIndex: "updatedAt", key: "updatedAt", render: formatDateTime, width: 180 }, // Bỏ bớt nếu không cần thiết
      {
        title: "Action",
        key: "action",
        width: 100,
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
              title="Edit"
            />
            <Popconfirm
              title="Delete this category?"
              onConfirm={() => handleDelete(record.id, record.name)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
              icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            >
              {/* Cần thêm state isDeleting riêng cho category nếu muốn loading */}
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                title="Delete"
              />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  ); // Không có dependencies nếu columns tĩnh

  // --- Render Component ---
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card bordered={false} className="shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <Title level={2} className="mb-0 flex items-center">
            <TagsOutlined className="mr-2" /> Category Management
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            {" "}
            Add New Category{" "}
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Search by category name..."
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          {isFetching && !isLoading && <Spin size="small" />}
        </div>

        {isError && !isLoading && (
          <Alert
            message="Error Loading Categories"
            description={error?.data?.message || error?.error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Table
          columns={columns}
          dataSource={categoriesData} // <<< Dùng data từ hook
          rowKey="id"
          loading={tableLoading} // Dùng biến loading tổng hợp
          pagination={{
            current: tableParams.pagination.current,
            pageSize: tableParams.pagination.pageSize,
            total: totalCategoryCount, // <<< Dùng total từ hook
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE_OPTIONS_CATEGORY, // Dùng options riêng
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} categories`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modal Add/Edit Category */}
      <Modal
        title={editingCategory ? "Edit Category" : "Add New Category"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Custom footer trong Form
        destroyOnClose
        maskClosable={false} // Không cho đóng khi bấm ra ngoài
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          name="category_management_form"
        >
          {/* Name */}
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: "Please enter the category name!" },
            ]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          {/* Description */}
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter category description" />
          </Form.Item>
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
              {editingCategory ? "Update Category" : "Add Category"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagementPage;
