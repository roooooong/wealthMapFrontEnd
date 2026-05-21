import { Component, HostListener, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Chart from 'chart.js/auto';
import { ExampleService } from '../@service/example.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NotificationList } from '../@interface/notification-list';
import { AssetService } from '../features/assets/services/asset.service';
import { HttpClientService } from '../@service/http-client.service';
import { News } from '../@interface/news';
import { SlicePipe } from '@angular/common';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-main',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule, SlicePipe, CurrencyPipe,RouterLinkActive],
  providers: [CurrencyPipe],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  private myLineChart: Chart | undefined;
  private myDoughnutChart: Chart | undefined;
  // 三種身刁Evisitor;user;admin
  role = 'visitor';
  page = 1;
  userId!: number;
  currentIndex = 0; // 目前顯示皁E��聞索弁E
  riskLevel!:string;


  realTotalAssets: number = 0;
  hasAnyHistory: boolean = false;

  private myChart: any;


  constructor(private router: Router,
    private exampleService: ExampleService,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute,
    private assetService: AssetService,
    private currencyPipe: CurrencyPipe
  ) { }

  notificationList!: NotificationList;
  notificationIdDetail!: any;
  newsList: News[] = [];

  isMenuOpen = false;
  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.isNotificationOpen = false;
  }

  isNotificationOpen = false;
  activeTab: 'personal' | 'system' = 'personal';
  hasNewMessage = true;

  // 刁E��通知面板
  toggleNotification(event: Event) {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isMenuOpen = false; // 💡 點開鈴鐺時，�E動關閉使用老E��單
  }

  fetchNotificationDetail(id: number) {
    this.notificationIdDetail = null; // 抓取前�E渁E���E�避免畫面閁E�E
    this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/notifications/${id}`)
      .subscribe((res: any) => {
        if (res && res.data) {
          this.notificationIdDetail = res.data;
          this.page = 2;
        }
      });
  }

  // 點擊事件�E�現在只負責換網址
  detail(pageId: number) {
    this.router.navigate(['/system-notification', pageId]);
  }

  // 點擊外面自動關閁E(原本皁EHostListener 也要處琁E��E
  @HostListener('document:click')
  closeAll() {
    this.isNotificationOpen = false;
    this.isMenuOpen = false;
  }

  logout() {
    console.log('執行登出');
    this.isMenuOpen = false;
    this.exampleService.clearUserData();
  }
  // 個人通知格弁E左右刁E��按�E
  // personalList = [
  //   { tag: '繳款提�E', title: '您皁E��屋貸款即封E�� 3 日後扣款�E�請確認帳戶餘額、E, date: '2026-03-22' },
  // ];
  // nextPersonal() {this.currentIndex = (this.currentIndex + 1) % this.personalList.length;}
  // prevPersonal() {this.currentIndex = (this.currentIndex - 1 + this.personalList.length) % this.personalList.length;}
  // 毁E5 秒�E動�E換下一剁E���E
  // setInterval(() => {this.nextPersonal();}, 8000);

  login() {
    this.router.navigate(['/login']);
  }
  register() {
    this.router.navigate(['/register']);
  }

  goToRiskTest() {
    if(this.role!=='visitor' && this.riskLevel){
      this.router.navigate(['/risk-result']);
    }else{
      this.router.navigate(['/risk-cover']);
    }

  }

  goToAssets() {
    this.router.navigate(['/assets']);
  }
  goToGoals() {
    this.router.navigate(['/goals']);
  }

  setNotification() {
    console.log("Notify");
    this.router.navigate(['/admin/notification-set']);
  }

  setNews() {
    this.router.navigate(['/admin/news']);
  }

  closeNotice() {
    const notice = document.getElementById('notification');
    notice?.remove();
  }
  health() {
    this.router.navigate(['/health']);
  }
  strategy() {
    this.router.navigate(['/strategy']);
  }

  investmentManage() {
    console.log("InvestmentManage");
    this.router.navigate(['/investment-manage']);
  }

  // ==========================================
  // 🌟 貼上這三個新皁E��況E(取代舊的 initChart)
  // ==========================================

  loadDashboardData(): void {
    // const userId = 1; // 目前暫時寫死 1 號使用老E

    this.assetService.getAssetAllocation(this.userId).subscribe({
      next: (data) => {
        // 加總總賁E��
        this.realTotalAssets = data.reduce((sum, item) => sum + item.totalAmount, 0);
        // 畫圖表
        this.initMainChart(data);
      },
      error: (err) => console.error('主畫面抓取賁E��失敁E, err)
    });
  }

  private initMainChart(allocationData: any[]): void {
    //解決舊的圖表邁E��著畫币E���E錯誤皁E��顁E
    const canvasId = 'doughnutChart';
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!ctx) return;

  // 2. 🌟 關鍵修正�E�直接征EChart.js 皁E�E域管琁E��中找出 ID '4' (或任佁EID) 皁E��表並摧毀
  // 這行�E解決「Canvas is already in use」的報錯
  Chart.getChart(canvasId)?.destroy();


    // ==========================================
    // 🌟 老師皁E��命防呁E��制�E�如果有�E圖表�E��E無惁E��銷毀宁E��E
    if (this.myChart) {
      this.myChart.destroy();
    }
    // ==========================================

    // 強制排序：現釁E-> 股票 -> 基釁E-> 債券
    const sortOrder = ['CASH', 'STOCK', 'FUND', 'BOND'];
    const sortedData = [...allocationData].sort((a, b) => {
      const indexA = sortOrder.indexOf(a.type);
      const indexB = sortOrder.indexOf(b.type);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    // 配色表 (舁E��畫面 Icon 風格一致)
    const colorMap: { [key: string]: string } = {
      'CASH': '#1D68A2', 'STOCK': '#8FC3D9', 'FUND': '#FDE0D3', 'BOND': '#F28E76'
    };

    const labels = sortedData.map(item => this.translateAssetType(item.type));
    const dataValues = sortedData.map(item => item.totalAmount);
    const wmColors = sortedData.map(item => colorMap[item.type] || '#cbd5e1');
    const formattedTotal = this.currencyPipe.transform(this.realTotalAssets, 'TWD', 'symbol-narrow', '1.0-0');

    // 圓餁E��中間的孁EPlugin
    const centerTextPlugin = {
      id: 'centerText',
      afterDatasetsDraw: (chart: any) => {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        ctx.save();
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '14px 微軟正黑髁E;
        ctx.fillStyle = '#666';
        ctx.fillText('總賁E��', centerX, centerY - 12);

        ctx.font = 'bold 20px 微軟正黑髁E;
        ctx.fillStyle = '#333';
        ctx.fillText(formattedTotal || '$0', centerX, centerY + 12);

        ctx.restore();
      }
    };

    if (this.myDoughnutChart) {
      this.myDoughnutChart.destroy();
    }

    this.myDoughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: wmColors,
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      plugins: [centerTextPlugin],
      options: {
        cutout: '65%',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 40 },
        plugins: {
          legend: {
            position: 'right',
            align: 'center',
            labels: {
              boxWidth: 40,
              padding: 15,
              font: { size: 12 }
            }
          },
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
                let label = context.label || '';
                if (label) label += ': ';
                if (context.parsed !== null) {
                  label += new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(context.parsed);
                }
                return label;
              }
            }
          }
        }
      }
    });
  }

  // 翻譯字�E
  translateAssetType(type: string): string {
    const mapping: any = { 'CASH': '現釁E, 'STOCK': '股票', 'FUND': '基釁E, 'BOND': '債券' };
    return mapping[type] || type;
  }

  assetChangeChart(assetHistory: any[]) {
    //解決舊的圖表邁E��著畫币E���E錯誤皁E��顁E
    const canvasId = 'assetChangeChart'; // 確保這跟你皁EHTML id 一致
  const ctx2 = document.getElementById(canvasId) as HTMLCanvasElement;

  if (!ctx2) return;

  // 🌟 關鍵修正�E�直接征EChart.js 皁E�E域渁E��中找出這個畫币E��的圖表並銷毀
  const existingChart = Chart.getChart(canvasId);
  if (existingChart) {
    existingChart.destroy();
  }


    const labels = assetHistory.map(item => item.recordDate.slice(5));
    const dataValues = assetHistory.map(item => item.totalAmount);
    this.myLineChart = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: '賁E��走勢圁E,
          data: dataValues,
          borderColor: '#4091c9',
          fill: false,
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              display: false // 隱藏右側數孁E
            },
            grid: {
              display: true, // 保留格孁E
              color: 'rgba(200, 200, 200, 0.2)'
            },
            border: {
              display: false // 🌟 這是新皁E��法，用侁E��代 drawBorder
            }
          },
          x: {
            grid: {
              display: true,
              color: 'rgba(70, 129, 206, 0.1)'
            },
            border: {
              display: false // 🌟 移除 X 軸底緁E
            },
            ticks: {
              font: {
                size: 10 // 👈 在這裡改小字體，預設通常是 12
              },
              color: '#94a3b8', // 也可以頁E��改顏色�E�讓日期看起侁E��一黁E
              autoSkip: true,   // 當日期太寁E��自動跳過一些，避免重疁E
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,          // 設為 true 才會顯示
            text: '賁E��趨勢圁E,  // 這裡寫你想顯示皁E��表名稱
            position: 'bottom',
            color: '#334155',       // 字體顏色
            font: {
              size: 14,             // 字體大封E
              // weight: 'bold'        // 加粁E
            }
          },
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
            enabled: true,
            callbacks: {
              label: (context: any) => ` 總賁E��: $${context.parsed.y.toLocaleString()}`
            }
          }
        },

      }
    });
  }

fullHistoryData: any[] = []; // 儲存從後端拿到皁E��有原始數擁E
currentRange: string = '1M';

updateRange(range: string) {
  this.currentRange = range;
  const now = new Date();
  let startDate = new Date();

  // 根據選擁E��算起始黁E
  switch (range) {
    case '1M': startDate.setMonth(now.getMonth() - 1); break;
    case '6M': startDate.setMonth(now.getMonth() - 6); break;
    case '1Y': startDate.setFullYear(now.getFullYear() - 1); break;
    case '3Y': startDate.setFullYear(now.getFullYear() - 3); break;
  }

  // 1. 過濾數擁E
  const filteredData = this.fullHistoryData.filter(item => {
    return new Date(item.recordDate) >= startDate;
  });

  // 2. 更新圖表
  this.refreshChart(filteredData);
  console.log(range);
}

refreshChart(data: any[]) {
  const labels = data.map(item => item.recordDate.slice(5)); // 取月-日
  const dataValues = data.map(item => item.totalAmount);

  // 更新 Chart.js 物件皁E��擁E
  if (this.myLineChart) {
    this.myLineChart.data.labels = labels;
    this.myLineChart.data.datasets[0].data = dataValues;
    this.myLineChart.update(); // 🌟 關鍵�E�調用 update() 朁E��平滑動畫效果
  } else {
    this.assetChangeChart(data); // 第一次初始化
  }
}

  goNewsUrl(newsUrl: string) {
    window.open(newsUrl, '_blank');
  }
  userManagement(){
    this.router.navigate(['/admin/user-management']);
  }

  // 這裡是新聞輪播
  newscurrentIndex = 0; // 起始索弁E
  displayCount = 3;     // 一次顯示幾剁E

  // 限制新聞�E現皁E��釁E目前設定為8剁E((定義Getter 讓HTML直接對宁E��迴圁E
  get visibleNews() {
    // 💡 增加檢查�E�如果新聞�E表邁E��抓到�E��E回傳空陣列，避允EHTML 報錯
    if (!this.newsList || this.newsList.length === 0) {
      return [];
    }
    const list = [];
    for (let i = 0; i < this.displayCount; i++) {
      // 💡 使用取餘數 (%) 運算子，讓索引永遠在 0~7 之間循環
      const index = (this.newscurrentIndex + i) % 8;
      list.push(this.newsList[index]);
    }
    return list;
  }

  // 向右刁E��
  next() {
    this.newscurrentIndex = (this.newscurrentIndex + 1) % this.newsList.length;
  }
  // 向左刁E��
  prev() {
    this.newscurrentIndex = (this.newscurrentIndex - 1 + this.newsList.length) % this.newsList.length;
  }

  today = new Date();
  gettoday!: string;

  ngOnInit() {

    console.log(this.activatedRoute.snapshot.paramMap.get('pageId'));
    this.activatedRoute.params.subscribe(params => {
      const pageId = params['pageId']; // 確保這裡皁E��稱跁EAppRoutingModule 定義一致

      //取得�E告�E表
      this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/notifications/list`)
        .subscribe((notificationList: any) => {
          // console.log(notificationList);
          this.notificationList = notificationList;
        })

      if (pageId) {
        // this.page = 2;
        this.fetchNotificationDetail(pageId);
      } else {
        this.page = 1;
        this.notificationIdDetail = null;
      }
    });

    this.exampleService.user$.subscribe(user => {
        if (user && user.id && user.id !== 0) {
          this.role = user.role;
          this.userId = user.id;
          this.riskLevel = user.riskLevel;

          // 當身刁E��確時，統籌呼叫所有圖表數擁E
          if (this.role === 'USER' || this.role === 'ADMIN') {
            //同步使用老E��賁E��(用於折線圖)
            this.httpClientService.postApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/asset-history/sync/${this.userId}`)
              .subscribe((totalasset: any) => {
                console.log('同步userid=', this.userId, '皁E��E��');

                //取得使用老E��賁E��(用於折線圖)
                this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/asset-history/${this.userId}`)
                  .subscribe((assetHistory: any) => {
                    console.log('取得userid=', this.userId, '皁E��賁E��變化', assetHistory);
                    if (assetHistory && assetHistory.length > 0) {
                      this.hasAnyHistory = true;
                      this.fullHistoryData = assetHistory;

                      setTimeout(() => {
                        //載�E圓餁E��數擁E
                        this.loadDashboardData();
                        //載�E折線圖數擁E
                        this.assetChangeChart(assetHistory);
                        this.updateRange('1M');
                      }, 150); // 稍微延長一點延遲�E�確俁ECanvas 穩宁E

                    }
                    else {
                      this.hasAnyHistory = false;
                    }
                  });
              });
          }
        }else {
      // 登出時的基礎渁E�� (雖然有重整頁E���E�佁E��寫一次比輁E��險)
      this.role = 'visitor';
      this.hasAnyHistory = false;
      }
      });


    // 取得前台新聞�E表
    this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/news/user/list`)
      .subscribe((news: any) => {
        console.log('使用老E��新聞�E表', news);
        this.newsList = news;
      });

    //取得今天日朁E
    if ((new Date().getMonth() + 1) < 10) {
      if (new Date().getDate() < 10) {
        this.gettoday = new Date().getFullYear() + '-0' + (new Date().getMonth() + 1) + '-0' + new Date().getDate()
      }
      else {
        this.gettoday = new Date().getFullYear() + '-0' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
      }
    }
    else {
      if (new Date().getDate() < 10) {
        this.gettoday = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-0' + new Date().getDate()
      }
      else {
        this.gettoday = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
      }
    }
  }
}
