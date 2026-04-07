import { filter } from 'rxjs/operators';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExampleService } from '../@service/example.service';
import { HttpClientService } from '../@service/http-client.service';
import { NotificationList, PersonalNotification } from '../@interface/notification-list';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  page: number = 1;
  constructor(
    private router: Router,
    private exampleService: ExampleService,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute
  ) { }

  notificationList!: NotificationList|null;
  notificationIdDetail!: any|null;
  userId!:number;
  personalLogs!:PersonalNotification[];
  personalLogDetail!:PersonalNotification|null;

  // fetchNotificationDetail(id: number) {
  //   this.notificationIdDetail = null; // 抓取前先清空，避免畫面閃爍
  //   this.httpClientService.getApi(`http://localhost:8080/api/notifications/${id}`)
  //   .subscribe((res: any) => {
  //     if (res && res.data) {
  //       this.notificationIdDetail = res.data;
  //       this.page=2;
  //     }
  //   });
  // }

  // 點擊事件：現在只負責換網址
  // detail(pageId: number) {
  //   this.router.navigate(['/notification', pageId]);
  // }
  ////change by carly
  detail(id: number) {
    const currentPath = this.router.url.includes('system-notification')
                        ? 'system-notification'
                        : 'personal-notification';

    this.router.navigate([currentPath, id]);
  }

  // 1. 取得系統公告列表 (page = 1)
  loadSystemList() {
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/list`)
    .subscribe((res: any) => {
      this.notificationList = res; // 這裡對應你原本的變數
      this.personalLogs = [];     // 清空另一邊的資料，確保畫面不衝突
    });

    // //取得公告列表
    // this.httpClientService.getApi(`http://localhost:8080/api/notifications/list`)
    //     .subscribe((notificationList: any) => {
    //       console.log(notificationList);
    //       this.notificationList = notificationList;
    //     })

    //   this.activatedRoute.params.subscribe(params => {
    //   const pageId = params['pageId']; // 確保這裡的名稱跟 AppRoutingModule 定義一致

    //   //page=1 -> 公告列表 http://localhost:4200/admin-notification-set
    //   //page=2 -> 公告詳情 http://localhost:4200/admin-notification-set/pageId (後面會接pageId)
    //   if (pageId) {
    //     // this.page = 2;
    //     this.fetchNotificationDetail(pageId);
    //   } else {
    //     this.page = 1;
    //     this.notificationIdDetail = null;
    //   }
    // });
  }

  // 2. 取得個人通知列表 (page = 1)
  loadPersonalList() {
    // 假設你有從 ExampleService 或 Session 取得 userId
    const userId = this.userId;
      this.httpClientService.getApi(`http://localhost:8080/api/notifications/${userId}/personal-list`)
      .subscribe((res: any) => {
        this.personalLogs = res.data; // 儲存個人通知陣列
        this.notificationList = null;  // 清空系統公告
        console.log(this.personalLogs);
      });
  }

  // 3. 取得詳情資料 (page = 2)
  loadDetail(id: number, type: 'SYSTEM' | 'PERSONAL') {
    this.notificationIdDetail = null; // 清空舊資料避免閃爍
    this.personalLogDetail = null;
    this.personalLogs = [];

    // 根據 type 決定去哪一個 Endpoint 抓資料
    const endpoint = type === 'SYSTEM'
      ? `http://localhost:8080/api/notifications/${id}`
      : `http://localhost:8080/api/notifications/${this.userId}/personal-list`; // 假設個人詳情 API 路徑

    this.httpClientService.getApi(endpoint).subscribe((res: any) => {
      if (res && res.data) {
        if(type === 'SYSTEM'){
          this.notificationIdDetail = res.data;
        }else if(type === 'PERSONAL'){
          this.personalLogs = res.data.map((item:any) => {
            if(item.content){
              item.content = item.content.replace(/\\n/g, '\n');
            }
            return item;
          });
          this.personalLogDetail=this.personalLogs.find(s => s.id===+id)||null;
          console.log(this.personalLogs);
        }

        this.page = 2; // 成功抓到資料後切換到詳情頁

        // 💡 額外加碼：如果是個人通知且未讀，可以在這裡順便觸發「標記已讀」
        if (type === 'PERSONAL' && ! this.personalLogDetail?.read) {
          this.markAsRead(id);
        }
      }
    });
  }

  markAsRead(id:number){
    // 呼叫個人訊息已讀 API (假設路徑如下)
    this.httpClientService.patchApi(`http://localhost:8080/api/notifications/${id}/read`, {})
    .subscribe(() => {

      // 4. 跳轉到個人訊息詳情頁 (或彈出視窗)
      this.router.navigate(['/personal-notification', id]);
    });
  }

  // 個人通知的tag定義
  getCategoryTag(category: string): string {
    switch (category) {
      case 'STOCK_STRATEGY': return '加減碼';
      default: return '提醒';
    }
  }

  goAnotherList(){
    const goAnotherPath = this.router.url.includes('system-notification')
                        ? 'personal-notification'
                        : 'system-notification';

    this.router.navigate([goAnotherPath]);
  }

  goBack(){
    const goPath = this.router.url.includes('system-notification')
                        ? 'system-notification'
                        : 'personal-notification';

    this.router.navigate([goPath]);
  }

  today = new Date();
  gettoday!: string;

  initTodayDate(){
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

  ngOnInit(): void {
    //change by carly  --start
    console.log("pageId:"+this.activatedRoute.snapshot.paramMap.get('pageId'));
    // 透過 URL 判斷目前是哪一類
    const isSystem = this.router.url.includes('system-notification');
    this.exampleService.user$.subscribe(user=>{
      if(user && user.role !== 'visitor'){
        this.userId=user.userId;
      }
    });

    //取得公告列表
    if(isSystem){
      this.httpClientService.getApi(`http://localhost:8080/api/notifications/list`)
      .subscribe((notificationList: any) => {
        console.log(notificationList);
        this.notificationList = notificationList;
        this.personalLogs = [];

      });
    }else{
      this.httpClientService.getApi(`http://localhost:8080/api/notifications/${this.userId}/personal-list`)
      .subscribe((personalLogs: any) => {
        console.log(personalLogs);
        this.personalLogs = personalLogs;
        this.notificationList = null;

      });
    }

    this.activatedRoute.params.subscribe(params => {
      const pageId = params['pageId']; // 確保這裡的名稱跟 AppRoutingModule 定義一致

      //page=1 -> 公告列表 http://localhost:4200/admin-notification-set
      //page=2 -> 公告詳情 http://localhost:4200/admin-notification-set/pageId (後面會接pageId)
      if (pageId) {
        // this.page = 2;
        // this.fetchNotificationDetail(pageId);
        this.loadDetail(pageId, isSystem ? 'SYSTEM' : 'PERSONAL');
      } else {
        // 顯示列表頁 (page 1)
        this.page = 1;
        if (isSystem) {
          this.loadSystemList();
        } else {
          this.loadPersonalList();
        }
      }
    });

    // 初始化今天日期（你原本的補零邏輯可以保留，或參考之前的簡化版）
    this.initTodayDate();

    //change by carly  --end

    // console.log(this.activatedRoute.snapshot.paramMap.get('pageId'));

    // this.httpClientService.getApi(`http://localhost:8080/api/notifications/list`)
    //     .subscribe((notificationList: any) => {
    //       console.log(notificationList);
    //       this.notificationList = notificationList;
    //     })

    //   this.activatedRoute.params.subscribe(params => {
    //   const pageId = params['pageId']; // 確保這裡的名稱跟 AppRoutingModule 定義一致

    //   //page=1 -> 公告列表 http://localhost:4200/admin-notification-set
    //   //page=2 -> 公告詳情 http://localhost:4200/admin-notification-set/pageId (後面會接pageId)
    //   if (pageId) {
    //     // this.page = 2;
    //     // this.fetchNotificationDetail(pageId);
    //     this.loadDetail(pageId, this.router.url.includes('system-notification') ? 'SYSTEM' : 'PERSONAL');
    //   } else {
    //     this.page = 1;
    //     this.notificationIdDetail = null;
    //     this.personalLogDetail = [];
    //   }
    // });

  }
}
