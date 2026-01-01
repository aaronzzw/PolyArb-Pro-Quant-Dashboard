
import React from 'react';
import { ArbSignal } from '../types';

interface StatsPanelProps {
  signals: ArbSignal[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ signals }) => {
  const successfulArbs = signals.length;
  const avgLatency = signals.length > 0 ? (signals.reduce((acc, s) => acc + s.executionLatency, 0) / signals.length).toFixed(2) : "0.00";
  const hedgeRate = (signals.filter(s => s.leg2).length / (signals.length || 1) * 100).toFixed(1);
  const totalArb = (signals.length * 12.4).toFixed(2); // Mocked dollar gain

  return (
    <div className="grid grid-cols-4 gap-12 h-full items-center">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <i className="fas fa-bolt text-yellow-500 text-[10px]"></i>
          <span className="text-[9px] text-slate-500 uppercase mono font-black tracking-widest">Execution Health</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tighter">{avgLatency}ms</span>
          <span className="text-[9px] text-yellow-500 mono font-bold uppercase">Avg Turnaround</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <i className="fas fa-link text-blue-500 text-[10px]"></i>
          <span className="text-[9px] text-slate-500 uppercase mono font-black tracking-widest">Hedge Efficiency</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tighter">{hedgeRate}%</span>
          <span className="text-[9px] text-blue-400 mono font-bold uppercase">Success Rate</span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <i className="fas fa-wallet text-green-500 text-[10px]"></i>
          <span className="text-[9px] text-slate-500 uppercase mono font-black tracking-widest">Est. Arb Profit</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tighter">+${totalArb}</span>
          <span className="text-[9px] text-green-500 mono font-bold uppercase">Net USDC</span>
        </div>
      </div>

      <div className="flex flex-col border-l border-slate-800 pl-8 h-full justify-center">
        <div className="bg-[#010409] border border-slate-800 p-3 rounded shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Engine Status</span>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
          </div>
          <p className="text-[9px] text-slate-400 leading-relaxed font-mono">
            $ target/release/poly-sniper<br/>
            <span className="text-blue-500">WebSocket: ACTIVE (0.1ms tick)</span><br/>
            <span className="text-slate-500 italic">Listening: BTC_15M, ETH_15M...</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
