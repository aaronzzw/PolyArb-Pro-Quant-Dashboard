
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
  const [audit, setAudit] = useState<string>("Analyzing CLOB data streams...");

  useEffect(() => {
    if (signals.length > 0) {
      const runAudit = async () => {
        const result = await getStrategyAudit({ 
          lastSignals: signals.slice(0, 3), 
          config,
          marketIds: ['BTC', 'ETH', 'SOL', 'XRP']
        });
        setAudit(result);
      };
      const timer = setTimeout(runAudit, 4000);
      return () => clearTimeout(timer);
    }
  }, [signals.length]);

  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-3 h-full">
      {/* Control Panel */}
      <div className="col-span-3 row-span-3 bg-[#0d1117] border border-slate-800 rounded-md p-4 flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bot Parameters</h3>
          <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1 rounded mono">CONFIG_V2</span>
        </div>
        
        <div className="space-y-4 flex-1">
          <section>
            <div className="flex justify-between mb-1">
              <label className="text-[9px] text-slate-500 uppercase mono font-bold">Crash Trigger</label>
              <span className="text-[10px] mono text-blue-400 font-bold">-{config.movePct}%</span>
            </div>
            <input 
              type="range" min="5" max="30" step="1"
              value={config.movePct}
              onChange={(e) => setConfig(prev => ({ ...prev, movePct: parseInt(e.target.value) }))}
              className="w-full accent-blue-600 h-1"
            />
          </section>

          <section>
            <div className="flex justify-between mb-1">
              <label className="text-[9px] text-slate-500 uppercase mono font-bold">Min Liquidity (Ask)</label>
              <span className="text-[10px] mono text-cyan-400 font-bold">{config.minLiquidity} SHRS</span>
            </div>
            <input 
              type="range" min="5" max="100" step="5"
              value={config.minLiquidity}
              onChange={(e) => setConfig(prev => ({ ...prev, minLiquidity: parseInt(e.target.value) }))}
              className="w-full accent-cyan-600 h-1"
            />
          </section>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-slate-500 block mb-1 uppercase font-bold">Gas (Priority)</label>
              <select 
                value={config.gasPriority}
                onChange={(e) => setConfig(prev => ({ ...prev, gasPriority: e.target.value as any }))}
                className="bg-[#010409] border border-slate-800 text-[10px] p-1.5 rounded w-full mono text-slate-300 outline-none"
              >
                <option value="HIGH">AGGRESSIVE</option>
                <option value="MAX">FRONT-RUN</option>
                <option value="MED">STABLE</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 block mb-1 uppercase font-bold">Max Expo (USDC)</label>
              <input 
                type="number" 
                value={config.maxExposure}
                onChange={(e) => setConfig(prev => ({ ...prev, maxExposure: parseInt(e.target.value) }))}
                className="bg-[#010409] border border-slate-800 text-[10px] p-1.5 rounded w-full mono text-slate-300 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 p-3 rounded-md border border-slate-800">
           <div className="flex items-center gap-2 mb-1.5">
             <i className="fas fa-brain text-purple-500 text-[10px]"></i>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Strategy Audit</span>
           </div>
           <p className="text-[10px] text-slate-400 italic leading-snug line-clamp-3">
             "{audit}"
           </p>
        </div>
      </div>

      {/* PnL Chart */}
      <div className="col-span-6 row-span-4 bg-[#0d1117] border border-slate-800 rounded-md p-5 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-5 flex gap-6 text-[10px] mono">
            <div className="text-right">
                <div className="text-slate-500 uppercase text-[8px]">Session Max Drawdown</div>
                <div className="text-red-500 font-bold">-0.04%</div>
            </div>
            <div className="text-right">
                <div className="text-slate-500 uppercase text-[8px]">Recovery Factor</div>
                <div className="text-blue-400 font-bold">12.1x</div>
            </div>
        </div>
        
        <div className="flex flex-col gap-1 mb-6">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Aggregate Real-Time PnL</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">
              +${pnlHistory[pnlHistory.length - 1]?.value.toFixed(2) || '0.00'}
            </span>
            <span className="text-[10px] text-green-500 font-bold uppercase mono animate-pulse">Running</span>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pnlHistory}>
              <defs>
                <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #334155', borderRadius: '4px', fontSize: '10px' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPnL)" strokeWidth={1.5} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orderbook Depth View */}
      <div className="col-span-3 row-span-4 bg-[#0d1117] border border-slate-800 rounded-md overflow-hidden flex flex-col">
        <OrderBook prices={prices} />
      </div>

      {/* Real-time Logs */}
      <div className="col-span-3 row-span-3 bg-[#0d1117] border border-slate-800 rounded-md overflow-hidden flex flex-col">
        <TerminalLogs orders={orders} signals={signals} />
      </div>

      {/* Statistics */}
      <div className="col-span-9 row-span-2 bg-[#0d1117] border border-slate-800 rounded-md p-6 overflow-hidden">
        <StatsPanel signals={signals} />
      </div>
    </div>
  );
};

export default Dashboard;
