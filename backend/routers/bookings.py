from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from auth import get_current_user, require_role
from datetime import date

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


def calc_price(prop: models.Property, check_in: date, check_out: date) -> float:
    nights = (check_out - check_in).days
    return prop.price * max(nights, 1)


def check_availability(db: Session, property_id: int, check_in: date, check_out: date, exclude_id: int = None):
    """Returns True if property is available for given dates."""
    # Check blocked dates
    blocked = db.query(models.BlockedDate).filter(
        models.BlockedDate.property_id == property_id,
        models.BlockedDate.date >= check_in,
        models.BlockedDate.date < check_out,
    ).first()
    if blocked:
        return False, "Some dates are blocked by the property owner"

    # Check existing accepted bookings
    q = db.query(models.Booking).filter(
        models.Booking.property_id == property_id,
        models.Booking.status == "accepted",
        models.Booking.check_in < check_out,
        models.Booking.check_out > check_in,
    )
    if exclude_id:
        q = q.filter(models.Booking.id != exclude_id)
    conflict = q.first()
    if conflict:
        return False, "Property already booked for those dates"

    return True, None


# ─── Customer ────────────────────────────────────────────────────────────────

@router.post("/", response_model=schemas.BookingOut)
def create_booking(
    payload: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("customer")),
):
    if payload.check_in >= payload.check_out:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")

    if payload.check_in < date.today():
        raise HTTPException(status_code=400, detail="Cannot book past dates")

    prop = db.query(models.Property).filter(
        models.Property.id == payload.property_id,
        models.Property.is_active == True,
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    available, reason = check_availability(db, payload.property_id, payload.check_in, payload.check_out)
    if not available:
        raise HTTPException(status_code=400, detail=reason)

    total = calc_price(prop, payload.check_in, payload.check_out)

    booking = models.Booking(
        property_id=payload.property_id,
        customer_id=current_user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        notes=payload.notes,
        total_price=total,
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my", response_model=List[schemas.BookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("customer")),
):
    return db.query(models.Booking).filter(
        models.Booking.customer_id == current_user.id
    ).order_by(models.Booking.created_at.desc()).all()


@router.delete("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("customer")),
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id,
        models.Booking.customer_id == current_user.id,
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status not in ("pending",):
        raise HTTPException(status_code=400, detail="Only pending bookings can be cancelled")
    booking.status = "cancelled"
    db.commit()
    return {"detail": "Booking cancelled"}


# ─── Hotel Admin ─────────────────────────────────────────────────────────────

@router.get("/property/{property_id}", response_model=List[schemas.BookingOut])
def property_bookings(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hotel_admin")),
):
    prop = db.query(models.Property).filter(
        models.Property.id == property_id,
        models.Property.owner_id == current_user.id,
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return db.query(models.Booking).filter(
        models.Booking.property_id == property_id
    ).order_by(models.Booking.created_at.desc()).all()


@router.get("/admin/all", response_model=List[schemas.BookingOut])
def admin_all_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hotel_admin")),
):
    """All bookings for all properties owned by this admin."""
    property_ids = [
        p.id for p in db.query(models.Property).filter(
            models.Property.owner_id == current_user.id
        ).all()
    ]
    return db.query(models.Booking).filter(
        models.Booking.property_id.in_(property_ids)
    ).order_by(models.Booking.created_at.desc()).all()


@router.patch("/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    payload: schemas.BookingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hotel_admin")),
):
    booking = db.query(models.Booking).join(models.Property).filter(
        models.Booking.id == booking_id,
        models.Property.owner_id == current_user.id,
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if payload.status not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'rejected'")
    booking.status = payload.status
    db.commit()
    return {"detail": f"Booking {payload.status}"}
