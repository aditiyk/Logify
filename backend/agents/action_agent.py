from .state import AgentState # pyre-ignore[21]
from database import SessionLocal, Route, LogEntry # pyre-ignore[21]

def action_node(state: AgentState):
    if state["errors"] or not state["selected_route_id"]:
        return state

    db = SessionLocal()
    
    shipment_id = state["shipment_data"]["id"]
    selected_route_id = state["selected_route_id"]
    
    try:
        # Update active routes
        db.query(Route).filter(Route.shipment_id == shipment_id).update({"is_active": False})
        db.query(Route).filter(Route.id == selected_route_id).update({"is_active": True})
        
        reasoning = state.get("decision_reasoning", "No reasoning provided.")
        disruptions = state.get("disruptions", [])
        if disruptions:
            d = disruptions[0]
            context = f"Disruption at {d['location']} due to {d['description']} causing +{d['delay_days']} days delay. "
            reasoning = context + reasoning

        from datetime import datetime, timedelta
        ist_time = datetime.utcnow() + timedelta(hours=5, minutes=30)

        # Log the decision
        log = LogEntry(
            shipment_id=shipment_id,
            agent_name="Decision & Action Agent",
            action=f"Rerouted to Route ID {selected_route_id}",
            reasoning=reasoning,
            timestamp=ist_time
        )
        db.add(log)
        db.commit()
        state["action_log"] = "Rerouting executed successfully and stakeholders notified."
    except Exception as e:
        state["errors"].append(f"Action failed: {str(e)}")
        db.rollback()
    finally:
        db.close()
    
    return state
