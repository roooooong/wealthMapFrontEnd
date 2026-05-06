import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';


// 匯入你的兩個 Service 與 Model
import { AssetService } from '../../services/asset.service';
import { AssetDTO, AssetAllocationDto } from '../../models/asset.model';
import { Liability } from '../../../../@interface/liability';
import { LiabilityService } from '../../../../@service/liability.service';
import { HealthEventService } from '../../../../services/health-event.service';
import { ExampleService } from '../../../../@service/example.service';



@Component({
  selector: 'app-asset-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-overview.component.html',
  styleUrls: ['./asset-overview.component.scss'],
  providers: [CurrencyPipe]
})
export class AssetOverviewComponent implements OnInit {

  // --- 🌟 資產變數 ---
  userAssets: AssetDTO[] = [];
  allocationData: AssetAllocationDto[] = [];
  totalAssetValue: number = 0;
  showAddAssetForm: boolean = false;
  isNotificationEnabled: boolean = false; //------------------
  newAssetName: string = '';
  newAssetType: string = 'CASH';
  newAssetSymbol: string = '';
  newAssetAmount: number | null = null;
  unitPrice: number | null = null;
  unitCount: number | null = null;
  userId: number | null = null;

  // --- 🌟 負債變數 (新加入) ---
  userLiabilities: Liability[] = [];
  totalLiabilities: number = 0;
  showAddLiabilityForm: boolean = false;
  newLiabilityName: string = '';
  newLiabilityCategory: string = 'MORTGAGE'; // 預設為房貸
  newLiabilityAmount: number | null = null;

  // --- 🌟 淨資產變數 (新加入) ---
  netWorth: number = 0;

  private chart: Chart | null = null;

  constructor(
    private assetService: AssetService,
    @Inject(LiabilityService) private liabilityService: LiabilityService, // 💡 注入負債服務
    private currencyPipe: CurrencyPipe,
    private router: Router,
    private healthEventService: HealthEventService,
    private exampleService: ExampleService
  ) { }

  ngOnInit(): void {
    this.exampleService.user$.subscribe(user => {

      if (!user || !user.id) {
        console.log('user 尚未載入完成');
        return;
      }
      this.userId = user.id;

      this.refreshData();

      this.healthEventService.triggerRefresh();
    });
  }

  // -------------------------------------------------------------
  // 核心邏輯：從後端重新讀取資產與負債資料
  // -------------------------------------------------------------
  refreshData(): void {
    if (!this.userId) {
      console.log('userId 尚未取得');
      return;
    }
    // 1. 抓取真實資產清單
    this.assetService.getUserAssets(this.userId!).subscribe({
      next: (assets) => {
        this.userAssets = assets;

        // 抓取圓餅圖分配資料
        this.assetService.getAssetAllocation(this.userId!).subscribe(data => {
          this.allocationData = data;
          this.totalAssetValue = data.reduce((sum, item) => sum + item.totalAmount, 0);
          this.calculateNetWorth(); // 🌟 重算淨資產
          this.initChart();
        });
      },
      error: (err) => console.error('抓取資產失敗', err)
    });

    // 2. 抓取真實負債清單 (新加入)
    this.liabilityService.getLiabilitiesByUserId(this.userId).subscribe({
      next: (liabilities: Liability[]) => {
        this.userLiabilities = liabilities;
        this.totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
        this.calculateNetWorth(); // 🌟 重算淨資產
      },
      error: (err: any) => console.error('抓取負債失敗', err)
    });
  }

  calculateNetWorth(): void {
    this.netWorth = this.totalAssetValue - this.totalLiabilities;
  }

  calculateTotal(): void {
    if (this.unitPrice != null && this.unitCount != null) {
      this.newAssetAmount = this.unitPrice * this.unitCount;
    }
  }

