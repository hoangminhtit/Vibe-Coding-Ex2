from fastapi import APIRouter, Depends
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import BookCopy, BookTitle, BorrowSlip, BorrowStatus, Reader, User
from app.db.session import get_db

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/top-borrowed-titles")
def top_borrowed_titles(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(BookTitle.name, func.count(BorrowSlip.id).label("borrow_count"))
        .join(BookCopy, BookCopy.title_id == BookTitle.id)
        .join(BorrowSlip, BorrowSlip.copy_id == BookCopy.id)
        .group_by(BookTitle.name)
        .order_by(desc("borrow_count"))
        .limit(10)
        .all()
    )
    return [{"title": r[0], "borrow_count": r[1]} for r in rows]


@router.get("/unreturned-readers")
def unreturned_readers(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Reader.code, Reader.full_name, func.count(BorrowSlip.id).label("open_borrows"))
        .join(BorrowSlip, BorrowSlip.reader_id == Reader.id)
        .filter(BorrowSlip.status == BorrowStatus.BORROWING)
        .group_by(Reader.code, Reader.full_name)
        .order_by(desc("open_borrows"))
        .all()
    )
    return [{"reader_code": r[0], "reader_name": r[1], "open_borrows": r[2]} for r in rows]
