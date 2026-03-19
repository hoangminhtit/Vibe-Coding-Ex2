import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", values);
      auth.login(response.data.access_token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <div className="auth-hero">
          <div>
            <Typography.Text>Library Hub Platform</Typography.Text>
            <h2>Vận hành thư viện gọn gàng, rõ ràng và nhanh hơn.</h2>
            <p>Theo dõi độc giả, đầu sách, mượn trả và báo cáo thống kê trong cùng một hệ thống.</p>
          </div>
          <div className="auth-kpis">
            <div className="auth-kpi">
              <strong>24/7</strong>
              <span>Thông tin sẵn sàng tra cứu</span>
            </div>
            <div className="auth-kpi">
              <strong>1 tập trung</strong>
              <span>Độc giả, sách, nhân viên</span>
            </div>
          </div>
        </div>

        <Card className="auth-card" variant="borderless">
          <Typography.Title level={2}>Đăng nhập hệ thống</Typography.Title>
          <Typography.Paragraph>
            Sử dụng tài khoản thủ thư hoặc quản trị để tiếp tục.
          </Typography.Paragraph>

          {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Username" name="username" rules={[{ required: true }]}>
              <Input placeholder="admin" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true }]}>
              <Input.Password placeholder="admin123" />
            </Form.Item>
            <Button htmlType="submit" type="primary" block loading={loading}>
              Đăng nhập
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
