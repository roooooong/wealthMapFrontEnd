import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { RiskService } from '../../services/risk.service'; // 🌟 引入你的 Service

@Component({
  selector: 'app-portfolio-recommendation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-recommendation.component.html',
  styleUrls: ['./portfolio-recommendation.component.scss']
})
export class PortfolioRecommendationComponent implements OnInit {

  userLevel: string = '';
  recommendedList: any[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private location: Location,
    private riskService: RiskService // 🌟 注入 Service
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['level']) {
      this.userLevel = navigation.extras.state['level'];
    }
  }

  ngOnInit(): void {
    const userId = 1; // 💡 測試用 ID

    // 🌟 呼叫後端 API 取得專屬推薦
    this.riskService.getRecommendations(userId).subscribe({
      next: (res) => {
        // 這裡的 res 包含 riskLevel 和 recommendations 陣列
        // 我們要把後端的欄位名稱 (symbol, description) 對應到 HTML 的 (ticker, reason)
        this.recommendedList = res.recommendations.map((item: any) => ({
          ticker: item.symbol,        // 後端 symbol -> 前端 ticker
          name: item.name,
          type: item.type,
          allocation: this.calculateAlloc(res.riskLevel, item.type), // 💡 建議佔比可由後端帶或前端算
          reason: item.description    // 後端 description -> 前端 reason
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('獲取推薦組合失敗', err);
        this.isLoading = false;
      }
    });
  }

  // 💡 輔助方法：根據風險等級與資產類型，簡單分配佔比 (如果後端沒給的話)
  private calculateAlloc(level: string, type: string): number {
    if (level === 'AGGRESSIVE') return type === '股票' ? 45 : 10;
    return 33; // 預設平均分配
  }

  goToAssets() { this.router.navigate(['/assets']); }
  backToHome() { this.router.navigate(['/main']); }
  backToResult() { this.location.back(); }
}