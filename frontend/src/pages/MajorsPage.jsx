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
      message.error(error?.response?.data?.detail || "Không tải được chuyên ngành");
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
        message.success("Cập nhật chuyên ngành thành công");
      } else {
        await api.post("/majors", values);
        message.success("Thêm chuyên ngành thành công");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Lưu chuyên ngành thất bại");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/majors/${id}`);
      message.success("Đã xóa chuyên ngành");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xóa chuyên ngành thất bại");
    }
  };

  const columns = [
    { title: "Mã chuyên ngành", dataIndex: "code" },
    { title: "Tên chuyên ngành", dataIndex: "name" },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa chuyên ngành này?" onConfirm={() => onDelete(record.id)}>
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
          Quản lý chuyên ngành
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Thêm chuyên ngành
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} />

      <Modal
        open={open}
        title={editing ? "Cập nhật chuyên ngành" : "Thêm chuyên ngành"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã chuyên ngành" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="name" label="Tên chuyên ngành" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
