import { useState } from "react"
import { Card, Input, Button, Form, Typography, message } from "antd"
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"

const { Title, Text } = Typography

const Register = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
// console.log( console.log("Register component rendered");
console.log("Register component rendered");


  const onFinish = (values) => {
    setLoading(true)
    // Giả lập API call
    setTimeout(() => {
      console.log("Register values:", values)
      message.success("Đăng ký thành công! Vui lòng đăng nhập.")
      setLoading(false)
      navigate("/login")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md">
        <div className="mb-6 text-center">
          <img src="/logo.svg" alt="Library Logo" className="mx-auto h-16" />
          <Title level={2} className="mt-4">
            Đăng ký tài khoản
          </Title>
          <Text type="secondary">Tạo tài khoản mới để sử dụng dịch vụ thư viện</Text>
        </div>

        <Form name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="email@example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
          >
            <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="0912345678" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Xác nhận mật khẩu"
              size="large"
            />
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
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Text type="secondary">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Đăng nhập
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Register
