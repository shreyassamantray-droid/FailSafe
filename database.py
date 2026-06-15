from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, JSON, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///failsafe.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)  # "faculty" or "hod"

class Upload(Base):
    __tablename__ = "uploads"
    id = Column(Integer, primary_key=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    total_students = Column(Integer)
    at_risk_count = Column(Integer)
    students = relationship("Student", back_populates="upload")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True)
    upload_id = Column(Integer, ForeignKey("uploads.id"))
    student_index = Column(Integer)
    at_risk = Column(Boolean)
    top_factors = Column(JSON)
    row_data = Column(JSON)
    upload = relationship("Upload", back_populates="students")
    intervention = relationship("Intervention", back_populates="student", uselist=False)

class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    content = Column(String)
    generated_at = Column(DateTime, default=datetime.utcnow)
    student = relationship("Student", back_populates="intervention")

def init_db():
    Base.metadata.create_all(engine)

def seed_users():
    from passlib.hash import bcrypt
    db = SessionLocal()
    if not db.query(User).first():
        db.add_all([
            User(email="faculty@failsafe.com", password=bcrypt.hash("faculty123"), role="faculty"),
            User(email="hod@failsafe.com", password=bcrypt.hash("hod123"), role="hod")
        ])
        db.commit()
    db.close()