
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
    minLiquidity: 20, // 20 units required at best ask
    gasPriority: 'HIGH',
  });

  const [marketPrices, setMarketPrices] = useState<Record<MarketId, MarketPrice[]>>({
    BTC: [], ETH: [], SOL: [], XRP: []
  });
  const [pnlHistory, setPnlHistory] = useState<PnLData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [signals, setSignals] = useState<ArbSignal[]>([]);
  const [currentPnl, setCurrentPnl] = useState(0);
  const [isEmergencyHedge, setIsEmergencyHedge] = useState(false);

  // SIMULATED RUST BACKEND WEBSOCKET LINK
  useEffect(() => {
    const wsSim = setInterval(() => {
      const now = Date.now();
      
      setMarketPrices(prev => {
        const nextState = { ...prev };
        MARKETS.forEach(m => {
          const history = prev[m];
          const lastPrice = history[history.length - 1]?.bestAsk || 0.5;
          
          const isCrash = Math.random() < 0.015;
          const change = isCrash ? -0.18 : (Math.random() - 0.5) * 0.003;
          const nextAsk = Math.max(0.01, Math.min(0.99, lastPrice + change));
          
          // Simulate dynamic liquidity (Size)
          const askSize = Math.random() * 100;

          const newPrice: MarketPrice = {
            marketId: m,
            tokenId: `0xTOKEN-${m}-15M`,
            timestamp: now,
            bestAsk: nextAsk,
            bestBid: nextAsk - 0.002,
            askSize: askSize,
            bidSize: Math.random() * 100,
          };
          nextState[m] = [...history.slice(-100), newPrice];
        });
        return nextState;
      });
    }, 250); // High frequency tick updates

    return () => clearInterval(wsSim);
  }, []);

  // SNIPER CORE LOGIC (Simulating Rust execution path)
  useEffect(() => {
    if (!config.isActive) return;

    MARKETS.forEach(m => {
      const prices = marketPrices[m];
      if (prices.length < 5) return;

      const latest = prices[prices.length - 1];
      const windowMs = config.windowMin * 1000;
      const now = Date.now();
      const windowPrices = prices.filter(p => now - p.timestamp <= windowMs);
      
      const maxInWindow = Math.max(...windowPrices.map(p => p.bestAsk));
      const drop = ((maxInWindow - latest.bestAsk) / maxInWindow) * 100;

      // TRIGGER: Crash + Sufficient Liquidity
      if (drop >= config.movePct) {
        
        // 1. LIQUIDITY CHECK (CRITICAL FOR SLIPPAGE)
        if (latest.askSize < config.minLiquidity) {
          console.log(`[ENGINE] ${m} SNIPE ABORTED: INSUFFICIENT DEPTH (${latest.askSize.toFixed(1)} < ${config.minLiquidity})`);
          return;
        }

        // 2. PRE-SIGNED EXECUTION (LATENCY < 5ms)
        const latency = Math.random() * 2 + 0.1; // 0.1ms to 2.1ms internal latency

        const signal: ArbSignal = {
          marketId: m,
          timestamp: now,
          dropPercent: drop,
          basePrice: maxInWindow,
          currentPrice: latest.bestAsk,
          executionLatency: latency,
          leg1: { id: `L1-${m}-${now}`, type: 'SNIPER', price: latest.bestAsk, status: 'SUCCESS' },
          leg2: null,
        };

        // 3. TWO-LEG HEDGE CHECK (SUM < 0.95)
        const oppositePrice = 1 - latest.bestAsk + (Math.random() * 0.02);
        if (latest.bestAsk + oppositePrice <= 0.95) {
          signal.leg2 = { id: `L2-${m}-${now}`, type: 'HEDGE', price: oppositePrice, status: 'SUCCESS' };
          setCurrentPnl(prev => prev + (0.95 - (latest.bestAsk + oppositePrice)) * 50);
        } else {
          // If hedge fails, we have a naked position!
          setIsEmergencyHedge(true);
        }

        setSignals(prev => [signal, ...prev.slice(0, 19)]);
        
        const newOrder: Order = {
          id: `ORD-${m}-${now}`,
          market: m,
          tokenId: latest.tokenId,
          side: 'BUY',
          outcome: 'YES',
          price: latest.bestAsk,
          amount: 50,
          status: 'FILLED',
          type: 'FOK',
          timestamp: now,
          latencyMs: latency
        };
        setOrders(prev => [newOrder, ...prev.slice(0, 29)]);
      }
    });
  }, [marketPrices, config.isActive, config.movePct, config.windowMin, config.minLiquidity]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPnlHistory(prev => [
        ...prev.slice(-60),
        { time: new Date().toLocaleTimeString(), value: currentPnl }
      ]);
    }, 2000);
    return () => clearInterval(interval);
  }, [currentPnl]);

  const toggleBot = () => setConfig(c => ({ ...c, isActive: !c.isActive }));
  const killSwitch = () => setConfig(c => ({ ...c, isActive: false }));
  const emergencyClose = () => {
    setIsEmergencyHedge(false);
    setOrders(prev => [{
      id: `KILL-${Date.now()}`,
      market: 'BTC',
      tokenId: 'CLOSE-ALL',
      side: 'SELL',
      outcome: 'YES',
      price: 0.5,
      amount: 0,
      status: 'FILLED',
      type: 'FOK',
      timestamp: Date.now(),
      latencyMs: 1.2
    }, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#010409]">
      <div className="scanline"></div>
      
      {/* High-Performance Header */}
      <nav className="flex items-center justify-between px-6 py-2 border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur-md z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border border-blue-500/50 flex items-center justify-center bg-blue-500/10">
              <i className="fas fa-microchip text-blue-500 text-sm"></i>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-widest mono text-white">POLY<span className="text-blue-500">SNIPER</span>_V4</h1>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[9px] mono text-slate-500 uppercase">Rust Engine 0.12ms Heat-Path</span>
              </div>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <MarketStatusBar marketPrices={marketPrices} />
        </div>

        <div className="flex items-center gap-4">
          {isEmergencyHedge && (
            <div className="px-3 py-1 bg-red-600/10 border border-red-600 rounded flex items-center gap-2 animate-pulse">
              <i className="fas fa-exclamation-triangle text-red-600 text-[10px]"></i>
              <span className="text-[10px] font-bold text-red-600 uppercase">Naked Exposure!</span>
              <button onClick={emergencyClose} className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700">CLOSE ALL</button>
            </div>
          )}

          <div className="flex gap-2">
            <button 
              onClick={toggleBot}
              className={`px-4 py-1.5 rounded font-bold text-[10px] transition-all uppercase tracking-tighter border ${config.isActive ? 'border-orange-500 text-orange-500 hover:bg-orange-500/10' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}
            >
              {config.isActive ? 'Halt Strategy' : 'Start Engine'}
            </button>
            <button 
              onClick={killSwitch}
              className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-[10px] uppercase tracking-tighter"
            >
              Kill
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden p-3">
        <Dashboard 
          config={config} 
          setConfig={setConfig} 
          prices={marketPrices.BTC} 
          pnlHistory={pnlHistory} 
          orders={orders}
          signals={signals}
        />
      </main>

      <footer className="h-6 border-t border-slate-800 bg-[#0d1117] px-4 flex items-center justify-between text-[9px] mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span className="text-green-500"><i className="fas fa-check-circle mr-1"></i> EIP-712 PRE-SIGNED</span>
          <span>RPC_URI: CLOB.POLYMARKET.COM</span>
          <span>ANCHOR: BTC/15M</span>
        </div>
        <div className="flex gap-4">
          <span className="text-blue-400">LIQUIDITY_CHK: >{config.minLiquidity} SHRS</span>
          <span className="text-slate-400 uppercase">Sig Ver: 0x4f...892</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
