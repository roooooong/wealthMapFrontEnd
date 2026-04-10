import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common'; // 💡 引入常用模組與金錢格式
import { FormsModule } from '@angular/forms'; // 💡 引入表單模組

@Component({
  selector: 'app-goal-overview',
  standalone: true,
  imports: [CommonModule, FormsModule], // 💡 記得把它們加進來
  templateUrl: './goal-overview.component.html',
  styleUrl: './goal-overview.component.scss',
  providers: [CurrencyPipe]
})
export class GoalOverviewComponent implements OnInit {

  // 💡 為了開發方便，我們先強制登入！
  isLoggedIn: boolean = true;

  // 控制表單顯示的開關
  showAddForm: boolean = false;

  // 綁定表單輸入框的變數
  newGoalName: string = '';
  newGoalAmount: number | null = null;
  newGoalDate: string = '';

  // 💡 暫時用一筆假資料墊檔，確認畫面有成功出來
  goals: any[] = [
    { id: 1, name: '日本東京之旅', targetAmount: 50000, targetDate: '2024-12-31' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void { }

  backToHome(): void {
    this.router.navigate(['/main']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  saveGoal(): void {
    if (!this.newGoalName || !this.newGoalAmount || !this.newGoalDate) {
      alert('請填寫完整目標資訊！');
      return;
    }
    alert('前端介面已就緒！等一下接上後端 API 就會把資料送出！');
    this.toggleAddForm(); // 關閉表單
  }

  deleteGoal(id: number, name: string): void {
    if (confirm(`確定要放棄「${name}」這個目標嗎？`)) {
      alert('前端介面已就緒！等一下接上 API 就會執行刪除！');
    }
  }
}