  // -------------------------------------------------------------
  // 圓餅圖初始化 (強制排序 + 質感配色)
  // -------------------------------------------------------------
  private initChart(): void {
    const ctx = document.getElementById('assetAllocationChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.chart) this.chart.destroy();

    // 🌟 1. 定義主畫面的完美順序 (從右上角順時針)
    const sortOrder = ['CASH', 'STOCK', 'FUND', 'BOND'];

    // 🌟 2. 將後端傳來的資料強制依照我們定義的順序「重新排隊」
    const sortedData = [...this.allocationData].sort((a, b) => {
      const indexA = sortOrder.indexOf(a.type);
      const indexB = sortOrder.indexOf(b.type);

      // 如果遇到未知的資產類型，就把它排到最後面 (給予 999 順位)
      const rankA = indexA === -1 ? 999 : indexA;
      const rankB = indexB === -1 ? 999 : indexB;

      return rankA - rankB;
    });

    // 🌟 3. 使用「排好隊」的資料來萃取標籤、數值和百分比
    const labels = sortedData.map(item => this.translateAssetType(item.type));
    const dataValues = sortedData.map(item => item.totalAmount);
    const percentages = sortedData.map(item => item.percentage);

    // 🌟 4. 魔法配色表
    const colorMap: { [key: string]: string } = {
      'CASH': '#1D68A2',  // 現金/存款 (深藍)
      'STOCK': '#8FC3D9', // 股票 (淺藍)
      'FUND': '#FDE0D3',  // 基金 (粉橘)
      'BOND': '#F28E76'   // 債券 (珊瑚紅)
    };

    // 套用配色 (根據排好隊的資料)
    const wmColors = sortedData.map(item => colorMap[item.type] || '#cbd5e1');

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
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const percent = percentages[context.dataIndex];
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

  // -------------------------------------------------------------
  // 資產 (Asset) 相關方法
  // -------------------------------------------------------------
  toggleAddAssetForm(): void {
    this.showAddAssetForm = !this.showAddAssetForm;
    this.showAddLiabilityForm = false; // 💡 確保兩個表單不會同時打開
  }

  addAsset(): void {
    if (!this.newAssetName || !this.newAssetAmount) {
      alert('請填寫完整資訊');
      return;
    }
    if (!this.userId) {
      alert('使用者尚未登入');
      return;
    }
    const payload = {
      name: this.newAssetName,
      type: this.newAssetType,
      amount: this.newAssetAmount
    };


    this.assetService.addAsset(this.userId, payload).subscribe({
      next: () => {
        this.showAddAssetForm = false;
        this.newAssetName = '';
        this.newAssetAmount = null;

        this.refreshData();

        // ⭐⭐ 關鍵
        this.healthEventService.triggerRefresh();
      },
      error: () => alert('新增失敗')
    });
  }

  deleteAsset(assetId: number, assetName: string): void {
    if (confirm(`確定刪除「${assetName}」嗎？`)) {
      this.assetService.deleteAsset(assetId).subscribe({
        next: () => this.refreshData(),
        error: () => alert('刪除失敗')
      });
    }
  }

  // -------------------------------------------------------------
  // 負債 (Liability) 相關方法 (新加入)
  // -------------------------------------------------------------
  toggleAddLiabilityForm(): void {
    this.showAddLiabilityForm = !this.showAddLiabilityForm;
    this.showAddAssetForm = false; // 💡 確保兩個表單不會同時打開
  }

  addLiability(): void {
    if (!this.newLiabilityName || !this.newLiabilityAmount) {
      alert('請填寫完整資訊');
      return;
    }

    if (!this.userId) {
      alert('使用者尚未登入');
      return;
    }
    const payload: Liability = {
      name: this.newLiabilityName,
      category: this.newLiabilityCategory,
      amount: this.newLiabilityAmount
    };

    this.liabilityService.addLiability(this.userId, payload).subscribe({
      next: () => {
        this.showAddLiabilityForm = false;
        this.newLiabilityName = '';
        this.newLiabilityAmount = null;

        this.refreshData();

        // ⭐⭐ 一樣要加
        this.healthEventService.triggerRefresh();
      }
    });
  }

  //-----------------------------------------------------------------------------------------
  notificationDay: string = '1';
  onNotifyChange() {
    if (this.isNotificationEnabled) {
      console.log(`設定在每月 ${this.notificationDay} 提醒`);
    } else {
      console.log('使用者關閉了通知');
    }
  }
  daysOptions: string[] = [
    ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())
  ];
  //-----------------------------------------------------------------------------------------


  deleteLiability(liabilityId: number, liabilityName: string): void {
    if (confirm(`確定刪除負債「${liabilityName}」嗎？`)) {
      // 假設你的 Liability Model 的 id 可以為 null，這裡保險起見加個防呆
      if (!liabilityId) return;

      this.liabilityService.deleteLiability(liabilityId).subscribe({
        next: () => this.refreshData(),
        error: () => alert('刪除失敗')
      });
    }
  }


  // -------------------------------------------------------------
  // 工具方法
  // -------------------------------------------------------------
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

  translateLiabilityType(type: string): string {
    switch (type) {
      case 'MORTGAGE': return '房貸';
      case 'CAR_LOAN': return '車貸';
      case 'PERSONAL_LOAN': return '信貸';
      case 'OTHER': return '其他';
      default: return type;
    }
  }
}
