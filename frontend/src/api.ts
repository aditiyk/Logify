import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export interface Route {
  id: number;
  name: string;
  cost: number;
  time_days: number;
  is_active: boolean;
  transport_mode?: string;
  incremental_cost?: number;
  delay_impact?: number;
  risk_level?: string;
  total_impact?: number;
  recommended?: boolean;
}

export interface Shipment {
  id: number;
  master_tracking_id: string;
  origin: string;
  destination: string;
  current_status: string;
  current_location: string;
  priority?: string;
  goods_sensitivity?: string;
  expected_delivery_days?: number;
  routes: Route[];
}

export interface Disruption {
  id: number;
  location: string;
  description: string;
  delay_days: number;
  disruption_type?: string;
  severity_multiplier?: number;
}

export interface LogEntry {
  id: number;
  agent_name: string;
  action: string;
  reasoning: string;
  timestamp: string;
}

export const getShipments = () => api.get<Shipment[]>('/shipments').then(res => res.data);
export const getShipment = (id: string) => api.get<Shipment>(`/shipments/${id}`).then(res => res.data);
export const getDisruptions = () => api.get<Disruption[]>('/disruptions').then(res => res.data);
export const getLogs = (id: string) => api.get<LogEntry[]>(`/logs/${id}`).then(res => res.data);
export const runAgents = (id: string) => api.post('/agents/run', { master_tracking_id: id }).then(res => res.data);
export const approveRoute = (id: string, routeId: number, reasoning: string) => 
  api.post('/agents/approve', { master_tracking_id: id, selected_route_id: routeId, decision_reasoning: reasoning }).then(res => res.data);
