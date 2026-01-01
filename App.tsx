
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dashboard from './components/Dashboard';
import { BotConfig, MarketPrice, PnLData, Order, ArbSignal, MarketId } from './types';
import MarketStatusBar from './components/MarketStatusBar';

const MARKETS: MarketId[] = ['BTC', 'ETH', 'SOL', 'XRP'];

const App: React.FC = () => {
  const [config, setConfig] = useState<BotConfig>({
    windowMin: 3,
    movePct: 15,
    isActive: false,
    maxExposure: 1000,
    slippageTolerance: 0.5,
    gasPriority: 'HIGH',
  });

  const [marketPrices, setMarketPrices] = useState<Record<MarketId, MarketPrice[]>>({
    BTC: [], ETH: [], SOL: [], XRP: []
  });
  const [pnlHistory, setPnlHistory] = useState<PnLData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [signals, setSignals] = useState<ArbSignal[]>([]);
  const [currentPnl, setCurrentPnl] = useState(0);

  // Simulation of concurrent multi-market data
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setMarketPrices(prev => {
        const nextState = { ...prev };
        MARKETS.forEach(m => {
          const history = prev[m];
          const lastPrice = history[history.length - 1]?.bestAsk || 0.5;
          
          // Crash simulation per market
          const isCrash = Math.random() < 0.02; // Slightly lower per market to avoid too much noise
          const change = isCrash ? -0.17 : (Math.random() - 0.5) * 0.005;
          const nextAsk = Math.max(0.01, Math.min(0.99, lastPrice + change));
          
          const newPrice: MarketPrice = {
            marketId: m,
            timestamp: now,
            bestAsk: nextAsk,
            bestBid: nextAsk - 0.002,
            volume: Math.random() * 10000,
          };
          nextState[m] = [...history.slice(-100), newPrice];
        });
        return nextState;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Parallel crash detection logic (simulating tokio::spawn behavior)
  useEffect(() => {
    if (!config.isActive) return;

    MARKETS.forEach(m => {
      const prices = marketPrices[m];
      if (prices.length < 2) return;

      const windowMs = config.windowMin * 1000;
      const now = Date.now();
      const windowPrices = prices.filter(p => now - p.timestamp <= windowMs);
      
      if (windowPrices.length < 2) return;

      const maxInWindow = Math.max(...windowPrices.map(p => p.bestAsk));
      const latest = prices[prices.length - 1];
      const drop = ((maxInWindow - latest.bestAsk) / maxInWindow) * 100;

      if (drop >= config.movePct) {
        // Slippage Protection Check
        const estimatedSlippage = Math.random() * 1.0; 
        if (estimatedSlippage > config.slippageTolerance) {
          // Log aborted trade due to slippage
          return;
        }

        const signal: ArbSignal = {
          marketId: m,
          timestamp: now,
          dropPercent: drop,
          basePrice: maxInWindow,
          currentPrice: latest.bestAsk,
          leg1: { id: `L1-${m}-${now}`, type: 'SNIPER', price: latest.bestAsk, status: 'SUCCESS' },
          leg2: null,
        };

        // Two-leg hedge check
        const oppositePrice = 1 - latest.bestAsk + (Math.random() * 0.03);
        if (latest.bestAsk + oppositePrice <= 0.95) {
          signal.leg2 = { id: `L2-${m}-${now}`, type: 'HEDGE', price: oppositePrice, status: 'SUCCESS' };
          setCurrentPnl(prev => prev + (0.95 - (latest.bestAsk + oppositePrice)) * 50);
        }

        setSignals(prev => [signal, ...prev.slice(0, 24)]);
        
        const newOrder: Order = {
          id: `ORD-${m}-${now}`,
          market: m,
          side: 'BUY',
          outcome: 'YES',
          price: latest.bestAsk,
          amount: 50,
          status: 'FILLED',
          type: 'FOK',
          timestamp: now
        };
        setOrders(prev => [newOrder, ...prev.slice(0, 49)]);
      }
    });
  }, [marketPrices, config.isActive, config.movePct, config.windowMin, config.slippageTolerance]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPnlHistory(prev => [
        ...prev.slice(-40),
        { time: new Date().toLocaleTimeString(), value: currentPnl }
      ]);
    }, 1500);
    return () => clearInterval(interval);
  }, [currentPnl]);

  const toggleBot = () => setConfig(c => ({ ...c, isActive: !c.isActive }));
  const killSwitch = () => {
    setConfig(c => ({ ...c, isActive: false }));
    console.warn("CRITICAL: EMERGENCY KILL SWITCH ACTIVATED");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#020617]">
      <div className="scanline"></div>
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-2 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fas fa-bolt text-white text-lg"></i>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tighter italic">QUANT<span className="text-blue-500">BOLT</span> PRO</h1>
              <p className="text-[9px] mono text-slate-500 uppercase leading-none">Polymarket Sniper Engine // v4.0.1 Rust Core</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800 mx-2"></div>
          <MarketStatusBar marketPrices={marketPrices} />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-[11px] mono">
            <div className="flex flex-col">
              <span className="text-slate-500">NET APY (EST)</span>
              <span className="text-blue-400 font-bold">142.8%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500">GAS (GWEI)</span>
              <span className="text-orange-400">42.1 <i className="fas fa-arrow-up text-[8px]"></i></span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={toggleBot}
              className={`px-5 py-2 rounded font-black text-xs transition-all uppercase tracking-widest ${config.isActive ? 'bg-orange-600/20 border border-orange-500 text-orange-500 hover:bg-orange-600/30' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'}`}
            >
              {config.isActive ? 'Stop Engine' : 'Start Engine'}
            </button>
            <button 
              onClick={killSwitch}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20"
            >
              Kill
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4">
        <Dashboard 
          config={config} 
          setConfig={setConfig} 
          prices={marketPrices.BTC} 
          pnlHistory={pnlHistory} 
          orders={orders}
          signals={signals}
        />
      </main>

      {/* Footer Status Bar */}
      <footer className="h-7 border-t border-slate-800 bg-slate-950/90 px-4 flex items-center justify-between text-[10px] mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> WS: CLOB_STREAMS_OK</span>
          <span>LATENCY: 0.18ms</span>
          <span>SIGNER: LOCAL_PRECACHE</span>
        </div>
        <div className="flex gap-4">
          <span className="text-blue-500 font-bold">SLIPPAGE: {config.slippageTolerance}%</span>
          <span>MEM: 14MB</span>
          <span className="text-slate-400">SESSION: 04h 12m 3s</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
