// Ví dụ: src/pages/UserProfile.jsx hoặc src/features/user/pages/UserProfile.jsx

import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Avatar,
  Typography,
  Spin,
  Alert,
  App,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  SaveOutlined,
  WomanOutlined,
  ManOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Nếu cần điều hướng

// --- Sửa đường dẫn import ---
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "../../auth/api/authApiSlice"; // <<<=== Import hooks mới
import { UseAuth } from "../../../contexts/AuthContext"; // <<<=== Import UseAuth để check login ban đầu
import { PATHS } from "../../../routes/routePaths"; // <<<=== Import PATHS
const { Title, Text } = Typography;
const { Option } = Select;

const UserProfile = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp();
  const [isEditing, setIsEditing] = useState(false); // State bật/tắt chế độ chỉnh sửa
  // Lấy thông tin user hiện tại từ context để hiển thị tạm thời khi loading
  const { user: userFromContext, login: loginContext } = UseAuth();

  // === Gọi RTK Query Hook để lấy dữ liệu Profile ===
  const {
    data: profileData, // Dữ liệu trả về từ API /users/me (đã qua transformResponse nếu có)
    isLoading: isLoadingProfile,
    isFetching: isFetchingProfile,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile, // Hàm để fetch lại profile thủ công
  } = useGetProfileQuery(undefined, {
    // undefined vì không cần tham số
    refetchOnMountOrArgChange: true, // Có thể bật để luôn lấy mới khi vào trang
  });

  // Hook mutation để cập nhật profile
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  // =============================================

  // --- useEffect để đổ dữ liệu vào form khi có data từ API ---
  useEffect(() => {
    if (profileData) {
      console.log("Setting form values:", profileData);
      // Đảm bảo tên field trong setFieldsValue khớp với name của Form.Item
      form.setFieldsValue({
        username: profileData.username || profileData.userName, // Dùng tên đã map hoặc tên gốc
        email: profileData.email,
        fullName: profileData.fullName,
        gender: profileData.gender, // Giả sử gender là số (0 hoặc 1)
      });
    }
  }, [profileData, form]); // Chạy lại khi profileData thay đổi

  // --- Handler ---
  // Bật/tắt chế độ chỉnh sửa
  const handleToggleEdit = () => {
    if (isEditing) {
      form.resetFields(); // Reset về giá trị ban đầu nếu hủy chỉnh sửa
      // Hoặc nếu muốn giữ lại giá trị ban đầu từ API:
      // if(profileData) form.setFieldsValue({...});
    }
    setIsEditing(!isEditing);
  };

  // Xử lý submit form cập nhật
  const onFinishUpdate = async (values) => {
    console.log("Submitting profile update:", values);
    // Chỉ lấy những trường cần update (API chỉ nhận fullName và gender)
    const dataToUpdate = {
      fullName: values.fullName,
      gender: values.gender,
    };

    try {
      const updatedUserResponse = await updateProfile(dataToUpdate).unwrap(); // Gọi mutation
      console.log("userFromContext:", userFromContext);
      console.log("Profile updated API response:", updatedUserResponse);
      messageApi.success("Profile updated successfully!");
      const currentToken =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      const currentRefreshToken =
        localStorage.getItem("refreshToken") ||
        sessionStorage.getItem("refreshToken");

      //   let finalUserData = updatedUserResponse
      //     ? {
      //         ...userFromContext,
      //         userName: updatedUserResponse.fullName,
      //       } // Map lại nếu cần
      //     : { ...userFromContext, ...dataToUpdate };
      let finalUserData = {
        ...userFromContext,
        ...dataToUpdate,
        username: updatedUserResponse.fullName,
      };
      console.log("Final user data to save:", finalUserData);

      const storage = localStorage.getItem("accessToken")
        ? localStorage
        : sessionStorage;
      storage.setItem("userData", JSON.stringify(finalUserData));
      // Lưu lại cả token để đảm bảo đồng bộ (dù nó không đổi)
      if (currentToken) storage.setItem("accessToken", currentToken);
      if (currentRefreshToken)
        storage.setItem("refreshToken", currentRefreshToken);

      // 5. Cập nhật AuthContext (truyền user mới và token cũ)
      loginContext(finalUserData, currentToken); // Dùng hàm login để cập nhật cả user và token trong context
      // Dữ liệu sẽ tự cập nhật trên UI nhờ invalidateTags và hook getProfile tự fetch lại
      // hoặc gọi refetchProfile(); nếu muốn chắc chắn
      setIsEditing(false); // Tắt chế độ chỉnh sửa sau khi thành công
    } catch (err) {
      console.error("Failed to update profile:", err);
      messageApi.error(err?.data?.message || "Failed to update profile.");
    }
  };

  // --- Render ---
  // Hiển thị loading ban đầu
  if (isLoadingProfile) {
    return (
      <div className="p-8 text-center">
        <Spin size="large" tip="Loading Profile..." />
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (isProfileError || !profileData) {
    return (
      <div className="p-8">
        <Alert
          message="Error"
          description={profileError?.data?.message || "Could not load profile."}
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Lấy thông tin để hiển thị (ưu tiên data từ hook, fallback về context nếu cần)
  const displayUser = profileData || userFromContext;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {" "}
      {/* Giới hạn chiều rộng */}
      {isFetchingProfile && (
        <Spin
          tip="Refreshing..."
          style={{ position: "fixed", top: 80, right: 20 }}
        />
      )}{" "}
      {/* Spin nhỏ khi fetch lại */}
      <Card className="shadow-lg rounded-lg">
        <div className="flex flex-col items-center mb-6">
          <Avatar
            size={100} // Kích thước lớn hơn
            icon={<UserOutlined />}
            src={displayUser?.avatarUrl || undefined} // Lấy avatar từ profileData hoặc user context
            className="mb-4 border-2 border-gray-200" // Thêm border
          />
          <Title level={3} className="mb-1">
            {displayUser?.fullName || "User Name"}
          </Title>
          <Text type="secondary">{displayUser?.email}</Text>
          {displayUser?.roles && (
            <div className="mt-2">
              {displayUser.roles.map((role) => (
                <Tag key={role} color="blue">
                  {role}
                </Tag>
              ))}
            </div>
          )}
        </div>

        <Divider>Profile Information</Divider>

        {/* Form hiển thị và chỉnh sửa */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishUpdate}
          // initialValues được set bằng useEffect
          className="mt-6"
        >
          {/* Username (Read-only) */}
          <Form.Item label="Username">
            <Input
              prefix={<UserOutlined />}
              value={displayUser?.username || displayUser?.userName}
              size="large"
              readOnly
              className="!bg-gray-100"
            />
          </Form.Item>

          {/* Email (Read-only) */}
          <Form.Item label="Email">
            <Input
              prefix={<MailOutlined />}
              value={displayUser?.email}
              size="large"
              readOnly
              className="!bg-gray-100"
            />
          </Form.Item>

          {/* Full Name (Editable) */}
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              { required: true, message: "Please input your full name!" },
            ]}
          >
            <Input
              prefix={<ProfileOutlined />}
              placeholder="Your full name"
              size="large"
              readOnly={!isEditing}
            />
          </Form.Item>

          {/* Gender (Editable) */}
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: "Please select your gender!" }]}
          >
            <Select
              placeholder="Select gender"
              size="large"
              disabled={!isEditing}
            >
              {/* !!! VALUE phải khớp giá trị backend mong đợi (0, 1) !!! */}
              <Option value={0}>
                <ManOutlined /> Male
              </Option>
              <Option value={1}>
                <WomanOutlined /> Female
              </Option>
              {/* <Option value={2}>Other</Option> */}
            </Select>
          </Form.Item>

          <Divider />

          {/* Nút Edit/Save/Cancel */}
          <Form.Item className="text-right">
            {" "}
            {/* Căn phải các nút */}
            {isEditing ? (
              <div className="space-x-2">
                <Button onClick={handleToggleEdit}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isUpdatingProfile}
                  icon={<SaveOutlined />}
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                type="default"
                onClick={handleToggleEdit}
                icon={<EditOutlined />}
              >
                Edit Profile
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserProfile;
