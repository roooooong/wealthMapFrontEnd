import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RiskAssessmentRequest } from '../models/risk.model';

@Injectable({
    providedIn: 'root'
})
export class RiskService {
    // TODO: 更新為實際後端 API 網址
    private apiUrl = 'https://wealthmapbackend-production-412c.up.railway.app/api/risk';

    constructor(private http: HttpClient) { }
    //Risk Test頁面計算分數
    evaluateRisk(requestData: RiskAssessmentRequest): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/evaluate`, requestData);
    }
    //藉由riskLevel，抓取投資組合建議
    getRiskResultByLevel(userId: number,level: string): Observable<any>  {
      return this.http.get<any>(`${this.apiUrl}/last-riskresult?user_id=${userId}&level=${level}`);
    }
    checkHasTested(userId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
    }
    // getRecommendations(userId: number) {
    //     return this.http.get<any>(`https://wealthmapbackend-production-412c.up.railway.app/api/portfolio/recommend/${userId}`);
    // }
    getRecommendations(level: string) {
        return this.http.get<any>(`https://wealthmapbackend-production-412c.up.railway.app/api/portfolio/recommend/${level}`);
    }

}
