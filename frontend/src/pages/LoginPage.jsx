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
      setError(err?.response?.data?.detail || "Dang nhap that bai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Card className="auth-card" variant="outlined">
        <Typography.Title level={2}>Library Management</Typography.Title>
        <Typography.Paragraph>
          Dang nhap voi tai khoan thu thu hoac quan tri.
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
            Dang nhap
          </Button>
        </Form>
      </Card>
    </div>
  );
}
