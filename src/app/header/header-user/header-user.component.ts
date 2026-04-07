import { ChangeDetectorRef, Component, HostListener, inject, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationList, SseMessage } from '../../@interface/notification-list';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { ExampleService } from '../../@service/example.service';
import { HttpClientService } from '../../@service/http-client.service';
import { SseService } from '../../@service/sse.service';
import {MatBadgeModule} from '@angular/material/badge';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-user',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule,MatBadgeModule],
  templateUrl: './header-user.component.html',
  styleUrl: './header-user.component.scss'
})
export class HeaderUserComponent {


  isNotificationOpen = false;
  activeTab: 'personal' | 'system' = 'personal';
  hasNewMessage = true;
  page = 1;

  systemUnreadCount: number = 0;
  personalUnreadCount: number = 0;
  userId: number = 1; // 暫時寫死，之後從登入資訊拿
  userName: string = "XXX"; // 暫時寫死，之後從登入資訊拿

  constructor(private router: Router,
    private exampleService: ExampleService,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute,
    // private cdr: ChangeDetectorRef //因為未讀數量html讀不到才注入的
  ) { }

  notificationList!: NotificationList;
  notificationIdDetail!: any;

  // 定義變數存個人列表
  personalNotificationList: any[] = [];

  //設定 SSE
  private sseService = inject(SseService);
  private sseSubscription : Subscription | null = null; // 用來管理連線
  isConnected = signal(false);
  messages = signal<SseMessage[]>([]);

    // 點擊系統公告列表的時候，觸發已讀和換網址
  detail(pageId: number) {
    // 1. 呼叫已讀 API (POST)
    this.httpClientService.postApi(`http://localhost:8080/api/notifications/read?userId=${this.userId}&notificationId=${pageId}`, {})
      .subscribe(() => {
        // 標記成功後，刷新紅點數字
        this.refreshUnreadCount();

        // 重新抓取列表，這樣 notificationList 裡的 hasRead 就會變成 true
        this.httpClientService.getApi(`http://localhost:8080/api/notifications/list-with-status?userId=${this.userId}`)
          .subscribe((res: any) => {
            this.notificationList = res;
            // 💡 C. 列表更新完後，再跳轉
            this.router.navigate(['/system-notification', pageId]);
        });
        // this.router.navigate(['/notification', pageId]);

      });
  }

  // 個人提醒的點擊處理
  detailPersonal(logId: number) {
    // 1. 呼叫個人訊息已讀 API (假設路徑如下)
    this.httpClientService.patchApi(`http://localhost:8080/api/notifications/${logId}/read`, {})
    .subscribe(() => {
      // 2. 刷新紅點 (這時候 personalCount 會減少)
      this.refreshUnreadCount();

      // 3. 重新抓取個人列表 (讓畫面上的未讀點消失)
      this.fetchPersonalNotifications();

      // 4. 跳轉到個人訊息詳情頁 (或彈出視窗)
      this.router.navigate(['/personal-notification', logId]);
    });
  }

  // 取得未讀數量
  refreshUnreadCount() {
    // this.httpClientService.getApi(`http://localhost:8080/api/notifications/unread-count?userId=${this.userId}`)
    // this.httpClientService.getApi(`http://localhost:8080/api/notifications/unread-count?userId=5`)
    //   .subscribe((unreadCount: any) => {
    //     console.log('系統通知未讀', unreadCount.data);
    //     if (unreadCount && unreadCount.code === 200) {
    //       this.systemUnreadCount = unreadCount.data;
    //       console.log('這裡有存到嗎', this.systemUnreadCount);
    //       // this.cdr.detectChanges(); // 💡 強制更新畫面
    //     }
    //   });
    //新增個人訊息未讀 by Carly
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/unread-count-new?userId=${this.userId}`)
    // this.httpClientService.getApi(`http://localhost:8080/api/notifications/unread-count-new?userId=1`)
    .subscribe((res: any) => {
      console.log('系統通知未讀', res.data.systemCount);
      console.log('個人通知未讀', res.data.personalCount);
      if (res && res.code === 200) {
        this.systemUnreadCount = res.data.systemCount;
        this.personalUnreadCount = res.data.personalCount;
        console.log('系統未讀：', this.systemUnreadCount);
        console.log('個人未讀：', this.personalUnreadCount);
        // this.cdr.detectChanges(); // 💡 強制更新畫面
      }
    });
  }

