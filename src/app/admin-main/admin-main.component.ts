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

  // 三種身刁Evisitor;user;admin
  role: string = "ADMIN";
  userName: string = "Admin";
  page = 1;

  notificationList!: NotificationList;
  notificationIdDetail!: any;
  newsList: News[] = [];

  //系統通知
  systemList = [
    { tag: '功�E', title: '【新功�E】�E台首創「賁E��再平衡」建議系統正式上線！E, date: '2026-03-19' },
    { tag: '維護', title: '【預告】本週六凌晨 02:00 系統維護�E�屁E��暫停服務本週六凌晨 02:00 系統維護�E�屁E��暫停服務本週六凌晨 02:00 系統維護�E�屁E��暫停服勁E, date: '2026-03-18' },
    { tag: '公呁E, title: '【提醒】保障賁E��安�E�E�建議每三個月定期更換登入寁E��', date: '2026-03-15' },
    { tag: '教學', title: '【攻略】如何設定您皁E��一個「財務目標」？三�E鐘上手教學', date: '2026-03-12' }
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
    this.router.navigate(['/notification', pageId]);
  }
  goNewsUrl(newsUrl: string) {
    window.open(newsUrl, '_blank');
  }

  // 這裡是新聞輪播
  newscurrentIndex = 0; // 起始索弁E
  displayCount = 3;     // 一次顯示幾剁E

  // 限制新聞�E現皁E��釁E目前設定為8剁E((定義Getter 讓HTML直接對宁E��迴圁E
  get visibleNews() {
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

ngAfterViewInit() {
    // 確認是使用老E��才朁E��成圓餁E��

      // 獲叁Ecanvas 允E��
      let ctx = document.getElementById('chart') as HTMLCanvasElement;

      // 設定數擁E
      let data = {
        // x 軸斁E��E
        labels: ['現釁E, '股票', '基釁E, '債券'],
        datasets: [
          {
            // 上方刁E��文孁E
            // label: '金顁E,
            // 數擁E
            data: [1000000, 1350000, 800000, 650000],
            // 線�E邊桁E��色
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
            //設定hover時的偏移量，滑鼠移上去表朁E��移�E�方便觀看選種皁E��E��
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
          maintainAspectRatio: false,  // 設為 false�E�圖表才會完�E聽征ECSS 設定的高度
          layout: {
            padding: 40               // 💡 增加內距，圖表視覺上會直接縮封E
          },
          plugins: {
            legend: {
              position: 'right',  // 💡 關鍵�E�設定在右邁E
              align: 'center',    // 圖例在右側垂直置中
              labels: {
                boxWidth: 40,     // 圖例色塊的大封E
                padding: 15,
                // 每個圖例之間皁E��跁E
                font: {
                  size: 12        // 斁E��大封E
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgb(255, 255, 255)', // 1. 更改底色
              titleColor: '#333',                      // 2. 標題顏色
              bodyColor: '#666',                       // 3. 內容斁E��顏色
              cornerRadius: 20,                        // 4. 更改形狀 (圓角設定，數值越大越圓)
              padding: 12,                             // 內距，讓桁E��E��起侁E��擁擠
              borderColor: '#4091c9',                  // 5. 邊桁E��色
              borderWidth: 1,                          // 邊桁E��度
              displayColors: false,                     // 是否顯示旁E��皁E��色塁E
              boxPadding: 5,                           // 色塊�E斁E��的距離
              callbacks: {
                // 💡 如果你想要�E定義顯示皁E��字格式（例如加上錢字號�E�E
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
      const pageId = params['pageId']; // 確保這裡皁E��稱跁EAppRoutingModule 定義一致

      //取得系統公告�E表
      this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/notifications/list`)
        .subscribe((notificationList: any) => {
          console.log(notificationList);
          this.notificationList = notificationList;
        })

      //page=1 -> 公告�E表 http://localhost:4200/admin-notification-set
      //page=2 -> 公告詳惁Ehttp://localhost:4200/admin-notification-set/pageId (後面朁E��pageId)
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
    //   console.log('MainComponent 收到身刁E��更�E�E, this.role);
    // });

    this.exampleService.user$.subscribe(newUser => {
      this.role = newUser.role;
      console.log(this.role);
    });
    console.log('現在身刁E, this.role);

    // setInterval(() => {
    //   this.nextPersonal();
    // }, 8000);

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
