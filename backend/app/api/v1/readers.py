from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Reader, User
from app.db.session import get_db
from app.schemas.reader import ReaderCreate, ReaderOut, ReaderUpdate

router = APIRouter(prefix="/readers", tags=["readers"])


@router.get("", response_model=list[ReaderOut])
def list_readers(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Reader).all()


@router.post("", response_model=ReaderOut, status_code=status.HTTP_201_CREATED)
def create_reader(
    payload: ReaderCreate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.query(Reader).filter(Reader.code == payload.code).first():
        raise HTTPException(status_code=400, detail="Reader code already exists")

    reader = Reader(**payload.model_dump())
    db.add(reader)
    db.commit()
    db.refresh(reader)
    return reader


@router.patch("/{reader_id}", response_model=ReaderOut)
def update_reader(
    reader_id: int,
    payload: ReaderUpdate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reader = db.query(Reader).filter(Reader.id == reader_id).first()
    if not reader:
        raise HTTPException(status_code=404, detail="Reader not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(reader, field, value)

    db.commit()
    db.refresh(reader)
    return reader


@router.delete("/{reader_id}")
def delete_reader(
    reader_id: int,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reader = db.query(Reader).filter(Reader.id == reader_id).first()
    if not reader:
        raise HTTPException(status_code=404, detail="Reader not found")
    db.delete(reader)
    db.commit()
    return {"message": "Deleted"}
