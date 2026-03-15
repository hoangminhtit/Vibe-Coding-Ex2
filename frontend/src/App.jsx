import { Button, Layout, Menu, Spin, Typography } from "antd";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
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
    { key: "/", label: "Dashboard" },
    { key: "/readers", label: "Doc gia" },
    { key: "/majors", label: "Chuyen nganh" },
    { key: "/book-titles", label: "Dau sach" },
    { key: "/book-copies", label: "Ban sao" },
    { key: "/borrows", label: "Muon/Tra" },
    { key: "/reports", label: "Bao cao" },
  ];

  if (auth.user?.role === "ADMIN") {
    menuItems.push({ key: "/users", label: "Nhan vien" });
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="light">
        <div className="brand">Library App</div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="topbar">
          <Typography.Title level={4} style={{ margin: 0 }}>
            He thong quan ly thu vien
          </Typography.Title>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Typography.Text>{auth.user?.full_name || ""}</Typography.Text>
            <Button onClick={auth.logout}>Dang xuat</Button>
          </div>
        </Header>
        <Content className="content-wrap">
          <Outlet />
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
