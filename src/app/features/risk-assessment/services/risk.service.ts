import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RiskAssessmentRequest } from '../models/risk.model';

@Injectable({
    providedIn: 'root'
})
export class RiskService {
    // TODO: 更新為實際後端 API 網址
    private apiUrl = 'http://localhost:8080/api/risk';

    constructor(private http: HttpClient) { }

    evaluateRisk(requestData: RiskAssessmentRequest): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/evaluate`, requestData);
    }
    checkHasTested(userId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
    }
    // getRecommendations(userId: number) {
    //     return this.http.get<any>(`http://localhost:8080/api/portfolio/recommend/${userId}`);
    // }
    getRecommendations(level: string) {
        return this.http.get<any>(`http://localhost:8080/api/portfolio/recommend/${level}`);
    }

}
