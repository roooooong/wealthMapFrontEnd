import { Component, inject } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { HttpClientService } from '../../@service/http-client.service';
import { Router } from '@angular/router';
import { NotificationList, Data } from '../../@interface/notification-list';

@Component({
  selector: 'app-add-notification',
  imports: [FormsModule],
  templateUrl: './add-notification.component.html',
  styleUrl: './add-notification.component.scss'
})
export class AddNotificationComponent {

  id!: number;
  tag!: string;
  title!: string;
  content!: string;
  scheduledDate!: string;
  notificationList!: Data;
  editNotificationList!: Data;


  constructor(
    private httpClientService: HttpClientService) {
  }

  //讓這個dialogRef全域變數 等於你後面宣告的DialogComponent 後面要去做關閉才知道要關閉哪個dialog
  readonly dialogRef = inject(MatDialogRef<AddNotificationComponent>);
  //讓全域變數用來接收你開啟dialog時傳遞進來的資料
  readonly data = inject<any>(MAT_DIALOG_DATA);

  today = new Date();
  gettoday!: string;

  save() {
    this.notificationList.tag = this.tag
    this.notificationList.title = this.title
    this.notificationList.content = this.content
    this.notificationList.scheduledDate = this.scheduledDate
    this.httpClientService.postApi(`http://localhost:8080/api/notifications/save`, this.notificationList)
      .subscribe((save: any) => {
        if (save.code == 200) {
          console.log('通知儲存成功');
          this.dialogRef.close();
        }
        window.location.reload();
      })
  }

  edit() {
    this.editNotificationList.id = this.id;
    this.editNotificationList.tag = this.tag
    this.editNotificationList.title = this.title
    this.editNotificationList.content = this.content
    this.editNotificationList.scheduledDate = this.scheduledDate
    this.httpClientService.putApi(`http://localhost:8080/api/notifications/update`, this.editNotificationList)
      .subscribe((save: any) => {
        if (save.code == 200) {
          console.log('更新成功');
          this.dialogRef.close();
        }
        window.location.reload();
      })
  }

  cancel() {
    this.tag = '';
    this.title = '';
    this.content = '';
    this.scheduledDate = '';
    this.dialogRef.close();
  }

  ngOnInit(): void {

    //給初始值
    this.notificationList = {
      tag: '',
      title: '',
      content: '',
      scheduledDate: '',
      hasRead: false
    };
    //給初始值
    this.editNotificationList = {
      tag: '',
      title: '',
      content: '',
      scheduledDate: '',
      hasRead: false
    };
    this.tag = '';
    this.title ='';
    this.content = '';
    this.scheduledDate ='';

    if(this.data.choise==2){
    //取得修改公告列表
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/list`)
      .subscribe((editNotificationList: any) => {
        console.log(editNotificationList.data[this.data.index]);
        this.id = editNotificationList.data[this.data.index].id;
        this.tag = editNotificationList.data[this.data.index].tag;
        this.title = editNotificationList.data[this.data.index].title;
        this.content = editNotificationList.data[this.data.index].content;
        this.scheduledDate = editNotificationList.data[this.data.index].scheduledDate;
      })
      }


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
