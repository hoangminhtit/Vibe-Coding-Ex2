from datetime import datetime

from pydantic import BaseModel

from app.db.models import BorrowStatus


class BorrowCreate(BaseModel):
    copy_id: int
    reader_id: int
    borrowed_at: datetime
    condition: str | None = None


class ReturnUpdate(BaseModel):
    returned_at: datetime
    status: BorrowStatus = BorrowStatus.RETURNED
    condition: str | None = None


class BorrowOut(BaseModel):
    id: int
    borrowed_at: datetime
    returned_at: datetime | None
    status: BorrowStatus
    condition: str | None
    copy_id: int
    reader_id: int
    librarian_id: int

    class Config:
        from_attributes = True
