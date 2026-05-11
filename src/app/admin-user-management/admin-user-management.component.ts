import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientService } from '../@service/http-client.service';
import { UserAdminViewDTO } from '../@interface/wealth-map';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ExampleService } from '../@service/example.service';
import { MatDialog } from '@angular/material/dialog';
import { InvalidComponent } from '../@dialog/invalid/invalid.component';

@Component({
  selector: 'app-admin-user-management',
  imports: [FormsModule, MatIconModule],
  templateUrl: './admin-user-management.component.html',
  styleUrl: './admin-user-management.component.scss'
})
export class AdminUserManagementComponent {

  constructor(
    private router: Router,
    private httpClientService: HttpClientService,
    private activatedRoute: ActivatedRoute,
    private exampleService: ExampleService
  ) { }
  //分頁設定
  currentPage!:number;
  pageSize!:number;
  userList:UserAdminViewDTO[]=[];
  userId!:number;
  role!:string;

  readonly dialog = inject(MatDialog);

  get pagedUserLogs() {

    if (!this.userList) {
      return [];
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return  this.userList.slice(startIndex, startIndex + this.pageSize);
  }

  // 總頁數
  get totalPages() {
    let totalItems = 0;
    totalItems = this.userList.length || 0;

    return Math.ceil(totalItems / this.pageSize) || 1;
  }

  ngOnInit(): void {
    //initiallize
    this.currentPage = 1;
    this.pageSize = 5; // 預設一頁 5 筆

    this.exampleService.user$.subscribe(user => {
      if (user && user.id && user.id !== 0) {
        this.userId = user.id;
        this.role = user.role;
        //取得使用者列表
        this.fetchUsers();

      }
    });

  }

  fetchUsers(){
    this.httpClientService.getApi(`http://localhost:8080/api/auth/user-list`)
    .subscribe((res: any) => {
      this.userList = res.data.filter(((item:any) => item.id !== this.userId));
      // this.userList = res.data;
      console.log(this.userList);
    });
  }

  onToggle(user:UserAdminViewDTO){

    const action = user.enabled ? '停用' : '啟用';

    this.showDialog(9,user,action);

  }

  showDialog(no:number,user:UserAdminViewDTO,actionText:string) {
    // 單選
    //let dialogRef 是宣告一個變數 讓系統知道我們現在要接收哪個dialog
    //(要開啟的dialog頁面的名稱, {要傳遞的值和設定})
    let dialogRef = this.dialog.open(InvalidComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data:{
        no: no,
        name: user.name,
        action: actionText
      },
      width: '250px',
      height: '180px'
    });
    //去偵測dialogRef這個dialog甚麼時候關閉
    //如果dialog結束有傳值出來 res就是那個值
    dialogRef.afterClosed().subscribe((isConfirm) => {

      const originalState = !user.enabled;
      //如果有值傳遞出來
      if (isConfirm) {
        console.log(`http://localhost:8080/api/auth/${user.id}/enabled`);
        this.httpClientService.patchApi(`http://localhost:8080/api/auth/${user.id}/enabled`, {})
          .subscribe({
            next: () => {
              user.enabled = !user.enabled; // 更新前端狀態
              console.log(`${actionText}成功`);
            },
            error: (err) => {
              alert('更新失敗');
              user.enabled = originalState;
              this.fetchUsers(); // 發生錯誤則刷新列表恢復狀態
            }
          });
      } else {
        // 因為 Checkbox 可能已經變動了，我們需要從後端重新 fetch 資料來還原 UI
        user.enabled = originalState;
        this.fetchUsers();
      }
    });
  }

}
