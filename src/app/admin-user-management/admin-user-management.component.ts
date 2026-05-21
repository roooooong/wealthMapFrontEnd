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
  //蛻・∬ｨｭ螳・
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

  // 邵ｽ鬆∵丙
  get totalPages() {
    let totalItems = 0;
    totalItems = this.userList.length || 0;

    return Math.ceil(totalItems / this.pageSize) || 1;
  }

  ngOnInit(): void {
    //initiallize
    this.currentPage = 1;
    this.pageSize = 5; // 鬆占ｨｭ荳鬆・5 遲・

    this.exampleService.user$.subscribe(user => {
      if (user && user.id && user.id !== 0) {
        this.userId = user.id;
        this.role = user.role;
        //蜿門ｾ嶺ｽｿ逕ｨ閠・・陦ｨ
        this.fetchUsers();

      }
    });

  }

  fetchUsers(){
    this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/auth/user-list`)
    .subscribe((res: any) => {
      this.userList = res.data.filter(((item:any) => item.id !== this.userId));
      // this.userList = res.data;
      console.log(this.userList);
    });
  }

  onToggle(user:UserAdminViewDTO){

    const action = user.enabled ? '蛛懃畑' : '蝠溽畑';

    this.showDialog(9,user,action);

  }

  showDialog(no:number,user:UserAdminViewDTO,actionText:string) {
    // 蝟ｮ驕ｸ
    //let dialogRef 譏ｯ螳｣蜻贋ｸ蛟玖ｮ頑丙 隶鍋ｳｻ邨ｱ遏･驕捺・蛟醍樟蝨ｨ隕∵磁謾ｶ蜩ｪ蛟掬ialog
    //(隕・幕蝠溽噪dialog鬆・擇逧・錐遞ｱ, {隕∝さ驕樒噪蛟ｼ蜥瑚ｨｭ螳嘲)
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
    //蜴ｻ蛛ｵ貂ｬdialogRef騾吝掬ialog逕夐ｺｼ譎ょ咎梨髢・
    //螯よ棡dialog邨先據譛牙さ蛟ｼ蜃ｺ萓・res蟆ｱ譏ｯ驍｣蛟句ｼ
    dialogRef.afterClosed().subscribe((isConfirm) => {

      const originalState = !user.enabled;
      //螯よ棡譛牙ｼ蛯ｳ驕槫・萓・
      if (isConfirm) {
        console.log(`https://wealthmapbackend-production-5c68.up.railway.app/api/auth/${user.id}/enabled`);
        this.httpClientService.patchApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/auth/${user.id}/enabled`, {})
          .subscribe({
            next: () => {
              user.enabled = !user.enabled; // 譖ｴ譁ｰ蜑咲ｫｯ迢諷・
              console.log(`${actionText}謌仙粥`);
            },
            error: (err) => {
              alert('譖ｴ譁ｰ螟ｱ謨・);
              user.enabled = originalState;
              this.fetchUsers(); // 逋ｼ逕滄険隱､蜑・姐譁ｰ蛻苓｡ｨ諱｢蠕ｩ迢諷・
            }
          });
      } else {
        // 蝗轤ｺ Checkbox 蜿ｯ閭ｽ蟾ｲ邯楢ｮ雁虚莠・ｼ梧・蛟鷹怙隕∝ｾ槫ｾ檎ｫｯ驥肴眠 fetch 雉・侭萓・ｄ蜴・UI
        user.enabled = originalState;
        this.fetchUsers();
      }
    });
  }

}
