import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientService } from '../@service/http-client.service';
import { NotificationList } from '../@interface/notification-list';

@Component({
  selector: 'app-personal-notification',
  imports: [],
  templateUrl: './personal-notification.component.html',
  styleUrl: './personal-notification.component.scss'
})
export class PersonalNotificationComponent {
 page: number = 1;
  constructor(
    private router: Router,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute
  ) { }

  notificationList!: NotificationList;
  notificationIdDetail!: any;

  fetchNotificationDetail(id: number) {
  this.notificationIdDetail = null; // 抓取前先清空，避免畫面閃爍
  this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/${id}`)
    .subscribe((res: any) => {
      if (res && res.data) {
        this.notificationIdDetail = res.data;
        this.page=2;
      }
    });
}

// 點擊事件：現在只負責換網址
detail(pageId: number) {
  this.router.navigate(['/notification', pageId]);
}

today = new Date();
  gettoday!: string;

  ngOnInit(): void {

    console.log(this.activatedRoute.snapshot.paramMap.get('pageId'));

    //取得公告列表
    this.httpClientService.getApi(`https://wealthmapbackend-production-85e8.up.railway.app/api/notifications/list`)
      .subscribe((notificationList: any) => {
        console.log(notificationList);
        this.notificationList = notificationList;
      })

    this.activatedRoute.params.subscribe(params => {
    const pageId = params['pageId']; // 確保這裡的名稱跟 AppRoutingModule 定義一致

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

