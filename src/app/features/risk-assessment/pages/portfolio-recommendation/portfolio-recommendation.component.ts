import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { RiskService } from '../../services/risk.service'; // 🌟 引入你的 Service
import { ExampleService } from '../../../../@service/example.service';

@Component({
  selector: 'app-portfolio-recommendation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-recommendation.component.html',
  styleUrls: ['./portfolio-recommendation.component.scss']
})
export class PortfolioRecommendationComponent implements OnInit {

  userLevel: string = '';
  userLevelChinese: string = '';
  recommendedList: any[] = [];
  isLoading: boolean = true;
  role:string='visitor';
  userId!:number;

  constructor(
    private router: Router,
    private location: Location,
    private riskService: RiskService,
    private exampleService: ExampleService // 🌟 注入 Service
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['level']) {
      console.log(navigation?.extras.state);
      this.userLevelChinese = navigation.extras.state['levelChinese'];
      this.userLevel = navigation.extras.state['level'];
    }
  }

  ngOnInit(): void {
    // const userId = 1; // 💡 測試用 ID

    // 1. 優先判斷路由是否有帶過來的 level (訪客或剛測驗完的會員)
    if (this.userLevel) {
      this.fetchPortfolio(this.userLevel);
    }
    // 2. 訂閱 User 狀態，如果沒有 userLevel 則嘗試從 User Profile 拿
    this.exampleService.user$.subscribe(user => {
      if (user && user.role !== 'visitor') {
        this.userId = user.id;
        if (!this.userLevel && user.riskLevel) {
          this.userLevel = user.riskLevel;
          this.fetchPortfolio(this.userLevel);
        }
      }
    });

  }

  fetchPortfolio(level: string): void {
    this.isLoading = true;
    // 呼叫 API，此處 riskService 需對應新的 URL 結構
    this.riskService.getRecommendations(level).subscribe({
      next: (res: any) => {
        const data = res.data;
        console.log(data);
        this.recommendedList = data.recommendations.map((item: any) => ({
          ticker: item.symbol,
          name: item.name,
          type: item.type,
          // 這裡呼叫下方根據你的定義改寫的占比邏輯
          allocation: this.calculateAlloc(data.riskLevel, item.type),
          reason: item.description
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('獲取推薦組合失敗', err);
        this.isLoading = false;
      }
    });
  }

  // 依照你提供的風險類別配比 (CONSERVATIVE"保守型":15/80/5, DEFENSIVE"穩健型":45/45/10, GROWTH"積極型":75/15/10)
  private calculateAlloc(level: string, type: string): number {
    switch (level) {
      case 'CONSERVATIVE':
        if (type === '權益型資產') return 15;
        if (type === '固定收益') return 40; // 假設有兩個債券標的，平分 80%
        if (type === '另類投資') return 5;
        return 0;
      case 'DEFENSIVE':
        if (type === '權益型資產') return 22.5; // 兩個股票平分 45%
        if (type === '固定收益') return 45;
        if (type === '另類投資') return 10;
        return 0;
      case 'GROWTH':
        if (type === '權益型資產') return 37.5; // 兩個股票平分 75%
        if (type === '固定收益') return 15;
        if (type === '另類投資') return 10;
        return 0;
      default:
        return 33.3;
    }
  }

  goToAssets() { this.router.navigate(['/assets']); }
  backToHome() { this.router.navigate(['/main']); }
  backToResult() { this.location.back(); }
}
