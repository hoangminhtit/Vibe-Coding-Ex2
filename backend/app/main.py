from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.v1.auth import router as auth_router
from app.api.v1.book_copies import router as book_copies_router
from app.api.v1.book_titles import router as book_titles_router
from app.api.v1.borrows import router as borrows_router
from app.api.v1.majors import router as majors_router
from app.api.v1.readers import router as readers_router
from app.api.v1.reports import router as reports_router
from app.api.v1.users import router as users_router
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.models import User, UserRole
from app.db.session import SessionLocal, engine

app = FastAPI(title="Library Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            db.add(
                User(
                    username="admin",
                    password_hash=get_password_hash("admin123"),
                    full_name="System Admin",
                    role=UserRole.ADMIN,
                    is_active=True,
                )
            )
            db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"ok": True, "service": "library-fastapi"}


app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(readers_router, prefix="/api/v1")
app.include_router(majors_router, prefix="/api/v1")
app.include_router(book_titles_router, prefix="/api/v1")
app.include_router(book_copies_router, prefix="/api/v1")
app.include_router(borrows_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
