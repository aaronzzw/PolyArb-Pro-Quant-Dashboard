
import React from 'react';
import { ArbSignal } from '../types';

interface StatsPanelProps {
  signals: ArbSignal[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ signals }) => {
  const successfulArbs = signals.length;
  const totalVolume = signals.length * 150; // Calibrated volume
  const hedgeRate = (signals.filter(s => s.leg2).length / (signals.length || 1) * 100).toFixed(1);
  const avgDrop = signals.length > 0 ? (signals.reduce((acc, s) => acc + s.dropPercent, 0) / signals.length).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-4 gap-8 h-full items-center">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <i className="fas fa-crosshairs text-blue-500 text-[10px]"></i>
          <span className="text-[10px] text-slate-500 uppercase mono font-black tracking-widest">Snipe Frequency</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white tracking-tighter">{successfulArbs}</span>
          <span className="text-[10px] text-blue-400 mono font-bold uppercase">Triggers / 1h</span>
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <i className="fas fa-link text-cyan-500 text-[10px]"></i>
          <span className="text-[10px] text-slate-500 uppercase mono font-black tracking-widest">Hedge Sync Rate</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white tracking-tighter">{hedgeRate}%</span>
          <span className="text-[10px] text-cyan-400 mono font-bold uppercase">Auto-Coupled</span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <i className="fas fa-wave-square text-orange-500 text-[10px]"></i>
          <span className="text-[10px] text-slate-500 uppercase mono font-black tracking-widest">Avg Trigger Drop</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white tracking-tighter">-{avgDrop}%</span>
          <span className="text-[10px] text-orange-400 mono font-bold uppercase">Volatility Mean</span>
        </div>
      </div>

      <div className="flex flex-col border-l border-slate-800 pl-8 h-full justify-center">
        <div className="bg-gradient-to-r from-blue-900/20 to-transparent border-l-2 border-blue-500 p-3 rounded-r">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Engine Diagnostic</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
            $ cargo check --release <br/>
            <span className="text-green-500">Status: Running O(1) Rolling Sum</span><br/>
            <span className="text-slate-500">Listening: BTC, ETH, SOL, XRP</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
