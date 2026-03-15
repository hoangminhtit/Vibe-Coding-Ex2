import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    LIBRARIAN = "LIBRARIAN"


class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class CopyStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BORROWED = "BORROWED"
    DAMAGED = "DAMAGED"
    LOST = "LOST"


class BorrowStatus(str, enum.Enum):
    BORROWING = "BORROWING"
    RETURNED = "RETURNED"
    OVERDUE = "OVERDUE"
    LOST = "LOST"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.LIBRARIAN, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Reader(Base):
    __tablename__ = "readers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    class_name: Mapped[str] = mapped_column(String(50), nullable=False)
    dob: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    gender: Mapped[Gender] = mapped_column(Enum(Gender), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Major(Base):
    __tablename__ = "majors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class BookTitle(Base):
    __tablename__ = "book_titles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    publisher: Mapped[str] = mapped_column(String(150), nullable=False)
    pages: Mapped[int] = mapped_column(Integer, nullable=False)
    size: Mapped[str] = mapped_column(String(50), nullable=False)
    author: Mapped[str] = mapped_column(String(150), nullable=False)
    total_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    major_id: Mapped[int] = mapped_column(ForeignKey("majors.id", ondelete="RESTRICT"), nullable=False)
    major = relationship("Major")


class BookCopy(Base):
    __tablename__ = "book_copies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    copy_code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    status: Mapped[CopyStatus] = mapped_column(Enum(CopyStatus), default=CopyStatus.AVAILABLE, nullable=False)
    imported_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    title_id: Mapped[int] = mapped_column(ForeignKey("book_titles.id", ondelete="CASCADE"), nullable=False)
    title = relationship("BookTitle")


class BorrowSlip(Base):
    __tablename__ = "borrow_slips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    borrowed_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    returned_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[BorrowStatus] = mapped_column(Enum(BorrowStatus), default=BorrowStatus.BORROWING, nullable=False)
    condition: Mapped[str | None] = mapped_column(String(255), nullable=True)

    copy_id: Mapped[int] = mapped_column(ForeignKey("book_copies.id", ondelete="RESTRICT"), nullable=False)
    reader_id: Mapped[int] = mapped_column(ForeignKey("readers.id", ondelete="RESTRICT"), nullable=False)
    librarian_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    copy = relationship("BookCopy")
    reader = relationship("Reader")
    librarian = relationship("User")
