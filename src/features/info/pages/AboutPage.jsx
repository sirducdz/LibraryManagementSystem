import React from 'react';
import { Typography, Divider, Card, Row, Col, Avatar } from 'antd';
import {
    InfoCircleOutlined, // Icon cho tiêu đề chính
    TeamOutlined,       // Icon cho phần Team
    AimOutlined,        // Icon cho Mission/Vision
    EnvironmentOutlined,// Icon cho Địa chỉ
    PhoneOutlined,      // Icon cho Điện thoại
    MailOutlined,        // Icon cho Email
    UserOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom'; // Import nếu cần link nội bộ
import { PATHS } from '../../../routes/routePaths'; // Import PATHS nếu cần

// Lấy các component Typography từ Ant Design
const { Title, Paragraph, Text } = Typography;

// --- Component AboutPage ---
const AboutPage = () => {
  return (
    // Container chung với padding và nền xám nhạt
    <div className="p-4 md:p-8 lg:p-12 bg-gray-50 min-h-screen">

      {/* Sử dụng Card để tạo khung nội dung chính */}
      <Card bordered={false} className="shadow-lg mb-8 max-w-5xl mx-auto"> {/* Giới hạn chiều rộng và căn giữa */}

        {/* Tiêu đề trang */}
        <div className="text-center mb-10">
           <InfoCircleOutlined style={{ fontSize: '48px', color: '#096dd9' }} className="mb-4" /> {/* Sử dụng màu xanh khác */}
           <Title level={1} className="!mb-2">About Our Library</Title> {/* Dấu ! để ưu tiên */}
           <Paragraph type="secondary" className="text-lg max-w-3xl mx-auto">
               Learn more about our mission, values, and the services we offer to our community. Find out what makes our library special.
           </Paragraph>
        </div>

         <Divider />

         {/* Phần Nhiệm vụ / Sứ mệnh */}
         <div className="mb-10 px-4">
            <Title level={3} className="!mb-3"><AimOutlined className="mr-2 text-blue-600" />Our Mission</Title>
            <Paragraph className="text-base leading-relaxed text-gray-700">
                Our mission is to provide free and equitable access to information, knowledge, independent learning, and the simple joys of reading for every member of our diverse community. We are committed to fostering a welcoming and inclusive environment that encourages discovery, creativity, collaboration, and connection among our patrons.
            </Paragraph>
             <Paragraph className="text-base leading-relaxed text-gray-700">
                 This digital platform serves as an extension of our physical space, aiming to make our extensive resources and services accessible anytime, anywhere, supporting lifelong learning and engagement.
             </Paragraph>
         </div>

          <Divider />

          {/* Phần Giới thiệu cách hoạt động (liên kết đến HomePage) */}
          <div className="mb-10 px-4 text-center">
              <Title level={3} className="!mb-3">How It Works</Title>
              <Paragraph className="text-base text-gray-600">
                  Easily browse our collection, add books to your borrowing cart, and submit your request online.
              </Paragraph>
              <Paragraph className="text-base text-gray-600">
                  (See the "How It Works" section on the <Link to={PATHS.HomePage || "/"} className="text-blue-600 hover:text-blue-800 font-medium">Homepage</Link> for more details)
             </Paragraph>
          </div>

         <Divider />

         {/* Phần Đội ngũ (Ví dụ - Tùy chọn) */}
          <div className="mb-10 px-4">
               <Title level={3} className="!mb-4"><TeamOutlined className="mr-2 text-blue-600" />Meet the Team</Title>
               <Paragraph type="secondary" className="mb-8 text-center text-base">Our dedicated team is passionate about connecting you with the resources you need.</Paragraph>
               <Row gutter={[24, 24]} justify="center">
                   {/* Thêm các thành viên khác nếu cần */}
                   <Col xs={24} sm={12} md={8} className="text-center">
                        <Avatar size={80} icon={<UserOutlined />} className="mb-2 shadow-md" src="https://i.pravatar.cc/150?u=librarian1" />
                        <Text strong className="block text-lg">Alice Johnson</Text>
                        <Text type="secondary">Head Librarian</Text>
                   </Col>
                    <Col xs={24} sm={12} md={8} className="text-center">
                        <Avatar size={80} icon={<UserOutlined />} className="mb-2 shadow-md" src="https://i.pravatar.cc/150?u=librarian2"/>
                        <Text strong className="block text-lg">Bob Williams</Text>
                        <Text type="secondary">Community Outreach</Text>
                   </Col>
                    <Col xs={24} sm={12} md={8} className="text-center">
                        <Avatar size={80} icon={<UserOutlined />} className="mb-2 shadow-md" src="https://i.pravatar.cc/150?u=tech1"/>
                        <Text strong className="block text-lg">Charlie Brown</Text>
                        <Text type="secondary">Digital Services</Text>
                   </Col>
               </Row>
           </div>

         <Divider />

           {/* Phần Liên hệ (Ví dụ - Tùy chọn) */}
           <div className="px-4">
               <Title level={3} className="!mb-4"><EnvironmentOutlined className="mr-2 text-blue-600" />Contact & Visit Us</Title>
               <Row gutter={[16, 16]}>
                   <Col xs={24} md={12}>
                       <Paragraph className="text-base">
                           <Text strong>Address:</Text> <br/>
                           123 Library Street, <br/>
                           Knowledge City, Province 12345 <br/>
                           Vietnam
                       </Paragraph>
                       {/* Thêm Giờ mở cửa nếu cần */}
                       {/* <Paragraph className="text-base mt-4">
                           <Text strong>Opening Hours:</Text><br/>
                           Monday - Friday: 9:00 AM - 7:00 PM<br/>
                           Saturday: 10:00 AM - 4:00 PM<br/>
                           Sunday: Closed
                       </Paragraph> */}
                   </Col>
                   <Col xs={24} md={12}>
                       <Paragraph className="text-base">
                           <PhoneOutlined className="mr-2"/> <Text strong>Phone:</Text> (+84) 123 456 789
                       </Paragraph>
                        <Paragraph className="text-base">
                           <MailOutlined className="mr-2"/> <Text strong>Email:</Text> <a href="mailto:info@yourlibrary.com" className="text-blue-600 hover:underline">info@libraryms.com</a>
                       </Paragraph>
                   </Col>
               </Row>
           </div>

      </Card>
    </div>
  );
};

export default AboutPage;