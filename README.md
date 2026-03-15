# Library Management - Vibe Coding 2

Stack:
- Frontend: React + Vite + Ant Design
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL (hoac SQLite de chay nhanh local)

## 1) Chay backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

Tai khoan mac dinh:
- username: admin
- password: admin123

Docs API:
- http://localhost:8000/docs

## 2) Chay frontend

```bash
cd frontend
npm install
npm run dev
```

UI:
- http://localhost:5173

## 3) Chuc nang da hoan thien

- Dang nhap JWT
- Profile va role-based menu
- RBAC trang Quan ly nhan vien (chi ADMIN)
- CRUD Doc gia
- CRUD Chuyen nganh
- CRUD Dau sach
- CRUD Ban sao sach
- Muon sach va tra sach
- Bao cao dau sach muon nhieu
- Bao cao doc gia chua tra
- CRUD Nhan vien (ADMIN)

## 4) Kiem thu nhanh

1. Dang nhap tai khoan admin
2. Tao chuyen nganh
3. Tao dau sach gan vao chuyen nganh
4. Tao ban sao cho dau sach
5. Tao doc gia
6. Cap nhat/xoa du lieu va xac nhan bang du lieu thay doi
7. Vao trang Nhan vien, tao tai khoan thu thu
8. Dang nhap bang tai khoan thu thu va kiem tra khong truy cap duoc trang Nhan vien
