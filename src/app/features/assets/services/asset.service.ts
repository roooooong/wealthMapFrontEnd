import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs'; //
import { map, tap } from 'rxjs/operators'; //
import { AssetDTO, AssetType, AssetAllocationDto } from '../models/asset.model';


export interface TwStockList {
    stockId: string;
    stockName: string;
    industryCategory: string;
    updateTime: string;
}


@Injectable({
    providedIn: 'root'
})
export class AssetService {

    private apiUrl = 'http://localhost:8080/api/assets';
    // 用來存放查過的股票，格式：{ "2330": "台積電" }
    private stockCache = new Map<string, string>();

    constructor(
        private http: HttpClient
    ) { }

    getUserAssets(userId: number): Observable<AssetDTO[]> {
        return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).pipe(
            // backendAssets = 後端 AssetDTO
            map(backendAssets => {
                return backendAssets.map(item => ({
                    id: item.id,
                    name: item.name,
                    type: item.type as AssetType,
                    amount: item.amount,
                    currentValue: item.cost ?? item.amount,
                    cost: item.cost ?? item.amount,
                    stockId: item.stockId,
                    sharesOwned: item.sharesOwned,
                    returnPercentage: 0,
                }));
            })
        );
    }

    updateAsset(id: number, payload: any): Observable<any> {

        // 注意：這裡的 URL 請配合你檔案中原本的寫法
        // 如果你有宣告 baseUrl (例如 this.apiUrl = 'http://localhost:8080/api/assets')
        // 那就寫成 return this.http.put(`${this.apiUrl}/${id}`, payload);

        // 如果你是直接寫死網址，就用下面這行：
        return this.http.put(`http://localhost:8080/api/assets/${id}`, payload);
    }
    addAsset(userId: number, assetData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${userId}`, assetData);
    }

    getAssetAllocation(userId: number): Observable<AssetAllocationDto[]> {
        return this.getUserAssets(userId).pipe(
            map(assets => {
                // 1. 先過濾掉不屬於「資產配置」範疇的類型
                const filteredAssets = assets.filter(asset =>
                    asset.type !== 'INCOME' && asset.type !== 'EXPENSE'
                );

                const allocationMap = new Map<AssetType, number>();
                let totalAllAssets = 0;

                filteredAssets.forEach(asset => {
                    const assetTypeKey = asset.type as AssetType;
                    const currentTypeTotal = allocationMap.get(assetTypeKey) || 0;

                    allocationMap.set(assetTypeKey, currentTypeTotal + (asset.currentValue || 0));
                    totalAllAssets += (asset.currentValue || 0);
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

    // 根據代碼查詢股票名稱 (具備快取機制)
    getStockNameBySymbol(symbol: string): Observable<string> {
        // 1. 如果快取裡已經有了，就直接吐回去，不發 API
        if (this.stockCache.has(symbol)) {
            return of(this.stockCache.get(symbol)!);
        }

        // 2. 如果沒查過，發送 API 請求給組員的心血
        return this.http.get<any>(`${this.apiUrl}/search-stock/${symbol}`).pipe(
            // 由於組員的回傳格式是 { code: 200, data: { stockName: "台積電" } }
            // 我們用 map 直接把我們要的 "台積電" 萃取出來
            map(res => res.data.stockName),
            // 用 tap 在資料流經過時，順手把它存進快取字典裡
            tap(stockName => this.stockCache.set(symbol, stockName))
        );
    }
    searchStock(symbol: string): Observable<any> {

        if (this.stockCache.has(symbol)) {


            return of({
                code: 200,
                message: '操作成功 (來自前端快取)',
                data: {
                    stockName: this.stockCache.get(symbol)
                }
            });
        }

        return this.http.get<any>(`http://localhost:8080/api/assets/search-stock/${symbol}`).pipe(
            tap(res => {
                // 如果後端有查到資料，我們就偷偷把它抄進小本子裡備用
                if (res && res.code === 200 && res.data) {
                    this.stockCache.set(symbol, res.data.stockName);
                    console.log(`[快取寫入] 📝 已將 ${symbol} (${res.data.stockName}) 記下來了！`);
                }
            })
        );
    }
}
