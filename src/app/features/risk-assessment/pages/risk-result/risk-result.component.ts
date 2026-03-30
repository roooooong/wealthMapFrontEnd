import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { StrategyResponse } from '../../models/risk.model';

@Component({
  selector: 'app-risk-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-result.component.html',
  styleUrls: ['./risk-result.component.scss']
}
)
export class RiskResultComponent implements OnInit, AfterViewInit {

  resultData: StrategyResponse | null = null;
  private chart: Chart | null = null;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['result']) {
      this.resultData = navigation.extras.state['result'];
    }
  }

  ngOnInit(): void {
    // 防呆
    if (!this.resultData) {
      alert('無評估資料，請重新進行測驗。');
      this.router.navigate(['/risk-test']);
    }
  }

  ngAfterViewInit(): void {
    if (this.resultData) {
      this.initChart();
    }
  }

  private initChart(): void {
    const ctx = document.getElementById('allocationChart') as HTMLCanvasElement;
    if (!ctx || !this.resultData) return;

    const labels = Object.keys(this.resultData.allocation);
    const dataValues = Object.values(this.resultData.allocation) as number[];
    const wmColors = [
      '#99B3E4', //WM 藍
      '#FFF7AE', //WM 黃
      '#bdffe0', //WM 綠
      '#fbb6c9', //WM 紅
      '#e0c3fc'  //WM 紫
    ];


    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: wmColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: { size: 14, family: '微軟正黑體' }
            }
          },
          tooltip: {
            // 滑鼠移上去顯示百分比
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return ` ${label}: ${value}%`;
              }
            }
          }
        },
        layout: {
          padding: 10
        }
      }
    });
  }

  // 重新測驗按鈕
  retryTest(): void {
    this.router.navigate(['/risk-test']);
  }

  // 前往投資建議頁 
  goToPortfolios(): void {
    alert('此功能正在開發中，將串接您的資產配置進行產品推薦！');
    this.router.navigate(['/main']);
  }
  translateLevel(level: string): string {
    if (!level) return '';
    const upperLevel = level.toUpperCase();

    // 結果翻譯
    switch (upperLevel) {
      case 'CONSERVATIVE': return '保守型';
      case 'DEFENSIVE': return '穩健型';
      case 'BALANCED': return '平衡型';
      case 'GROWTH': return '積極型';
      case 'AGGRESSIVE': return '衝刺型';
      default: return level;
    }
  }
}