import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';
import { ExampleService } from '../../../../@service/example.service';

// 匯入你的兩個 Service 與 Model
import { AssetService } from '../../services/asset.service';
import { AssetDTO, AssetAllocationDto } from '../../models/asset.model';
import { Liability } from '../../../../@interface/liability';
import { LiabilityService } from '../../../../@service/liability.service';

@Component({
  selector: 'app-asset-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-overview.component.html',
  styleUrls: ['./asset-overview.component.scss'],
  providers: [CurrencyPipe, ExampleService]
})
export class AssetOverviewComponent implements OnInit {
  // 取得 HTML 中的標記元件
  @ViewChild('formTop') formTopElement!: ElementRef;
  //資產變數
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
  editingAssetId: number | null = null;
  currentUserId: number = 0;//00
  editingLiabilityId: number | null = null;

  //收支紀錄變數
  showAddCashflowForm: boolean = false;
  userCashflow: AssetDTO[] = [];

  // 負債變數
  userLiabilities: Liability[] = [];
  totalLiabilities: number = 0;
  showAddLiabilityForm: boolean = false;
  newLiabilityName: string = '';
  newLiabilityCategory: string = 'MORTGAGE'; // 預設為房貸
  newLiabilityAmount: number | null = null;
  newLiabilityPayment: number | null = null; //貸款月還款
  newLiabilityNotifyEnabled: boolean = false;  //是否開啟繳款通知
  newLiabilitydueDay: number | null = 1;  //貸款月還款日

  // --- 淨資產變數 (新加入) ---
  netWorth: number = 0;

  private chart: Chart | null = null;

  constructor(
    private assetService: AssetService,
    @Inject(LiabilityService) private liabilityService: LiabilityService, // 💡 注入負債服務
    private currencyPipe: CurrencyPipe,
    private router: Router,
    private exampleService: ExampleService
  ) { }

  ngOnInit(): void {
    // 承接身分
    this.exampleService.user$.subscribe(user => {
      if (user && user.id && user.id !== 0) {
        this.currentUserId = user.id;
        this.refreshData(); // 拿到真實 ID 後，才去資料庫撈他的資產
      }
    });

  }

