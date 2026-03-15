import { Result } from "antd";

export default function ForbiddenPage() {
  return <Result status="403" title="403" subTitle="Ban khong co quyen truy cap trang nay." />;
}
