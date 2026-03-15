from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import BookCopy, BorrowSlip, BorrowStatus, CopyStatus, Reader, User
from app.db.session import get_db
from app.schemas.borrow import BorrowCreate, BorrowOut, ReturnUpdate

router = APIRouter(prefix="/borrows", tags=["borrows"])


@router.get("", response_model=list[BorrowOut])
def list_borrows(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(BorrowSlip).order_by(BorrowSlip.id.desc()).all()


@router.post("", response_model=BorrowOut, status_code=status.HTTP_201_CREATED)
def create_borrow(
    payload: BorrowCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    copy = db.query(BookCopy).filter(BookCopy.id == payload.copy_id).first()
    if not copy:
        raise HTTPException(status_code=404, detail="Book copy not found")
    if copy.status != CopyStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Book copy is not available")

    reader = db.query(Reader).filter(Reader.id == payload.reader_id, Reader.is_active.is_(True)).first()
    if not reader:
        raise HTTPException(status_code=404, detail="Reader not found or inactive")

    # Rule: one active borrow at a time per reader.
    active = (
        db.query(func.count(BorrowSlip.id))
        .filter(BorrowSlip.reader_id == reader.id, BorrowSlip.status == BorrowStatus.BORROWING)
        .scalar()
    )
    if active and active > 0:
        raise HTTPException(status_code=400, detail="Reader already has an active borrow")

    borrow = BorrowSlip(
        copy_id=payload.copy_id,
        reader_id=payload.reader_id,
        librarian_id=current_user.id,
        borrowed_at=payload.borrowed_at,
        status=BorrowStatus.BORROWING,
        condition=payload.condition,
    )
    copy.status = CopyStatus.BORROWED

    db.add(borrow)
    db.commit()
    db.refresh(borrow)
    return borrow


@router.patch("/{borrow_id}/return", response_model=BorrowOut)
def return_borrow(
    borrow_id: int,
    payload: ReturnUpdate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    borrow = db.query(BorrowSlip).filter(BorrowSlip.id == borrow_id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow not found")

    if borrow.status != BorrowStatus.BORROWING:
        raise HTTPException(status_code=400, detail="Borrow is already closed")

    borrow.returned_at = payload.returned_at
    borrow.status = payload.status
    borrow.condition = payload.condition

    copy = db.query(BookCopy).filter(BookCopy.id == borrow.copy_id).first()
    if copy:
        copy.status = CopyStatus.AVAILABLE

    db.commit()
    db.refresh(borrow)
    return borrow
