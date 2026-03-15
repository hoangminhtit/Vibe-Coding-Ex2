import { Button, Form, Input, Modal, Popconfirm, Space, Table, Typography, message } from "antd";
import { useEffect, useState } from "react";

import api from "../api/client";

export default function MajorsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/majors");
      setRows(response.data);
    } catch (error) {
      message.error(error?.response?.data?.detail || "Khong tai duoc chuyen nganh");
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
        await api.patch(`/majors/${editing.id}`, values);
        message.success("Cap nhat chuyen nganh thanh cong");
      } else {
        await api.post("/majors", values);
        message.success("Them chuyen nganh thanh cong");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Luu chuyen nganh that bai");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/majors/${id}`);
      message.success("Da xoa chuyen nganh");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xoa chuyen nganh that bai");
    }
  };

  const columns = [
    { title: "Ma chuyen nganh", dataIndex: "code" },
    { title: "Ten chuyen nganh", dataIndex: "name" },
    { title: "Mo ta", dataIndex: "description" },
    {
      title: "Thao tac",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sua
          </Button>
          <Popconfirm title="Xoa chuyen nganh nay?" onConfirm={() => onDelete(record.id)}>
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
          Quan ly chuyen nganh
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Them chuyen nganh
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} />

      <Modal
        open={open}
        title={editing ? "Cap nhat chuyen nganh" : "Them chuyen nganh"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Luu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Ma chuyen nganh" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="name" label="Ten chuyen nganh" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mo ta">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
