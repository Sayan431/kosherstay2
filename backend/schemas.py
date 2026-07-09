from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ─── Auth ───────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    role: str = "customer"   # customer | hotel_admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str
    is_approved: bool

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    role: str
    is_active: bool
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Property ────────────────────────────────────────────────────────────────

class ServiceIn(BaseModel):
    title: str
    description: Optional[str] = None

class DaysPlanIn(BaseModel):
    title: str
    description: Optional[str] = None

class PropertyCreate(BaseModel):
    name: str
    address: str
    pincode: str
    type: str
    price: float
    description: Optional[str] = None
    check_in_rules: Optional[str] = None
    check_out_rules: Optional[str] = None
    hotel_rules: Optional[str] = None
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    services: Optional[List[ServiceIn]] = []
    days_plans: Optional[List[DaysPlanIn]] = []

class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    type: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    check_in_rules: Optional[str] = None
    check_out_rules: Optional[str] = None
    hotel_rules: Optional[str] = None
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None

class ServiceOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    class Config:
        from_attributes = True

class DaysPlanOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    class Config:
        from_attributes = True

class PropertyImageOut(BaseModel):
    id: int
    image_url: str
    class Config:
        from_attributes = True

class OwnerOut(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    email: str
    class Config:
        from_attributes = True

class PropertyOut(BaseModel):
    id: int
    name: str
    address: str
    pincode: str
    type: str
    price: float
    description: Optional[str]
    check_in_rules: Optional[str]
    check_out_rules: Optional[str]
    hotel_rules: Optional[str]
    open_time: Optional[str]
    close_time: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    is_active: bool
    created_at: datetime
    owner: OwnerOut
    images: List[PropertyImageOut]
    services: List[ServiceOut]
    days_plans: List[DaysPlanOut]

    class Config:
        from_attributes = True

class PropertyListOut(BaseModel):
    id: int
    name: str
    address: str
    pincode: str
    type: str
    price: float
    description: Optional[str]
    is_active: bool
    owner: OwnerOut
    images: List[PropertyImageOut]

    class Config:
        from_attributes = True


# ─── Blocked Dates ───────────────────────────────────────────────────────────

class BlockedDateIn(BaseModel):
    dates: List[date]
    reason: Optional[str] = "blocked"

class BlockedDateOut(BaseModel):
    id: int
    date: date
    reason: str
    class Config:
        from_attributes = True


# ─── Booking ─────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    property_id: int
    check_in: date
    check_out: date
    guests: Optional[int] = 1
    notes: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str   # accepted | rejected | cancelled

class BookingOut(BaseModel):
    id: int
    property_id: int
    customer_id: int
    check_in: date
    check_out: date
    guests: int
    status: str
    total_price: Optional[float]
    notes: Optional[str]
    created_at: datetime
    property: PropertyListOut
    customer: UserOut

    class Config:
        from_attributes = True
