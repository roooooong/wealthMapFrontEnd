import { Component, HostListener, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
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
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule, SlicePipe, CurrencyPipe],
  providers: [CurrencyPipe],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  // 三種身分 visitor;user;admin
  // role!:string ;
  role = 'visitor';
  page = 1;

  realTotalAssets: number = 0;

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

  // 切換通知面板
  toggleNotification(event: Event) {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isMenuOpen = false; // 💡 點開鈴鐺時，自動關閉使用者選單
  }

  fetchNotificationDetail(id: number) {
    this.notificationIdDetail = null; // 抓取前先清空，避免畫面閃爍
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/${id}`)
      .subscribe((res: any) => {
        if (res && res.data) {
          this.notificationIdDetail = res.data;
          this.page = 2;
        }
      });
  }

  // 點擊事件：現在只負責換網址
  detail(pageId: number) {
    this.router.navigate(['/system-notification', pageId]);
  }

  // 點擊外面自動關閉 (原本的 HostListener 也要處理它)
  @HostListener('document:click')
  closeAll() {
    this.isNotificationOpen = false;
    this.isMenuOpen = false;
  }

  logout() {
    console.log('執行登出');
    this.isMenuOpen = false;
    // 之後要清空使用者資料
    // this.exampleService.setRole('visitor');
    // 💡 清空使用者資料並清除 localStorage
    // this.exampleService.clearRole();
    this.exampleService.clearUserData();
  }
  // 個人通知格式
  personalList = [
    { tag: '繳款提醒', title: '您的房屋貸款即將於 3 日後扣款，請確認帳戶餘額。', date: '2026-03-22' },
    { tag: '定期定額', title: '本月美股 ETF 投資已扣款成功，點擊查看成交明細。', date: '2026-03-18' },
    { tag: '目標到期', title: '您的「緊急預備金存滿計劃」今日到期，請檢視資產配置。您的「緊急預備金存滿計劃」今日到期，請檢視資產配置。您的「緊急預備金存滿計劃」今日到期，請檢視資產配置。您的「緊急預備金存滿計劃」今日到期，請檢視資產配置。', date: '2026-03-19' }
  ];

  //系統通知格式
  // systemList = [
  //   { tag: '功能', title: '【新功能】全台首創「資產再平衡」建議系統正式上線！', date: '2026-03-19' },
  //   { tag: '維護', title: '【預告】本週六凌晨 02:00 系統維護，屆時暫停服務本週六凌晨 02:00 系統維護，屆時暫停服務本週六凌晨 02:00 系統維護，屆時暫停服務', date: '2026-03-18' },
  //   { tag: '公告', title: '【提醒】保障資產安全，建議每三個月定期更換登入密碼', date: '2026-03-15' },
  //   { tag: '教學', title: '【攻略】如何設定您的第一個「財務目標」？三分鐘上手教學', date: '2026-03-12' }
  // ];

  currentIndex = 0; // 目前顯示的新聞索引



  nextPersonal() {
    this.currentIndex = (this.currentIndex + 1) % this.personalList.length;
  }

  prevPersonal() {
    this.currentIndex = (this.currentIndex - 1 + this.personalList.length) % this.personalList.length;
  }
  login() {
    this.router.navigate(['/login']);
  }
  register() {
    this.router.navigate(['/register']);
  }

  goToRiskTest() {
    this.router.navigate(['/risk-cover']);
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
  // 🌟 貼上這三個新的方法 (取代舊的 initChart)
  // ==========================================

  loadDashboardData(): void {
    const userId = 1; // 目前暫時寫死 1 號使用者

    this.assetService.getAssetAllocation(userId).subscribe({
      next: (data) => {
        // 加總總資產
        this.realTotalAssets = data.reduce((sum, item) => sum + item.totalAmount, 0);
        // 畫圖表
        this.initMainChart(data);
      },
      error: (err) => console.error('主畫面抓取資料失敗', err)
    });
  }

  private initMainChart(allocationData: any[]): void {
    // 注意：這裡的 id 是 'chart'，對應你原本 HTML 裡的 canvas
    const ctx = document.getElementById('chart') as HTMLCanvasElement;
    if (!ctx) return;

    // 強制排序：現金 -> 股票 -> 基金 -> 債券
    const sortOrder = ['CASH', 'STOCK', 'FUND', 'BOND'];
    const sortedData = [...allocationData].sort((a, b) => {
      const indexA = sortOrder.indexOf(a.type);
      const indexB = sortOrder.indexOf(b.type);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    // 配色表 (與主畫面 Icon 風格一致)
    const colorMap: { [key: string]: string } = {
      'CASH': '#1D68A2', 'STOCK': '#8FC3D9', 'FUND': '#FDE0D3', 'BOND': '#F28E76'
    };

    const labels = sortedData.map(item => this.translateAssetType(item.type));
    const dataValues = sortedData.map(item => item.totalAmount);
    const wmColors = sortedData.map(item => colorMap[item.type] || '#cbd5e1');
    const formattedTotal = this.currencyPipe.transform(this.realTotalAssets, 'TWD', 'symbol-narrow', '1.0-0');

    // 圓餅圖中間的字 Plugin
    const centerTextPlugin = {
      id: 'centerText',
      afterDatasetsDraw: (chart: any) => {
        const { ctx, chartArea: { left, right, top, bottom } } = chart;
        ctx.save();
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '14px 微軟正黑體';
        ctx.fillStyle = '#666';
        ctx.fillText('總資產', centerX, centerY - 12);

        ctx.font = 'bold 20px 微軟正黑體';
        ctx.fillStyle = '#333';
        ctx.fillText(formattedTotal || '$0', centerX, centerY + 12);

        ctx.restore();
      }
    };

    new Chart(ctx, {
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

  // 翻譯字典
  translateAssetType(type: string): string {
    const mapping: any = { 'CASH': '現金', 'STOCK': '股票', 'FUND': '基金', 'BOND': '債券' };
    return mapping[type] || type;
  }

  goNewsUrl(newsUrl: string) {
    window.open(newsUrl, '_blank');
  }

  // 這裡是新聞輪播
  newscurrentIndex = 0; // 起始索引
  displayCount = 3;     // 一次顯示幾則

  // 限制新聞出現的數量 目前設定為8則 ((定義Getter 讓HTML直接對它跑迴圈
  get visibleNews() {
    // 💡 增加檢查：如果新聞列表還沒抓到，先回傳空陣列，避免 HTML 報錯
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

  // 向右切換
  next() {
    this.newscurrentIndex = (this.newscurrentIndex + 1) % this.newsList.length;
  }
  // 向左切換
  prev() {
    this.newscurrentIndex = (this.newscurrentIndex - 1 + this.newsList.length) % this.newsList.length;
  }

  today = new Date();
  gettoday!: string;

  ngOnInit() {


    console.log(this.activatedRoute.snapshot.paramMap.get('pageId'));
    this.activatedRoute.params.subscribe(params => {
      const pageId = params['pageId']; // 確保這裡的名稱跟 AppRoutingModule 定義一致

      //取得公告列表
      this.httpClientService.getApi(`http://localhost:8080/api/notifications/list`)
        .subscribe((notificationList: any) => {
          // console.log(notificationList);
          this.notificationList = notificationList;
        })

      //page=1 -> 公告列表 http://localhost:4200/admin-notification-set
      //page=2 -> 公告詳情 http://localhost:4200/admin-notification-set/pageId (後面會接pageId)
      if (pageId) {
        // this.page = 2;
        this.fetchNotificationDetail(pageId);
      } else {
        this.page = 1;
        this.notificationIdDetail = null;
      }
    });

    // this.exampleService.role$.subscribe(newRole => {
    //   this.role = newRole;
    // });
    // console.log('現在身分', this.role);

    this.exampleService.user$.subscribe(newUser => {
      this.role = newUser.role;

      // 當角色變更為可看圖表的身分時
      if (this.role === 'USER' || this.role === 'ADMIN') {
        // 延遲一小段時間確保 HTML 的 <canvas id="chart"> 已經被渲染出來 (@if 判斷完成)
        setTimeout(() => {
          this.loadDashboardData();
        }, 100);
      }
    });
    console.log('現在身分', this.role);

    // 每 5 秒自動切換下一則新聞
    setInterval(() => {
      this.nextPersonal();
    }, 8000);

    // 取得前台新聞列表
    this.httpClientService.getApi(`http://localhost:8080/api/news/user/list`)
      .subscribe((news: any) => {
        console.log('使用者的新聞列表', news);
        this.newsList = news;
      });

    //取得今天日期
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

