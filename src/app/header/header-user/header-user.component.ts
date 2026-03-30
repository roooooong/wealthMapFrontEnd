import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationList } from '../../@interface/notification-list';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { ExampleService } from '../../@service/example.service';
import { HttpClientService } from '../../@service/http-client.service';
import {MatBadgeModule} from '@angular/material/badge';
import { filter } from 'rxjs/operators';

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
  userId: number = 1; // 暫時寫死，之後從登入資訊拿

  constructor(private router: Router,
    private exampleService: ExampleService,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute,
    // private cdr: ChangeDetectorRef //因為未讀數量html讀不到才注入的
  ) { }

  notificationList!: NotificationList;
  notificationIdDetail!: any;

    // 點擊公告列表的時候，觸發已讀和換網址
  detail(pageId: number) {
    // 1. 呼叫已讀 API (POST)
    // this.httpClientService.postApi(`http://localhost:8080/api/notifications/read?userId=${this.userId}&notificationId=${id}`, {})
    this.httpClientService.postApi(`http://localhost:8080/api/notifications/read?userId=5&notificationId=${pageId}`, {})
      .subscribe(() => {
        // 標記成功後，刷新紅點數字
        this.refreshUnreadCount();

        // 重新抓取列表，這樣 notificationList 裡的 hasRead 就會變成 true
      this.httpClientService.getApi(`http://localhost:8080/api/notifications/list-with-status?userId=5`)
        .subscribe((res: any) => {
          this.notificationList = res;
          // 💡 C. 列表更新完後，再跳轉
          this.router.navigate(['/notification', pageId]);
        });
        // this.router.navigate(['/notification', pageId]);

      });
  }

  // 取得未讀數量
  refreshUnreadCount() {
    // this.httpClientService.getApi(`http://localhost:8080/api/notifications/unread-count?userId=${this.userId}`)
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/unread-count?userId=5`)
      .subscribe((unreadCount: any) => {
        console.log('系統通知未讀', unreadCount.data);
        if (unreadCount && unreadCount.code === 200) {
          this.systemUnreadCount = unreadCount.data;
          console.log('這裡有存到嗎', this.systemUnreadCount);
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
  }

  today = new Date();
  gettoday!: string;

  ngOnInit() {

    //初始化時獲取未讀數
    this.refreshUnreadCount();


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
