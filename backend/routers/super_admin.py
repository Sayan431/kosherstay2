from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db
from auth import require_role

router = APIRouter(prefix="/api/super-admin", tags=["Super Admin"])

SuperAdminDep = require_role("super_admin")


@router.get("/hotel-admins", response_model=List[schemas.UserOut])
def list_hotel_admins(db: Session = Depends(get_db), _=Depends(SuperAdminDep)):
    return db.query(models.User).filter(models.User.role == "hotel_admin").all()


@router.patch("/hotel-admins/{user_id}/approve")
def approve_admin(user_id: int, db: Session = Depends(get_db), _=Depends(SuperAdminDep)):
    user = db.query(models.User).filter(
        models.User.id == user_id, models.User.role == "hotel_admin"
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Hotel admin not found")
    user.is_approved = True
    user.is_active = True
    db.commit()
    return {"detail": "Approved"}


@router.patch("/hotel-admins/{user_id}/block")
def block_admin(user_id: int, db: Session = Depends(get_db), _=Depends(SuperAdminDep)):
    user = db.query(models.User).filter(
        models.User.id == user_id, models.User.role == "hotel_admin"
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Hotel admin not found")
    user.is_active = False
    user.is_approved = False
    db.commit()
    return {"detail": "Blocked"}


@router.get("/customers", response_model=List[schemas.UserOut])
def list_customers(db: Session = Depends(get_db), _=Depends(SuperAdminDep)):
    return db.query(models.User).filter(models.User.role == "customer").all()


@router.get("/properties", response_model=List[schemas.PropertyListOut])
def list_all_properties(db: Session = Depends(get_db), _=Depends(SuperAdminDep)):
    return db.query(models.Property).all()


@router.patch("/properties/{property_id}/toggle")
def toggle_property(property_id: int, db: Session = Depends(get_db), _=Depends(SuperAdminDep)):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    prop.is_active = not prop.is_active
    db.commit()
    return {"detail": "toggled", "is_active": prop.is_active}


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _=Depends(SuperAdminDep)):
    return {
        "total_properties": db.query(models.Property).count(),
        "active_properties": db.query(models.Property).filter(models.Property.is_active == True).count(),
        "total_bookings": db.query(models.Booking).count(),
        "pending_bookings": db.query(models.Booking).filter(models.Booking.status == "pending").count(),
        "total_hotel_admins": db.query(models.User).filter(models.User.role == "hotel_admin").count(),
        "approved_hotel_admins": db.query(models.User).filter(
            models.User.role == "hotel_admin", models.User.is_approved == True
        ).count(),
        "total_customers": db.query(models.User).filter(models.User.role == "customer").count(),
    }
