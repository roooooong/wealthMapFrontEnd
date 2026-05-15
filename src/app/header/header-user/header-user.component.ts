import { ChangeDetectorRef, Component, HostListener, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationList, SseMessage } from '../../@interface/notification-list';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { ExampleService } from '../../@service/example.service';
import { HttpClientService } from '../../@service/http-client.service';
import { SseService } from '../../@service/sse.service';
import { MatBadgeModule } from '@angular/material/badge';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-user',
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule],
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
  userId!: number;
  userName!: string;

  constructor(private router: Router,
    private exampleService: ExampleService,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef //因為未讀數量html讀不到才注入的
  ) { }

  notificationList!: NotificationList;
  notificationIdDetail!: any;

  // 定義變數存個人列表
  personalNotificationList: any[] = [];

  //設定 SSE
  private sseService = inject(SseService);
  private sseSubscription: Subscription | null = null; // 用來管理連線
  isConnected = signal(false);
  messages = signal<SseMessage[]>([]);

  // 點擊系統公告列表的時候，觸發已讀和換網址
  detail(pageId: number) {
    // 1. 呼叫已讀 API (POST)
    this.httpClientService.postApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/read?userId=${this.userId}&notificationId=${pageId}`, {})
      .subscribe(() => {
        this.router.navigate(['/system-notification', pageId]);
      });
  }

  // 個人提醒的點擊處理
  detailPersonal(logId: number) {
    // 1. 呼叫個人訊息已讀 API (假設路徑如下)
    this.httpClientService.patchApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${logId}/read`, {})
      .subscribe(() => {
        this.router.navigate(['/personal-notification', logId]);
      });
  }

  // 取得未讀數量
  refreshUnreadCount() {

    if (!this.userId) return;

    //新增個人訊息未讀 by Carly
    this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/unread-count-new?userId=${this.userId}`)
      // this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/unread-count-new?userId=1`)
      .subscribe((res: any) => {
        if (res && res.code === 200) {
          this.systemUnreadCount = res.data.systemCount;
          this.personalUnreadCount = res.data.personalCount;
          this.cdr.detectChanges(); // 💡 強制更新畫面
        }
      });
  }

  get totalUnreadCount(): number {
    return this.systemUnreadCount + this.personalUnreadCount;
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
    this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${id}`)
      .subscribe((res: any) => {
        if (res && res.data) {
          this.notificationIdDetail = res.data;
          this.page = 2;
        }
      });
  }

  //取得當前使用者的公告列表(含以讀未讀狀態)
  fetchSystemNotifications() {
    this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/list-with-status?userId=${this.userId}`)
      .subscribe((notificationList: any) => {
        console.log('使用者的公告列表', notificationList);
        this.notificationList = notificationList;
        // for test
        // this.notificationList.data.forEach((item)=>{
        //   console.log(item.id+":"+item.hasRead);
        // });
      });
  }

  // 新增抓取個人訊息的方法 by Carly
  fetchPersonalNotifications() {


    // 記得加上你提到的 channel=WEB_PUSH 篩選 (假設後端有提供此過濾)
    this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${this.userId}/personal-list`)
      .subscribe((res: any) => {
        if (res && res.code === 200) {
          this.personalNotificationList = res.data;
          // for test
          // this.personalNotificationList.forEach((item)=>{
          //   console.log(item.id+":"+item.read);
          // });
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

  goProfile() {
    this.router.navigate(['/profile']);
  }
  logout() {
    console.log('執行登出');
    this.isMenuOpen = false;
    // 之後要清空使用者資料
    // this.exampleService.setRole('visitor');
    this.exampleService.clearUserData(); // 這會清除 localStorage 並廣播 null
     // 清空 Console
    console.clear();
    this.router.navigate(['/main']);
  }

  today = new Date();
  gettoday!: string;

  initTodayDate() {
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

  // 三種身分 visitor;user;admin
  role: string = "visitor";

  ngOnInit() {

    console.log("Header User NgOnInt");
    // 新增抓取個人資訊 by Carly
    this.exampleService.user$.subscribe(user => {

      console.log('header user 👉', user);

      // ❗最關鍵防呆
      if (!user || !user.id || user.role === 'visitor') {
        console.log('user 不完整，停止所有 API');

        this.disconnectSse();
        return;
      }

      // ✅ 只有這裡才會執行
      this.userId = user.id;
      this.userName = user.name;
      this.role = user.role;

      this.connectSse(String(user.id));

      this.refreshUnreadCount();
      this.fetchPersonalNotifications();
      this.fetchSystemNotifications();
    });


    //page=1 -> 公告列表 http://localhost:4200/admin-notification-set
    //page=2 -> 公告詳情 http://localhost:4200/admin-notification-set/pageId (後面會接pageId)
    // if (pageId) {
    //   // this.page = 2;
    //   this.fetchNotificationDetail(pageId);

    //   // 進入詳情頁也刷一次紅點總數
    //   this.refreshUnreadCount();
    // } else {
    //   this.page = 1;
    //   this.notificationIdDetail = null;
    // }
    // });

    // 監聽路由事件，只要導航結束就關閉所有面板
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isNotificationOpen = false;
      this.isMenuOpen = false;
      console.log('路由已切換，自動收起面板');

      // 1. 取得當前網址
      const currentUrl = this.router.url;

      // 2. 判斷是否為「通知類」的詳細頁面
      // 邏輯：網址包含 'notification' 且 最後一段是數字 (代表 pageId)
      const isNotificationPath = currentUrl.includes('personal-notification') ||
        currentUrl.includes('system-notification');

      const urlParts = currentUrl.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const isDetailView = !isNaN(Number(lastPart)); // 檢查最後一段是不是 ID
      console.log("urlParts:" + urlParts + ",lastPart:" + lastPart + ",isDetailView:" + isDetailView);
      if (isNotificationPath && isDetailView) {
        // 💡 稍微延遲一點點，確保資料庫已經寫入完成
        setTimeout(() => {
          console.log('符合過濾條件：進入通知詳細頁，刷新紅點。');
          this.refreshUnreadCount();
          console.log("重新載入panel紅點");
          this.fetchPersonalNotifications();
          this.fetchSystemNotifications();
        }, 300);
      }
      else {
        this.fetchPersonalNotifications();
        this.fetchSystemNotifications();
      }
    });

    // 初始化今天日期（你原本的補零邏輯可以保留，或參考之前的簡化版）
    this.initTodayDate();


    // // 每 5 秒自動切換下一則新聞
    // setInterval(() => {
    //   this.nextPersonal();
    // }, 8000);


  }

  connectSse(userId: string) {
    // 💡 檢查：如果已經連線，且 userId 沒變，就直接 return，不要斷開
    if (this.isConnected() && this.userId.toString() === userId) {
      return;
    }

    this.disconnectSse(); // 確保不會重複連線

    this.sseSubscription = this.sseService.getServerSentEvent(userId).subscribe({
      next: (data) => {
        this.isConnected.set(true); // 💡 連線成功設定為 true
        console.log('收到即時通知:', data);
        // 💡 收到訊息後，直接刷新紅點數字
        this.refreshUnreadCount();
        // 如果是個人訊息，也可以順便刷新個人列表
        this.fetchPersonalNotifications();
        this.fetchSystemNotifications();
        // 強制檢查畫面，讓紅點立刻亮起來
        this.cdr.markForCheck();
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
  disconnectSse() {
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
