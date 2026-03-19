import {
  AppstoreOutlined,
  BarChartOutlined,
  BookOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ReadOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Spin, Typography } from "antd";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import "./App.css";
import BookCopiesPage from "./pages/BookCopiesPage";
import BookTitlesPage from "./pages/BookTitlesPage";
import BorrowsPage from "./pages/BorrowsPage";
import DashboardPage from "./pages/DashboardPage";
import ForbiddenPage from "./pages/ForbiddenPage";
import LoginPage from "./pages/LoginPage";
import MajorsPage from "./pages/MajorsPage";
import ReadersPage from "./pages/ReadersPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";

const { Header, Content, Sider } = Layout;

function PrivateLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (auth.loadingProfile) {
    return (
      <div className="loading-page">
        <Spin size="large" />
      </div>
    );
  }

  const menuItems = [
    { key: "/", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/readers", label: "Độc giả", icon: <TeamOutlined /> },
    { key: "/majors", label: "Chuyên ngành", icon: <AppstoreOutlined /> },
    { key: "/book-titles", label: "Đầu sách", icon: <ReadOutlined /> },
    { key: "/book-copies", label: "Bản sao", icon: <BookOutlined /> },
    { key: "/borrows", label: "Mượn/Trả", icon: <FileTextOutlined /> },
    { key: "/reports", label: "Báo cáo", icon: <BarChartOutlined /> },
  ];

  if (auth.user?.role === "ADMIN") {
    menuItems.push({ key: "/users", label: "Nhân viên", icon: <UserSwitchOutlined /> });
  }

  return (
    <Layout className="app-shell">
      <Sider breakpoint="lg" collapsedWidth="0" width={260} theme="light" className="app-sider">
        <div className="brand">
          <span className="brand-mark">LB</span>
          <div>
            <Typography.Text strong>Library Hub</Typography.Text>
            <Typography.Text type="secondary">Academic circulation desk</Typography.Text>
          </div>
        </div>
        <Menu
          className="app-menu"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="topbar">
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Hệ thống quản lý thư viện
            </Typography.Title>
            <Typography.Text type="secondary">Quản lý đầu sách, độc giả và lưu thông một nơi</Typography.Text>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <span>{auth.user?.full_name || ""}</span>
            </div>
            <Button type="primary" ghost onClick={auth.logout}>
              Đăng xuất
            </Button>
          </div>
        </Header>
        <Content className="content-wrap">
          <div className="content-surface">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function AdminRoute({ children }) {
  const auth = useAuth();
  if (auth.user?.role !== "ADMIN") {
    return <Navigate to="/forbidden" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="readers" element={<ReadersPage />} />
        <Route path="majors" element={<MajorsPage />} />
        <Route path="book-titles" element={<BookTitlesPage />} />
        <Route path="book-copies" element={<BookCopiesPage />} />
        <Route path="borrows" element={<BorrowsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
