import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getShipment, runAgents, approveRoute, Shipment, Route } from '../api';
import { Activity, Clock, IndianRupee, BrainCircuit, ArrowRight, ShieldAlert } from 'lucide-react';

export default function ImpactDecision() {
  const location = useLocation();
  const navigate = useNavigate();
  const trackingId = location.state?.trackingId || 'MT-001';

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [approving, setApproving] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    getShipment(trackingId).then(setShipment).catch(console.error);
  }, [trackingId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await runAgents(trackingId);
      setAnalysisResult(result);
      setSelectedId(result.selected_route_id);
      setTimerActive(true);
      setCountdown(60);
    } catch (e) {
      console.error(e);
    }
    setAnalyzing(false);
  };

  useEffect(() => {
    let interval: any;
    if (timerActive && countdown > 0 && !approvalMessage) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && timerActive && !approvalMessage && !approving) {
      setTimerActive(false);
      handleApprove(); // Auto-execute!
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown, approvalMessage, approving]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const isOverride = selectedId !== analysisResult.selected_route_id;
      const customReasoning = isOverride 
          ? `[HUMAN OVERRIDE] User rejected AI recommendation and manually intervened to select a custom route.`
          : analysisResult.decision_reasoning;

      await approveRoute(trackingId, selectedId!, customReasoning);
      setApprovalMessage("Execution Action Agent triggered successfully. Redirecting to Audit Logs...");
      setTimeout(() => navigate('/logs', { state: { trackingId } }), 1500);
    } catch (e) {
      console.error(e);
      setApprovalMessage("Failed to execute route. Check logs.");
    }
    setApproving(false);
  };

  if (!shipment) return <div className="p-10 text-center">Loading shipment data...</div>;

  const activeRoute = shipment.routes.find(r => r.is_active);

  return (
    <div className="w-full px-6 py-4 flex flex-col gap-6 min-h-[calc(100vh-140px)] animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-gradient-to-r from-[#9929EA]/40 to-[#000000]/80 p-6 rounded-xl border border-[#9929EA]/30 shadow-[0_0_20px_rgba(153,41,234,0.15)]">
        <div>
          <h2 className="text-2xl font-bold">Impact Analysis: {shipment.master_tracking_id}</h2>
          <p className="text-gray-400 mt-1">{shipment.origin} → {shipment.destination} | Current Location: {shipment.current_location}</p>
        </div>
        {!analysisResult && (
          <button 
            onClick={handleAnalyze} 
            disabled={analyzing}
            className="bg-[#9929EA] hover:bg-[#9929EA]/90 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
          >
            {analyzing ? <span className="animate-pulse">⏳</span> : <BrainCircuit />} 
            {analyzing ? 'Agents Analyzing...' : 'Run Autonomous Analysis'}
          </button>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        {/* Current State */}
        <div className="glass-panel w-full xl:w-[35%] bg-gradient-to-br from-[#000000]/60 to-[#9929EA]/10 rounded-xl p-6 flex flex-col gap-4 border border-[#9929EA]/20">
          <h3 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="text-red-400"/> Current Situation</h3>
          {activeRoute && (
             <div className={`rounded-xl p-5 border transition-all duration-300 ${analysisResult?.disruptions?.length > 0 ? 'bg-red-900/10 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-[#9929EA]/20 border-[#9929EA]/40 shadow-[0_0_20px_rgba(153,41,234,0.2)]'}`}>
               <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${analysisResult?.disruptions?.length > 0 ? 'text-red-400' : 'text-[#9929EA]'}`}>
                 {analysisResult?.disruptions?.length > 0 ? 'Disrupted Active Route' : 'Active Route'}
               </div>
               <div className="font-bold text-lg mb-3 text-white">{activeRoute.name}</div>
               <div className="flex justify-between text-sm">
                 <span className="flex items-center gap-1"><Clock size={16}/> {activeRoute.time_days} Days (Base)</span>
                 <span className="flex items-center gap-1 text-red-500 font-bold">+{analysisResult?.disruptions?.[0]?.delay_days || '?'} Days Delay</span>
               </div>
               <div className="flex justify-between text-sm mt-2">
                 <span className="flex items-center gap-1"><IndianRupee size={16}/> {activeRoute.cost} (Base)</span>
                 {analysisResult && (
                   <span className="flex items-center gap-1 text-red-400"><IndianRupee size={16}/> {activeRoute.cost + (analysisResult.disruptions?.[0]?.delay_days * 50 || 0)} (Adjusted Impact)</span>
                 )}
               </div>
             </div>
          )}
          {analysisResult && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="font-semibold text-[#9929EA] mb-2">🤖 Sense Agent Analysis:</h4>
              <p className="text-gray-300 italic p-4 bg-[#9929EA]/10 border border-[#9929EA]/30 rounded-lg">"{analysisResult.impact_analysis}"</p>
            </div>
          )}
        </div>

        {/* Alternatives & Decision */}
        <div className="glass-panel w-full xl:w-[65%] bg-gradient-to-br from-[#000000]/60 to-[#FF5FCF]/10 rounded-xl p-6 flex flex-col gap-4 overflow-y-auto border border-[#FF5FCF]/20">
          <h3 className="text-xl font-bold flex items-center gap-2"><BrainCircuit className="text-[#9929EA]"/> AI Routing Intelligence</h3>
          
          {analysisResult ? (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-700">
               {analysisResult.route_options?.map((opt: any) => {
                 const isSelected = selectedId === opt.id;
                 const isDisrupted = opt.delay_impact > 0;
                 return (
                 <div onClick={() => !approving && setSelectedId(opt.id)} key={opt.id} className={`p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 cursor-pointer ${isSelected ? 'border-green-400 bg-gradient-to-br from-green-900/30 to-green-500/10 shadow-[0_0_25px_rgba(34,197,94,0.3)]' : isDisrupted ? 'border-red-500/30 bg-red-900/10 shadow-[0_0_15px_rgba(239,68,68,0.15)] opacity-80' : 'border-[#ffffff]/10 bg-[#000000]/40 hover:bg-[#ffffff]/5 hover:border-[#9929EA]/30 opacity-70 hover:opacity-100'}`}>
                   <div className="flex justify-between items-start mb-3">
                     <span className="font-bold flex items-center gap-2">
                        {opt.name} 
                        {isSelected && <span className="text-green-400 text-xs px-2 py-1 bg-green-500/20 rounded border border-green-500/30 uppercase tracking-wider">Selected</span>}
                        {opt.recommended && !isSelected && <span className="text-[#9929EA] text-xs px-2 py-1 bg-[#9929EA]/20 rounded border border-[#9929EA]/30 uppercase tracking-wider">AI Recommendation</span>}
                        {isDisrupted && <span className="text-red-400 text-xs px-2 py-1 bg-red-500/20 rounded border border-red-500/30 uppercase tracking-wider">Disrupted</span>}
                     </span>
                     <span className={`text-xs px-2 py-1 rounded font-bold ${opt.risk_level === 'High' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : opt.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-green-500/20 text-green-500 border border-green-500/30'}`}>Risk: {opt.risk_level}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                     <div className="flex flex-col gap-1">
                       <span className="text-gray-400 text-xs">Base Cost</span>
                       <span className="flex items-center gap-1"><IndianRupee size={14}/> {opt.cost}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                       <span className="text-gray-400 text-xs">Incremental Cost</span>
                       <span className="flex items-center gap-1 font-semibold text-white"><IndianRupee size={14}/> {opt.incremental_cost > 0 ? `+${opt.incremental_cost}` : opt.incremental_cost}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                       <span className="text-gray-400 text-xs">Delay Penalty Impact</span>
                       <span className="flex items-center gap-1 text-red-400"><IndianRupee size={14}/> +{opt.delay_impact}</span>
                     </div>
                     <div className="flex flex-col gap-1">
                       <span className="text-[#FF5FCF] text-xs uppercase font-bold">Total Impact Score</span>
                       <span className="flex items-center gap-1 text-[#FF5FCF] font-bold text-lg"><IndianRupee size={16}/> {opt.total_impact}</span>
                     </div>
                   </div>
                 </div>
               )})}

               <div className="mt-4 p-5 bg-gradient-to-r from-[#FF5FCF]/20 to-[#000000]/80 border border-[#FF5FCF]/40 rounded-xl relative overflow-hidden shadow-[0_0_15px_rgba(255,95,207,0.15)]">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-[#FAEB92]/20 text-[#FAEB92] text-xs font-bold rounded-bl-lg border-b border-l border-[#FAEB92]/30 animate-pulse">
                      Auto-execute in 24 hours (Demo: {countdown}s)
                  </div>
                  <h4 className="font-bold text-[#FF5FCF] mb-2 mt-2 uppercase tracking-wide text-xs">🧠 AI Recommendation Justification:</h4>
                  <p className="text-sm text-gray-300 mb-6">{analysisResult.decision_reasoning}</p>

                  <button 
                     onClick={handleApprove}
                     disabled={approving || !!approvalMessage}
                     className={`w-full font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-transform hover:scale-[1.02] ${selectedId === analysisResult.selected_route_id ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gradient-to-r from-[#FF5FCF] to-[#d63cba] text-white shadow-[0_0_15px_rgba(255,95,207,0.4)]'} disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
                  >
                     {approving ? <span className="animate-pulse">⏳ Executing...</span> : approvalMessage ? `✅ ${approvalMessage}` : selectedId === analysisResult.selected_route_id ? 'Approve AI Recommendation' : 'Approve Manual Override'}
                  </button>
               </div>

               <button onClick={() => navigate('/logs')} className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-all border border-white/20">
                 View Execution Logs <ArrowRight size={18} />
               </button>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-xl p-8">
                Click "Run Autonomous Analysis" to evaluate alternative routes.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
