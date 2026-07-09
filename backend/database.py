import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_8AjChB0rpmTX@ep-tiny-brook-ahledph2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,       # reconnects if the connection drops
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
