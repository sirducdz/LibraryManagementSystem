import { useEffect } from "react";
import {
  LockOutlined,
  UserOutlined,
  KeyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Card,
  Typography,
  Alert,
  Divider,
} from "antd";
// import { Link } from "react-router-dom"; // Import nếu cần
import { useLoginMutation } from "../api/authApiSlice"; // Điều chỉnh đường dẫn nếu cần

const { Title } = Typography;

const LoginPage = () => {
  const [loginTrigger, { isLoading, error, data, isSuccess, isError, reset }] =
    useLoginMutation();
  const [form] = Form.useForm();

  // ... (phần logic onFinish, onFinishFailed, useEffect, getErrorMessage giữ nguyên) ...
  const onFinish = (values) => {
    console.log("Submitting login credentials:", values);
    const credentials = {
      username: values.username,
      password: values.password,
    };
    loginTrigger(credentials);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    if (isSuccess && data) {
      console.log("Login successful with RTK Query!", data);
      // Logic chuyển hướng
    }
  }, [isSuccess, data]);

  const getErrorMessage = (error) => {
    if (!error) return "An unknown error occurred.";
    if (error.data) {
      if (
        typeof error.data === "object" &&
        error.data !== null &&
        error.data.message
      ) {
        return error.data.message;
      }
      if (
        typeof error.data === "object" &&
        error.data !== null &&
        error.data.error
      ) {
        return error.data.error;
      }
      return JSON.stringify(error.data);
    }
    return error.message || "Network error or invalid response.";
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Background và Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
          filter: "brightness(0.9)",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/70 z-0"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header text */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-20 backdrop-blur-md mb-4">
            <KeyOutlined className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-white/80 text-sm">Sign in to continue</p>
        </div>

        {/* Card */}
        <Card className="backdrop-blur-md bg-black/15 border-0 shadow-2xl rounded-xl overflow-hidden">
          <div className="p-4">
            {isError && (
              <Alert
                // **** THAY ĐỔI MÀU CHỮ ALERT THÀNH ĐEN ****
                message={
                  <span className="font-semibold text-black">Login Failed</span>
                } // Đổi thành text-black
                description={
                  <span className="text-black">{getErrorMessage(error)}</span>
                } // Đổi thành text-black
                type="error"
                showIcon
                closable
                onClose={reset}
                // Giữ nguyên style nền và viền
                className="mb-4 bg-red-900/40 border border-red-500/50 rounded-lg backdrop-blur-sm"
                // Lưu ý: Độ tương phản giữa chữ đen và nền đỏ sẫm này rất thấp, khó đọc.
              />
            )}

            <Form
              form={form}
              name="normal_login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              requiredMark={false}
              onValuesChange={() => {
                if (isError) reset();
              }}
              className="space-y-3"
            >
              {/* Username Item - Label màu đen */}
              <Form.Item
                name="username"
                label={
                  <span className="font-semibold text-black text-sm">
                    Username / Email
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Please input your Username or Email!",
                  },
                ]}
                className="mb-3"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Username or email"
                  size="large"
                  className="rounded-lg bg-black/20 backdrop-blur-md border-white/30 text-white placeholder:text-gray-400"
                />
              </Form.Item>

              {/* Password Item - Label màu đen */}
              <Form.Item
                name="password"
                label={
                  <span className="font-semibold text-black text-sm">
                    Password
                  </span>
                }
                rules={[
                  { required: true, message: "Please input your Password!" },
                ]}
                className="mb-3"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Password"
                  size="large"
                  className="rounded-lg bg-black/20 backdrop-blur-md border-white/30 text-white placeholder:text-gray-400"
                />
              </Form.Item>

              {/* Remember me / Forgot password */}
              <Form.Item className="mb-3">
                <div className="flex justify-between items-center">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-white text-sm font-medium">
                      Remember me
                    </Checkbox>
                  </Form.Item>
                  <a
                    className="text-white/90 hover:text-white hover:underline text-sm font-medium"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </a>
                </div>
              </Form.Item>

              {/* Button Sign In */}
              <Form.Item className="mb-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                  disabled={isLoading}
                  className="h-11 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-1 text-sm font-semibold"
                >
                  {isLoading ? "Logging in..." : "Sign In"}
                </Button>
              </Form.Item>

              {/* Divider - Chữ OR màu đen */}
              <Divider className="border-white/20 my-3">
                <span className="text-black text-xs px-2">OR</span>
              </Divider>

              {/* Social buttons */}
              <div className="flex gap-3 justify-center mt-3">
                {/* Google */}
                <Button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border-0 text-white transition-all duration-300 hover:-translate-y-1"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                  }
                />
                {/* Facebook */}
                <Button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border-0 text-white transition-all duration-300 hover:-translate-y-1"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                    </svg>
                  }
                />
                {/* GitHub */}
                <Button
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border-0 text-white transition-all duration-300 hover:-translate-y-1"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  }
                />
              </div>

              {/* Link Đăng ký - Chữ "Don't have an account?" màu đen */}
              <div className="text-center mt-4 text-sm">
                <span className="text-black">Don't have an account?</span>{" "}
                <a
                  href="/register"
                  className="font-medium text-white hover:underline"
                >
                  Register now
                </a>
              </div>
            </Form>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4 text-white/60 text-xs">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
