import {
  BookOutlined,
  FileTextOutlined,
  ReadOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";

const cards = [
  { title: "Độc giả", desc: "Quản lý thẻ thư viện", value: "1 module", icon: <TeamOutlined /> },
  { title: "Đầu sách", desc: "Quản lý thông tin đầu sách", value: "1 module", icon: <ReadOutlined /> },
  { title: "Bản sao", desc: "Quản lý tình trạng sách", value: "1 module", icon: <BookOutlined /> },
  { title: "Mượn/Trả", desc: "Lập phiếu mượn và trả sách", value: "1 module", icon: <FileTextOutlined /> },
  { title: "Báo cáo", desc: "Thống kê sách và độc giả", value: "2 report", icon: <FileTextOutlined /> },
  { title: "Nhân viên", desc: "Quản lý tài khoản hệ thống", value: "2 role", icon: <UserSwitchOutlined /> },
];

export default function DashboardPage() {
  return (
    <div>
      <Typography.Title level={2} className="page-heading" style={{ marginBottom: 8 }}>
        Tổng quan hệ thống thư viện
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 18 }}>
        Đây là khu vực theo dõi nhanh các nhóm chức năng quan trọng của hệ thống.
      </Typography.Paragraph>

      <Row gutter={[16, 16]} className="dashboard-grid">
        {cards.map((item) => (
          <Col key={item.title} xs={24} sm={12} lg={8}>
            <Card title={item.title}>
              <div className="dashboard-stat">
                <div className="dashboard-icon">{item.icon}</div>
                <div>
                  <strong>{item.value}</strong>
                  <div>
                    <Typography.Text type="secondary">{item.desc}</Typography.Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
