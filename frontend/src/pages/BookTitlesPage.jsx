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
      message.error(error?.response?.data?.detail || "Không tải được dữ liệu đầu sách");
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
        message.success("Cập nhật đầu sách thành công");
      } else {
        await api.post("/book-titles", values);
        message.success("Thêm đầu sách thành công");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Lưu đầu sách thất bại");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/book-titles/${id}`);
      message.success("Đã xóa đầu sách");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xóa đầu sách thất bại");
    }
  };

  const columns = [
    { title: "Mã đầu", dataIndex: "code" },
    { title: "Tên đầu sách", dataIndex: "name" },
    { title: "Tác giả", dataIndex: "author" },
    { title: "Nhà xuất bản", dataIndex: "publisher" },
    { title: "Số trang", dataIndex: "pages" },
    { title: "Kích thước", dataIndex: "size" },
    { title: "Số lượng", dataIndex: "total_quantity" },
    { title: "Chuyên ngành", dataIndex: "major_id", render: (value) => majorNameById(value) },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa đầu sách này?" onConfirm={() => onDelete(record.id)}>
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
          Quản lý đầu sách
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Thêm đầu sách
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 1100 }} />

      <Modal
        open={open}
        title={editing ? "Cập nhật đầu sách" : "Thêm đầu sách"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Lưu"
        width={760}
      >
        <Form form={form} layout="vertical">
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item name="code" label="Mã đầu sách" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input disabled={Boolean(editing)} />
            </Form.Item>
            <Form.Item name="name" label="Tên đầu sách" rules={[{ required: true }]} style={{ flex: 2 }}>
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item name="author" label="Tác giả" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
            <Form.Item name="publisher" label="Nhà xuất bản" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item name="pages" label="Số trang" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="size" label="Kích thước" rules={[{ required: true }]} style={{ flex: 1 }}>
              <Input placeholder="13x20 cm" />
            </Form.Item>
            <Form.Item name="total_quantity" label="Số lượng" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item name="major_id" label="Chuyên ngành" rules={[{ required: true }]}>
            <Select
              options={majors.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))}
              placeholder="Chọn chuyên ngành"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
