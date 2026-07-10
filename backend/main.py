import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, SessionLocal
import models
from auth import hash_password
from routers import auth, properties, bookings, admin, super_admin

# ─── Create tables ───────────────────────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kosher Vacation Rental API", version="1.0.0")

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(bookings.router)
app.include_router(admin.router)
app.include_router(super_admin.router)


# ─── Seed super admin ────────────────────────────────────────────────────────
def seed_super_admin():
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.role == "super_admin").first()
        if not existing:
            sa = models.User(
                name="Super Admin",
                email="admin@kosher.com",
                phone="+1-000-000-0000",
                password_hash=hash_password("admin123"),
                role="super_admin",
                is_active=True,
                is_approved=True,
            )
            db.add(sa)
            db.commit()
            print("[OK] Super Admin seeded: admin@kosher.com / admin123")
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    seed_super_admin()


@app.get("/")
def root():
    return {"message": "Kosher Vacation Rental API is running ✡"}


@app.get("/health")
def health():
    return {"status": "ok"}
