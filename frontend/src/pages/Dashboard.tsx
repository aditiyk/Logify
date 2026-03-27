import React, { useEffect, useState } from 'react';
import { getShipments, getDisruptions, Shipment, Disruption } from '../api';
import MapVisualization from '../components/MapVisualization';
import { AlertCircle, AlertTriangle, Ship, Navigation, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    Promise.all([getShipments(), getDisruptions()]).then(([s, d]) => {
      setShipments(s);
      setDisruptions(d);
      if (s.length > 0) setActiveShipment(s[0]);
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
      {/* Top Disruption Alerts prominently displayed */}
      {disruptions.filter(d => activeShipment?.current_location === d.location).length > 0 && (
        <div className="w-full bg-gradient-to-r from-red-900/40 via-destructive/20 to-transparent border border-destructive/50 rounded-xl p-5 flex justify-between items-center shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
           <div className="flex gap-4 items-center">
             <AlertTriangle className="text-destructive h-8 w-8" />
             <div>
               <h3 className="font-bold text-red-500 text-lg uppercase tracking-wider">Disruption Active at {disruptions.find(d => activeShipment?.current_location === d.location)?.location}</h3>
               <p className="text-gray-300">
                 {disruptions.find(d => activeShipment?.current_location === d.location)?.description} ({disruptions.find(d => activeShipment?.current_location === d.location)?.delay_days} days expected delay)
               </p>
             </div>
           </div>
           <Link to="/impact" state={{ trackingId: activeShipment?.master_tracking_id }} className="bg-destructive hover:bg-destructive/80 text-white font-bold px-6 py-2 rounded-lg transition-transform hover:scale-105 shadow-lg shadow-destructive/50">
               Analyze & Reroute Now
           </Link>
        </div>
      )}
      
      {disruptions.filter(d => activeShipment?.current_location === d.location).length === 0 && (
        <div className="w-full bg-gradient-to-r from-green-900/20 to-transparent border border-green-500/30 text-green-400 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 /> <span className="font-medium">All tracking normally for {activeShipment?.master_tracking_id || 'selected shipment'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Panel: Shipments List */}
        <div className="glass-panel bg-gradient-to-b from-purple-900/10 to-transparent rounded-xl p-5 flex flex-col gap-4 overflow-y-auto border border-purple-500/20">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Ship className="text-purple-400" /> Active Shipments
          </h2>
          {shipments.map(s => (
            <div 
              key={s.id} 
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] ${activeShipment?.id === s.id ? 'bg-gradient-to-br from-purple-800/40 to-primary/10 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-black/40 border-white/10'}`}
              onClick={() => setActiveShipment(s)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg text-white">{s.master_tracking_id}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${
                  s.current_status === 'In Transit' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  s.current_status === 'At Port' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-green-500/10 text-green-400 border-green-500/20'
                }`}>{s.current_status}</span>
              </div>
              <div className="text-sm text-purple-200/60 mt-1 flex justify-between">
                <span>{s.origin} → {s.destination}</span>
              </div>
              <div className="text-sm text-gray-300 mt-2 p-2 bg-black/40 rounded-lg border border-white/5">
                Current: <span className="font-semibold text-purple-300">{s.current_location}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center/Right: Map */}
        <div className="lg:col-span-2 h-full rounded-xl overflow-hidden border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative">
           <MapVisualization shipment={activeShipment} disruptions={disruptions} />
           <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
