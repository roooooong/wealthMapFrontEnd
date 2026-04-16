import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RiskService } from '../features/risk-assessment/services/risk.service';

@Injectable({
  providedIn: 'root'
})
export class RiskGuard implements CanActivate {

  constructor(
    private riskService: RiskService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    const userId = 1; // 💡 假設的 userId，未來換成登入者的 ID

    // 🌟 在「進入畫面之前」，先問後端
    return this.riskService.checkHasTested(userId).pipe(
      map(res => {
        if (res.hasTested) {
          // 🚨 考過了！直接在門口攔截，帶上大禮包改道去成績單！
          this.router.navigate(['/risk-result'], { state: { data: res } });
          return false; // 取消進入原本的頁面
        }
        return true; // 沒考過，放行進入歡迎頁面
      }),
      catchError((err) => {
        console.error('守衛檢查失敗', err);
        return of(true); // 就算發生錯誤，也先放行讓他進去
      })
    );
  }
}