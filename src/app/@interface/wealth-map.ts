export interface WealthMap {
}

export interface UserHolding {
  symbol: string;
  name: string;
}

export interface StrategySetting {
  id?: number;
  symbol: string;
  buyThreshold: number;
  sellThreshold: number;
  isActive: boolean;
  // 以下為前端暫存顯示用
  currentPrice?: number;
  lastClosePrice?: number;
  currentBias?: number;
}
