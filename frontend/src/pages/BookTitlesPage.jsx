import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Typography, message } from "antd";
import { useEffect, useState } from "react";

import api from "../api/client";

export default function BookTitlesPage() {
  const [rows, setRows] = useState([]);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [titlesRes, majorsRes] = await Promise.all([api.get("/book-titles"), api.get("/majors")]);
      setRows(titlesRes.data);
      setMajors(majorsRes.data);
    } catch (error) {
      message.error(error?.response?.data?.detail || "Khong tai duoc du lieu dau sach");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const majorNameById = (majorId) => majors.find((item) => item.id === majorId)?.name || "";

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ pages: 0, total_quantity: 0 });
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
        await api.patch(`/book-titles/${editing.id}`, values);
        message.success("Cap nhat dau sach thanh cong");
      } else {
        await api.post("/book-titles", values);
        message.success("Them dau sach thanh cong");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Luu dau sach that bai");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/book-titles/${id}`);
      message.success("Da xoa dau sach");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xoa dau sach that bai");
    }
  };

  const columns = [
    { title: "Ma dau", dataIndex: "code" },
    { title: "Ten dau sach", dataIndex: "name" },
    { title: "Tac gia", dataIndex: "author" },
    { title: "Nha xuat ban", dataIndex: "publisher" },
    { title: "So trang", dataIndex: "pages" },
    { title: "Kich thuoc", dataIndex: "size" },
    { title: "So luong", dataIndex: "total_quantity" },
    { title: "Chuyen nganh", dataIndex: "major_id", render: (value) => majorNameById(value) },
    {
      title: "Thao tac",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sua
          </Button>
          <Popconfirm title="Xoa dau sach nay?" onConfirm={() => onDelete(record.id)}>
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
          Quan ly dau sach
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Them dau sach
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 1100 }} />

      <Modal
        open={open}
        title={editing ? "Cap nhat dau sach" : "Them dau sach"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Luu"
        width={760}
      >
        <Form form={form} layout="vertical">
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item name="code" label="Ma dau sach" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input disabled={Boolean(editing)} />
            </Form.Item>
            <Form.Item name="name" label="Ten dau sach" rules={[{ required: true }]} style={{ flex: 2 }}>
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item name="author" label="Tac gia" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="publisher" label="Nha xuat ban" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item name="pages" label="So trang" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="size" label="Kich thuoc" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="13x20 cm" />
            </Form.Item>
            <Form.Item name="total_quantity" label="So luong" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item name="major_id" label="Chuyen nganh" rules={[{ required: true }]}>
            <Select
              options={majors.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))}
              placeholder="Chon chuyen nganh"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
