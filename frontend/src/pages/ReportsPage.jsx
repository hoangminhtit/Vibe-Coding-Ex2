import { Button, Card, Space, Table, Typography, message } from "antd";
import { useEffect } from "react";
import { useState } from "react";

import api from "../api/client";

export default function ReportsPage() {
  const [topRows, setTopRows] = useState([]);
  const [unreturnedRows, setUnreturnedRows] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingUnreturned, setLoadingUnreturned] = useState(false);

  const loadTopBorrowed = async () => {
    setLoadingTop(true);
    try {
      const response = await api.get("/reports/top-borrowed-titles");
      setTopRows(response.data);
    } catch (error) {
      message.error(error?.response?.data?.detail || "Tải báo cáo thất bại");
    } finally {
      setLoadingTop(false);
    }
  };

  const loadUnreturned = async () => {
    setLoadingUnreturned(true);
    try {
      const response = await api.get("/reports/unreturned-readers");
      setUnreturnedRows(response.data);
    } catch (error) {
      message.error(error?.response?.data?.detail || "Tải báo cáo thất bại");
    } finally {
      setLoadingUnreturned(false);
    }
  };

  useEffect(() => {
    loadTopBorrowed();
    loadUnreturned();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} className="page-heading">
        Báo cáo thống kê
      </Typography.Title>

      <Card
        title="Đầu sách được mượn nhiều"
        extra={<Button onClick={loadTopBorrowed}>Tải báo cáo</Button>}
      >
        <Table
          rowKey={(row) => row.title}
          loading={loadingTop}
          dataSource={topRows}
          columns={[
            { title: "Tên đầu sách", dataIndex: "title" },
            { title: "Số lượt mượn", dataIndex: "borrow_count" },
          ]}
          pagination={false}
        />
      </Card>

      <Card
        title="Độc giả chưa trả sách"
        extra={<Button onClick={loadUnreturned}>Tải báo cáo</Button>}
      >
        <Table
          rowKey={(row) => row.reader_code}
          loading={loadingUnreturned}
          dataSource={unreturnedRows}
          columns={[
            { title: "Mã độc giả", dataIndex: "reader_code" },
            { title: "Họ tên", dataIndex: "reader_name" },
            { title: "Số sách chưa trả", dataIndex: "open_borrows" },
          ]}
          pagination={false}
        />
      </Card>
    </Space>
  );
}
