export interface WealthMap {
}

export interface UserHolding {
  symbol: string;
  name: string;
}

export interface StrategySetting {
  id?: number,
  symbol: string,
  buyThreshold: number,
  sellThreshold: number,
  isActive: boolean,
  // 以下為前端暫存顯示用
  currentPrice?: number,
  lastClosePrice?: number,
  currentBias?: number,
  date?:string
}

export interface LoginResponseDTO{
  token: string,
  userId: number,
  role: string,
  userName: string
}

export interface UserApi{
  code:number,
  data:UserInfo,
  message:string
}

export interface UserInfo{
  token: string;
  id:number,
  name:string,
  email:string,
  role:string,
  assets:Array<AssetDTO>,
  investments:Array<InvestmentDTO>,
  financialGoals:Array<FinancialGoalDTO>,
  strategySettings:Array<StrategySettingDTO>
}

export interface AssetDTO{
  id:number,
  name:string,
  symbol:string,
  type:string,
  amount:number
}

export interface InvestmentDTO{
  id:number,
  symbol:string,
  type:string,
  buy_price:number,
  current_price:number,
  quantity:number

}

export interface FinancialGoalDTO{
  id:number,
  goal_name:string,
  current_amount:number,
  target_amount:number,
  target_date:Date

}

export interface StrategySettingDTO{
  id:number,
  symbol:string,
  buyThreshold:number,
  sellThreshold:number,
  isActive:boolean,
}
