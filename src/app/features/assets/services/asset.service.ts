import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 💡 引入發射 HTTP 請求的天線
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // 💡 引入資料翻譯機
import { AssetDTO, AssetType, AssetAllocationDto } from '../models/asset.model';

@Injectable({
    providedIn: 'root'
})
export class AssetService {

    // 💡 這是我們剛剛在 Postman 測試成功的後端餐廳網址
    private apiUrl = 'http://localhost:8080/api/assets';

    // 💡 把天線 (HttpClient) 裝進建構子裡
    constructor(private http: HttpClient) { }

    // 1. 從後端取得真實資產，並翻譯成前端看得懂的 AssetDTO
    getUserAssets(userId: number): Observable<AssetDTO[]> {
        // 呼叫 GET http://localhost:8080/api/assets/user/{userId}
        return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).pipe(
            map(backendAssets => {
                // 將後端的 JSON 轉換成前端的 AssetDTO 格式
                return backendAssets.map(item => ({
                    id: item.id,
                    assetName: item.name,        // 對應後端的 name
                    assetType: item.type as AssetType, // 對應後端的 type
                    currentValue: item.amount,   // 對應後端的 amount
                    cost: item.amount,           // 暫時把成本設成跟金額一樣
                    returnPercentage: 0
                }));
            })
        );
    }

    // 2. 新增資產到後端
    addAsset(userId: number, assetData: any): Observable<any> {
        // 呼叫 POST http://localhost:8080/api/assets/{userId}
        return this.http.post<any>(`${this.apiUrl}/${userId}`, assetData);
    }

    // -------------------------------------------------------------
    // 3. 動態計算圓餅圖資料 
    // -------------------------------------------------------------
    getAssetAllocation(userId: number): Observable<AssetAllocationDto[]> {
        return this.getUserAssets(userId).pipe(
            map(assets => {
                // 自動幫你把拿到的真實資產，按類別加總並算出百分比
                const allocationMap = new Map<AssetType, number>();
                let totalAllAssets = 0;

                // 計算各類別總額
                assets.forEach(asset => {
                    const currentTypeTotal = allocationMap.get(asset.assetType) || 0;
                    allocationMap.set(asset.assetType, currentTypeTotal + asset.currentValue);
                    totalAllAssets += asset.currentValue;
                });

                // 轉換成圓餅圖需要的陣列格式
                const allocationArray: AssetAllocationDto[] = [];
                allocationMap.forEach((amount, type) => {
                    allocationArray.push({
                        type: type,
                        totalAmount: amount,
                        percentage: totalAllAssets === 0 ? 0 : Number(((amount / totalAllAssets) * 100).toFixed(1))
                    });
                });

                return allocationArray;
            })
        );
    }
    deleteAsset(assetId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${assetId}`);
    }
}