  // -------------------------------------------------------------
  // 核心邏輯：從後端重新讀取資產與負債資料
  // -------------------------------------------------------------
  refreshData(): void {
    // const userId = 1; // 暫時寫死 1 號使用者

    // 1. 抓取真實資產清單
    this.assetService.getUserAssets(this.currentUserId).subscribe({
      next: (assets) => {
        this.userAssets = assets.filter((item => item.type !== "INCOME" && item.type !== "EXPENSE"));

        // 抓取圓餅圖分配資料
        this.assetService.getAssetAllocation(this.currentUserId).subscribe(data => {
          this.allocationData = data;
          this.totalAssetValue = data.reduce((sum, item) => sum + item.totalAmount, 0);
          this.calculateNetWorth(); // 🌟 重算淨資產
          this.initChart();
        });

        // 篩選收支管理清單
        this.userCashflow = assets.filter((item => item.type === "INCOME" || item.type === "EXPENSE"));

      },
      error: (err) => console.error('抓取資產失敗', err)
    });

    // 2. 抓取真實負債清單 (新加入)
    this.liabilityService.getLiabilitiesByUserId(this.currentUserId).subscribe({
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

  // 🌟 股票代號連動方法
  onStockIdBlur(): void {
    // if (!this.newAssetSymbol || (this.newAssetType !== 'STOCK' && this.newAssetType !== 'FUND')) {
    if (!this.newAssetSymbol || this.newAssetType !== 'STOCK') {
      return;
    }

    this.assetService.searchStock(this.newAssetSymbol).subscribe({
      next: (res: any) => {
        console.log(' 後端回傳的資料長這樣:', res);
        // this.newAssetName ="";
        if (res && res.data && res.data.stockName) {

          this.newAssetName = res.data.stockName;

        } else {
          console.warn('⚠️ 找不到資料', res);
          alert('找不到該股票代號，請確認後再試！');
          this.newAssetName = '';


          this.newAssetSymbol = '';
        }
      },
      error: (err: any) => {
        console.error('❌ 查詢股票失敗', err);
        alert('股票查詢服務暫時異常，請稍後再試！');


        this.newAssetSymbol = '';
      }
    });
  }


  // 圓餅圖初始化
  private initChart(): void {
    const ctx = document.getElementById('assetAllocationChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.chart) this.chart.destroy();

    const sortOrder = ['CASH', 'STOCK', 'FUND', 'BOND'];

    const sortedData = [...this.allocationData].sort((a, b) => {
      const indexA = sortOrder.indexOf(a.type);
      const indexB = sortOrder.indexOf(b.type);

      const rankA = indexA === -1 ? 999 : indexA;
      const rankB = indexB === -1 ? 999 : indexB;

      return rankA - rankB;
    });

    const labels = sortedData.map(item => this.translateAssetType(item.type));
    const dataValues = sortedData.map(item => item.totalAmount);
    const percentages = sortedData.map(item => item.percentage);

    const colorMap: { [key: string]: string } = {
      'CASH': '#1D68A2',  // 現金/存款 (深藍)
      'STOCK': '#8FC3D9', // 股票 (淺藍)
      'FUND': '#FDE0D3',  // 基金 (粉橘)
      'BOND': '#F28E76'   // 債券 (珊瑚紅)
    };

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
            yAlign: 'bottom',
            backgroundColor: 'rgb(255, 255, 255)',
            titleColor: '#333',
            bodyColor: '#666',
            cornerRadius: 20,
            padding: 12,
            borderColor: '#4091c9',
            borderWidth: 1,
            displayColors: false,
            boxPadding: 5,
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

  // 資產 (Asset) 相關方法
  toggleAddAssetForm() {
    this.showAddAssetForm = !this.showAddAssetForm;
    if (this.showAddAssetForm) {
      this.editingAssetId = null;
      this.resetAssetForm();
    }
    this.showAddLiabilityForm = false;
    this.showAddCashflowForm = false;
  }

  addAsset(): void {

    if (this.newAssetType === 'STOCK' || this.newAssetType === 'FUND') {
      if (!this.newAssetName || !this.newAssetAmount || !this.newAssetSymbol) {
        alert('請填寫完整資訊');
        return;
      }
      const isExistStock = this.userAssets.some(s => s.stockId === this.newAssetSymbol);
      if(!this.editingAssetId && isExistStock){
        const isConfirmed = confirm(`${this.newAssetName} 已設置過，確定要再新增該項目嗎?`);

        if (!isConfirmed) {
          // 使用者點擊「取消」，直接中斷執行
          return;
        }
      }
    } else {
      // 1. 基礎檢查
      if (!this.newAssetName || !this.newAssetAmount) {
        alert('請填寫完整資訊');
        return;
      }
    }


    // 2. 準備包裹 Payload
    const payload: any = { // 這裡暫時用 any 或你的 AssetDTO，確保編譯通過
      name: this.newAssetName,
      type: this.newAssetType
    };

    if (this.newAssetType === 'STOCK' || this.newAssetType === 'FUND') {
      payload.stockId = this.newAssetSymbol;
      payload.sharesOwned = this.unitCount || 0;
      payload.cost = this.unitPrice;    //單位成本價

    }
    payload.amount = this.newAssetAmount; //股票/基金:股數 * 單位成本價


    if (this.editingAssetId) {

      this.assetService.updateAsset(this.editingAssetId, payload).subscribe({
        next: () => {

          this.cancelEdit();
          this.refreshData();
          this.exampleService.reloadUserContext(); //全域更新
        },
        error: (err: any) => {
          console.error('修改失敗', err);

        }
      });

    } else {

      this.assetService.addAsset(this.currentUserId, payload).subscribe({
        next: () => {

          this.showAddAssetForm = false;
          this.resetAssetForm();
          this.refreshData();
          this.exampleService.reloadUserContext(); //全域更新
        },
        error: (err: any) => {
          console.error('新增失敗', err);
          alert('新增失敗，請通知開發者。');
        }
      });

    }
  }
  deleteAsset(assetId: number | undefined, assetName: string | undefined): void {

    if (!assetId) {
      console.error("無法刪除：找不到資產 ID");
      return;
    }

    const name = assetName || '此資產'; // 給個預設名字防呆

    if (confirm(`確定刪除「${name}」嗎？`)) {
      this.assetService.deleteAsset(assetId).subscribe({
        next: () => {

          this.refreshData(); // 重新整理畫面
          this.exampleService.reloadUserContext(); //全域更新
        },
        error: (err) => {
          console.error('刪除失敗', err);

        }
      });
    }
  }

  editAsset(asset: any): void {
    this.editingAssetId = asset.id;
    this.showAddAssetForm = true;
    this.showAddLiabilityForm = false;
    this.showAddCashflowForm = false;

    this.newAssetName = asset.name;
    this.newAssetType = asset.type;
    this.newAssetSymbol = asset.stockId ?? '';
    this.unitCount = asset.sharesOwned;
    this.unitPrice = asset.cost ?? null;
    this.newAssetAmount = asset.amount ?? null;

    // 新增滾動方法
    this.scrollToForm();
  }

  cancelEdit() {
    this.editingAssetId = null;
    this.showAddAssetForm = false;
    this.showAddCashflowForm = false;
    this.resetAssetForm();
  }

  resetAssetForm() {
    this.newAssetName = '';
    this.newAssetType = 'CASH';
    this.newAssetSymbol = '';
    this.unitPrice = null;
    this.unitCount = null;
    this.newAssetAmount = null;
    this.editingAssetId = null;
  }


  // 負債 (Liability) 相關方法

  toggleAddLiabilityForm(): void {
    this.showAddLiabilityForm = !this.showAddLiabilityForm;
    this.showAddAssetForm = false;
    this.showAddCashflowForm = false;
  }

  addLiability(): void {
    if (!this.newLiabilityName || !this.newLiabilityAmount) {
      alert('請填寫完整資訊');
      return;
    }

    if ( this.newLiabilityNotifyEnabled && !this.newLiabilitydueDay) {
      alert('請選擇繳款日期');
      return;
    }
    const payload: Liability = {
      name: this.newLiabilityName,
      category: this.newLiabilityCategory,
      amount: this.newLiabilityAmount,
      monthlyPayment: this.newLiabilityPayment,
      notifyEnabled: this.newLiabilityNotifyEnabled,
      dueDay: this.newLiabilitydueDay
    };

    if (this.editingLiabilityId) {
      // 修改模式
      this.liabilityService.updateLiability(this.editingLiabilityId, payload).subscribe({
        next: () => {
          this.cancelLiabilityEdit();
          this.refreshData();
        },
        error: () => alert('修改失敗，請通知開發者。')
      });
    } else {
      // 新增模式
      this.liabilityService.addLiability(this.currentUserId, payload).subscribe({
        next: () => {
          this.showAddLiabilityForm = false;
          this.newLiabilityName = '';
          this.newLiabilityAmount = null;
          this.newLiabilityPayment = null;
          this.newLiabilityNotifyEnabled= false;
          this.newLiabilitydueDay = 1;
          this.refreshData();
        },
        error: () => alert('新增失敗，請通知開發者。')
      });
    }
  }

  editLiability(liability: Liability): void {
    this.editingLiabilityId = liability.id!;
    this.showAddLiabilityForm = true;
    this.showAddAssetForm = false;
    this.showAddCashflowForm = false;
    this.newLiabilityName = liability.name;
    this.newLiabilityCategory = liability.category;
    this.newLiabilityAmount = liability.amount;
    this.newLiabilityPayment = liability.monthlyPayment!;
    this.newLiabilityNotifyEnabled= liability.notifyEnabled;
    this.newLiabilitydueDay = liability.dueDay==null ? 1 : liability.dueDay;

    // 新增滾動方法
    this.scrollToForm();
  }

  cancelLiabilityEdit(): void {
    this.editingLiabilityId = null;
    this.showAddLiabilityForm = false;
    this.newLiabilityName = '';
    this.newLiabilityCategory = 'MORTGAGE';
    this.newLiabilityAmount = null;
    this.newLiabilityPayment = null;
    this.newLiabilityNotifyEnabled= false;
    this.newLiabilitydueDay = 1;
  }


  onNotifyChange() {
    if (this.newLiabilityNotifyEnabled) {
      console.log(`設定在每月 ${this.newLiabilitydueDay} 提醒`);
    } else {
      console.log('使用者關閉了通知');
    }
  }
  daysOptions: string[] = [
    ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())
  ];



  deleteLiability(liabilityId: number, liabilityName: string): void {
    if (confirm(`確定刪除負債「${liabilityName}」嗎？`)) {
      // 假設你的 Liability Model 的 id 可以為 null，這裡保險起見加個防呆
      if (!liabilityId) return;

      this.liabilityService.deleteLiability(liabilityId).subscribe({
        next: () => this.refreshData(),
        error: () => alert('刪除失敗，請通知開發者。')
      });
    }
  }

  // 收支 相關方法
  toggleAddCashflowForm() {
    this.showAddCashflowForm = !this.showAddCashflowForm;
    if (this.showAddCashflowForm) {
      this.editingAssetId = null;
      this.newAssetName =  '';
      this.newAssetType = '';
      this.newAssetAmount = null;
    }
    this.showAddLiabilityForm = false;
    this.showAddAssetForm = false;
  }

  addCashflow(): void {

    if (!this.newAssetName || !this.newAssetType || !this.newAssetAmount) {
      alert('請填寫完整資訊。');
      return;
    }


    // 2. 準備包裹 Payload
    const payload: any = { // 這裡暫時用 any 或你的 AssetDTO，確保編譯通過
      name: this.newAssetName,
      type: this.newAssetType
    };

    payload.amount = this.newAssetAmount; //股票/基金:股數 * 單位成本價


    if (this.editingAssetId) {

      this.assetService.updateAsset(this.editingAssetId, payload).subscribe({
        next: () => {
          this.cancelCashFlow();
          this.refreshData();
          this.exampleService.reloadUserContext(); //全域更新
        },
        error: (err: any) => {
          console.error('修改失敗，請通知開發者。', err);

        }
      });

    } else {

      this.assetService.addAsset(this.currentUserId, payload).subscribe({
        next: () => {

          this.showAddCashflowForm = false;
          this.newAssetName =  '';
          this.newAssetType = '';
          this.newAssetAmount = null;
          this.refreshData();
          this.exampleService.reloadUserContext(); //全域更新
        },
        error: (err: any) => {
          console.error('新增失敗', err);
          alert('新增失敗，請通知開發者。');
        }
      });

    }
  }

  editCashFlow(asset: any): void {
    this.editingAssetId = asset.id; // 記下 ID，進入編輯模式
    this.showAddCashflowForm = true;
    this.showAddLiabilityForm = false;
    this.showAddAssetForm = false;

    // 完美對應你的變數清單
    this.newAssetName = asset.name;
    this.newAssetType = asset.type;
    this.newAssetAmount = asset.currentValue; // 總金額

    // 新增滾動方法
    this.scrollToForm();
  }

  cancelCashFlow(): void {
    this.editingAssetId = null;
    this.showAddCashflowForm = false;

    this.newAssetName =  '';
    this.newAssetType = '';
    this.newAssetAmount = null;
  }

  deleteCashFlow(assetId: number | undefined, assetName: string | undefined): void {
    if (!assetId) {
      console.error("無法刪除：找不到資產 ID");
      return;
    }

    const name = assetName; // 給個預設名字防呆

    if (confirm(`確定刪除「${name}」嗎？`)) {
      this.assetService.deleteAsset(assetId).subscribe({
        next: () => {

          this.refreshData(); // 重新整理畫面
        },
        error: (err) => {
          console.error('刪除失敗', err);

        }
      });
    }
  }


  goToCashFlow(): void {
    this.router.navigate(['/cash-flow']);
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
      case 'INCOME': return '收入';
      case 'EXPENSE': return '支出';
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

  // 新增滾動方法
  scrollToForm() {
    setTimeout(() => {
      if (this.formTopElement) {
        this.formTopElement.nativeElement.scrollIntoView({
          behavior: 'smooth', // 平滑滾動
          block: 'start'      // 對齊頂部
        });
      }
    }, 100); // 延遲 100 毫秒確保 DOM 已渲染
  }
}
