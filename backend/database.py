from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Boolean # pyre-ignore[21]
from sqlalchemy.orm import declarative_base, sessionmaker, relationship # pyre-ignore[21]
from datetime import datetime

DATABASE_URL = "sqlite:///./logify.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    master_tracking_id = Column(String, unique=True, index=True)
    origin = Column(String)
    destination = Column(String)
    current_status = Column(String)
    current_location = Column(String)
    priority = Column(String, default="Standard")
    goods_sensitivity = Column(String, default="Medium")
    expected_delivery_days = Column(Integer, default=10)
    routes = relationship("Route", back_populates="shipment")
    logs = relationship("LogEntry", back_populates="shipment")

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    name = Column(String)
    cost = Column(Float)
    time_days = Column(Integer)
    is_active = Column(Boolean, default=False)
    transport_mode = Column(String, default="Sea")
    shipment = relationship("Shipment", back_populates="routes")

class Disruption(Base):
    __tablename__ = "disruptions"
    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, index=True)
    description = Column(String)
    delay_days = Column(Integer)
    disruption_type = Column(String, default="Weather")
    severity_multiplier = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)

class LogEntry(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    agent_name = Column(String)
    action = Column(String)
    reasoning = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    shipment = relationship("Shipment", back_populates="logs")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
