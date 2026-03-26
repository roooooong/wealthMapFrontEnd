// src/app/features/assets/services/asset.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AssetDTO, AssetType, AssetAllocationDto } from '../models/asset.model';

@Injectable({
    providedIn: 'root'
})
export class AssetService {

    constructor() { }

    // 假資產清單
    getUserAssets(userId: number): Observable<AssetDTO[]> {
        const mockAssets: AssetDTO[] = [
            { id: 1, assetName: '國泰世華活存', assetType: AssetType.CASH, currentValue: 20000, cost: 19400, returnPercentage: 0.00 },
            { id: 2, assetName: '中信定存', assetType: AssetType.CASH, currentValue: 30000, cost: 29800, returnPercentage: 0.00 },
            { id: 3, assetName: 'Apple Inc. (AAPL)', assetType: AssetType.STOCK, currentValue: 45000, cost: 42000, returnPercentage: 0.00 },
            { id: 4, assetName: '台積電 (2330)', assetType: AssetType.STOCK, currentValue: 35000, cost: 36000, returnPercentage: 0.00 },
            { id: 5, assetName: '全球平衡基金', assetType: AssetType.FUND, currentValue: 15000, cost: 14500, returnPercentage: 0.01 },
            { id: 6, assetName: '美國公債 ETF', assetType: AssetType.BOND, currentValue: 5000, cost: 5100, returnPercentage: -0.01 },
        ];
        return of(mockAssets);
    }

    // 假圓餅圖資料
    getAssetAllocation(userId: number): Observable<AssetAllocationDto[]> {
        const mockAllocation: AssetAllocationDto[] = [
            { type: AssetType.CASH, totalAmount: 50000, percentage: 33.3 },
            { type: AssetType.STOCK, totalAmount: 80000, percentage: 53.3 },
            { type: AssetType.FUND, totalAmount: 15000, percentage: 10.0 },
            { type: AssetType.BOND, totalAmount: 5000, percentage: 3.3 },
        ];
        return of(mockAllocation);
    }
}