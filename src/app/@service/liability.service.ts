import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Liability } from '../@interface/liability';

@Injectable({
  providedIn: 'root'
})
export class LiabilityService {
  private apiUrl = 'https://wealthmapbackend-production-85e8.up.railway.app/api/liabilities';

  constructor(private http: HttpClient) { }

  getLiabilitiesByUserId(userId: number): Observable<Liability[]> {
    return this.http.get<Liability[]>(`${this.apiUrl}/user/${userId}`);
  }

  addLiability(userId: number, liability: Liability): Observable<Liability> {
    return this.http.post<Liability>(`${this.apiUrl}/user/${userId}`, liability);
  }

  deleteLiability(liabilityId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${liabilityId}`);
  }

  updateLiability(liabilityId: number, liability: Liability): Observable<Liability> {
    return this.http.put<Liability>(`${this.apiUrl}/${liabilityId}`, liability);
  }
}
