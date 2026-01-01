
import React from 'react';
import { Order, ArbSignal } from '../types';

interface TerminalLogsProps {
  orders: Order[];
  signals: ArbSignal[];
}

const TerminalLogs: React.FC<TerminalLogsProps> = ({ orders, signals }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-black">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Execution Core</h3>
        <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse delay-75"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse delay-150"></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 mono text-[10px] space-y-2 bg-black selection:bg-blue-500/30">
        {signals.length === 0 && (
          <div className="text-slate-700 italic border border-dashed border-slate-800 p-4 text-center rounded">
            [SYS_MONITOR] STANDBY...<br/>ALL_MARKETS_STABLE
          </div>
        )}
        
        {signals.map((sig, i) => (
          <div key={i} className="border-l-2 border-blue-500 pl-3 py-1 mb-3 bg-blue-500/5 group hover:bg-blue-500/10 transition-colors">
            <div className="flex justify-between items-baseline">
              <span className="text-blue-400 font-bold uppercase tracking-tighter">[{sig.marketId}] CRASH_{sig.dropPercent.toFixed(1)}%</span>
              <span className="text-[8px] text-slate-600">{new Date(sig.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-slate-500 text-[9px] mb-1">λ={sig.basePrice.toFixed(3)} → {sig.currentPrice.toFixed(3)} (Δt=3s)</div>
            <div className="space-y-0.5">
                {sig.leg1 && (
                  <div className="text-green-400/90 font-bold">
                    <i className="fas fa-check-double mr-1 text-[8px]"></i> 
                    SNIPE_L1_EXECUTED @ {sig.leg1.price.toFixed(4)}
                  </div>
                )}
                {sig.leg2 && (
                  <div className="text-cyan-400/90 font-bold border-t border-slate-800 mt-1 pt-1">
                    <i className="fas fa-shield-virus mr-1 text-[8px]"></i> 
                    HEDGE_L2_EXECUTED @ {sig.leg2.price.toFixed(4)} (SUM=0.945)
                  </div>
                )}
            </div>
          </div>
        ))}

        {orders.length > 0 && <div className="text-[8px] text-slate-800 uppercase mt-4 mb-2 tracking-[0.2em] font-black border-t border-slate-900 pt-2">Raw Transaction History</div>}
        
        {orders.map((order, i) => (
          <div key={i} className="text-slate-600 border-b border-slate-900 pb-1 flex justify-between">
            <span>{order.market}: {order.side} {order.outcome} @ {order.price.toFixed(3)}</span>
            <span className="text-green-800 font-bold">ACK</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerminalLogs;
