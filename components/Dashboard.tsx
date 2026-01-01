
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BotConfig, MarketPrice, PnLData, Order, ArbSignal } from '../types';
import StatsPanel from './StatsPanel';
import TerminalLogs from './TerminalLogs';
import OrderBook from './OrderBook';
import { getStrategyAudit } from '../services/geminiService';

interface DashboardProps {
  config: BotConfig;
  setConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
  prices: MarketPrice[];
  pnlHistory: PnLData[];
  orders: Order[];
  signals: ArbSignal[];
}

const Dashboard: React.FC<DashboardProps> = ({ config, setConfig, prices, pnlHistory, orders, signals }) => {
  const [audit, setAudit] = useState<string>("Initializing strategy audit...");

  useEffect(() => {
    if (signals.length > 0) {
      const runAudit = async () => {
        const result = await getStrategyAudit({ 
          lastSignals: signals.slice(0, 3), 
          config 
        });
        setAudit(result);
      };
      const timer = setTimeout(runAudit, 5000);
      return () => clearTimeout(timer);
    }
  }, [signals.length]);

  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-4 h-full">
      {/* Parameters & Risk Controls */}
      <div className="col-span-3 row-span-3 bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex flex-col gap-4">
        <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>Engine Parameters</span>
          <i className="fas fa-microchip"></i>
        </h3>
        
        <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-hide">
          <section>
            <label className="text-[9px] text-slate-500 block mb-1 uppercase mono font-bold tracking-tighter">Crash Threshold (%)</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="5" max="25" step="1"
                value={config.movePct}
                onChange={(e) => setConfig(prev => ({ ...prev, movePct: parseInt(e.target.value) }))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-xs font-bold mono w-8 text-blue-400">{config.movePct}%</span>
            </div>
          </section>

          <section>
            <label className="text-[9px] text-slate-500 block mb-1 uppercase mono font-bold tracking-tighter">Slippage Tolerance (%)</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" min="0.1" max="2.0" step="0.1"
                value={config.slippageTolerance}
                onChange={(e) => setConfig(prev => ({ ...prev, slippageTolerance: parseFloat(e.target.value) }))}
                className="flex-1 accent-cyan-500"
              />
              <span className="text-xs font-bold mono w-8 text-cyan-400">{config.slippageTolerance}%</span>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-slate-500 block mb-1 uppercase mono font-bold tracking-tighter">Gas Priority</label>
              <select 
                value={config.gasPriority}
                onChange={(e) => setConfig(prev => ({ ...prev, gasPriority: e.target.value as any }))}
                className="bg-slate-950 border border-slate-800 text-[10px] p-2 rounded w-full mono font-bold focus:ring-1 focus:ring-blue-500 outline-none text-slate-300"
              >
                <option value="LOW">LOW</option>
                <option value="MED">MED</option>
                <option value="HIGH">HIGH</option>
                <option value="MAX">MAX</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1 uppercase mono font-bold tracking-tighter">Exposure</label>
              <input 
                type="number" 
                value={config.maxExposure}
                onChange={(e) => setConfig(prev => ({ ...prev, maxExposure: parseInt(e.target.value) }))}
                className="bg-slate-950 border border-slate-800 text-[10px] p-2 rounded w-full mono font-bold focus:ring-1 focus:ring-blue-500 outline-none text-slate-300"
              />
            </div>
          </section>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800">
           <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
               <i className="fas fa-brain text-purple-400"></i> AI Audit
             </span>
             <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></span>
           </div>
           <p className="text-[10px] text-slate-400 italic leading-tight line-clamp-4 font-serif">
             "{audit}"
           </p>
        </div>
      </div>

      {/* Equity Chart */}
      <div className="col-span-6 row-span-4 bg-slate-950/40 border border-slate-800 rounded-lg p-5 flex flex-col relative">
        <div className="absolute top-0 right-0 p-4 flex gap-4 text-[10px] mono">
            <div className="text-right">
                <div className="text-slate-500 uppercase">Daily Drawdown</div>
                <div className="text-red-400 font-bold">-0.12%</div>
            </div>
            <div className="text-right">
                <div className="text-slate-500 uppercase">Profit Factor</div>
                <div className="text-green-400 font-bold">2.84</div>
            </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Performance Overview (Aggregated)
          </h3>
        </div>
        <div className="flex-1 min-h-0 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pnlHistory}>
              <defs>
                <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', fontSize: '10px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPnL)" strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-between items-center bg-slate-900/40 p-3 rounded border border-slate-800/50">
            <span className="text-xs text-slate-500 mono uppercase font-bold">Cumulative Net PnL</span>
            <span className="text-3xl font-black text-white tracking-tighter">
              +${pnlHistory[pnlHistory.length - 1]?.value.toFixed(2) || '0.00'}
            </span>
        </div>
      </div>

      {/* CLOB View */}
      <div className="col-span-3 row-span-4 bg-slate-950/40 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
        <OrderBook prices={prices} />
      </div>

      {/* Logs View */}
      <div className="col-span-3 row-span-3 bg-slate-950/40 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
        <TerminalLogs orders={orders} signals={signals} />
      </div>

      {/* Global Stats View */}
      <div className="col-span-9 row-span-2 bg-slate-950/40 border border-slate-800 rounded-lg p-5 overflow-hidden">
        <StatsPanel signals={signals} />
      </div>
    </div>
  );
};

export default Dashboard;
