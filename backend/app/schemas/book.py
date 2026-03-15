from datetime import datetime

from pydantic import BaseModel

from app.db.models import CopyStatus


class BookTitleCreate(BaseModel):
    code: str
    name: str
    publisher: str
    pages: int
    size: str
    author: str
    total_quantity: int = 0
    major_id: int


class BookTitleUpdate(BaseModel):
    name: str | None = None
    publisher: str | None = None
    pages: int | None = None
    size: str | None = None
    author: str | None = None
    total_quantity: int | None = None
    major_id: int | None = None


class BookTitleOut(BaseModel):
    id: int
    code: str
    name: str
    publisher: str
    pages: int
    size: str
    author: str
    total_quantity: int
    major_id: int

    class Config:
        from_attributes = True


class BookCopyCreate(BaseModel):
    copy_code: str
    status: CopyStatus = CopyStatus.AVAILABLE
    imported_at: datetime
    title_id: int


class BookCopyUpdate(BaseModel):
    status: CopyStatus | None = None


class BookCopyOut(BaseModel):
    id: int
    copy_code: str
    status: CopyStatus
    imported_at: datetime
    title_id: int

    class Config:
        from_attributes = True
