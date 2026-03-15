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
      message.error(error?.response?.data?.detail || "Khong tai duoc danh sach doc gia");
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
        message.success("Cap nhat doc gia thanh cong");
      } else {
        await api.post("/readers", payload);
        message.success("Tao doc gia thanh cong");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Luu doc gia that bai");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/readers/${id}`);
      message.success("Da xoa doc gia");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xoa doc gia that bai");
    }
  };

  const columns = [
    { title: "Ma doc gia", dataIndex: "code" },
    { title: "Ho ten", dataIndex: "full_name" },
    { title: "Lop", dataIndex: "class_name" },
    {
      title: "Ngay sinh",
      dataIndex: "dob",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    { title: "Gioi tinh", dataIndex: "gender" },
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
          <Popconfirm title="Xoa doc gia nay?" onConfirm={() => onDelete(record.id)}>
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
          Quan ly doc gia
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Them doc gia
        </Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} />

      <Modal
        open={open}
        title={editing ? "Cap nhat doc gia" : "Them doc gia"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Luu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Ma doc gia" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="full_name" label="Ho ten" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="class_name" label="Lop" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dob" label="Ngay sinh" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="gender" label="Gioi tinh" rules={[{ required: true }]}>
            <Select options={genderOptions.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          {editing ? (
            <Form.Item name="is_active" label="Trang thai" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: true, label: "Hoat dong" },
                  { value: false, label: "Ngung" },
                ]}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
}
