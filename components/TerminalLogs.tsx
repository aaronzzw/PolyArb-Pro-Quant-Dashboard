
import React from 'react';
import { Order, ArbSignal } from '../types';

interface TerminalLogsProps {
  orders: Order[];
  signals: ArbSignal[];
}

const TerminalLogs: React.FC<TerminalLogsProps> = ({ orders, signals }) => {
  return (
    <div className="h-full flex flex-col bg-[#010409]">
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-[#0d1117]">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Execution Engine</h3>
        <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse delay-100"></span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 mono text-[10px] space-y-3 bg-[#010409]">
        {signals.length === 0 && (
          <div className="text-slate-700 italic border border-dashed border-slate-800/50 p-6 text-center rounded">
            [SYS_READY] LISTENING FOR VOLATILITY SPIKES...
          </div>
        )}
        
        {signals.map((sig, i) => (
          <div key={i} className="border-l-2 border-blue-600 pl-3 py-1 bg-blue-600/5 group hover:bg-blue-600/10 transition-all rounded-r">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-blue-500 font-black uppercase tracking-tighter">[{sig.marketId}] SNIPE_TRIGGER</span>
              <span className="text-[8px] text-slate-600">{new Date(sig.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-[9px] mb-1.5">
              <span className="text-red-500 font-bold">-{sig.dropPercent.toFixed(1)}%</span>
              <span className="text-slate-600 mx-1">/</span>
              <span className="text-slate-400">TICK_LATENCY: {sig.executionLatency.toFixed(2)}ms</span>
            </div>
            <div className="space-y-1">
                {sig.leg1 && (
                  <div className="text-green-400 font-bold border-t border-slate-800/50 pt-1">
                    <i className="fas fa-arrow-right mr-1 text-[8px]"></i> 
                    FOK_ORDER: {sig.leg1.price.toFixed(4)} [SIGNED_LOCAL]
                  </div>
                )}
                {sig.leg2 && (
                  <div className="text-cyan-400 font-bold">
                    <i className="fas fa-shield-alt mr-1 text-[8px]"></i> 
                    HEDGE_H2: {sig.leg2.price.toFixed(4)} [EXECUTED]
                  </div>
                )}
                {!sig.leg2 && (
                  <div className="text-orange-500 font-bold flex items-center gap-1">
                    <i className="fas fa-exclamation-triangle text-[8px]"></i> 
                    HEDGE_FAILED: SUM_RATIO > 0.95
                  </div>
                )}
            </div>
          </div>
        ))}

        {orders.length > 0 && <div className="text-[8px] text-slate-700 uppercase mt-4 mb-2 tracking-[0.2em] font-black border-t border-slate-900 pt-2">Mem-Buffer Snapshot</div>}
        
        {orders.map((order, i) => (
          <div key={i} className="text-slate-600 border-b border-slate-900/50 pb-1 flex justify-between font-mono text-[9px]">
            <span className="truncate">{order.market} {order.side} {order.outcome} @ {order.price.toFixed(3)}</span>
            <span className="text-green-900 font-black">ACK_{order.latencyMs.toFixed(1)}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TerminalLogs;
