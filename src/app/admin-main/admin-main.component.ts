import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { News } from '../@interface/news';
import { ExampleService } from '../@service/example.service';
import { HttpClientService } from '../@service/http-client.service';
import { NotificationList } from '../@interface/notification-list';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-main',
  imports: [MatIconModule, MatButtonModule, MatMenuModule,],
  templateUrl: './admin-main.component.html',
  styleUrl: './admin-main.component.scss'
})
export class AdminMainComponent {

  constructor(private router: Router,
    private exampleService: ExampleService,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute
  ) { }

  // 三種身分 visitor;user;admin
  role: string = "ADMIN";
  userName: string = "Admin";
  page = 1;

  notificationList!: NotificationList;
  notificationIdDetail!: any;
  newsList: News[] = [];

  //系統通知
  systemList = [
    { tag: '功能', title: '【新功能】全台首創「資產再平衡」建議系統正式上線！', date: '2026-03-19' },
    { tag: '維護', title: '【預告】本週六凌晨 02:00 系統維護，屆時暫停服務本週六凌晨 02:00 系統維護，屆時暫停服務本週六凌晨 02:00 系統維護，屆時暫停服務', date: '2026-03-18' },
    { tag: '公告', title: '【提醒】保障資產安全，建議每三個月定期更換登入密碼', date: '2026-03-15' },
    { tag: '教學', title: '【攻略】如何設定您的第一個「財務目標」？三分鐘上手教學', date: '2026-03-12' }
  ];

  setNotification() {
    console.log("Notify");
    this.router.navigate(['/admin/notification-set']);
  }

  goToRiskTest() {
    this.router.navigate(['/risk-test']);
  }
  setNews() {
    this.router.navigate(['/admin/news']);
  }

  fetchNotificationDetail(id: number) {
    this.notificationIdDetail = null; // 抓取前先清空，避免畫面閃爍
    this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/notifications/${id}`)
      .subscribe((res: any) => {
        if (res && res.data) {
          this.notificationIdDetail = res.data;
          this.page = 2;
        }
      });
  }
  // 點擊事件：現在只負責換網址
  detail(pageId: number) {
    this.router.navigate(['/notification', pageId]);
  }
  goNewsUrl(newsUrl: string) {
    window.open(newsUrl, '_blank');
  }

  // 這裡是新聞輪播
  newscurrentIndex = 0; // 起始索引
  displayCount = 3;     // 一次顯示幾則

  // 限制新聞出現的數量 目前設定為8則 ((定義Getter 讓HTML直接對它跑迴圈
  get visibleNews() {
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

  ngAfterViewInit() {
    // 確認是使用者後才會生成圓餅圖

    // 獲取 canvas 元素
    let ctx = document.getElementById('chart') as HTMLCanvasElement;

    // 設定數據
    let data = {
      // x 軸文字
      labels: ['現金', '股票', '基金', '債券'],
      datasets: [
        {
          // 上方分類文字
          // label: '金額',
          // 數據
          data: [1000000, 1350000, 800000, 650000],
          // 線與邊框顏色
          backgroundColor: [
            // '#FFF7AE',
            // '#99B3E4',
            // '#bdffe0',
            // '#fbb6c9',
            '#1368aa',
            '#9dcee2',
            '#fedfd4',
            '#f29479',
          ],
          //設定hover時的偏移量，滑鼠移上去表會偏移，方便觀看選種的項目
          hoverOffset: 4,
        },
      ],
    };

    // 創建圖表
    let chart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,           // 讓圖表隨容器大小伸縮
        maintainAspectRatio: false,  // 設為 false，圖表才會完全聽從 CSS 設定的高度
        layout: {
          padding: 40               // 💡 增加內距，圖表視覺上會直接縮小
        },
        plugins: {
          legend: {
            position: 'right',  // 💡 關鍵：設定在右邊
            align: 'center',    // 圖例在右側垂直置中
            labels: {
              boxWidth: 40,     // 圖例色塊的大小
              padding: 15,
              // 每個圖例之間的間距
              font: {
                size: 12        // 文字大小
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgb(255, 255, 255)', // 1. 更改底色
            titleColor: '#333',                      // 2. 標題顏色
            bodyColor: '#666',                       // 3. 內容文字顏色
            cornerRadius: 20,                        // 4. 更改形狀 (圓角設定，數值越大越圓)
            padding: 12,                             // 內距，讓框框看起來不擁擠
            borderColor: '#4091c9',                  // 5. 邊框顏色
            borderWidth: 1,                          // 邊框寬度
            displayColors: false,                     // 是否顯示旁邊的小色塊
            boxPadding: 5,                           // 色塊與文字的距離
            callbacks: {
              // 💡 如果你想要自定義顯示的文字格式（例如加上錢字號）
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': $';
                }
                if (context.parsed !== null) {
                  label += new Intl.NumberFormat('zh-TW').format(context.parsed);
                }
                return label;
              }
            }
          },
        }
      }
    });
  }
  today = new Date();
  gettoday!: string;
  ngOnInit() {

    console.log(this.activatedRoute.snapshot.paramMap.get('pageId'));
    this.activatedRoute.params.subscribe(params => {
      const pageId = params['pageId']; // 確保這裡的名稱跟 AppRoutingModule 定義一致

      //取得系統公告列表
      this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/notifications/list`)
        .subscribe((notificationList: any) => {
          console.log(notificationList);
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
    //   console.log('MainComponent 收到身分變更：', this.role);
    // });

    this.exampleService.user$.subscribe(newUser => {
      this.role = newUser.role;
      console.log(this.role);
    });
    console.log('現在身分', this.role);

    // setInterval(() => {
    //   this.nextPersonal();
    // }, 8000);

    // 取得前台新聞列表
    this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/news/user/list`)
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
