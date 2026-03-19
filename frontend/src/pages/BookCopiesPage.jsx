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
      message.error(error?.response?.data?.detail || "Không tải được bản sao sách");
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
        message.success("Cập nhật bản sao thành công");
      } else {
        await api.post("/book-copies", {
          copy_code: values.copy_code,
          title_id: values.title_id,
          status: values.status,
          imported_at: values.imported_at.toISOString(),
        });
        message.success("Thêm bản sao thành công");
      }
      setOpen(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Lưu bản sao thất bại");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/book-copies/${id}`);
      message.success("Đã xóa bản sao");
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Xóa bản sao thất bại");
    }
  };

  const columns = [
    { title: "Mã sách", dataIndex: "copy_code" },
    { title: "Đầu sách", dataIndex: "title_id", render: (value) => titleNameById(value) },
    {
      title: "Tình trạng",
      dataIndex: "status",
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: "Ngày nhập",
      dataIndex: "imported_at",
      render: (value) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            Sửa
          </Button>
          <Popconfirm title="Xóa bản sao này?" onConfirm={() => onDelete(record.id)}>
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
          Quản lý bản sao sách
        </Typography.Title>
        <Button type="primary" onClick={openCreate}>
          Thêm bản sao
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} />

      <Modal
        open={open}
        title={editing ? "Cập nhật bản sao" : "Thêm bản sao"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        okText="Lưu"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="copy_code" label="Mã sách" rules={[{ required: true }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="title_id" label="Đầu sách" rules={[{ required: true }]}>
            <Select
              disabled={Boolean(editing)}
              options={titles.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))}
            />
          </Form.Item>
          {!editing ? (
            <Form.Item name="imported_at" label="Ngày nhập" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          ) : null}
          <Form.Item name="status" label="Tình trạng" rules={[{ required: true }]}>
            <Select options={statusOptions.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
