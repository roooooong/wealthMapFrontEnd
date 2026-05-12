import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  role: string = 'visitor';
  isLoggedIn: boolean = true;
  showAddForm: boolean = false;
  currentUserId: number = 1;

  // 表單變數
  editingGoalId: number | null = null;
  newGoalName: string = '';
  newGoalAmount: number | null = null;
  newGoalDate: string = '';
  newGoalAssetId: number | null = null; // 綁定的資產 ID

  goals: FinancialGoal[] = [];
  userAssets: any[] = []; // 資產下拉選單用
  totalAssetValue: number = 0;

  //目標過期時間
  today: string = new Date().toISOString().split('T')[0]; // 格式 "2026-05-08"

  constructor(
    private router: Router,
    private goalService: GoalService,
    private exampleService: ExampleService,
    private assetService: AssetService
  ) { }

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {
      if (user) {
        this.role = user.role || 'visitor'; // ✅ 不管有沒有 id 都先更新 role
      }
      if (user && user.id) {
        this.currentUserId = user.id;
        this.refreshData();
        this.loadAssets();
      }
    });
  }

  refreshData(): void {
    this.goalService.getGoals(this.currentUserId).subscribe({
      next: (data) => { this.goals = data; },
      error: (err) => console.error('取得財務目標失敗', err)
    });
  }

  loadAssets(): void {
    this.assetService.getUserAssets(this.currentUserId).subscribe({
      next: (assets: any[]) => {
        this.userAssets = assets;
        this.totalAssetValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
      },
      error: (err) => console.error('取得資產失敗', err)
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) this.resetForm();
  }

  editGoal(goal: FinancialGoal): void {
    this.editingGoalId = goal.id!;
    this.showAddForm = true;
    this.newGoalName = goal.goalName;
    this.newGoalAmount = goal.targetAmount;
    this.newGoalDate = goal.targetDate;
    this.newGoalAssetId = goal.assetId ?? null;
  }

  saveGoal(): void {
    if (!this.newGoalName || !this.newGoalAmount || !this.newGoalDate) {
      alert('請填寫完整目標資訊！');
      return;
    }

    const payload: FinancialGoal = {
      goalName: this.newGoalName,
      targetAmount: this.newGoalAmount,
      currentAmount: 0,
      targetDate: this.newGoalDate,
      assetId: this.newGoalAssetId || null
    };

    if (this.editingGoalId) {
      this.goalService.updateGoal(this.editingGoalId, payload).subscribe({
        next: () => { this.resetForm(); this.refreshData(); },
        error: () => alert('修改失敗')
      });
    } else {
      this.goalService.addGoal(this.currentUserId, payload).subscribe({
        next: () => { this.resetForm(); this.refreshData(); },
        error: () => alert('新增失敗')
      });
    }
  }

  resetForm(): void {
    this.showAddForm = false;
    this.editingGoalId = null;
    this.newGoalName = '';
    this.newGoalAmount = null;
    this.newGoalDate = '';
    this.newGoalAssetId = null;
  }

  // 核心：根據綁定資產或總資產計算進度
  getGoalProgress(goal: FinancialGoal): number {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;

    let currentValue = this.totalAssetValue; // 預設用總資產

    if (goal.assetId) {
      const boundAsset = this.userAssets.find(
        a => a.id === goal.assetId &&
          a.type !== 'INCOME' &&
          a.type !== 'EXPENSE'
      );
      currentValue = boundAsset ? boundAsset.currentValue : this.totalAssetValue;
    }

    return Math.min((currentValue / goal.targetAmount) * 100, 100);
  }

  // 取得綁定資產名稱（顯示用）
  getBoundAssetName(assetId: number | null | undefined): string {
    if (!assetId) return '總資產';
    const asset = this.userAssets.find(a => a.id === assetId);
    return asset ? asset.name : '未知資產';
  }

  deleteGoal(id: number | undefined, name: string): void {
    if (!id) return;
    if (confirm(`確定要放棄「${name}」這個目標嗎？`)) {
      this.goalService.deleteGoal(id).subscribe({
        next: () => this.refreshData(),
        error: () => alert('刪除失敗')
      });
    }
  }

  backToHome(): void { this.router.navigate(['/main']); }
  goRegister(): void { this.router.navigate(['/register']); }
  goToLogin(): void { this.router.navigate(['/login']); }

  isOverdue(targetDate: string): boolean {
    if (!targetDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    return target < today && this.getGoalProgress({ targetDate } as any) < 100;
  }
}
