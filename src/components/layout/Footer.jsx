import { Layout } from "antd"

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter style={{ textAlign: "center", background: "#f8fafc" }}>
      <div className="text-gray-500 text-sm">
        Library Management System ©{new Date().getFullYear()} Created by Your Company
      </div>
      <div className="text-gray-400 text-xs mt-1">Version 1.0.0</div>
    </AntFooter>
  )
}

export default Footer
