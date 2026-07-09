from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, Date, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    phone = Column(String(30))
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), default="customer")   # super_admin | hotel_admin | customer
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)    # hotel_admin must be approved by super_admin
    created_at = Column(DateTime, default=datetime.utcnow)

    properties = relationship("Property", back_populates="owner")
    bookings = relationship("Booking", back_populates="customer")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(300), nullable=False)
    address = Column(String(500), nullable=False)
    pincode = Column(String(20), nullable=False, index=True)
    type = Column(String(30), nullable=False)       # Home | Apartment | Villa | Cabin
    price = Column(Float, nullable=False)
    description = Column(Text)
    check_in_rules = Column(Text)
    check_out_rules = Column(Text)
    hotel_rules = Column(Text)
    open_time = Column(String(10))
    close_time = Column(String(10))
    is_active = Column(Boolean, default=True)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")
    services = relationship("PropertyService", back_populates="property", cascade="all, delete-orphan")
    days_plans = relationship("DaysPlan", back_populates="property", cascade="all, delete-orphan")
    blocked_dates = relationship("BlockedDate", back_populates="property", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="property", cascade="all, delete-orphan")


class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    image_url = Column(String(500), nullable=False)

    property = relationship("Property", back_populates="images")


class PropertyService(Base):
    __tablename__ = "property_services"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)

    property = relationship("Property", back_populates="services")


class DaysPlan(Base):
    __tablename__ = "days_plans"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)

    property = relationship("Property", back_populates="days_plans")


class BlockedDate(Base):
    __tablename__ = "blocked_dates"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    date = Column(Date, nullable=False)
    reason = Column(String(100), default="blocked")  # blocked | shabbat

    property = relationship("Property", back_populates="blocked_dates")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, default=1)
    status = Column(String(20), default="pending")  # pending | accepted | rejected | cancelled
    total_price = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="bookings")
    customer = relationship("User", back_populates="bookings")
