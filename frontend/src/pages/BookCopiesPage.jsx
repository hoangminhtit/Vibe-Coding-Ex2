import { Button, DatePicker, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import api from "../api/client";

const statusOptions = ["AVAILABLE", "BORROWED", "DAMAGED", "LOST"];

export default function BookCopiesPage() {
  const [rows, setRows] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [copiesRes, titlesRes] = await Promise.all([api.get("/book-copies"), api.get("/book-titles")]);
      setRows(copiesRes.data);
      setTitles(titlesRes.data);
    } catch (error) {
      message.error(error?.response?.data?.detail || "Khong tai duoc ban sao sach");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const titleNameById = (titleId) => titles.find((item) => item.id === titleId)?.name || "";

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: "AVAILABLE", imported_at: dayjs() });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      status: record.status,
      imported_at: dayjs(record.imported_at),
      copy_code: record.copy_code,
      title_id: record.title_id,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    try {
      if (editing) {
        await api.patch(`/book-copies/${editing.id}`, {
          status: values.status,
        });
        message.success("Cap nhat ban sao thanh cong");
      } else {
        await api.post("/book-copies", {
          copy_code: values.copy_code,
          title_id: values.title_id,
          status: values.status,
          imported_at: values.imported_at.toISOString(),
        });
        message.success("Them ban sao thanh cong");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Luu ban sao that bai");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/book-copies/${id}`);
      message.success("Da xoa ban sao");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xoa ban sao that bai");
    }
  };

  const columns = [
    { title: "Ma sach", dataIndex: "copy_code" },
    { title: "Dau sach", dataIndex: "title_id", render: (value) => titleNameById(value) },
    {
      title: "Tinh trang",
      dataIndex: "status",
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: "Ngay nhap",
      dataIndex: "imported_at",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tac",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sua
          </Button>
          <Popconfirm title="Xoa ban sao nay?" onConfirm={() => onDelete(record.id)}>
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
          Quan ly ban sao sach
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Them ban sao
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} />

      <Modal
        open={open}
        title={editing ? "Cap nhat ban sao" : "Them ban sao"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Luu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="copy_code" label="Ma sach" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="title_id" label="Dau sach" rules={[{ required: true }]}>
            <Select
              disabled={Boolean(editing)}
              options={titles.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))}
            />
          </Form.Item>
          {!editing ? (
            <Form.Item name="imported_at" label="Ngay nhap" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          ) : null}
          <Form.Item name="status" label="Tinh trang" rules={[{ required: true }]}>
            <Select options={statusOptions.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
