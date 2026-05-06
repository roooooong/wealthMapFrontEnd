import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CashFlow } from '../model/cash-flow.model';

@Injectable({
  providedIn: 'root'
})
export class CashFlowService {
  private apiUrl = 'http://localhost:8080/api/cash-flows';

  constructor(private http: HttpClient) { }

  // 取得使用者收支列表
  getHistory(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list/${userId}`);
  }

  // 收支紀錄
  addRecord(data: CashFlow): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, data);
  }

  // 刪除紀錄
  deleteRecord(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }
}