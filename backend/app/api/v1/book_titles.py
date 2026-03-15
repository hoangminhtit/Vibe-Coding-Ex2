from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import BookTitle, Major, User
from app.db.session import get_db
from app.schemas.book import BookTitleCreate, BookTitleOut, BookTitleUpdate

router = APIRouter(prefix="/book-titles", tags=["book-titles"])


@router.get("", response_model=list[BookTitleOut])
def list_book_titles(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(BookTitle).all()


@router.post("", response_model=BookTitleOut, status_code=status.HTTP_201_CREATED)
def create_book_title(
    payload: BookTitleCreate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.query(BookTitle).filter(BookTitle.code == payload.code).first():
        raise HTTPException(status_code=400, detail="Book title code already exists")

    if not db.query(Major).filter(Major.id == payload.major_id).first():
        raise HTTPException(status_code=400, detail="Major not found")

    title = BookTitle(**payload.model_dump())
    db.add(title)
    db.commit()
    db.refresh(title)
    return title


@router.patch("/{title_id}", response_model=BookTitleOut)
def update_book_title(
    title_id: int,
    payload: BookTitleUpdate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    title = db.query(BookTitle).filter(BookTitle.id == title_id).first()
    if not title:
        raise HTTPException(status_code=404, detail="Book title not found")

    data = payload.model_dump(exclude_none=True)
    if "major_id" in data and not db.query(Major).filter(Major.id == data["major_id"]).first():
        raise HTTPException(status_code=400, detail="Major not found")

    for field, value in data.items():
        setattr(title, field, value)

    db.commit()
    db.refresh(title)
    return title


@router.delete("/{title_id}")
def delete_book_title(
    title_id: int,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    title = db.query(BookTitle).filter(BookTitle.id == title_id).first()
    if not title:
        raise HTTPException(status_code=404, detail="Book title not found")
    db.delete(title)
    db.commit()
    return {"message": "Deleted"}
