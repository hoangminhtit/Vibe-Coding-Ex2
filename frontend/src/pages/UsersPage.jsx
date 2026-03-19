import { Button, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";

import api from "../api/client";

const roles = ["ADMIN", "LIBRARIAN"];

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setRows(response.data);
    } catch (error) {
      message.error(error?.response?.data?.detail || "Không tải được người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ role: "LIBRARIAN" });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    try {
      if (editing) {
        await api.patch(`/users/${editing.id}`, {
          full_name: values.full_name,
          role: values.role,
          is_active: values.is_active,
        });
        message.success("Cập nhật nhân viên thành công");
      } else {
        await api.post("/users", values);
        message.success("Tạo tài khoản nhân viên thành công");
      }

      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Lưu tài khoản thất bại");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success("Đã xóa tài khoản");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xóa tài khoản thất bại");
    }
  };

  const columns = [
    { title: "Username", dataIndex: "username" },
    { title: "Họ tên", dataIndex: "full_name" },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (value) => <Tag color={value === "ADMIN" ? "gold" : "blue"}>{value}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      render: (value) => <Tag color={value ? "green" : "red"}>{value ? "Hoạt động" : "Ngừng"}</Tag>,
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa tài khoản này?" onConfirm={() => onDelete(record.id)}>
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space className="page-toolbar">
        <Typography.Title level={3} className="page-heading">
          Quản lý nhân viên và tài khoản
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Thêm nhân viên
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} />

      <Modal
        open={open}
        title={editing ? "Cập nhật tài khoản" : "Tạo tài khoản"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          {!editing ? (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          ) : null}
          <Form.Item name="full_name" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
            <Select options={roles.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          {editing ? (
            <Form.Item name="is_active" label="Hoạt động" valuePropName="checked">
              <Switch />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
