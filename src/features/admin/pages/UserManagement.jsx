// Ví dụ: src/features/admin/pages/UserManagementPage.jsx

import React, { useState, useEffect, useMemo } from "react";
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
  Popconfirm,
  Typography,
  App,
  Spin,
  Alert,
  Avatar,
  Row,
  Col,
} from "antd"; // Thêm Switch, Avatar
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  ProfileOutlined,
  UserOutlined,
  WomanOutlined,
  ManOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Không cần Link ở đây

// --- Sửa đường dẫn import ---
import { PATHS } from "../../../routes/routePaths"; // Có thể không cần PATHS ở đây
import {
  useGetUsersAdminQuery,
  useAddUserAdminMutation,
  useUpdateUserAdminMutation,
  useDeleteUserAdminMutation,
  useUpdateUserStatusAdminMutation,
} from "../api/userAdminApiSlice"; // <<<=== Đảm bảo đúng path

const { Title, Text } = Typography; // Thêm Text nếu cần
const { Option } = Select;

// Hook debounce
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

const PAGE_SIZE_OPTIONS = ["10", "15", "20", "50"];
// Hàm format ngày giờ (nếu dùng cho CreatedAt)
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
    return dateString;
  }
};
const UserManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const debouncedSearchTerm = useDebounce(searchText, 500);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sorter: { field: "name", order: "ascend" }, // Default sort name asc
  });
  // State riêng cho loading của nút toggle status và delete
  const [togglingStatusId, setTogglingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { message: messageApi, modal: modalApi } = App.useApp();
  const navigate = useNavigate();

  // === RTK Query Hook Calls ===
  const queryArgs = useMemo(
    () => ({
      searchTerm: debouncedSearchTerm,
      page: tableParams.pagination.current,
      pageSize: tableParams.pagination.pageSize,
      // Map frontend state -> backend param name
      sortBy:
        tableParams.sorter?.field === "name"
          ? "FullName"
          : tableParams.sorter?.field === "createdAt"
          ? "CreatedAt"
          : tableParams.sorter?.field,
      sortOrder:
        tableParams.sorter?.order === "ascend"
          ? "asc"
          : tableParams.sorter?.order === "descend"
          ? "desc"
          : undefined,
      // !!! VALUE filter phải khớp backend ('Admin'/'User', 'Active'/'Inactive') !!!
      filters: {
        role: tableParams.filters?.role || null,
        status: tableParams.filters?.status || null,
      },
    }),
    [debouncedSearchTerm, tableParams]
  );

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetUsersAdminQuery(queryArgs);
  const [addUser, { isLoading: isAdding }] = useAddUserAdminMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserAdminMutation();
  const [deleteUser, { isLoading: isDeletingMutation }] =
    useDeleteUserAdminMutation(); // Đổi tên để phân biệt
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusAdminMutation();
  // ===========================

  // Process data
  // `usersData` có `name` đã được map từ `fullName` trong slice
  const usersData = useMemo(() => usersResponse?.users || [], [usersResponse]);
  const totalUserCount = useMemo(
    () => usersResponse?.totalCount || 0,
    [usersResponse]
  );
  const tableLoading = isLoading || isFetching; // Loading tổng cho bảng

  // --- Handlers ---
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination: { ...pagination },
      filters,
      sorter: { field: sorter.field, order: sorter.order },
    });
  };
  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  const showEditModal = (record) => {
    console.log("Editing User Record:", record);
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name, // Dùng name đã map
      email: record.email,
      // phone: record.phone, // Bỏ nếu không có
      // API Update chỉ nhận fullName, roleID, gender nên các field khác không cần thiết lập ở đây
      // Chỉ cần set các field mà Form Edit có
      role: record.role, // Role dạng string ('Admin'/'User')
      gender: record.gender, // Gender dạng số (0/1)
      // Status là boolean cho Switch, API trả về string -> cần map
      // status: record.status?.toLowerCase() === 'active', // Bỏ field này khỏi Edit Form nếu không update qua đây
    });
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  // Handler Submit Form (Add/Edit)
  const handleSubmit = async (values) => {
    try {
      console.log("Form Values:", values);

      if (editingUser) {
        // UPDATE: Chỉ gửi các trường API cho phép
        const updatePayload = {
          fullName: values.name, // Map form 'name' -> API 'fullName'
          // Map role string -> roleID số trong slice query
          role: values.role, // Truyền role string để slice map
          gender: values.gender,
        };
        console.log("Updating user:", editingUser.id, updatePayload);
        await updateUser({ id: editingUser.id, ...updatePayload }).unwrap();
        messageApi.success(`User "${updatePayload.fullName}" updated!`);
      } else {
        // ADD: Gửi tất cả các trường form cần thiết
        const addPayload = {
          username: values.username,
          email: values.email,
          name: values.name, // Dùng name từ form
          password: values.password,
          confirmPassword: values.confirmPassword,
          role: values.role, // Role string
          gender: values.gender,
          status: values.status ?? true, // Lấy status boolean từ Switch (mặc định true nếu không có)
        };
        console.log("Adding user:", addPayload);
        await addUser(addPayload).unwrap(); // Slice sẽ map tên trường và roleID, status
        messageApi.success(`User "${addPayload.name}" added!`);
      }
      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    } catch (err) {
      messageApi.error(err?.data?.message || `Failed.`);
    }
  };

  // Handler Delete
  const handleDelete = (id, name) => {
    modalApi.confirm({
      title: `Delete User: ${name}?`,
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone. Are you sure?",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        setDeletingId(id); // Set loading cho nút delete
        try {
          await deleteUser(id).unwrap();
          messageApi.success(`User "${name}" deleted!`);
        } catch (err) {
          messageApi.error(err?.data?.message || "Failed.");
        } finally {
          setDeletingId(null);
        } // Bỏ loading
      },
    });
  };

  // Handler Toggle Status
  const handleToggleStatus = (record) => {
    if (!record) return;
    const currentStatusBool = record.status?.toLowerCase() === "active";
    const newStatusBool = !currentStatusBool;
    const actionText = newStatusBool ? "activate" : "deactivate";

    modalApi.confirm({
      title: `Confirm Status Change`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to ${actionText} user "${record.name}"?`,
      okText: `Yes, ${actionText}`,
      cancelText: "Cancel",
      okButtonProps: { danger: !newStatusBool }, // Nút danger khi deactivate
      onOk: async () => {
        setTogglingStatusId(record.id); // Set loading cho nút toggle
        try {
          // Gọi mutation cập nhật status, gửi đi boolean isActive
          await updateStatus({
            id: record.id,
            isActive: newStatusBool,
          }).unwrap();
          messageApi.success(
            `User "${record.name}" ${actionText}d successfully!`
          );
        } catch (err) {
          messageApi.error(
            err?.data?.message || `Failed to ${actionText} user.`
          );
        } finally {
          setTogglingStatusId(null);
        } // Bỏ loading
      },
    });
  };

  // --- Table Columns ---
  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 60 },
      { title: "Name", dataIndex: "name", key: "name", sorter: true }, // Dùng 'name' đã map
      { title: "Email", dataIndex: "email", key: "email", sorter: true },
      // { title: "Phone", dataIndex: "phone", key: "phone" }, // Bỏ nếu API không có
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        width: 100,
        align: "center",
        render: (role) => (
          <Tag color={role?.toLowerCase() === "admin" ? "purple" : "blue"}>
            {role || "N/A"}
          </Tag>
        ),
        // filters: [
        //   { text: "Admin", value: "Admin" },
        //   { text: "User", value: "User" },
        // ], // VALUE khớp backend
        // filteredValue: tableParams.filters?.role || null,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        align: "center",
        render: (status) => (
          <Tag color={status?.toLowerCase() === "active" ? "green" : "red"}>
            {status?.charAt(0).toUpperCase() + status?.slice(1) || "N/A"}
          </Tag>
        ),
        filters: [
          { text: "Active", value: "Active" },
          { text: "Inactive", value: "Inactive" },
        ], // VALUE khớp backend
        filteredValue: tableParams.filters?.status || null,
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        render: formatDateTime,
        sorter: true,
        width: 180,
      },
      {
        title: "Action",
        key: "action",
        width: 120,
        align: "center",
        fixed: "right",
        render: (_, record) => (
          <Space size="small">
            {/* Nút Edit */}
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              title="Edit User Info"
            />
            {/* Nút Toggle Status */}
            <Button
              size="small"
              icon={
                record.status?.toLowerCase() === "active" ? (
                  <LockOutlined />
                ) : (
                  <UnlockOutlined />
                )
              }
              onClick={() => handleToggleStatus(record)}
              danger={record.status?.toLowerCase() === "active"}
              title={
                record.status?.toLowerCase() === "active"
                  ? "Deactivate"
                  : "Activate"
              }
              loading={isUpdatingStatus && togglingStatusId === record.id} // Loading đúng nút
            />
            {/* Nút Delete */}
            <Popconfirm
              title="Delete this user?"
              onConfirm={() => handleDelete(record.id, record.name)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                title="Delete User"
                loading={isDeletingMutation && deletingId === record.id}
              />
            </Popconfirm>
          </Space>
        ),
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ],
    [
      tableParams.filters,
      isUpdatingStatus,
      togglingStatusId,
      isDeletingMutation,
      deletingId,
    ]
  ); // Thêm dependencies loading

  // --- Render Component ---
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card bordered={false} className="shadow-md">
        {/* <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <Title level={2} className="mb-0 flex items-center">
            <TeamOutlined className="mr-2" /> User Management
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            {" "}
            Add New User{" "}
          </Button>
        </div> */}
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Search by Name, Email..."
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
            message="Error Loading Users"
            description={""}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        <Table
          columns={columns}
          dataSource={usersData}
          rowKey="id"
          loading={tableLoading}
          pagination={{
            current: tableParams.pagination.current,
            pageSize: tableParams.pagination.pageSize,
            total: totalUserCount,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modal Add/Edit User */}
      <Modal
        title={editingUser ? `Edit User: ${editingUser.name}` : "Add New User"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Footer trong Form
        destroyOnClose
        maskClosable={false}
        width={600}
      >
        {/* Chỉ render Form khi có thể để reset state tốt hơn, hoặc dùng form.resetFields */}
        {isModalVisible && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            name="user_management_form"
          >
            <Row gutter={16}>
              {/* Các trường chung cho Add/Edit nhưng chỉ Edit được 1 số */}
              <Col span={12}>
                {" "}
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true }]}
                >
                  <Input
                    prefix={<ProfileOutlined />}
                    // readOnly={!!editingUser}
                  />
                </Form.Item>{" "}
              </Col>
              <Col span={12}>
                {" "}
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input prefix={<MailOutlined />} readOnly={!!editingUser} />
                </Form.Item>{" "}
              </Col>
              <Col span={12}>
                {" "}
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select gender" disabled={!editingUser}>
                    {" "}
                    {/* Chỉ cho sửa Gender khi Edit */}
                    <Option value={0}>
                      <ManOutlined /> Male
                    </Option>
                    <Option value={1}>
                      <WomanOutlined /> Female
                    </Option>
                  </Select>
                </Form.Item>{" "}
              </Col>
              <Col span={12}>
                {" "}
                <Form.Item
                  name="role"
                  label="Role"
                  rules={[{ required: true }]}
                >
                  <Select placeholder="Select role" disabled={!editingUser}>
                    {" "}
                    {/* Chỉ cho sửa Role khi Edit */}
                    {/* !!! VALUE phải khớp với logic mapRoleNameToId !!! */}
                    <Option value="Admin">Admin</Option>
                    <Option value="User">User</Option>{" "}
                    {/* Hoặc NormalUser tùy vào data */}
                  </Select>
                </Form.Item>{" "}
              </Col>

              {/* Trường chỉ có khi Add User */}
              {!editingUser && (
                <>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[{ required: true, min: 3 }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>{" "}
                  </Col>
                  <Col span={12}></Col> {/* Cột trống để giữ layout */}
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[{ required: true, min: 6 }]}
                      hasFeedback
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>{" "}
                  </Col>
                  <Col span={12}>
                    {" "}
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm Password"
                      dependencies={["password"]}
                      hasFeedback
                      rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value)
                              return Promise.resolve();
                            return Promise.reject(
                              new Error("Passwords do not match!")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>{" "}
                  </Col>
                  {/* Status cho Add User (Mặc định Active?) */}
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="Initial Status"
                      initialValue={true}
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleCancel} disabled={isAdding || isUpdating}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isAdding || isUpdating}
              >
                {editingUser ? "Update User" : "Add User"}
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
