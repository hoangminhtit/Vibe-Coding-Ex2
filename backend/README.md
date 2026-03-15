# Backend - FastAPI

## 1) Cai dat

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## 2) Chay development

```bash
uvicorn app.main:app --reload --port 8000
```

## 3) Tai khoan mac dinh

- Username: `admin`
- Password: `admin123`

## 4) API docs

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
