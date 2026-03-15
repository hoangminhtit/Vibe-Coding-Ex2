import { Card, Col, Row, Typography } from "antd";

const cards = [
  { title: "Doc gia", desc: "Quan ly the thu vien" },
  { title: "Dau sach", desc: "Quan ly thong tin dau sach" },
  { title: "Ban sao", desc: "Quan ly tinh trang sach" },
  { title: "Muon/Tra", desc: "Lap phieu muon va tra sach" },
  { title: "Bao cao", desc: "Thong ke sach va doc gia" },
  { title: "Nhan vien", desc: "Quan ly tai khoan he thong" },
];

export default function DashboardPage() {
  return (
    <div>
      <Typography.Title level={2} style={{ marginTop: 0 }}>
        Tong quan he thong thu vien
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {cards.map((item) => (
          <Col key={item.title} xs={24} sm={12} lg={8}>
            <Card title={item.title}>
              <Typography.Text>{item.desc}</Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
