import json
from langchain_core.messages import HumanMessage # pyre-ignore[21]
from .state import AgentState # pyre-ignore[21]
from .sense_agent import get_llm # pyre-ignore[21]

def decision_node(state: AgentState):
    if state["errors"] or not state["disruptions"]:
        return state

    shipment = state["shipment_data"]
    disruption = state["disruptions"][0]
    delay_days = disruption["delay_days"]
    d_type = disruption.get("disruption_type", "Weather")
    d_severity = disruption.get("severity_multiplier", 1.0)

    priority = shipment.get("priority", "Standard")
    sensitivity = shipment.get("goods_sensitivity", "Medium")
    expected_dlv = shipment.get("expected_delivery_days", 10)

    priority_mult = {"High": 100, "Standard": 50, "Low": 0}.get(priority, 50)
    sens_mult = {"High": 100, "Medium": 50, "Low": 0}.get(sensitivity, 50)
    penalty_factor = 50 + priority_mult + sens_mult

    routes = shipment["routes"]
    
    active_route = next((r for r in routes if r["is_active"]), routes[0])
    active_cost = active_route["cost"]

    # Risk mapping based on Disruption Type and Transport Mode
    def get_risk_multiplier(d_type, mode):
        if d_type == "Weather":
            return {"Sea": 3.0, "Air": 1.5, "Road": 1.0}.get(mode, 1.0)
        elif d_type == "Strike":
            return {"Sea": 3.0, "Air": 1.0, "Road": 2.0}.get(mode, 1.0)
        return 1.0

    # Risk level categorization
    def categorize_risk(val):
        if val >= 3.0: return "High"
        if val >= 2.0: return "Medium"
        return "Low"

    for r in routes:
        # 1. Effective Time & Delay
        is_affected = r.get("is_affected", r["is_active"])
        if is_affected:
            r["effective_time_days"] = r["time_days"] + delay_days
            r["delay_impact"] = delay_days * penalty_factor
        else:
            r["effective_time_days"] = r["time_days"]
            r["delay_impact"] = 0
            
        # 2. Incremental Cost
        r["incremental_cost"] = r["cost"] - active_cost

        # 4. Risk Penalty
        t_mode = r.get("transport_mode", "Sea")
        r_mult = get_risk_multiplier(d_type, t_mode)
        raw_risk = r_mult * d_severity
        r["risk_level"] = categorize_risk(raw_risk)
        r_penalty = raw_risk * 1000

        # 5. Switching Cost
        s_cost = 0 if r["is_active"] else (0.10 * r["cost"])

        # 6. SLA Penalty
        if r["effective_time_days"] > expected_dlv:
            sla_penalty = (delay_days) * 1500
        else:
            sla_penalty = 0

        # 7. Total Impact
        r["total_impact"] = r["incremental_cost"] + r["delay_impact"] + r_penalty + s_cost + sla_penalty
        
        # Format values
        r["incremental_cost"] = round(r["incremental_cost"], 2)
        r["total_impact"] = round(r["total_impact"], 2)
        r["recommended"] = False

    # 8. Decision Logic: Filter routes where risk_level != "High"
    safe_routes = [r for r in routes if r["risk_level"] != "High"]
    if safe_routes:
        best_route = min(safe_routes, key=lambda x: x["total_impact"])
    else:
        best_route = min(routes, key=lambda x: x["total_impact"])
        
    for r in routes:
        if r["id"] == best_route["id"]:
            r["recommended"] = True

    llm = get_llm()

    if llm:
        prompt = f"""You are a supply chain decision intelligence agent.

A shipment has been disrupted at {disruption['location']} due to {disruption['description']}.

You are given precomputed route options with:
- incremental_cost
- delay_impact
- risk_level
- total_impact

{json.dumps(routes, indent=2)}

IMPORTANT RULES:
1. Do NOT blindly select lowest total_impact.
2. Avoid HIGH risk routes if safer options exist.
3. Only choose HIGH risk route if ALL routes are high risk.

Decision steps:
- Filter out HIGH risk routes (if alternatives exist)
- From remaining routes, pick lowest total_impact

Explain clearly:
- Why current route is inefficient/risky
- Why selected route is better
- Tradeoffs (cost vs delay vs risk)
- Mention if higher cost is accepted to reduce risk

Return JSON:
{{
  "selected_route_id": int,
  "decision_reasoning": "clear explanation"
}}"""
        try:
            response = llm.invoke([HumanMessage(content=prompt)])
            content = response.content.replace("```json", "").replace("```", "").strip()
            decision = json.loads(content)
            state["selected_route_id"] = decision["selected_route_id"]
            state["decision_reasoning"] = decision["decision_reasoning"]
            state["route_options"] = routes
        except Exception as e:
            state["errors"].append(f"Decision failed: {str(e)}")
    else:
        # Mock Decision
        state["selected_route_id"] = best_route["id"]
        state["decision_reasoning"] = f"[MOCK] Evaluated impact models. The route '{best_route['name']}' was selected because it is the ONLY safe option filtering out High Risk. Note: It incurs an extreme total penalty of ₹{best_route['total_impact']} solely due to SLA delivery breaches, but strictly abides by the safety constraint."
        state["route_options"] = routes

    return state
