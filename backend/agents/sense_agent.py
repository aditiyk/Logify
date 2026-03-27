import os
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from .state import AgentState
from database import SessionLocal, Shipment, Disruption

def get_llm():
    if not os.getenv("OPENAI_API_KEY"):
        return None
    return ChatOpenAI(model="gpt-4o-mini", temperature=0)

def sense_node(state: AgentState):
    master_tracking_id = state["master_tracking_id"]
    db = SessionLocal()
    
    shipment = db.query(Shipment).filter(Shipment.master_tracking_id == master_tracking_id).first()
    if not shipment:
        state["errors"].append("Shipment not found.")
        db.close()
        return state

    shipment_data = {
        "id": shipment.id,
        "master_tracking_id": shipment.master_tracking_id,
        "origin": shipment.origin,
        "destination": shipment.destination,
        "current_status": shipment.current_status,
        "current_location": shipment.current_location,
        "priority": shipment.priority,
        "goods_sensitivity": shipment.goods_sensitivity,
        "expected_delivery_days": shipment.expected_delivery_days,
        "routes": [{"id": r.id, "name": r.name, "cost": r.cost, "time_days": r.time_days, "is_active": r.is_active, "transport_mode": r.transport_mode} for r in shipment.routes]
    }
    
    disruptions = db.query(Disruption).filter(Disruption.location == shipment.current_location, Disruption.is_active == True).all()
    disruption_data = [{"id": d.id, "location": d.location, "description": d.description, "delay_days": d.delay_days, "disruption_type": d.disruption_type, "severity_multiplier": d.severity_multiplier} for d in disruptions]
    
    db.close()
    
    state["shipment_data"] = shipment_data
    state["disruptions"] = disruption_data
    
    if disruption_data:
        llm = get_llm()
        if llm:
            prompt = f"""
            Analyze the impact of the following disruptions on the shipment.
            Shipment: {shipment_data}
            Disruptions: {disruption_data}
            Provide a short 1-2 sentence impact summary.
            """
            try:
                response = llm.invoke([HumanMessage(content=prompt)])
                state["impact_analysis"] = response.content
            except Exception as e:
                state["impact_analysis"] = f"Error calling LLM: {str(e)}"
        else:
            state["impact_analysis"] = f"[MOCK] Disruption detected: delays expected up to {disruption_data[0]['delay_days']} days."
    else:
        state["impact_analysis"] = "No disruptions detected."

    return state
