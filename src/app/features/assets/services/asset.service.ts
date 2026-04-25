import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 💡 引入發射 HTTP 請求的天線
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // 💡 引入資料翻譯機
import { AssetDTO, AssetType, AssetAllocationDto } from '../models/asset.model';

@Injectable({
    providedIn: 'root'
})
export class AssetService {


    private apiUrl = 'http://localhost:8080/api/assets';

    constructor(
        private http: HttpClient
    ) { }

    getUserAssets(userId: number): Observable<AssetDTO[]> {
        return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).pipe(
            map(backendAssets => {
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

    addAsset(userId: number, assetData: any): Observable<any> {

        return this.http.post<any>(`${this.apiUrl}/${userId}`, assetData);
    }

    getAssetAllocation(userId: number): Observable<AssetAllocationDto[]> {
        return this.getUserAssets(userId).pipe(
            map(assets => {
                const allocationMap = new Map<AssetType, number>();
                let totalAllAssets = 0;

                assets.forEach(asset => {
                    const currentTypeTotal = allocationMap.get(asset.assetType) || 0;
                    allocationMap.set(asset.assetType, currentTypeTotal + asset.currentValue);
                    totalAllAssets += asset.currentValue;
                });

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