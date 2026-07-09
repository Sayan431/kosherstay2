from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json, os, shutil, uuid
import models, schemas
from database import get_db
from auth import require_approved_admin, get_current_user

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api/properties", tags=["Properties"])


def save_image(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return f"/uploads/{filename}"


# ─── Public endpoints ────────────────────────────────────────────────────────

@router.get("/", response_model=List[schemas.PropertyListOut])
def list_properties(
    pincode: Optional[str] = None,
    type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Property).filter(models.Property.is_active == True)
    if pincode:
        q = q.filter(models.Property.pincode == pincode)
    if type:
        q = q.filter(models.Property.type == type)
    if min_price is not None:
        q = q.filter(models.Property.price >= min_price)
    if max_price is not None:
        q = q.filter(models.Property.price <= max_price)
    return q.all()


@router.get("/{property_id}", response_model=schemas.PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.get("/{property_id}/blocked-dates", response_model=List[schemas.BlockedDateOut])
def get_blocked_dates(property_id: int, db: Session = Depends(get_db)):
    return db.query(models.BlockedDate).filter(models.BlockedDate.property_id == property_id).all()


# ─── Hotel Admin endpoints ───────────────────────────────────────────────────

@router.post("/", response_model=schemas.PropertyOut)
def create_property(
    payload: schemas.PropertyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    prop = models.Property(
        owner_id=current_user.id,
        name=payload.name,
        address=payload.address,
        pincode=payload.pincode,
        type=payload.type,
        price=payload.price,
        description=payload.description,
        check_in_rules=payload.check_in_rules,
        check_out_rules=payload.check_out_rules,
        hotel_rules=payload.hotel_rules,
        open_time=payload.open_time,
        close_time=payload.close_time,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.add(prop)
    db.flush()

    for s in (payload.services or []):
        db.add(models.PropertyService(property_id=prop.id, title=s.title, description=s.description))
    for d in (payload.days_plans or []):
        db.add(models.DaysPlan(property_id=prop.id, title=d.title, description=d.description))

    db.commit()
    db.refresh(prop)
    return prop


@router.put("/{property_id}", response_model=schemas.PropertyOut)
def update_property(
    property_id: int,
    payload: schemas.PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    prop = db.query(models.Property).filter(
        models.Property.id == property_id,
        models.Property.owner_id == current_user.id,
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(prop, field, value)

    db.commit()
    db.refresh(prop)
    return prop


@router.post("/{property_id}/images")
async def upload_images(
    property_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    prop = db.query(models.Property).filter(
        models.Property.id == property_id,
        models.Property.owner_id == current_user.id,
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    existing_count = db.query(models.PropertyImage).filter(
        models.PropertyImage.property_id == property_id
    ).count()
    if existing_count + len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed per property")

    urls = []
    for f in files:
        url = save_image(f)
        db.add(models.PropertyImage(property_id=property_id, image_url=url))
        urls.append(url)

    db.commit()
    return {"uploaded": urls}


@router.delete("/{property_id}/images/{image_id}")
def delete_image(
    property_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    img = db.query(models.PropertyImage).filter(
        models.PropertyImage.id == image_id,
        models.PropertyImage.property_id == property_id,
    ).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    # Remove file
    try:
        os.remove(img.image_url.lstrip("/"))
    except Exception:
        pass
    db.delete(img)
    db.commit()
    return {"detail": "Deleted"}


@router.post("/{property_id}/blocked-dates")
def set_blocked_dates(
    property_id: int,
    payload: schemas.BlockedDateIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    prop = db.query(models.Property).filter(
        models.Property.id == property_id,
        models.Property.owner_id == current_user.id,
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    for d in payload.dates:
        existing = db.query(models.BlockedDate).filter(
            models.BlockedDate.property_id == property_id,
            models.BlockedDate.date == d,
        ).first()
        if not existing:
            db.add(models.BlockedDate(property_id=property_id, date=d, reason=payload.reason))

    db.commit()
    return {"detail": "Dates blocked"}


@router.delete("/{property_id}/blocked-dates")
def unblock_dates(
    property_id: int,
    payload: schemas.BlockedDateIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    for d in payload.dates:
        db.query(models.BlockedDate).filter(
            models.BlockedDate.property_id == property_id,
            models.BlockedDate.date == d,
        ).delete()
    db.commit()
    return {"detail": "Dates unblocked"}


@router.delete("/{property_id}")
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    prop = db.query(models.Property).filter(
        models.Property.id == property_id,
        models.Property.owner_id == current_user.id,
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db.delete(prop)
    db.commit()
    return {"detail": "Property deleted"}
