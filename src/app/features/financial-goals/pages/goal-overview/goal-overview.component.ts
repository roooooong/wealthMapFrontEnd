import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 💡 1. 引入我們剛剛建好的 GoalService 和介面 (請確認路徑是否正確)
import { GoalService, FinancialGoal } from '../../services/goal.service';
import { ExampleService } from '../../../../@service/example.service';
import { AssetService } from '../../../assets/services/asset.service';
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
  totalAssetValue: number = 0;

  // 💡 2. 把原本的假資料清掉，宣告一個空的陣列來接後端資料
  goals: FinancialGoal[] = [];

  // 💡 3. 在建構子注入 GoalService 發球機
  constructor(private router: Router,
    private goalService: GoalService,
    private exampleService: ExampleService,
    private assetService: AssetService) { }

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {
      this.role = user.role; // 當角色改變，這裡會自動觸發
      // this.userId = user.id;
      // this.userName = user.name;

      if (this.role === 'USER' || this.role === 'ADMIN') {
        // 只有當確定是「登入狀態」時，才去跟後端要資料
        this.refreshData();
        this.loadTotalAssets();
      }
    });
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

  loadTotalAssets(): void {
    const userId = 1; // 目前寫死 1 號使用者

    this.assetService.getUserAssets(userId).subscribe({
      next: (assets: any[]) => {
        // 加總資產金額 (請確認後端金額欄位名稱是否為 amount)
        this.totalAssetValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
        console.log('目前真實總資產為：', this.totalAssetValue);
      },
      error: (err) => {
        console.error('取得總資產失敗', err);
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

  getGoalProgress(targetAmount: number): number {
    if (!targetAmount || targetAmount === 0) return 0;
    const progress = (this.totalAssetValue / targetAmount) * 100;
    return Math.min(progress, 100); // 確保不會超過 100%
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
