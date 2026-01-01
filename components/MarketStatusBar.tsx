
import React from 'react';
import { MarketId, MarketPrice } from '../types';

interface MarketStatusBarProps {
  marketPrices: Record<MarketId, MarketPrice[]>;
}

const MarketStatusBar: React.FC<MarketStatusBarProps> = ({ marketPrices }) => {
  const markets: MarketId[] = ['BTC', 'ETH', 'SOL', 'XRP'];

  return (
    <div className="flex gap-4">
      {markets.map(m => {
        const prices = marketPrices[m];
        const current = prices[prices.length - 1];
        const prev = prices[prices.length - 2];
        const change = current && prev ? current.bestAsk - prev.bestAsk : 0;
        const colorClass = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-slate-400';

        return (
          <div key={m} className="flex flex-col min-w-[60px]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400">{m}</span>
              <span className={`text-[8px] font-bold ${colorClass}`}>
                {change !== 0 ? (change > 0 ? '▲' : '▼') : ''}
              </span>
            </div>
            <span className="text-xs font-bold mono tracking-tighter">
              {current ? current.bestAsk.toFixed(3) : '---'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MarketStatusBar;
