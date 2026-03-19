import { Button, DatePicker, Form, Input, Modal, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import api from "../api/client";

export default function BorrowsPage() {
  const [rows, setRows] = useState([]);
  const [readers, setReaders] = useState([]);
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openBorrow, setOpenBorrow] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [borrowForm] = Form.useForm();
  const [returnForm] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [borrowsRes, readersRes, copiesRes] = await Promise.all([
        api.get("/borrows"),
        api.get("/readers"),
        api.get("/book-copies"),
      ]);
      setRows(borrowsRes.data);
      setReaders(readersRes.data.filter((item) => item.is_active));
      setCopies(copiesRes.data);
    } catch (error) {
      message.error(error?.response?.data?.detail || "Không tải được dữ liệu mượn/trả");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableCopies = copies.filter((item) => item.status === "AVAILABLE");
  const readerLabelById = (id) => readers.find((item) => item.id === id)?.full_name || `#${id}`;
  const copyLabelById = (id) => copies.find((item) => item.id === id)?.copy_code || `#${id}`;

  const createBorrow = async () => {
    const values = await borrowForm.validateFields();
    try {
      await api.post("/borrows", {
        copy_id: values.copy_id,
        reader_id: values.reader_id,
        borrowed_at: values.borrowed_at.toISOString(),
        condition: values.condition,
      });
      message.success("Lập phiếu mượn thành công");
      setOpenBorrow(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Lập phiếu mượn thất bại");
    }
  };

  const openReturnModal = (record) => {
    setSelectedBorrow(record);
    returnForm.setFieldsValue({ returned_at: dayjs(), status: "RETURNED" });
    setOpenReturn(true);
  };

  const submitReturn = async () => {
    const values = await returnForm.validateFields();
    try {
      await api.patch(`/borrows/${selectedBorrow.id}/return`, {
        returned_at: values.returned_at.toISOString(),
        status: values.status,
        condition: values.condition,
      });
      message.success("Trả sách thành công");
      setOpenReturn(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Trả sách thất bại");
    }
  };

  const columns = [
    { title: "Mã phiếu", dataIndex: "id" },
    { title: "Độc giả", dataIndex: "reader_id", render: (value) => readerLabelById(value) },
    { title: "Mã sách", dataIndex: "copy_id", render: (value) => copyLabelById(value) },
    {
      title: "Ngày mượn",
      dataIndex: "borrowed_at",
      render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ngày trả",
      dataIndex: "returned_at",
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"),
    },
    { title: "Tình trạng", dataIndex: "condition" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (value) => <Tag color={value === "BORROWING" ? "blue" : "green"}>{value}</Tag>,
    },
    {
      title: "Thao tác",
      render: (_, record) =>
        record.status === "BORROWING" ? (
          <Button size="small" onClick={() => openReturnModal(record)}>
            Trả sách
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Space className="page-toolbar">
        <Typography.Title level={3} className="page-heading">
          Quản lý mượn trả sách
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            borrowForm.resetFields();
            borrowForm.setFieldsValue({ borrowed_at: dayjs() });
            setOpenBorrow(true);
          }}
        >
          Lập phiếu mượn
        </Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 1100 }} />

      <Modal
        open={openBorrow}
        title="Lập phiếu mượn"
        onCancel={() => setOpenBorrow(false)}
        onOk={createBorrow}
        okText="Lưu"
      >
        <Form form={borrowForm} layout="vertical">
          <Form.Item name="reader_id" label="Độc giả" rules={[{ required: true }]}>
            <Select options={readers.map((item) => ({ value: item.id, label: `${item.code} - ${item.full_name}` }))} />
          </Form.Item>
          <Form.Item name="copy_id" label="Bản sao sách" rules={[{ required: true }]}>
            <Select
              options={availableCopies.map((item) => ({
                value: item.id,
                label: `${item.copy_code} (${item.status})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="borrowed_at" label="Ngày mượn" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} showTime />
          </Form.Item>
          <Form.Item name="condition" label="Tình trạng lúc mượn">
            <Input placeholder="Tốt" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={openReturn}
        title="Trả sách"
        onCancel={() => setOpenReturn(false)}
        onOk={submitReturn}
        okText="Xác nhận trả"
      >
        <Form form={returnForm} layout="vertical">
          <Form.Item name="returned_at" label="Ngày trả" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} showTime />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={["RETURNED", "OVERDUE", "LOST"].map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          <Form.Item name="condition" label="Tình trạng lúc trả">
            <Input placeholder="Sách còn tốt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
