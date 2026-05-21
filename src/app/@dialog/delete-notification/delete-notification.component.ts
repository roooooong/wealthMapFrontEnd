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

  //隶馴吝掬ialogRef蜈ｨ蝓溯ｮ頑丙 遲画名菴蠕碁擇螳｣蜻顔噪DialogComponent 蠕碁擇隕∝悉蛛夐梨髢画燕遏･驕楢ｦ・梨髢牙頭蛟掬ialog
  readonly dialogRef = inject(MatDialogRef<DeleteNotificationComponent>);
  //隶灘・蝓溯ｮ頑丙逕ｨ萓・磁謾ｶ菴髢句福dialog譎ょさ驕樣ｲ萓・噪雉・侭
  readonly data = inject<any>(MAT_DIALOG_DATA);

  delete() {
    this.httpClientService.delApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/notifications/${this.id}`)
      .subscribe((del: any) => {
        if (del.code == 200) {
          console.log('蛻ｪ髯､謌仙粥');
          this.dialogRef.close();
        }
        window.location.reload();
      })
  }

  cancel() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/notifications/list`)
      .subscribe((editNotificationList: any) => {
        console.log(editNotificationList.data[this.data]);
        this.id = editNotificationList.data[this.data].id;
      })
  }
}
