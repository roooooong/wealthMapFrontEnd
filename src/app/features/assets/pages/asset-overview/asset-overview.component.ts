import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 💡 加上這個，新增表單才有用
import { Chart } from 'chart.js/auto';
import { AssetService } from '../../services/asset.service';
import { AssetDTO, AssetAllocationDto, AssetType } from '../../models/asset.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asset-overview',
  standalone: true,
  imports: [CommonModule, FormsModule], // 💡 確保有 FormsModule
  templateUrl: './asset-overview.component.html',
  styleUrls: ['./asset-overview.component.scss'],
  providers: [CurrencyPipe]
})
export class AssetOverviewComponent implements OnInit {

  userAssets: AssetDTO[] = [];
  allocationData: AssetAllocationDto[] = [];
  totalAssetValue: number = 0;
  private chart: Chart | null = null;

  // 💡 用於新增資產表單的變數
  showAddForm: boolean = false;
  newAssetName: string = '';
  newAssetType: string = 'CASH';
  newAssetAmount: number | null = null;

  unitPrice: number | null = null;
  unitCount: number | null = null;

  calculateTotal(): void {
    if (this.unitPrice != null && this.unitCount != null) {
      this.newAssetAmount = this.unitPrice * this.unitCount;
    }
  }

  constructor(
    private assetService: AssetService,
    private currencyPipe: CurrencyPipe,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // 💡 畫面初始化時，直接從後端抓取真實資料
    this.refreshData();
  }

  // -------------------------------------------------------------
  // 核心邏輯：從後端重新讀取所有資產資料並更新圖表
  // -------------------------------------------------------------
  refreshData(): void {
    const userId = 1; // 暫時寫死 1 號使用者

    // 1. 抓取真實資產清單
    this.assetService.getUserAssets(userId).subscribe({
      next: (assets) => {
        this.userAssets = assets;

        // 2. 抓取圓餅圖分配資料（內部會根據真實資產計算）
        this.assetService.getAssetAllocation(userId).subscribe(data => {
          this.allocationData = data;
          this.totalAssetValue = data.reduce((sum, item) => sum + item.totalAmount, 0);

          // 3. 資料到位後，重新渲染圖表
          this.initChart();
        });
      },
      error: (err) => {
        console.error('後端連線失敗', err);
      }
    });
  }

  // -------------------------------------------------------------
  // 圓餅圖初始化 (保留你原本的樣式與中心文字)
  // -------------------------------------------------------------
  private initChart(): void {
    const ctx = document.getElementById('assetAllocationChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.allocationData.map(item => this.translateAssetType(item.type));

    // 💡 改變 1：把餵給圖表的資料改成「真實金額」
    const dataValues = this.allocationData.map(item => item.totalAmount);
    // 💡 把百分比存起來，等一下提示框會用到
    const percentages = this.allocationData.map(item => item.percentage);

    const wmColors = ['#99B3E4', '#FFF7AE', '#bdffe0', '#fbb6c9'];
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
            callbacks: {
              // 💡 改變 2：自訂提示框的顯示格式
              label: (context) => {
                const value = context.raw as number;
                const percent = percentages[context.dataIndex];
                // 將數字格式化為台幣加上千分位
                const formattedCurrency = new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value);
                return ` ${context.label}: ${formattedCurrency} (${percent}%)`;
              }
            }
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

          ctx.font = '14px 微軟正黑體';
          ctx.fillStyle = '#7f8c8d';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('總資產', centerX, centerY - 15);

          ctx.font = 'bolder 24px 微軟正黑體';
          ctx.fillStyle = '#2c3e50';
          ctx.fillText(formattedTotal || '$0', centerX, centerY + 10);
          ctx.restore();
        }
      }]
    });
  }
  // 💡 如果舊的圖表還在，必須先銷毀，否則滑鼠移上去會閃爍或重疊


  // -------------------------------------------------------------
  // 新增資產動作 (正式接上後端 POST API)
  // -------------------------------------------------------------
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  addAsset(): void {
    if (!this.newAssetName || !this.newAssetAmount) {
      alert('請填寫完整資訊');
      return;
    }

    const payload = {
      name: this.newAssetName,
      type: this.newAssetType,
      amount: this.newAssetAmount
    };

    // 💡 呼叫 Service 送出資料到 Spring Boot
    this.assetService.addAsset(1, payload).subscribe({
      next: (res) => {
        // 新增成功後：
        this.showAddForm = false;     // 1. 關閉表單
        this.newAssetName = '';      // 2. 清空輸入
        this.newAssetAmount = null;
        this.refreshData();          // 3. 重新整理資料，圖表會自動更新！
      },
      error: (err) => {
        alert('新增失敗，請檢查後端是否啟動');
      }
    });
  }

  backToHome(): void {
    this.router.navigate(['/main']);
  }

  translateAssetType(type: string): string {
    switch (type) {
      case 'CASH': return '現金/存款';
      case 'STOCK': return '股票';
      case 'FUND': return '基金';
      case 'BOND': return '債券';
      default: return type;
    }
  }
  deleteAsset(assetId: number, assetName: string): void {
    // 跳出確認視窗，避免誤刪
    if (confirm(`您確定要刪除「${assetName}」這筆紀錄嗎？`)) {
      this.assetService.deleteAsset(assetId).subscribe({
        next: () => {
          // 刪除成功後，重新跟後端要一次最新資料，圖表會自動重算！
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