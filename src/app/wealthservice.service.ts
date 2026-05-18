import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WealthService {
  private readonly API_BASE = 'https://wealthmapbackend-production-85e8.up.railway.app/api';
  private readonly USERS_API_URL = `${this.API_BASE}/users`;
  private readonly PUBLIC_API_URL = `${this.API_BASE}/wealthmap`; // 依照 Controller 的路徑

  constructor(private http: HttpClient) {}

  // login(data: any): Observable<any> {
  //   return this.http.post(`${this.PUBLIC_API_URL}/login`, data);
  // }
  // register(data: any): Observable<any> {
  //   return this.http.post(`${this.PUBLIC_API_URL}/register`, data);
  // }

  // 取得所有使用者
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.USERS_API_URL}/users`);
  }

  // 新增使用者
  createUser(user: any): Observable<any> {
    return this.http.post(`${this.USERS_API_URL}/add-users`, user);
  }
  //忘記密碼
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.USERS_API_URL}/forgot-password`, { email });
  }


}
