import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { AssetService } from '../../services/asset.service';
import { AssetDTO, AssetAllocationDto, AssetType } from '../../models/asset.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asset-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-overview.component.html',
  styleUrls: ['./asset-overview.component.scss'],
  providers: [CurrencyPipe] // 💡 提供 CurrencyPipe 給 TS 裡面的圖表使用
})
export class AssetOverviewComponent implements OnInit, AfterViewInit {

  userAssets: AssetDTO[] = [];
  allocationData: AssetAllocationDto[] = [];
  totalAssetValue: number = 0;
  private chart: Chart | null = null;

  constructor(
    private assetService: AssetService,
    private currencyPipe: CurrencyPipe,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // 1. 抓取清單假資料
    this.assetService.getUserAssets(1).subscribe(assets => {
      this.userAssets = assets;
    });

    // 2. 抓取圓餅圖假資料，並計算總資產
    this.assetService.getAssetAllocation(1).subscribe(data => {
      this.allocationData = data;
      this.totalAssetValue = data.reduce((sum, item) => sum + item.totalAmount, 0);
    });
  }

  ngAfterViewInit(): void {
    // 3. 畫面載入完畢後，開始畫圖
    if (this.allocationData.length > 0) {
      this.initChart();
    }
  }

  private initChart(): void {
    const ctx = document.getElementById('assetAllocationChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = this.allocationData.map(item => this.translateAssetType(item.type));
    const dataValues = this.allocationData.map(item => item.percentage);

    const wmColors = ['#99B3E4', '#FFF7AE', '#bdffe0', '#fbb6c9'];

    // 把數字變成現金
    const formattedTotal = this.currencyPipe.transform(this.totalAssetValue, 'TWD', 'symbol-narrow', '1.0-0');

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: wmColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: { label: (context) => ` ${context.label}: ${context.parsed}%` }
          }
        },
        layout: { padding: 20 }
      },

      plugins: [{
        id: 'centerText',
        afterDraw: (chart) => {
          const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
          ctx.save();
          const centerX = left + width / 2;
          const centerY = top + height / 2;

          // 畫總資產標題
          ctx.font = '14px 微軟正黑體';
          ctx.fillStyle = '#7f8c8d';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('總資產', centerX, centerY - 15);

          // 畫金額數字
          ctx.font = 'bolder 24px 微軟正黑體';
          ctx.fillStyle = '#2c3e50';
          ctx.fillText(formattedTotal || '$0', centerX, centerY + 10);
          ctx.restore();
        }
      }]
    });
  }

  backToHome(): void {
    this.router.navigate(['/main']);
  }

  // 轉成中文
  translateAssetType(type: string): string {
    switch (type) {
      case 'CASH': return '現金/存款';
      case 'STOCK': return '股票';
      case 'FUND': return '基金';
      case 'BOND': return '債券';
      default: return type;
    }
  }

  addAsset(): void {
    alert('開啟新增資產表單！');
  }
}