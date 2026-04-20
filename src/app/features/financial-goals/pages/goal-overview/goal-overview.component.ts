import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 💡 1. 引入我們剛剛建好的 GoalService 和介面 (請確認路徑是否正確)
import { GoalService, FinancialGoal } from '../../services/goal.service';

@Component({
  selector: 'app-goal-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goal-overview.component.html',
  styleUrl: './goal-overview.component.scss',
  providers: [CurrencyPipe]
})
export class GoalOverviewComponent implements OnInit {

  role!: string;

  isLoggedIn: boolean = true;
  showAddForm: boolean = false;

  newGoalName: string = '';
  newGoalAmount: number | null = null;
  newGoalDate: string = '';

  // 💡 2. 把原本的假資料清掉，宣告一個空的陣列來接後端資料
  goals: FinancialGoal[] = [];

  // 💡 3. 在建構子注入 GoalService 發球機
  constructor(private router: Router, private goalService: GoalService) { }

  ngOnInit(): void {
    // 💡 4. 畫面一載入，就去跟後端要資料
    this.refreshData();
  }

  // 🌟 新增一個專門用來重新整理資料的方法
  refreshData(): void {
    const userId = 1; // 暫時寫死 1 號使用者
    this.goalService.getGoals(userId).subscribe({
      next: (data) => {
        this.goals = data; // 把後端傳來的資料塞給畫面
      },
      error: (err) => {
        console.error('取得財務目標失敗', err);
      }
    });
  }

  goRegister(): void {
    this.router.navigate(['/register']);
  }

  backToHome(): void {
    this.router.navigate(['/main']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  // 🌟 5. 正式接上「新增」API
  saveGoal(): void {
    if (!this.newGoalName || !this.newGoalAmount || !this.newGoalDate) {
      alert('請填寫完整目標資訊！');
      return;
    }

    const payload: FinancialGoal = {
      goalName: this.newGoalName,
      targetAmount: this.newGoalAmount,
      currentAmount: 0, // 新目標的目前進度預設為 0
      targetDate: this.newGoalDate
    };

    const userId = 1; // 暫時寫死 1 號使用者
    this.goalService.addGoal(userId, payload).subscribe({
      next: () => {
        // 新增成功後：關閉表單、清空輸入框、重新整理列表
        this.showAddForm = false;
        this.newGoalName = '';
        this.newGoalAmount = null;
        this.newGoalDate = '';
        this.refreshData();
      },
      error: (err) => {
        console.error('新增目標失敗', err);
        alert('新增失敗，請檢查後端連線！');
      }
    });
  }

  deleteGoal(id: number | undefined, name: string): void {
    if (!id) return; // 防呆，確保有 ID

    if (confirm(`確定要放棄「${name}」這個目標嗎？`)) {
      this.goalService.deleteGoal(id).subscribe({
        next: () => {
          // 刪除成功後，重新整理列表
          this.refreshData();
        },
        error: (err) => {
          console.error('刪除失敗', err);
          alert('刪除失敗，請檢查後端連線！');
        }
      });
    }
  }
}
