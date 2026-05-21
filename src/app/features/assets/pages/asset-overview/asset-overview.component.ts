import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { Router } from '@angular/router';
import { ExampleService } from '../../../../@service/example.service';

// 匯入你皁E�E倁EService 舁EModel
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
  // 取征EHTML 中皁E��記�E件
  @ViewChild('formTop') formTopElement!: ElementRef;
  //賁E��變數
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

  //收支紀錁E��數
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

  // --- 淨賁E��變數 (新加入) ---
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
    // 承接身刁E
    this.exampleService.user$.subscribe(user => {
      if (user && user.id && user.id !== 0) {
        this.currentUserId = user.id;
        this.refreshData(); // 拿到真實 ID 後，才去賁E��庫撈他的賁E��
      }
    });

  }

  // -------------------------------------------------------------
  // 核忁E��輯�E�從後端重新讀取賁E��舁E��債賁E��
  // -------------------------------------------------------------
  refreshData(): void {
    // const userId = 1; // 暫時寫死 1 號使用老E

    // 1. 抓取真實賁E��渁E��
    this.assetService.getUserAssets(this.currentUserId).subscribe({
      next: (assets) => {
        this.userAssets = assets.filter((item => item.type !== "INCOME" && item.type !== "EXPENSE"));

        // 抓取圓餁E��刁E�E賁E��
        this.assetService.getAssetAllocation(this.currentUserId).subscribe(data => {
          this.allocationData = data;
          this.totalAssetValue = data.reduce((sum, item) => sum + item.totalAmount, 0);
          this.calculateNetWorth(); // 🌟 重算淨賁E��
          this.initChart();
        });

        // 篩選收支管琁E��E��
        this.userCashflow = assets.filter((item => item.type === "INCOME" || item.type === "EXPENSE"));

      },
      error: (err) => console.error('抓取賁E��失敁E, err)
    });

    // 2. 抓取真實負債渁E�� (新加入)
    this.liabilityService.getLiabilitiesByUserId(this.currentUserId).subscribe({
      next: (liabilities: Liability[]) => {
        this.userLiabilities = liabilities;
        this.totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
        this.calculateNetWorth(); // 🌟 重算淨賁E��
      },
      error: (err: any) => console.error('抓取負債失敁E, err)
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

  // 🌟 股票代號連動方況E
  onStockIdBlur(): void {
    // if (!this.newAssetSymbol || (this.newAssetType !== 'STOCK' && this.newAssetType !== 'FUND')) {
    if (!this.newAssetSymbol || this.newAssetType !== 'STOCK') {
      return;
    }

    this.assetService.searchStock(this.newAssetSymbol).subscribe({
      next: (res: any) => {
        console.log(' 後端回傳皁E��E��長這樣:', res);
        // this.newAssetName ="";
        if (res && res.data && res.data.stockName) {

          this.newAssetName = res.data.stockName;

        } else {
          console.warn('⚠�E�E找不到賁E��', res);
          alert('找不到該股票代號，請確認後�E試�E�E);
          this.newAssetName = '';


          this.newAssetSymbol = '';
        }
      },
      error: (err: any) => {
        console.error('❁E查詢股票失敁E, err);
        alert('股票查詢服務暫時異常�E�請稍後�E試�E�E);


        this.newAssetSymbol = '';
      }
    });
  }


  // 圓餁E��初始化
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
      'CASH': '#1D68A2',  // 現釁E存款 (深藁E
      'STOCK': '#8FC3D9', // 股票 (淺藁E
      'FUND': '#FDE0D3',  // 基釁E(粉橁E
      'BOND': '#F28E76'   // 債券 (珊瑚紁E
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
          ctx.font = '14px 微軟正黑髁E;
          ctx.fillStyle = '#7f8c8d';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('總賁E��', centerX, centerY - 15);
          ctx.font = 'bolder 24px 微軟正黑髁E;
          ctx.fillStyle = '#2c3e50';
          ctx.fillText(formattedTotal || '$0', centerX, centerY + 10);
          ctx.restore();
        }
      }]
    });
  }

  // 賁E�� (Asset) 相關方況E
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
        alert('請填寫完整賁E��E);
        return;
      }
      const isExistStock = this.userAssets.some(s => s.stockId === this.newAssetSymbol);
      if(!this.editingAssetId && isExistStock){
        const isConfirmed = confirm(`${this.newAssetName} 已設置過，確定要�E新增該頁E��嗁E`);

        if (!isConfirmed) {
          // 使用老E��擊「取消」，直接中斷執衁E
          return;
        }
      }
    } else {
      // 1. 基礎檢查
      if (!this.newAssetName || !this.newAssetAmount) {
        alert('請填寫完整賁E��E);
        return;
      }
    }


    // 2. 準備匁E�� Payload
    const payload: any = { // 這裡暫時用 any 或你皁EAssetDTO�E�確保編譯通過
      name: this.newAssetName,
      type: this.newAssetType
    };

    if (this.newAssetType === 'STOCK' || this.newAssetType === 'FUND') {
      payload.stockId = this.newAssetSymbol;
      payload.sharesOwned = this.unitCount || 0;
      payload.cost = this.unitPrice;    //單位�E本價

    }
    payload.amount = this.newAssetAmount; //股票/基釁E股數 * 單位�E本價


    if (this.editingAssetId) {

      this.assetService.updateAsset(this.editingAssetId, payload).subscribe({
        next: () => {

          this.cancelEdit();
          this.refreshData();
          this.exampleService.reloadUserContext(); //全域更新
        },
        error: (err: any) => {
          console.error('修改失敁E, err);

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
          console.error('新增失敁E, err);
          alert('新增失敗，請通知開發老E��E);
        }
      });

    }
  }
  deleteAsset(assetId: number | undefined, assetName: string | undefined): void {

    if (!assetId) {
      console.error("無法刪除�E�找不到賁E�� ID");
      return;
    }

    const name = assetName || '此賁E��'; // 給個預設名字防呁E

    if (confirm(`確定刪除、E{name}」嗎�E�`)) {
      this.assetService.deleteAsset(assetId).subscribe({
        next: () => {

          this.refreshData(); // 重新整琁E��面
          this.exampleService.reloadUserContext(); //全域更新
        },
        error: (err) => {
          console.error('刪除失敁E, err);

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

    // 新增滾動方況E
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


  // 負債 (Liability) 相關方況E

  toggleAddLiabilityForm(): void {
    this.showAddLiabilityForm = !this.showAddLiabilityForm;
    this.showAddAssetForm = false;
    this.showAddCashflowForm = false;
  }

  addLiability(): void {
    if (!this.newLiabilityName || !this.newLiabilityAmount) {
      alert('請填寫完整賁E��E);
      return;
    }

    if ( this.newLiabilityNotifyEnabled && !this.newLiabilitydueDay) {
      alert('請選擁E��款日朁E);
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
      // 修改模弁E
      this.liabilityService.updateLiability(this.editingLiabilityId, payload).subscribe({
        next: () => {
          this.cancelLiabilityEdit();
          this.refreshData();
        },
        error: () => alert('修改失敗，請通知開發老E��E)
      });
    } else {
      // 新增模弁E
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
        error: () => alert('新增失敗，請通知開發老E��E)
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

    // 新增滾動方況E
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
      console.log(`設定在每月 ${this.newLiabilitydueDay} 提�E`);
    } else {
      console.log('使用老E��閉亁E��知');
    }
  }
  daysOptions: string[] = [
    ...Array.from({ length: 31 }, (_, i) => (i + 1).toString())
  ];



  deleteLiability(liabilityId: number, liabilityName: string): void {
    if (confirm(`確定刪除負債、E{liabilityName}」嗎�E�`)) {
      // 偁E��你皁ELiability Model 皁Eid 可以為 null�E�這裡保險起見加個防呁E
      if (!liabilityId) return;

      this.liabilityService.deleteLiability(liabilityId).subscribe({
        next: () => this.refreshData(),
        error: () => alert('刪除失敗，請通知開發老E��E)
      });
    }
  }

  // 收支 相關方況E
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
      alert('請填寫完整賁E��、E);
      return;
    }


    // 2. 準備匁E�� Payload
    const payload: any = { // 這裡暫時用 any 或你皁EAssetDTO�E�確保編譯通過
      name: this.newAssetName,
      type: this.newAssetType
    };

    payload.amount = this.newAssetAmount; //股票/基釁E股數 * 單位�E本價


    if (this.editingAssetId) {

      this.assetService.updateAsset(this.editingAssetId, payload).subscribe({
        next: () => {
          this.cancelCashFlow();
          this.refreshData();
          this.exampleService.reloadUserContext(); //全域更新
        },
        error: (err: any) => {
          console.error('修改失敗，請通知開發老E��E, err);

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
          console.error('新增失敁E, err);
          alert('新增失敗，請通知開發老E��E);
        }
      });

    }
  }

  editCashFlow(asset: any): void {
    this.editingAssetId = asset.id; // 記丁EID�E�進入編輯模弁E
    this.showAddCashflowForm = true;
    this.showAddLiabilityForm = false;
    this.showAddAssetForm = false;

    // 完美對應你皁E��數渁E��
    this.newAssetName = asset.name;
    this.newAssetType = asset.type;
    this.newAssetAmount = asset.currentValue; // 總金顁E

    // 新增滾動方況E
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
      console.error("無法刪除�E�找不到賁E�� ID");
      return;
    }

    const name = assetName; // 給個預設名字防呁E

    if (confirm(`確定刪除、E{name}」嗎�E�`)) {
      this.assetService.deleteAsset(assetId).subscribe({
        next: () => {

          this.refreshData(); // 重新整琁E��面
        },
        error: (err) => {
          console.error('刪除失敁E, err);

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
      case 'CASH': return '現釁E存款';
      case 'STOCK': return '股票';
      case 'FUND': return '基釁E;
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
      case 'OTHER': return '其仁E;
      default: return type;
    }
  }

  // 新增滾動方況E
  scrollToForm() {
    setTimeout(() => {
      if (this.formTopElement) {
        this.formTopElement.nativeElement.scrollIntoView({
          behavior: 'smooth', // 平滑滾勁E
          block: 'start'      // 對齊頂部
        });
      }
    }, 100); // 延遲 100 毫秒確俁EDOM 已渲柁E
  }
}
