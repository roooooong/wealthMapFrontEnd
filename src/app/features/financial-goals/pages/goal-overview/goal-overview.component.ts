import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
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
  // 蜿門ｾ・HTML 荳ｭ逧・ｨ呵ｨ伜・莉ｶ
  @ViewChild('formTop') formTopElement!: ElementRef;

  role: string = 'visitor';
  isLoggedIn: boolean = true;
  showAddForm: boolean = false;
  currentUserId: number = 1;

  // 陦ｨ蝟ｮ隶頑丙
  editingGoalId: number | null = null;
  newGoalName: string = '';
  newGoalAmount: number | null = null;
  newGoalDate: string = '';
  newGoalAssetId: number | null = null; // 邯∝ｮ夂噪雉・箸 ID

  goals: FinancialGoal[] = [];
  userAssets: any[] = []; // 雉・箸荳区級驕ｸ蝟ｮ逕ｨ
  totalAssetValue: number = 0;

  //逶ｮ讓咎℃譛滓凾髢・
  today: string = new Date().toISOString().split('T')[0]; // 譬ｼ蠑・"2026-05-08"

  constructor(
    private router: Router,
    private goalService: GoalService,
    private exampleService: ExampleService,
    private assetService: AssetService
  ) { }

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {
      // if (user) {
      //   this.role = user.role || 'visitor'; // 笨・荳咲ｮ｡譛画ｲ呈怏 id 驛ｽ蜈域峩譁ｰ role
      // }
      if (user && user.id) {
        if (user && user.id && user.id !== 0) {
          this.role = user.role;
          this.currentUserId = user.id;
          // this.refreshData();
          this.loadAssets();
        }
      }
    });
  }

  refreshData(): void {
    this.goalService.getGoals(this.currentUserId).subscribe({
      next: (data) => {
        // this.goals = data;
        this.goals = data.sort((a, b) => {
          const progressA = this.getGoalProgress(a);
          const progressB = this.getGoalProgress(b);

          // 螯よ棡荳蛟句ｮ梧・莠・ｼ御ｸ蛟区ｲ貞ｮ梧・・梧ｲ貞ｮ梧・逧・賜蜑埼擇
          if (progressA >= 100 && progressB < 100) return 1;
          if (progressA < 100 && progressB >= 100) return -1;

          // 螯よ棡迢諷倶ｸ讓｣・悟援謖画律譛滓賜蠎・
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        });
      },

      error: (err) => console.error('蜿門ｾ苓ｲ｡蜍咏岼讓吝､ｱ謨・, err)
    });
  }

  loadAssets(): void {
    this.assetService.getUserAssets(this.currentUserId).subscribe({
      next: (assets: any[]) => {
        this.userAssets = assets;
        this.totalAssetValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
        this.refreshData();
      },
      error: (err) => console.error('蜿門ｾ苓ｳ・箸螟ｱ謨・, err)
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
    // 譁ｰ蠅樊ｻｾ蜍墓婿豕・
    this.scrollToForm();
  }

  saveGoal(): void {
    if (!this.newGoalName || !this.newGoalAmount || !this.newGoalDate) {
      alert('隲句｡ｫ蟇ｫ螳梧紛逶ｮ讓呵ｳ・ｨ奇ｼ・);
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
        error: () => alert('菫ｮ謾ｹ螟ｱ謨・)
      });
    } else {
      this.goalService.addGoal(this.currentUserId, payload).subscribe({
        next: () => { this.resetForm(); this.refreshData(); },
        error: () => alert('譁ｰ蠅槫､ｱ謨・)
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

  // 譬ｸ蠢・ｼ壽ｹ謫夂ｶ∝ｮ夊ｳ・箸謌也ｸｽ雉・箸險育ｮ鈴ｲ蠎ｦ
  getGoalProgress(goal: FinancialGoal): number {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;

    let currentValue = this.totalAssetValue; // 鬆占ｨｭ逕ｨ邵ｽ雉・箸

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

  // 蜿門ｾ礼ｶ∝ｮ夊ｳ・箸蜷咲ｨｱ・磯｡ｯ遉ｺ逕ｨ・・
  getBoundAssetName(assetId: number | null | undefined): string {
    if (!assetId) return '邵ｽ雉・箸';
    const asset = this.userAssets.find(a => a.id === assetId);
    return asset ? asset.name : '譛ｪ遏･雉・箸';
  }

  deleteGoal(id: number | undefined, name: string): void {
    if (!id) return;
    if (confirm(`遒ｺ螳夊ｦ∵叛譽・・{name}縲埼吝狗岼讓吝落・歔)) {
      this.goalService.deleteGoal(id).subscribe({
        next: () => this.refreshData(),
        error: () => alert('蛻ｪ髯､螟ｱ謨・)
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

  // 譁ｰ蠅樊ｻｾ蜍墓婿豕・
  scrollToForm() {
    setTimeout(() => {
      if (this.formTopElement) {
        this.formTopElement.nativeElement.scrollIntoView({
          behavior: 'smooth', // 蟷ｳ貊第ｻｾ蜍・
          block: 'start'      // 蟆埼ｽ企るΚ
        });
      }
    }, 100); // 蟒ｶ驕ｲ 100 豈ｫ遘堤｢ｺ菫・DOM 蟾ｲ貂ｲ譟・
  }
}
