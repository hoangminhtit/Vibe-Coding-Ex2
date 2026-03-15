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
      message.error(error?.response?.data?.detail || "Khong tai duoc nguoi dung");
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
        message.success("Cap nhat nhan vien thanh cong");
      } else {
        await api.post("/users", values);
        message.success("Tao tai khoan nhan vien thanh cong");
      }

      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Luu tai khoan that bai");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success("Da xoa tai khoan");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xoa tai khoan that bai");
    }
  };

  const columns = [
    { title: "Username", dataIndex: "username" },
    { title: "Ho ten", dataIndex: "full_name" },
    {
      title: "Vai tro",
      dataIndex: "role",
      render: (value) => <Tag color={value === "ADMIN" ? "gold" : "blue"}>{value}</Tag>,
    },
    {
      title: "Trang thai",
      dataIndex: "is_active",
      render: (value) => <Tag color={value ? "green" : "red"}>{value ? "Hoat dong" : "Ngung"}</Tag>,
    },
    {
      title: "Thao tac",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sua
          </Button>
          <Popconfirm title="Xoa tai khoan nay?" onConfirm={() => onDelete(record.id)}>
            <Button size="small" danger>
              Xoa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Quan ly nhan vien va tai khoan
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Them nhan vien
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} />

      <Modal
        open={open}
        title={editing ? "Cap nhat tai khoan" : "Tao tai khoan"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Luu"
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
          <Form.Item name="full_name" label="Ho ten" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai tro" rules={[{ required: true }]}>
            <Select options={roles.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          {editing ? (
            <Form.Item name="is_active" label="Hoat dong" valuePropName="checked">
              <Switch />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
