import { filter } from 'rxjs/operators';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExampleService } from '../@service/example.service';
import { HttpClientService } from '../@service/http-client.service';
import { NotificationList, PersonalNotification } from '../@interface/notification-list';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notification',
  imports: [CommonModule,
    FormsModule,
    MatIconModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent {
  role!: string;
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
  personalLogs:PersonalNotification[]=[];
  personalLogDetail!:PersonalNotification|null;
  notificationType!:string;
  //分頁設定
  currentPage!:number;
  pageSize!:number;

  // fetchNotificationDetail(id: number) {
  //   this.notificationIdDetail = null; // 抓取前先清空，避免畫面閃爍
  //   this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${id}`)
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
    this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/list`)
    .subscribe((res: any) => {
      this.notificationList = res; // 這裡對應你原本的變數
      this.personalLogs = [];     // 清空另一邊的資料，確保畫面不衝突
    });
  }

  // 2. 取得個人通知列表 (page = 1)
  loadPersonalList() {
    // 假設你有從 ExampleService 或 Session 取得 userId
    const userId = this.userId;
      this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${userId}/personal-list`)
      .subscribe((res: any) => {
        this.personalLogs = res.data; // 儲存個人通知陣列
        this.notificationList = null;  // 清空系統公告
        console.log(this.personalLogs);
      });
  }

  // 3. 取得詳情資料 (page = 2)
  loadDetail(id: number, type: 'SYSTEM' | 'PERSONAL') {
    //如果是訪客身分，絕對不准傳 userId 給後端
  if(type === 'SYSTEM' && (this.role === 'visitor' || !localStorage.getItem('token'))) {
    // 訪客只能看「純系統公告」，不帶 userId 參數
    const pureEndpoint = `https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${id}`;
    this.httpClientService.getApi(pureEndpoint).subscribe((res: any) => {
       // 只顯示內容，不呼叫 markAsRead
       this.notificationIdDetail = res.data;
       this.page = 2;
    });
    return; // 阻止後面的邏輯跑掉
  }

    this.notificationIdDetail = null; // 清空舊資料避免閃爍
    this.personalLogDetail = null;
    this.personalLogs = [];

    // 根據 type 決定去哪一個 Endpoint 抓資料
    const endpoint = type === 'SYSTEM'
      ? `https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${id}`
      : `https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${this.userId}/personal-list`; // 假設個人詳情 API 路徑

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
          this.markAsRead(id,'PERSONAL');
        }else if(type==='SYSTEM'){
          this.markAsRead(id,'SYSTEM');
        }
      }
    });
  }

  markAsRead(id:number, type: 'SYSTEM' | 'PERSONAL'){

    // 如果是訪客，或者 userId 不存在，直接 return 不做動作
  if (this.role === 'visitor' || !this.userId || this.userId === 0) {
    console.log('訪客模式：不記錄已讀狀態');
    return;
  }

    if(type==='SYSTEM'){
      this.httpClientService.postApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/read?userId=${this.userId}&notificationId=${id}`, {})
      .subscribe((res:any) => {
        if(res.code===200){
          // 4. 跳轉到公告訊息詳情頁 (或彈出視窗)
          // this.router.navigate(['/system-notification', id]);
        }

      });
    }else if(type==='PERSONAL'){
      // 呼叫個人訊息已讀 API (假設路徑如下)
      this.httpClientService.patchApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${id}/read`, {})
      .subscribe((res:any) => {
        if(res.code===200){
          // 4. 跳轉到個人訊息詳情頁 (或彈出視窗)
          // this.router.navigate(['/personal-notification', id]);
        }
      });
    }
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

  // 取值函數，用法就像一個變數，但背後其實執行了一個函數。
  // 取得當前頁面要顯示的資料 (以 personalLogs 為例)
  get pagedPersonalLogs() {
    if (!this.personalLogs) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.personalLogs.slice(startIndex, startIndex + this.pageSize);
  }

  get pagedSystemLogs() {
    // 1. 先過濾掉還沒到日期的公告
    const filteredData = this.notificationList?.data.filter(item => {
      return item.scheduledDate <= this.gettoday;
    }) || [];

    // 2. 再針對過濾後的結果進行切片
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filteredData.slice(startIndex, startIndex + this.pageSize);
  }

  // 總頁數
  get totalPages() {
    let totalItems = 0;

    if (this.notificationType === 'system') {
      // 記得這裡也要過濾日期，計算出的總頁數才會準確
      const filtered = this.notificationList?.data.filter(item => item.scheduledDate <= this.gettoday);
      totalItems = filtered?.length || 0;
    } else {
      totalItems = this.personalLogs.length || 0;
    }

    return Math.ceil(totalItems / this.pageSize) || 1;
  }

  ngOnInit(): void {
    //initiallize
    this.currentPage = 1;
    this.pageSize = 5; // 預設一頁 5 筆
    //change by carly  --start
    // 透過 URL 判斷目前是哪一類
    const isSystem = this.router.url.includes('system-notification');
    this.notificationType=isSystem?"system":"personal";
    this.exampleService.user$.subscribe(user=>{
      this.role = user.role; // 當角色改變，這裡會自動觸發
      if(user && user.role !== 'visitor'){
        this.userId=user.id;

        this.activatedRoute.params.subscribe(params => {
          const pageId = params['pageId'];

          if (pageId) {
            // 詳情模式
            this.loadDetail(pageId, isSystem ? 'SYSTEM' : 'PERSONAL');
          } else {
            // 列表模式
            this.page = 1;
            if (isSystem) {
              this.loadSystemList();
            } else {
              this.loadPersonalList();
            }
          }
        });
      }
      else{
        this.activatedRoute.params.subscribe(params => {
          const pageId = params['pageId'];

          if (pageId) {
            // 詳情模式
            this.loadDetail(pageId, 'SYSTEM');
          } else {
            // 列表模式
            this.page = 1;
            if (isSystem) {
              this.loadSystemList();
            }
          }
        });
      }
    });


    // 初始化今天日期（你原本的補零邏輯可以保留，或參考之前的簡化版）
    this.initTodayDate();

    // //取得公告列表
    // if(isSystem){
    //   this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/list`)
    //   .subscribe((notificationList: any) => {
    //     console.log(notificationList);
    //     this.notificationList = notificationList;
    //     this.personalLogs = [];

    //   });
    // }else{
    //   this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${this.userId}/personal-list`)
    //   .subscribe((personalLogs: any) => {
    //     console.log(personalLogs);
    //     this.personalLogs = personalLogs;
    //     this.notificationList = null;

    //   });
    // }

    // this.activatedRoute.params.subscribe(params => {
    //   const pageId = params['pageId']; // 確保這裡的名稱跟 AppRoutingModule 定義一致
    //   console.log("監聽中，pageId:"+pageId);
    //   //page=1 -> 公告列表 http://localhost:4200/admin-notification-set
    //   //page=2 -> 公告詳情 http://localhost:4200/admin-notification-set/pageId (後面會接pageId)
    //   if (pageId) {
    //     // this.page = 2;
    //     // this.fetchNotificationDetail(pageId);
    //     this.loadDetail(pageId, isSystem ? 'SYSTEM' : 'PERSONAL');
    //   } else {
    //     // 顯示列表頁 (page 1)
    //     this.page = 1;
    //     if (isSystem) {
    //       this.loadSystemList();
    //     } else {
    //       this.loadPersonalList();
    //     }
    //   }
    // });


    //change by carly  --end


  }
}
