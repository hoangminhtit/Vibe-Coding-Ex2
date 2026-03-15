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
      message.error(error?.response?.data?.detail || "Khong tai duoc du lieu muon/tra");
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
      message.success("Lap phieu muon thanh cong");
      setOpenBorrow(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Lap phieu muon that bai");
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
      message.success("Tra sach thanh cong");
      setOpenReturn(false);
      await loadData();
    } catch (error) {
      message.error(error?.response?.data?.detail || "Tra sach that bai");
    }
  };

  const columns = [
    { title: "Ma phieu", dataIndex: "id" },
    { title: "Doc gia", dataIndex: "reader_id", render: (value) => readerLabelById(value) },
    { title: "Ma sach", dataIndex: "copy_id", render: (value) => copyLabelById(value) },
    {
      title: "Ngay muon",
      dataIndex: "borrowed_at",
      render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Ngay tra",
      dataIndex: "returned_at",
      render: (value) => (value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"),
    },
    { title: "Tinh trang", dataIndex: "condition" },
    {
      title: "Trang thai",
      dataIndex: "status",
      render: (value) => <Tag color={value === "BORROWING" ? "blue" : "green"}>{value}</Tag>,
    },
    {
      title: "Thao tac",
      render: (_, record) =>
        record.status === "BORROWING" ? (
          <Button size="small" onClick={() => openReturnModal(record)}>
            Tra sach
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Quan ly muon tra sach
        </Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            borrowForm.resetFields();
            borrowForm.setFieldsValue({ borrowed_at: dayjs() });
            setOpenBorrow(true);
          }}
        >
          Lap phieu muon
        </Button>
      </Space>

      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 1100 }} />

      <Modal
        open={openBorrow}
        title="Lap phieu muon"
        onCancel={() => setOpenBorrow(false)}
        onOk={createBorrow}
        okText="Luu"
      >
        <Form form={borrowForm} layout="vertical">
          <Form.Item name="reader_id" label="Doc gia" rules={[{ required: true }]}>
            <Select options={readers.map((item) => ({ value: item.id, label: `${item.code} - ${item.full_name}` }))} />
          </Form.Item>
          <Form.Item name="copy_id" label="Ban sao sach" rules={[{ required: true }]}>
            <Select
              options={availableCopies.map((item) => ({
                value: item.id,
                label: `${item.copy_code} (${item.status})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="borrowed_at" label="Ngay muon" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} showTime />
          </Form.Item>
          <Form.Item name="condition" label="Tinh trang luc muon">
            <Input placeholder="Tot" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={openReturn}
        title="Tra sach"
        onCancel={() => setOpenReturn(false)}
        onOk={submitReturn}
        okText="Xac nhan tra"
      >
        <Form form={returnForm} layout="vertical">
          <Form.Item name="returned_at" label="Ngay tra" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} showTime />
          </Form.Item>
          <Form.Item name="status" label="Trang thai" rules={[{ required: true }]}>
            <Select options={["RETURNED", "OVERDUE", "LOST"].map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          <Form.Item name="condition" label="Tinh trang luc tra">
            <Input placeholder="Sach con tot" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
