import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-goal-overview',
  imports: [],
  templateUrl: './goal-overview.component.html',
  styleUrl: './goal-overview.component.scss'
})
export class GoalOverviewComponent implements OnInit {

  // 💡 新增這個變數來模擬是否登入 (你可以自己改成 true 測試原本的畫面)
  isLoggedIn: boolean = false;

  // ... (保留你原本的 goals, newGoalName 等變數)

  constructor(private router: Router) { }

  ngOnInit(): void {
    // ... (保留原本讀取 localStorage 的程式碼)
  }

  // ... (保留原本的 addGoal, totalTargetAmount 等方法)

  backToHome(): void {
    this.router.navigate(['/main']);
  }

  // 💡 新增這個跳轉到登入頁面的方法
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
