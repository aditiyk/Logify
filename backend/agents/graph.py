from langgraph.graph import StateGraph, END
from .state import AgentState
from .sense_agent import sense_node
from .decision_agent import decision_node
from .action_agent import action_node
from dotenv import load_dotenv

load_dotenv()

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("sense", sense_node)
    workflow.add_node("decision", decision_node)
    workflow.add_node("action", action_node)
    
    workflow.set_entry_point("sense")
    workflow.add_edge("sense", "decision")
    workflow.add_edge("decision", END)
    
    return workflow.compile()

agent_app = build_graph()
