from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from auth import require_approved_admin

router = APIRouter(prefix="/api/admin", tags=["Hotel Admin"])


@router.get("/my-properties", response_model=List[schemas.PropertyListOut])
def my_properties(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    return db.query(models.Property).filter(
        models.Property.owner_id == current_user.id
    ).all()


@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    props = db.query(models.Property).filter(
        models.Property.owner_id == current_user.id
    ).all()
    prop_ids = [p.id for p in props]

    total_bookings = db.query(models.Booking).filter(
        models.Booking.property_id.in_(prop_ids)
    ).count()
    pending = db.query(models.Booking).filter(
        models.Booking.property_id.in_(prop_ids),
        models.Booking.status == "pending",
    ).count()
    accepted = db.query(models.Booking).filter(
        models.Booking.property_id.in_(prop_ids),
        models.Booking.status == "accepted",
    ).count()

    return {
        "total_properties": len(props),
        "active_properties": sum(1 for p in props if p.is_active),
        "total_bookings": total_bookings,
        "pending_bookings": pending,
        "accepted_bookings": accepted,
    }


@router.put("/properties/{property_id}/services")
def update_services(
    property_id: int,
    services: List[schemas.ServiceIn],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    prop = db.query(models.Property).filter(
        models.Property.id == property_id,
        models.Property.owner_id == current_user.id,
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db.query(models.PropertyService).filter(
        models.PropertyService.property_id == property_id
    ).delete()
    for s in services:
        db.add(models.PropertyService(property_id=property_id, title=s.title, description=s.description))
    db.commit()
    return {"detail": "Services updated"}


@router.put("/properties/{property_id}/days-plans")
def update_days_plans(
    property_id: int,
    plans: List[schemas.DaysPlanIn],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_approved_admin),
):
    prop = db.query(models.Property).filter(
        models.Property.id == property_id,
        models.Property.owner_id == current_user.id,
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db.query(models.DaysPlan).filter(
        models.DaysPlan.property_id == property_id
    ).delete()
    for d in plans:
        db.add(models.DaysPlan(property_id=property_id, title=d.title, description=d.description))
    db.commit()
    return {"detail": "Days plans updated"}
