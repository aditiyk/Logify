from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    master_tracking_id: str
    shipment_data: Optional[Dict[str, Any]]
    disruptions: List[Dict[str, Any]]
    impact_analysis: Optional[str]
    route_options: List[Dict[str, Any]]
    selected_route_id: Optional[int]
    decision_reasoning: Optional[str]
    action_log: Optional[str]
    errors: List[str]
