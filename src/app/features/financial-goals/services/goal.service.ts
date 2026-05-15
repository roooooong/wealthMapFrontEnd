import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FinancialGoal {
  id?: number;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  assetId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private apiUrl = 'https://wealthmapbackend-production-412c.up.railway.app/api/goals';

  constructor(private http: HttpClient) { }

  // 取得使用者所有目標
  getGoals(userId: number): Observable<FinancialGoal[]> {
    return this.http.get<FinancialGoal[]>(`${this.apiUrl}/user/${userId}`);
  }

  // 新增目標
  addGoal(userId: number, goal: FinancialGoal): Observable<FinancialGoal> {
    return this.http.post<FinancialGoal>(`${this.apiUrl}/${userId}`, goal);
  }

  // 刪除目標
  deleteGoal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  //修改目標
  updateGoal(id: number, goal: FinancialGoal): Observable<FinancialGoal> {
    return this.http.put<FinancialGoal>(`${this.apiUrl}/${id}`, goal);
  }

}
