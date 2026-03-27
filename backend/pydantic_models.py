from pydantic import BaseModel # pyre-ignore[21]
from typing import List, Optional
from datetime import datetime

class RouteModel(BaseModel):
    id: int
    name: str
    cost: float
    time_days: int
    is_active: bool
    transport_mode: str = "Sea"
    incremental_cost: Optional[float] = None
    delay_impact: Optional[float] = None
    risk_level: Optional[str] = None
    total_impact: Optional[float] = None
    recommended: Optional[bool] = None

    class Config:
        from_attributes = True

class LogEntryModel(BaseModel):
    id: int
    agent_name: str
    action: str
    reasoning: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ShipmentModel(BaseModel):
    id: int
    master_tracking_id: str
    origin: str
    destination: str
    current_status: str
    current_location: str
    priority: str = "Standard"
    goods_sensitivity: str = "Medium"
    expected_delivery_days: int = 10
    routes: List[RouteModel] = []
    logs: List[LogEntryModel] = []

    class Config:
        from_attributes = True

class DisruptionModel(BaseModel):
    id: int
    location: str
    description: str
    delay_days: int
    disruption_type: str = "Weather"
    severity_multiplier: float = 1.0

    class Config:
        from_attributes = True

class RunAgentsRequest(BaseModel):
    master_tracking_id: str

class ApproveRouteRequest(BaseModel):
    master_tracking_id: str
    selected_route_id: int
    decision_reasoning: str
