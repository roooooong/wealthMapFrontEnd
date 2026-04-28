import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AddNotificationComponent } from '../@dialog/add-notification/add-notification.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientService } from '../@service/http-client.service';
import { NotificationList, Data } from '../@interface/notification-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DeleteNotificationComponent } from '../@dialog/delete-notification/delete-notification.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-notification-set',
  imports: [FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './admin-notification-set.component.html',
  styleUrl: './admin-notification-set.component.scss'
})
export class AdminNotificationSetComponent {
  userName: string = "Admin";
  add: boolean = false;
  page:number = 1;
  constructor(
    private router: Router,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute
  ) { }

  notificationList!: NotificationList;
  notificationIdDetail!: any;
  //分頁設定
  currentPage!:number;
  pageSize!:number;

  //系統通知假資料
  // notificationList = [
  //   { tag: '功能', title: '【新功能】全台首創「資產再平衡」建議系統正式上線！', date: '2026-03-19' },
  //   { tag: '維護', title: '【預告】本週六凌晨 02:00 系統維護，屆時暫停服務', date: '2026-03-18' },
  //   { tag: '公告', title: '【提醒】保障資產安全，建議每三個月定期更換登入密碼', date: '2026-03-15' },
  //   { tag: '教學', title: '【攻略】如何設定您的第一個「財務目標」？三分鐘上手教學', date: '2026-03-12' }
  // ];

  readonly dialog = inject(MatDialog);
  showDialog(choise: number, index: number) {
    // 單選
    //let dialogRef 是宣告一個變數 讓系統知道我們現在要接收哪個dialog
    //(要開啟的dialog頁面的名稱, {要傳遞的值和設定})
    let dialogRef = this.dialog.open(AddNotificationComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data: { choise: choise, index: index },
      width: '900px',
      height: '450px'
    });
    //去偵測dialogRef這個dialog甚麼時候關閉
    //如果dialog結束有傳值出來 res就是那個值
    dialogRef.afterClosed().subscribe((res) => {
      //如果有值傳遞出來
      if (res) {
        // setTimeout(()=>{
        console.log(res);
        // },3000)
      }
    })
  }

  showDialogDelete(index: number) {
    // 單選
    //let dialogRef 是宣告一個變數 讓系統知道我們現在要接收哪個dialog
    //(要開啟的dialog頁面的名稱, {要傳遞的值和設定})
    let dialogRef = this.dialog.open(DeleteNotificationComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data: index,
      width: '250px',
      height: '200px'
    });
    //去偵測dialogRef這個dialog甚麼時候關閉
    //如果dialog結束有傳值出來 res就是那個值
    dialogRef.afterClosed().subscribe((res) => {
      //如果有值傳遞出來
      if (res) {
        // setTimeout(()=>{
        console.log(res);
        // },3000)
      }
    })
  }
  fetchNotificationDetail(id: number) {
  this.notificationIdDetail = null; // 抓取前先清空，避免畫面閃爍
  this.httpClientService.getApi(`http://localhost:8080/api/notifications/${id}`)
    .subscribe((res: any) => {
      if (res && res.data) {
        this.notificationIdDetail = res.data;
        this.page=2;
      }
    });
}

// 點擊事件：現在只負責換網址
detail(pageId: number) {
  this.router.navigate(['/admin/notification-set', pageId]);
}

  // detail(pageId: number) {
  //   this.notificationIdDetail = null;
  //   this.page = 2;
  //   this.httpClientService.getApi(`http://localhost:8080/api/notifications/${pageId}`)
  //     .subscribe((notificationIdDetail: any) => {
  //       if (notificationIdDetail && notificationIdDetail.data) {
  //         console.log(notificationIdDetail.data);
  //       this.notificationIdDetail = notificationIdDetail.data;
  //       }

  //     })
  //   this.router.navigate(['/admin-notification-set',pageId]);
  // }
setAboutUs(){
    console.log("AboutUs");
    this.router.navigate(['/information']);
  }

  setNotification(){
    console.log("Notify");
    this.router.navigate(['/notification']);
  }

  setService(){
    console.log("Term of Service");
    this.router.navigate(['/service']);
  }

  setPrivacyPolicy(){
    console.log("Privacy Policy");
    this.router.navigate(['/privacy']);
  }

  goBack(){
    this.router.navigate(['/admin/notification-set']);
  }

  today = new Date();
  gettoday!: string;

  get pagedSystemLogs() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return  this.notificationList?.data.slice(startIndex, startIndex + this.pageSize);
  }

  // 總頁數
  get totalPages() {
    let totalItems = 0;
    totalItems = this.notificationList?.data.length || 0;

    return Math.ceil(totalItems / this.pageSize) || 1;
  }

  ngOnInit(): void {
    //initiallize
    this.currentPage = 1;
    this.pageSize = 5; // 預設一頁 5 筆

    console.log(this.activatedRoute.snapshot.paramMap.get('pageId'));

    //取得公告列表
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/list`)
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
