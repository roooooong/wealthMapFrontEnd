export interface AssetDTO {
    id: number;
    assetName: string;          // 例如：國泰世華活存、台積電、0050 ETF
    symbol?: string;
    assetType: AssetType;      // 例如：CASH, STOCK, FUND
    currentValue: number;       // 目前價值 (台幣)
    cost: number;               // 投資成本
    returnPercentage: number;   // 報酬率
}

export enum AssetType {
    CASH = 'CASH',
    STOCK = 'STOCK',
    FUND = 'FUND',
    BOND = 'BOND',
}
export interface AssetAllocationDto {
    type: AssetType;
    totalAmount: number;
    percentage: number;
}