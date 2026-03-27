import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ImpactDecision from './pages/ImpactDecision';
import ExecutionLogs from './pages/ExecutionLogs';
import { Package, Activity, FileText } from 'lucide-react';

const NavLink = ({ to, children, icon: Icon }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`text-sm font-medium transition-colors flex items-center gap-2 px-3 py-2 rounded-md ${isActive ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      <Icon size={16} /> {children}
    </Link>
  );
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden text-foreground">
      {/* Background Effects */}
      <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Navbar */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-purple">
            <Package size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-white">LOGIFY</h1>
        </div>
        <nav className="flex gap-2">
          <NavLink to="/" icon={Activity}>Dashboard</NavLink>
          <NavLink to="/impact" icon={Activity}>Impact & Decision</NavLink>
          <NavLink to="/logs" icon={FileText}>Execution Logs</NavLink>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 z-10 w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/impact" element={<ImpactDecision />} />
          <Route path="/logs" element={<ExecutionLogs />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
