import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-risk-cover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-cover.component.html',
  styleUrls: ['./risk-cover.component.scss']
})
export class RiskCoverComponent {

  // 🌟 因為我們已經把檢查邏輯交給大門守衛 (RiskGuard) 了
  // 所以這裡不需要 isLoading 變數，也不需要寫 ngOnInit 去打 API 了！

  constructor(private router: Router) { }

  // 點擊「開始測驗」按鈕
  goToTest() {
    this.router.navigate(['/risk-test']);
  }

  // 點擊「回首頁」按鈕
  backToHome() {
    this.router.navigate(['/main']);
  }
}