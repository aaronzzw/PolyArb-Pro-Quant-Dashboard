
import React from 'react';
import { MarketPrice } from '../types';

interface OrderBookProps {
  prices: MarketPrice[];
}

const OrderBook: React.FC<OrderBookProps> = ({ prices }) => {
  const current = prices[prices.length - 1] || { bestAsk: 0.5, bestBid: 0.498 };
  
  const generateDepth = (base: number, step: number, count: number, side: 'ask' | 'bid') => {
    return Array.from({ length: count }).map((_, i) => {
      const price = side === 'ask' ? base + (i * step) : base - (i * step);
      const size = Math.random() * 8000 + 1000;
      return { price: price.toFixed(3), size: size.toLocaleString(undefined, { maximumFractionDigits: 0 }) };
    });
  };

  const asks = generateDepth(current.bestAsk, 0.001, 10, 'ask').reverse();
  const bids = generateDepth(current.bestBid, 0.001, 10, 'bid');

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CLOB Depth</h3>
        <span className="text-[9px] mono font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">LIVE_FEED</span>
      </div>
      
      <div className="flex-1 p-2 mono text-[10px] overflow-hidden flex flex-col">
        {/* Asks */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end">
          {asks.map((a, i) => (
            <div key={i} className="flex justify-between py-0.5 px-3 relative group transition-colors">
              <div className="absolute right-0 top-0 bottom-0 bg-red-500/5" style={{ width: `${Math.random() * 90}%` }}></div>
              <span className="text-red-400/80 z-10 font-bold">{a.price}</span>
              <span className="text-slate-600 z-10">{a.size}</span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="my-3 py-2 px-3 bg-slate-900 border-y border-slate-800 flex justify-between items-center shadow-inner">
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tighter">{(current.bestAsk || 0).toFixed(3)}</span>
            <span className="text-[8px] text-slate-500 uppercase font-bold">Last Price</span>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-slate-500 uppercase font-bold">Spread</div>
            <div className="text-xs text-blue-400 font-bold mono">0.002 (0.4%)</div>
          </div>
        </div>

        {/* Bids */}
        <div className="flex-1 overflow-hidden">
          {bids.map((b, i) => (
            <div key={i} className="flex justify-between py-0.5 px-3 relative group transition-colors">
              <div className="absolute left-0 top-0 bottom-0 bg-green-500/5" style={{ width: `${Math.random() * 90}%` }}></div>
              <span className="text-green-400/80 z-10 font-bold">{b.price}</span>
              <span className="text-slate-600 z-10">{b.size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
