from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, init_db, get_db, Shipment, Disruption, Route, LogEntry
from pydantic_models import ShipmentModel, DisruptionModel, RunAgentsRequest, RouteModel, LogEntryModel, ApproveRouteRequest
from mock_data import seed_db
from agents.graph import agent_app

app = FastAPI(title="Logify API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    seed_db()

@app.get("/api/shipments", response_model=list[ShipmentModel])
def get_shipments(db: Session = Depends(get_db)):
    return db.query(Shipment).all()

@app.get("/api/shipments/{master_tracking_id}", response_model=ShipmentModel)
def get_shipment(master_tracking_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.master_tracking_id == master_tracking_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@app.get("/api/disruptions", response_model=list[DisruptionModel])
def get_disruptions(db: Session = Depends(get_db)):
    return db.query(Disruption).filter(Disruption.is_active == True).all()

@app.post("/api/agents/run")
def run_autonomous_agents(request: RunAgentsRequest):
    initial_state = {
        "master_tracking_id": request.master_tracking_id,
        "shipment_data": None,
        "disruptions": [],
        "impact_analysis": None,
        "route_options": [],
        "selected_route_id": None,
        "decision_reasoning": None,
        "action_log": None,
        "errors": []
    }
    
    result = agent_app.invoke(initial_state)
    return result

@app.post("/api/agents/approve")
def approve_route(request: ApproveRouteRequest, db: Session = Depends(get_db)):
    from agents.action_agent import action_node
    shipment = db.query(Shipment).filter(Shipment.master_tracking_id == request.master_tracking_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    disruptions = db.query(Disruption).filter(Disruption.is_active == True).all()
    d_list = [{"location": d.location, "description": d.description, "delay_days": d.delay_days} for d in disruptions]
    
    state = {
        "shipment_data": {"id": shipment.id},
        "selected_route_id": request.selected_route_id,
        "decision_reasoning": request.decision_reasoning,
        "disruptions": d_list,
        "errors": []
    }
    action_result = action_node(state)
    return action_result

@app.get("/api/logs/{master_tracking_id}", response_model=list[LogEntryModel])
def get_logs(master_tracking_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.master_tracking_id == master_tracking_id).first()
    if not shipment:
        return []
    return db.query(LogEntry).filter(LogEntry.shipment_id == shipment.id).order_by(LogEntry.timestamp.desc()).all()
