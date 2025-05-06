// src/pages/NotFoundPage.jsx

import React from "react";
import { Result, Button } from "antd";
import { Link, useNavigate } from "react-router-dom"; // Import Link hoặc useNavigate
import { PATHS } from "../routes/routePaths"; // Import PATHS để lấy đường dẫn trang chủ (Sửa đường dẫn nếu cần)
import { HomeOutlined } from "@ant-design/icons"; // Import icon nếu muốn

const NotFoundPage = () => {
  const navigate = useNavigate(); // Dùng useNavigate để điều hướng bằng hàm

  const goHome = () => {
    navigate(PATHS.HomePage || "/"); // Điều hướng về trang chủ
  };

  return (
    // Dùng flex để căn giữa nội dung theo chiều dọc và ngang
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Result
        status="404" // Sử dụng preset 404 của Antd
        title="404"
        subTitle="Sorry, the page you visited does not exist." // Thông báo lỗi
        extra={
          // Nút để quay về trang chủ
          // <Button type="primary" icon={<HomeOutlined />} onClick={goHome}>
          //     Back Home
          // </Button>
          //  Hoặc dùng Link trực tiếp:
          <Link to={PATHS.HomePage || "/"}>
            <Button type="primary" icon={<HomeOutlined />}>
              Back Home
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFoundPage;
