from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import BookCopy, BookTitle, User
from app.db.session import get_db
from app.schemas.book import BookCopyCreate, BookCopyOut, BookCopyUpdate

router = APIRouter(prefix="/book-copies", tags=["book-copies"])


@router.get("", response_model=list[BookCopyOut])
def list_book_copies(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(BookCopy).all()


@router.post("", response_model=BookCopyOut, status_code=status.HTTP_201_CREATED)
def create_book_copy(
    payload: BookCopyCreate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.query(BookCopy).filter(BookCopy.copy_code == payload.copy_code).first():
        raise HTTPException(status_code=400, detail="Copy code already exists")

    if not db.query(BookTitle).filter(BookTitle.id == payload.title_id).first():
        raise HTTPException(status_code=400, detail="Book title not found")

    copy = BookCopy(**payload.model_dump())
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return copy


@router.patch("/{copy_id}", response_model=BookCopyOut)
def update_book_copy(
    copy_id: int,
    payload: BookCopyUpdate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    copy = db.query(BookCopy).filter(BookCopy.id == copy_id).first()
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(copy, field, value)

    db.commit()
    db.refresh(copy)
    return copy


@router.delete("/{copy_id}")
def delete_book_copy(
    copy_id: int,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    copy = db.query(BookCopy).filter(BookCopy.id == copy_id).first()
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found")
    db.delete(copy)
    db.commit()
    return {"message": "Deleted"}
