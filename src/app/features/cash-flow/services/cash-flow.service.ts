import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CashFlow } from '../model/cash-flow.model';

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {
  private apiUrl = 'https://wealthmapbackend-production-5c68.up.railway.app/api/cash-flows';

  constructor(private http: HttpClient) { }

  // 取得使用老E��支列表
  getHistory(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list/${userId}`);
  }

  // 收支紀錁E
  addRecord(data: CashFlow): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, data);
  }

  // 刪除紀錁E
  deleteRecord(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }
  // 修正賁E��
  updateRecord(id: number, data: CashFlow): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, data);
  }
}
