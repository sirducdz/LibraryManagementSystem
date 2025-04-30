import { useState } from "react";
import { Card, Input, Checkbox, Button, Form, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values) => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      console.log("Login values:", values);
      localStorage.setItem("token", "sample-jwt-token");
      localStorage.setItem("role", "admin"); // hoặc 'user' tùy vào API trả về
      message.success("Đăng nhập thành công!");
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md">
        <div className="mb-6 text-center">
          <img src="/logo.svg" alt="Library Logo" className="mx-auto h-16" />
          <Title level={2} className="mt-4">
            Đăng nhập
          </Title>
          <Text type="secondary">
            Nhập thông tin đăng nhập của bạn để truy cập vào tài khoản
          </Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="email@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <div className="flex justify-between w-full">
                <span>Mật khẩu</span>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            }
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text type="secondary">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800">
              Đăng ký
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
