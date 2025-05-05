// Ví dụ: src/pages/RegisterPage.jsx

import React, { useEffect } from "react"; // Bỏ useState nếu không dùng loading cục bộ
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  ProfileOutlined,
  UserAddOutlined,
  WomanOutlined,
  ManOutlined,
  WarningOutlined, // Thêm các icons cần thiết
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  Card,
  Typography,
  Alert,
  Divider,
  App,
  Select,
  Row,
  Col, // Thêm App, Select
} from "antd";
import { Link, useNavigate } from "react-router-dom";

// --- Sửa đường dẫn import nếu cần ---
// import { useRegisterMutation } from "../features/auth/api/authApiSlice"; // Hook RTK Query register
// import { UseAuth } from "../../contexts/AuthContext"; // Hook Context Auth (chỉ để check redirect)
// import { PATHS } from "../../routes/routePaths"; // Hook định nghĩa paths

import { useRegisterMutation } from "../api/authApiSlice"; // <<<=== Import hook register
import { UseAuth } from "../../../contexts/AuthContext"; // <<<=== Import UseAuth để check login ban đầu
import { PATHS } from "../../../routes/routePaths"; // <<<=== Import PATHS

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  // === Sử dụng hook RTK Query cho Register ===
  // isLoading, isError, error sẽ được dùng để hiển thị trạng thái/lỗi
  const [registerTrigger, { isLoading, error, isError, reset }] =
    useRegisterMutation();
  // =========================================

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { message: messageApi } = App.useApp(); // Lấy messageApi từ Antd App Provider

  // Kiểm tra nếu đã đăng nhập -> về HomePage
  const { isLoading: isAuthLoading, isAuthenticated } = UseAuth();
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      console.log(
        "User is already authenticated, redirecting from Register page..."
      );
      navigate(PATHS.HomePage || "/", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]); // Dependencies

  // Hàm xử lý khi submit form đăng ký
  const onFinish = async (values) => {
    console.log("Submitting registration:", values);

    // Chuẩn bị dữ liệu gửi lên API (khớp với backend)
    const userData = {
      userName: values.username, // Map username -> userName
      email: values.email,
      fullName: values.fullName,
      password: values.password,
      confirmPassword: values.confirmPassword, // API yêu cầu trường này
      gender: values.gender, // Lấy gender từ form
    };

    if (isError) {
      reset(); // Reset lỗi cũ nếu có
    }

    try {
      console.log("User data to register:", userData);

      // Gọi mutation trigger với dữ liệu người dùng
      await registerTrigger(userData).unwrap(); // unwrap() để bắt lỗi từ API

      console.log("Registration successful!");
      messageApi.success(
        "Account registered successfully! Please proceed to login."
      ); // Thông báo thành công
      form.resetFields(); // Xóa trắng form
      navigate(PATHS.LOGIN || "/login"); // Điều hướng đến trang đăng nhập
    } catch (err) {
      console.error("Failed to register:", err);
      // Lỗi sẽ được hiển thị qua Alert dựa trên state `isError` và `error` của hook
      // messageApi.error(getErrorMessage(err)); // Có thể hiển thị thêm nếu cần
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Form validation Failed:", errorInfo);
  };

  // Hàm lấy thông báo lỗi (tương tự LoginPage, có thể tách ra file utils)
  const getErrorMessage = (error) => {
    if (!error) return "An unknown error occurred during registration.";
    if (error.data) {
      if (typeof error.data === "object" && error.data !== null) {
        if (error.data.errors) {
          return Object.values(error.data.errors).flat().join("; ");
        }
        if (error.data.message) return error.data.message;
        if (error.data.error) return error.data.error;
        if (error.data.title) return error.data.title;
        return JSON.stringify(error.data);
      }
      return String(error.data);
    }
    if (error.message) return error.message;
    if (error.error) return error.error;
    return "Registration failed. Please check your input or try again later.";
  };

  return (
    // *** CONTAINER NGOÀI CÙNG - GIỐNG LOGINPAGE ***
    <div className="relative h-screen flex items-center justify-center overflow-hidden p-4">
      {/* *** BACKGROUND VÀ OVERLAY - GIỐNG LOGINPAGE *** */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
          filter: "brightness(0.9)",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/70 z-0"></div>
      {/* ============================================= */}

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">
        {" "}
        {/* Giữ max-w-lg cho 2 cột */}
        {/* Header text */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-md mb-3">
            {/* Có thể dùng UserAddOutlined hoặc KeyOutlined như Login */}
            <UserAddOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-white/80 text-sm">Join our library community!</p>
        </div>
        {/* Card - Style giống Login */}
        <Card className="backdrop-blur-md bg-black/15 border-0 shadow-2xl rounded-xl overflow-hidden">
          <div className="p-4 md:p-6">
            {" "}
            {/* Giữ padding lớn hơn chút */}
            {isError && (
              <Alert
                message={
                  <span className="font-semibold text-red-100">
                    Registration Failed
                  </span>
                } // Chữ màu sáng trên nền đỏ
                description={
                  <span className="text-red-200">{getErrorMessage(error)}</span>
                }
                type="error"
                showIcon
                closable
                onClose={reset}
                className="mb-4 bg-red-900/50 border border-red-500/60 rounded-lg backdrop-blur-sm text-white" // Style Alert giống Login (chữ sáng)
                icon={<WarningOutlined className="text-red-300" />}
              />
            )}
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              requiredMark={false}
              onValuesChange={() => {
                if (isError) reset();
              }}
            >
              {/* === HÀNG 1 === */}
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  {/* *** SỬA MÀU LABEL *** */}
                  <Form.Item
                    name="fullName"
                    label={
                      <span className="font-semibold text-black text-sm">
                        Full Name
                      </span>
                    }
                    rules={[{ required: true }]}
                    className="mb-3"
                  >
                    {/* Input style giống Login */}
                    <Input
                      prefix={<ProfileOutlined className="text-gray-400" />}
                      placeholder="Your full name"
                      size="large"
                      className="rounded-lg bg-black/20 backdrop-blur-md border-white/30 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring focus:ring-purple-500/50"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="username"
                    label={
                      <span className="font-semibold text-black text-sm">
                        Username
                      </span>
                    }
                    rules={[{ required: true, min: 3 }]}
                    className="mb-3"
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Choose a username"
                      size="large"
                      className="rounded-lg bg-black/20 backdrop-blur-md border-white/30 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring focus:ring-purple-500/50"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* === HÀNG 2 === */}
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label={
                      <span className="font-semibold text-black text-sm">
                        Email Address
                      </span>
                    }
                    rules={[{ required: true, type: "email" }]}
                    className="mb-3"
                  >
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="your.email@example.com"
                      type="email"
                      size="large"
                      className="rounded-lg bg-black/20 backdrop-blur-md border-white/30 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring focus:ring-purple-500/50"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="gender"
                    label={
                      <span className="font-semibold text-black text-sm">
                        Gender
                      </span>
                    }
                    rules={[{ required: true }]}
                    className="mb-3"
                  >
                    {/* Select cần thêm class để style màu chữ/nền giống Input */}
                    <Select
                      placeholder="Select gender"
                      size="large"
                      popupClassName="custom-select-dropdown"
                      /* Thêm class nếu cần */ className=" custom-gender-select
                         rounded-lg bg-black/20 backdrop-blur-md border-white/30
                         focus-within:border-purple-500 focus-within:ring focus-within:ring-purple-500/50
                         [&_.ant-select-selection-placeholder]:!text-gray-400  // Style placeholder bằng cách nhắm vào class Antd
                         [&_.ant-select-selection-item]:!text-black        // <<< Style text ĐÃ CHỌN thành màu đen
                         [&_.ant-select-arrow]:!text-white/50  "
                    >
                      {" "}
                      {/* Các lớp Tailwind để style Select */}
                      <Option value={0}>
                        <ManOutlined /> Male
                      </Option>
                      <Option value={1}>
                        <WomanOutlined /> Female
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* === HÀNG 3 === */}
              <Row gutter={[16, 0]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    label={
                      <span className="font-semibold text-black text-sm">
                        Password
                      </span>
                    }
                    rules={[{ required: true, min: 6 }]}
                    hasFeedback
                    className="mb-3"
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Create a password"
                      size="large"
                      className="rounded-lg bg-black/20 backdrop-blur-md border-white/30 text-white placeholder:text-gray-400 focus-within:border-purple-500 focus-within:ring focus-within:ring-purple-500/50"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="confirmPassword"
                    label={
                      <span className="font-semibold text-black text-sm">
                        Confirm Password
                      </span>
                    }
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password!", // Thông báo lỗi khi bỏ trống
                      },
                      // Hàm validator tùy chỉnh
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          // `_` đại diện cho rule object, không cần dùng ở đây
                          // `value` là giá trị hiện tại của ô Confirm Password
                          if (!value || getFieldValue("password") === value) {
                            // Nếu ô này rỗng (rule required sẽ bắt) HOẶC giá trị khớp với ô password
                            return Promise.resolve(); // Validation thành công
                          }
                          // Nếu giá trị không rỗng và không khớp với ô password
                          return Promise.reject(
                            new Error(
                              "The two passwords that you entered do not match!"
                            )
                          ); // Validation thất bại
                        },
                      }),
                    ]}
                    className="mb-3"
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Confirm your password"
                      size="large"
                      className="rounded-lg bg-black/20 backdrop-blur-md border-white/30 text-white placeholder:text-gray-400 focus-within:border-purple-500 focus-within:ring focus-within:ring-purple-500/50"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* === CÁC PHẦN TỬ KHÁC === */}
              <Form.Item className="mb-2 mt-4">
                {/* Nút Submit giống Login */}
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                  disabled={isLoading}
                  className="h-11 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-1 text-sm font-semibold"
                >
                  {isLoading ? "Registering..." : "Create Account"}
                </Button>
              </Form.Item>
              {/* Divider và Social buttons (Chữ OR màu sáng) */}
              <Divider className="border-white/20 my-2">
                <span className="text-gray-300 text-xs px-2">OR</span>
              </Divider>
              <div className="flex gap-3 justify-center mt-2">
                {" "}
                {/* ... Social buttons giống Login ... */}{" "}
              </div>
              {/* Link quay lại Đăng nhập (Chữ màu trắng) */}
              <div className="text-center mt-3 text-sm">
                <span className="text-white/80">Already have an account?</span>{" "}
                <Link
                  to={PATHS.LOGIN || "/login"}
                  className="font-medium text-white hover:underline"
                >
                  {" "}
                  Sign in here{" "}
                </Link>
              </div>
            </Form>
          </div>
        </Card>
        {/* Footer (Style giống Login) */}
        <div className="text-center mt-3 text-white/60 text-xs">
          © {new Date().getFullYear()} Your Library Name. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
