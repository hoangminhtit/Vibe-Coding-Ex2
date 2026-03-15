from datetime import datetime

from pydantic import BaseModel

from app.db.models import Gender


class ReaderCreate(BaseModel):
    code: str
    full_name: str
    class_name: str
    dob: datetime
    gender: Gender


class ReaderUpdate(BaseModel):
    full_name: str | None = None
    class_name: str | None = None
    dob: datetime | None = None
    gender: Gender | None = None
    is_active: bool | None = None


class ReaderOut(BaseModel):
    id: int
    code: str
    full_name: str
    class_name: str
    dob: datetime
    gender: Gender
    is_active: bool

    class Config:
        from_attributes = True