  isMenuOpen = false;
  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.isNotificationOpen = false;
  }
  // 打開鈴鐺
  toggleNotification(event: Event) {
    event.stopPropagation();

    //切換開關
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isMenuOpen = false; // 點開鈴鐺時，自動關閉使用者選單

    // 只要是打開鈴鐺，就刷新一次數字
    if (this.isNotificationOpen) {
      this.refreshUnreadCount();
    }
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

  // 新增抓取個人訊息的方法 by Carly
  fetchPersonalNotifications() {
    // 記得加上你提到的 channel=WEB_PUSH 篩選 (假設後端有提供此過濾)
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/${this.userId}/personal-list`)
      .subscribe((res: any) => {
        if (res && res.code === 200) {
          this.personalNotificationList = res.data;
        }
      });
  }

 hidden = false;

  toggleBadgeVisibility() {
    this.hidden = !this.hidden;
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
    this.exampleService.setRole('visitor');
    this.exampleService.clearUserData(); // 這會清除 localStorage 並廣播 null
    this.router.navigate(['/login']);
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

  ngOnInit() {
    // 新增抓取個人資訊 by Carly
    this.exampleService.user$.subscribe(user=>{
      if(user && user.role !== 'visitor'){
        this.userId=user.userId;
        this.userName=user.userName;

        // 登入成功，開始 SSE 連線
        this.connectSse(user.userId.toString());
        this.refreshUnreadCount(); // 只有非訪客才去該使用者的未讀數
        this.fetchPersonalNotifications(); // 刷個人列表

      }else{
        // 登出（變回 visitor），關閉 SSE
        this.disconnectSse();
        console.log("SSE斷線");
      }
    });

    // //初始化時獲取未讀數
    // this.refreshUnreadCount();


    //監聽網址參數(看使用者現在在看哪一則公告)
    console.log(this.activatedRoute.snapshot.paramMap.get('pageId'));
    this.activatedRoute.params.subscribe(params => {
      const pageId = params['pageId']; // 確保這裡的名稱跟 AppRoutingModule 定義一致

    //只要換頁（或點擊列表進入詳情），就收起通知框
    this.isNotificationOpen = false;

      //取得當前使用者的公告列表(含以讀未讀狀態)
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/list-with-status?userId=5`)
      .subscribe((notificationList: any) => {
        console.log('使用者的公告列表',notificationList);
        this.notificationList = notificationList;
      })

      //page=1 -> 公告列表 http://localhost:4200/admin-notification-set
      //page=2 -> 公告詳情 http://localhost:4200/admin-notification-set/pageId (後面會接pageId)
      if (pageId) {
        // this.page = 2;
        this.fetchNotificationDetail(pageId);
        // 進入詳情頁也刷一次紅點總數
        this.refreshUnreadCount();
      } else {
        this.page = 1;
        this.notificationIdDetail = null;
      }
    });

    // 監聽路由事件，只要導航結束就關閉所有面板
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isNotificationOpen = false;
      this.isMenuOpen = false;
      console.log('路由已切換，自動收起面板');
    });

    // 初始化今天日期（你原本的補零邏輯可以保留，或參考之前的簡化版）
    this.initTodayDate();


    // this.exampleService.role$.subscribe(newRole => {
    //   this.role = newRole;
    //   console.log('MainComponent 收到身分變更：', this.role);
    // });
    // console.log('現在身分', this.role);

    // // 每 5 秒自動切換下一則新聞
    // setInterval(() => {
    //   this.nextPersonal();
    // }, 8000);


    //取得今天日期
    // if ((new Date().getMonth() + 1) < 10) {
    //   if (new Date().getDate() < 10) {
    //     this.gettoday = new Date().getFullYear() + '-0' + (new Date().getMonth() + 1) + '-0' + new Date().getDate()
    //   }
    //   else {
    //     this.gettoday = new Date().getFullYear() + '-0' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
    //   }
    // }
    // else {
    //   if (new Date().getDate() < 10) {
    //     this.gettoday = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-0' + new Date().getDate()
    //   }
    //   else {
    //     this.gettoday = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate()
    //   }
    // }
  }

  connectSse(userId: string){

    this.disconnectSse(); // 確保不會重複連線

    this.sseSubscription = this.sseService.getServerSentEvent(userId).subscribe({
      next: (data) => {
        console.log('收到即時通知:', data);
        // 💡 收到訊息後，直接刷新紅點數字
        this.refreshUnreadCount();
        // 如果是個人訊息，也可以順便刷新個人列表
        this.fetchPersonalNotifications();
        // const newMessage: SseMessage = {
        //   id: Date.now(),
        //   content: data,
        //   timestamp: new Date(),
        //   type: data.includes('INIT') ? 'info' : 'success'
        // };
        // this.messages.update(prev => [newMessage, ...prev].slice(0, 10)); // Keep last 10
      },
      error: (err) => {
        console.error('SSE Error:', err);
        this.isConnected.set(false);
      }
    });

  }
  disconnectSse(){
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe(); // 這會觸發 SseService 裡的 eventSource.close()
      console.log('SSE 連線已關閉');
    }
    this.isConnected.set(false);
  }
  // 確保組件銷毀時（例如徹底登出）關閉連線
  ngOnDestroy() {
    this.disconnectSse();
  }
}
