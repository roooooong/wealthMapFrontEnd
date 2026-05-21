import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WealthService {
  private readonly API_BASE = 'https://wealthmapbackend-production-5c68.up.railway.app/api';
  private readonly USERS_API_URL = `${this.API_BASE}/users`;
  private readonly PUBLIC_API_URL = `${this.API_BASE}/wealthmap`; // 萓晉・ Controller 逧・ｷｯ蠕・

  constructor(private http: HttpClient) {}

  // login(data: any): Observable<any> {
  //   return this.http.post(`${this.PUBLIC_API_URL}/login`, data);
  // }
  // register(data: any): Observable<any> {
  //   return this.http.post(`${this.PUBLIC_API_URL}/register`, data);
  // }

  // 蜿門ｾ玲園譛我ｽｿ逕ｨ閠・
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.USERS_API_URL}/users`);
  }

  // 譁ｰ蠅樔ｽｿ逕ｨ閠・
  createUser(user: any): Observable<any> {
    return this.http.post(`${this.USERS_API_URL}/add-users`, user);
  }
  //蠢倩ｨ伜ｯ・｢ｼ
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.USERS_API_URL}/forgot-password`, { email });
  }


}
