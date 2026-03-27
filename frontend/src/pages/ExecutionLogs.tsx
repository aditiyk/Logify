import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getShipments, getLogs, Shipment, LogEntry } from '../api';
import { FileText, ChevronRight, Activity } from 'lucide-react';

export default function ExecutionLogs() {
  const location = useLocation();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedTrackingId, setSelectedTrackingId] = useState<string>(location.state?.trackingId || '');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    getShipments().then(s => {
      setShipments(s);
      if (s.length > 0 && !location.state?.trackingId) {
         setSelectedTrackingId(s[0].master_tracking_id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedTrackingId) {
      getLogs(selectedTrackingId).then(setLogs);
    }
  }, [selectedTrackingId]);

  return (
    <div className="w-full h-full flex flex-col gap-6 min-h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center bg-black/40 p-6 rounded-xl border border-white/10 glow-purple">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <FileText className="text-primary" /> Execution & Audit Logs
        </h2>
        <select 
          value={selectedTrackingId} 
          onChange={e => setSelectedTrackingId(e.target.value)}
          className="bg-secondary border border-border text-white px-4 py-2 rounded-lg outline-none focus:border-primary cursor-pointer font-medium"
        >
          {shipments.map(s => (
            <option key={s.id} value={s.master_tracking_id}>{s.master_tracking_id}</option>
          ))}
        </select>
      </div>

      <div className="glass-panel rounded-xl p-6 flex-1 overflow-y-auto">
         {logs.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 border-2 border-dashed border-white/10 rounded-xl p-10">
             <Activity size={64} className="opacity-20 text-primary" />
             <p className="text-lg">No autonomous actions have been executed for this shipment yet.</p>
           </div>
         ) : (
           <div className="space-y-6 animate-in slide-in-from-bottom-4">
             {logs.map((log, index) => (
               <div key={log.id} className="relative pl-8 pb-6 border-l border-primary/50 last:border-0 last:pb-0">
                 <div className="absolute left-[-5px] top-0 w-[10px] h-[10px] rounded-full bg-primary glow-purple ring-4 ring-black" />
                 
                 <div className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-colors">
                   <div className="flex justify-between items-start mb-3">
                     <span className="font-bold text-lg text-white flex items-center gap-2">
                       {log.agent_name} <ChevronRight className="text-primary" size={16} /> <span className="text-green-400">{log.action}</span>
                     </span>
                     <span className="text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded">{new Date(log.timestamp).toLocaleString()}</span>
                   </div>
                   
                   <div className="text-sm p-4 bg-black/50 rounded-md border border-white/5 text-gray-300">
                     <span className="font-semibold text-primary block mb-2 text-xs uppercase tracking-wider">Reasoning Explanation</span>
                     <p className="leading-relaxed">{log.reasoning}</p>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}
