from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import Major, User
from app.db.session import get_db
from app.schemas.major import MajorCreate, MajorOut, MajorUpdate

router = APIRouter(prefix="/majors", tags=["majors"])


@router.get("", response_model=list[MajorOut])
def list_majors(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Major).all()


@router.post("", response_model=MajorOut, status_code=status.HTTP_201_CREATED)
def create_major(
    payload: MajorCreate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.query(Major).filter(Major.code == payload.code).first():
        raise HTTPException(status_code=400, detail="Major code already exists")

    major = Major(**payload.model_dump())
    db.add(major)
    db.commit()
    db.refresh(major)
    return major


@router.patch("/{major_id}", response_model=MajorOut)
def update_major(
    major_id: int,
    payload: MajorUpdate,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    major = db.query(Major).filter(Major.id == major_id).first()
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(major, field, value)

    db.commit()
    db.refresh(major)
    return major


@router.delete("/{major_id}")
def delete_major(
    major_id: int,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    major = db.query(Major).filter(Major.id == major_id).first()
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")
    db.delete(major)
    db.commit()
    return {"message": "Deleted"}
