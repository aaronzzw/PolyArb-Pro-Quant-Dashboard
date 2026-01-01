
export type MarketId = 'BTC' | 'ETH' | 'SOL' | 'XRP';

export interface MarketPrice {
  marketId: MarketId;
  tokenId: string; // The specific Polymarket Token ID (Yes/No)
  timestamp: number;
  bestAsk: number;
  bestBid: number;
  askSize: number; // Available liquidity at Best Ask
  bidSize: number; // Available liquidity at Best Bid
}

export interface Order {
  id: string;
  market: MarketId;
  tokenId: string;
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  amount: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED_DEPTH';
  type: 'FOK' | 'LIMIT';
  timestamp: number;
  latencyMs: number;
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
  executionLatency: number;
}

export interface BotConfig {
  windowMin: number;
  movePct: number;
  isActive: boolean;
  maxExposure: number;
  slippageTolerance: number;
  minLiquidity: number; // Min size at best ask to trigger
  gasPriority: 'LOW' | 'MED' | 'HIGH' | 'MAX';
}

export interface PnLData {
  time: string;
  value: number;
}
