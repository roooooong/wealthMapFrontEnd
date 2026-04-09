import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-portfolio-recommendation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-recommendation.component.html',
  styleUrls: ['./portfolio-recommendation.component.scss']
})
export class PortfolioRecommendationComponent implements OnInit {

  userLevel: string = '平衡型'; // 預設值
  recommendedList: any[] = [];

  // 💡 預先寫好的 5 套推薦菜單 (Mock Data，業界真實標準組合)
  private portfolioDatabase: any = {
    '保守型': [
      { ticker: '00679B', name: '元大美債20年 ETF', type: '固定收益', allocation: 75, reason: '極低風險，穩定配息' },
      { ticker: '0050', name: '元大台灣50 ETF', type: '權益型資產', allocation: 15, reason: '參與大盤基本成長' },
      { ticker: 'GLD', name: 'SPDR黃金 ETF', type: '另類投資', allocation: 10, reason: '抗通膨與避險' }
    ],
    '穩健型': [
      { ticker: 'BND', name: 'Vanguard 總體債券 ETF', type: '固定收益', allocation: 55, reason: '全球債券分散風險' },
      { ticker: 'VT', name: 'Vanguard 全世界股票 ETF', type: '權益型資產', allocation: 35, reason: '捕捉全球股市成長' },
      { ticker: 'VNQ', name: 'Vanguard 房地產 ETF', type: '另類投資', allocation: 10, reason: '穩定收租抗通膨' }
    ],
    '平衡型': [
      { ticker: 'VT', name: 'Vanguard 全世界股票 ETF', type: '權益型資產', allocation: 50, reason: '全球股票核心配置' },
      { ticker: 'BND', name: 'Vanguard 總體債券 ETF', type: '固定收益', allocation: 35, reason: '提供資產保護傘' },
      { ticker: 'GLD', name: 'SPDR黃金 ETF', type: '另類投資', allocation: 15, reason: '平衡市場波動' }
    ],
    '積極型': [
      { ticker: 'VOO', name: 'Vanguard 標普500 ETF', type: '權益型資產', allocation: 70, reason: '跟隨美國最強企業成長' },
      { ticker: 'TLT', name: 'iShares 20年期以上美債', type: '固定收益', allocation: 15, reason: '對沖股市下行風險' },
      { ticker: 'QQQ', name: 'Invesco 納斯達克100', type: '另類投資', allocation: 15, reason: '重倉科技股獲取超額報酬' }
    ],
    '衝刺型': [
      { ticker: 'QQQ', name: 'Invesco 納斯達克100', type: '權益型資產', allocation: 85, reason: '全押注高成長科技巨頭' },
      { ticker: 'TLT', name: 'iShares 20年期以上美債', type: '固定收益', allocation: 5, reason: '微幅保留流動資金' },
      { ticker: 'ARKK', name: '方舟創新 ETF', type: '另類投資', allocation: 10, reason: '追求破壞式創新極高報酬' }
    ]
  };

  constructor(private router: Router, private location: Location) {
    // 接收從風險結果頁傳來的「風險等級」
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['level']) {
      this.userLevel = navigation.extras.state['level'];
    }
  }

  ngOnInit(): void {
    // 根據使用者的等級，從資料庫(Mock)拉出對應的菜單
    this.recommendedList = this.portfolioDatabase[this.userLevel] || this.portfolioDatabase['平衡型'];
  }

  // 按鈕功能：未來接上資產頁面
  goToAssets() {
    this.router.navigate(['/assets']);
  }

  // 按鈕功能：回首頁
  backToHome() {
    this.router.navigate(['/main']);
  }
  backToResult() {
    this.location.back();
  }
}