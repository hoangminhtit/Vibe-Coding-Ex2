from pydantic import BaseModel


class MajorCreate(BaseModel):
    code: str
    name: str
    description: str | None = None


class MajorUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class MajorOut(BaseModel):
    id: int
    code: str
    name: str
    description: str | None

    class Config:
        from_attributes = True
