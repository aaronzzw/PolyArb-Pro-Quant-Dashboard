
import React from 'react';
import { MarketPrice } from '../types';

interface OrderBookProps {
  prices: MarketPrice[];
}

const OrderBook: React.FC<OrderBookProps> = ({ prices }) => {
  const latest = prices[prices.length - 1] || { bestAsk: 0.5, bestBid: 0.498, askSize: 50, bidSize: 50 };
  
  const generateDepth = (base: number, step: number, count: number, side: 'ask' | 'bid') => {
    return Array.from({ length: count }).map((_, i) => {
      const price = side === 'ask' ? base + (i * step) : base - (i * step);
      const size = i === 0 ? (side === 'ask' ? latest.askSize : latest.bidSize) : Math.random() * 50 + 10;
      return { price: price.toFixed(3), size: size.toFixed(1), rawSize: size };
    });
  };

  const asks = generateDepth(latest.bestAsk, 0.001, 10, 'ask').reverse();
  const bids = generateDepth(latest.bestBid, 0.001, 10, 'bid');

  return (
    <div className="h-full flex flex-col bg-[#010409]">
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-[#0d1117]">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CLOB Depth Feed</h3>
        <span className="text-[9px] mono text-blue-500 border border-blue-500/30 px-1 rounded font-bold uppercase">Tick-By-Tick</span>
      </div>
      
      <div className="flex-1 p-2 mono text-[10px] overflow-hidden flex flex-col">
        {/* Asks */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end">
          {asks.map((a, i) => (
            <div key={i} className={`flex justify-between py-0.5 px-3 relative transition-colors ${i === 9 && a.rawSize < 20 ? 'bg-red-500/5' : ''}`}>
              <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${Math.min(100, a.rawSize)}%` }}></div>
              <span className={`z-10 font-bold ${i === 9 ? 'text-red-400 scale-110 origin-left' : 'text-red-500/60'}`}>{a.price}</span>
              <span className="text-slate-600 z-10">{a.size}</span>
            </div>
          ))}
        </div>

        {/* Mid-Market Area */}
        <div className="my-3 py-3 px-3 bg-[#0d1117] border-y border-slate-800 flex justify-between items-center relative overflow-hidden">
          <div className="flex flex-col relative z-10">
            <span className="text-xl font-black text-white tracking-tighter leading-none">{(latest.bestAsk || 0).toFixed(3)}</span>
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-1">Mid Price</span>
          </div>
          <div className="text-right relative z-10">
            <div className="text-[9px] text-slate-500 font-bold uppercase">Spread</div>
            <div className="text-[10px] text-blue-400 font-black mono mt-0.5">0.40%</div>
          </div>
          <div className="absolute inset-0 bg-blue-500/5 opacity-50"></div>
        </div>

        {/* Bids */}
        <div className="flex-1 overflow-hidden">
          {bids.map((b, i) => (
            <div key={i} className="flex justify-between py-0.5 px-3 relative transition-colors">
              <div className="absolute left-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${Math.min(100, b.rawSize)}%` }}></div>
              <span className={`z-10 font-bold ${i === 0 ? 'text-green-400 scale-110 origin-left' : 'text-green-500/60'}`}>{b.price}</span>
              <span className="text-slate-600 z-10">{b.size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
