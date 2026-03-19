import { Button, DatePicker, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import api from "../api/client";

const genderOptions = ["MALE", "FEMALE", "OTHER"];

export default function ReadersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/readers");
      setRows(response.data);
    } catch (error) {
      message.error(error?.response?.data?.detail || "Không tải được danh sách độc giả");
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
    form.setFieldsValue({ gender: "MALE", is_active: true });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      dob: dayjs(record.dob),
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      dob: values.dob.toISOString(),
    };

    try {
      if (editing) {
        await api.patch(`/readers/${editing.id}`, payload);
        message.success("Cập nhật độc giả thành công");
      } else {
        await api.post("/readers", payload);
        message.success("Tạo độc giả thành công");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Lưu độc giả thất bại");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/readers/${id}`);
      message.success("Đã xóa độc giả");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xóa độc giả thất bại");
    }
  };

  const columns = [
    { title: "Mã độc giả", dataIndex: "code" },
    { title: "Họ tên", dataIndex: "full_name" },
    { title: "Lớp", dataIndex: "class_name" },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    { title: "Giới tính", dataIndex: "gender" },
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
          <Popconfirm title="Xóa độc giả này?" onConfirm={() => onDelete(record.id)}>
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
          Quản lý độc giả
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Thêm độc giả
        </Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} />

      <Modal
        open={open}
        title={editing ? "Cập nhật độc giả" : "Thêm độc giả"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã độc giả" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="full_name" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="class_name" label="Lớp" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
            <Select options={genderOptions.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          {editing ? (
            <Form.Item name="is_active" label="Trạng thái" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: true, label: "Hoạt động" },
                  { value: false, label: "Ngừng" },
                ]}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
