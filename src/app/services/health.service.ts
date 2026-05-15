import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface HealthRequest {
  income: number;
  expense: number;
  savings: number;
  cash: number;
  mortgage: number;
  carLoan: number;
  personalLoan: number;
  creditCard: number;
  investmentSuccessRate: number;
}

interface HealthResponse {
  L: number;
  DTI: number;
  S: number;
  G: number;
  score: number;
  level?: string;
  advice?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  getAssetGrowth(userId: number) {

    return this.http.get<any[]>(
      `https://wealthmapbackend-production-85e8.up.railway.app/api/health/growth/${userId}`
    );

  }
  private apiUrl = 'https://wealthmapbackend-production-85e8.up.railway.app/api/health';

  constructor(private http: HttpClient) { }


  postHealth(data: HealthRequest): Observable<HealthResponse> {
    return this.http.post<HealthResponse>(this.apiUrl, data);
  }


  getHealth(userId: number): Observable<any> {
    return this.http.get(`https://wealthmapbackend-production-85e8.up.railway.app/api/health/${userId}`);
  }

  calculateHealth(data: any) {
    return this.http.post('https://wealthmapbackend-production-85e8.up.railway.app/api/health', data);
  }


}
