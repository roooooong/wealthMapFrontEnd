// src/app/features/assets/models/asset.model.ts

// 1. 資產種類列舉 (維持你原本的，這設計很好)
export enum AssetType {
    CASH = 'CASH',
    STOCK = 'STOCK',
    FUND = 'FUND',
    BOND = 'BOND',
}

// 2. 嚴格對齊後端 Spring Boot 接收格式的 DTO
export interface AssetDTO {
    id?: number;              // 新增時不帶 ID，由後端生成

    // 🌟 基礎共用屬性 (必須與後端 Java 變數名稱 100% 吻合)
    name: string;             // (已從 assetName 改為 name)
    type: AssetType | string; // (已從 assetType 改為 type) 
    amount?: number;          // 現金類專用：總金額

    // 🌟 動態資產專屬屬性 (股票/基金)
    stockId?: string;         // 對應後端 Java 的 @JsonProperty("stockId")
    sharesOwned?: number;     // 對應後端的 double sharesOwned (持有股數)
    totalCost?: number;       // 對應後端的 double totalCost (總成本)

    // 💡 以下為前端顯示與試算輔助用，創建表單時非必填 (?)
    currentValue?: number;    // 目前市值 (未來由股價 API 算好傳回)
    returnPercentage?: number;// 報酬率 (未來由系統算好傳回)
    suggestion?: string;      // 系統建議
}

// 3. 資產配置比例用的 DTO (維持你原本的)
export interface AssetAllocationDto {
    type: AssetType;
    totalAmount: number;
    percentage: number;
}

// 接收單一股票資訊的 DTO
export interface TwStockList {
    stockId: string;
    stockName: string;
    industryCategory: string;
    updateTime: string;
}

// 通用的 API 回傳格式 (對應組員的 code, message, data)
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}