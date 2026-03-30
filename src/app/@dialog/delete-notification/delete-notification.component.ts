import { Component, inject } from '@angular/core';
import { HttpClientService } from '../../@service/http-client.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-notification',
  imports: [],
  templateUrl: './delete-notification.component.html',
  styleUrl: './delete-notification.component.scss'
})
export class DeleteNotificationComponent {

  id!: number;
  constructor(private httpClientService: HttpClientService) {}

  //讓這個dialogRef全域變數 等於你後面宣告的DialogComponent 後面要去做關閉才知道要關閉哪個dialog
  readonly dialogRef = inject(MatDialogRef<DeleteNotificationComponent>);
  //讓全域變數用來接收你開啟dialog時傳遞進來的資料
  readonly data = inject<any>(MAT_DIALOG_DATA);

  delete() {
    this.httpClientService.delApi(`http://localhost:8080/api/notifications/${this.id}`)
      .subscribe((del: any) => {
        if (del.code == 200) {
          console.log('刪除成功');
          this.dialogRef.close();
        }
        window.location.reload();
      })
  }

  cancel() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.httpClientService.getApi(`http://localhost:8080/api/notifications/list`)
      .subscribe((editNotificationList: any) => {
        console.log(editNotificationList.data[this.data]);
        this.id = editNotificationList.data[this.data].id;
      })
  }
}
