
export type MarketId = 'BTC' | 'ETH' | 'SOL' | 'XRP';

export interface MarketPrice {
  marketId: MarketId;
  timestamp: number;
  bestAsk: number;
  bestBid: number;
  volume: number;
}

export interface Order {
  id: string;
  market: MarketId;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  amount: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  type: 'FOK' | 'LIMIT';
  timestamp: number;
}

export interface TradeLeg {
  id: string;
  type: 'SNIPER' | 'HEDGE';
  price: number;
  status: 'SUCCESS' | 'FAILED';
}

export interface ArbSignal {
  marketId: MarketId;
  timestamp: number;
  dropPercent: number;
  basePrice: number;
  currentPrice: number;
  leg1: TradeLeg | null;
  leg2: TradeLeg | null;
}

export interface BotConfig {
  windowMin: number;
  movePct: number;
  isActive: boolean;
  maxExposure: number;
  slippageTolerance: number;
  gasPriority: 'LOW' | 'MED' | 'HIGH' | 'MAX';
}

export interface PnLData {
  time: string;
  value: number;
}
