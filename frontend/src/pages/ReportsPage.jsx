import { Button, Card, Space, Table, Typography, message } from "antd";
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
      message.error(error?.response?.data?.detail || "Tai bao cao that bai");
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
      message.error(error?.response?.data?.detail || "Tai bao cao that bai");
    } finally {
      setLoadingUnreturned(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Bao cao thong ke
      </Typography.Title>

      <Card
        title="Dau sach duoc muon nhieu"
        extra={<Button onClick={loadTopBorrowed}>Tai bao cao</Button>}
      >
        <Table
          rowKey={(row) => row.title}
          loading={loadingTop}
          dataSource={topRows}
          columns={[
            { title: "Ten dau sach", dataIndex: "title" },
            { title: "So luot muon", dataIndex: "borrow_count" },
          ]}
          pagination={false}
        />
      </Card>

      <Card
        title="Doc gia chua tra sach"
        extra={<Button onClick={loadUnreturned}>Tai bao cao</Button>}
      >
        <Table
          rowKey={(row) => row.reader_code}
          loading={loadingUnreturned}
          dataSource={unreturnedRows}
          columns={[
            { title: "Ma doc gia", dataIndex: "reader_code" },
            { title: "Ho ten", dataIndex: "reader_name" },
            { title: "So sach chua tra", dataIndex: "open_borrows" },
          ]}
          pagination={false}
        />
      </Card>
    </Space>
  );
}
