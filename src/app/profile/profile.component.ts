import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClientService } from '../@service/http-client.service';
import { HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { InvalidComponent } from '../@dialog/invalid/invalid.component';
import { ExampleService } from '../@service/example.service';

@Component({
  template: `
        <div class="card flex flex-wrap justify-center gap-2">
            <input type="text" pInputText pTooltip="Enter your username" [autoHide]="false" placeholder="autoHide: false" />
            <input type="text" pInputText pTooltip="Enter your username" placeholder="autoHide: true" />
        </div>
    `,
  standalone: true,
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, TooltipModule, FormsModule, InputTextModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  changePwd: boolean = false;
  oldPassword!: string;
  newPassword!: string;
  newPassword2!: string;

  userId!: number;
  userName!: string;
  userEmail!: string;
  userLevel!: string;

  constructor(private router: Router,
    private httpClientService: HttpClientService,
    private exampleService: ExampleService) {
  }

  oldPasswordErrorMsg = '';
  newPasswordErrorMsg = '';
  newPassword2ErrorMsg = '';

  validate(field: 'oldPassword' | 'newPassword' | 'newPassword2'): void {

    if (field === 'oldPassword') {
      if (!this.oldPassword) {
        this.oldPasswordErrorMsg = '*此為必填欄位';
      } else if (this.oldPassword.length < 8 || this.oldPassword.length > 12) {
        this.oldPasswordErrorMsg = '*密碼長度須為 8-12 位';
      } else {
        this.oldPasswordErrorMsg = '';
      }
    }
    if (field === 'newPassword') {
      if (!this.newPassword) {
        this.newPasswordErrorMsg = '*此為必填欄位';
      } else if (this.newPassword.length < 8 || this.newPassword.length > 12) {
        this.newPasswordErrorMsg = '*密碼長度須為 8-12 位';
      } else {
        this.newPasswordErrorMsg = '';
      }
    }
    if (field === 'newPassword2') {
      if (!this.newPassword2) {
        this.newPassword2ErrorMsg = '*此為必填欄位';
      } else if (this.newPassword !== this.newPassword2) {
        this.newPassword2ErrorMsg = '*密碼不一致';
      } else {
        this.newPassword2ErrorMsg = '';
      }
    }
  }

  toChangePwd() {
    this.changePwd = true;
  }
  cancle() {
    this.oldPassword = '';
    this.newPassword = '';
    this.newPassword2 = '';
    this.oldPasswordErrorMsg = '';
    this.newPasswordErrorMsg = '';
    this.newPassword2ErrorMsg = '';
    this.changePwd = false;
  }
  readonly dialog = inject(MatDialog);
  showDialog(no: number) {
    // 單選
    //let dialogRef 是宣告一個變數 讓系統知道我們現在要接收哪個dialog
    //(要開啟的dialog頁面的名稱, {要傳遞的值和設定})
    let dialogRef = this.dialog.open(InvalidComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data: no,
      width: '250px',
      height: '180px'
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

  goToRiskResult() {
    this.router.navigate(['/risk-result']);
  }

  ChangePwd() {
    // 1. 執行驗證並取得結果
    this.validate('oldPassword');
    this.validate('newPassword');
    this.validate('newPassword2');

    // 1. 從 localStorage 拿到登入時存下來的 Token
    const token = localStorage.getItem('token');

    // 2. 建立 Header，格式必須是 "Bearer " 加上 Token 字串
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (this.newPassword == this.newPassword2) {
      const newpwd = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      };
      //為了寫error 所以改成next的方式
      this.httpClientService.postApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/auth/change-password`, newpwd, { headers })
        .subscribe({
          next: (changePwd: any) => {
            if (changePwd.code == 200) {
              console.log(changePwd.data);
              this.showDialog(5);
              this.oldPassword = '';
              this.newPassword = '';
              this.newPassword2 = '';
              this.changePwd = false;
            }
          },
          error: (err: any) => {
            if (this.oldPasswordErrorMsg == '' && this.newPasswordErrorMsg == '' && this.newPassword2ErrorMsg == '') {
              this.showDialog(6);
            }
          }
        })
    }
  }

  ngOnInit(): void {

    this.exampleService.user$.subscribe(user => {
      if (user && user.role !== 'visitor') {
        this.userId = user.id;
        this.userName = user.name;
        this.userEmail = user.email;
        this.userLevel = user.riskLevel;
      }
    });
  }

  translateLevel(level: string): string {
    if (!level) return '';
    const upperLevel = level.toUpperCase();

    // 結果翻譯
    switch (upperLevel) {
      case 'CONSERVATIVE': return '保守型';
      case 'DEFENSIVE': return '穩健型';
      // case 'BALANCED': return '平衡型';
      case 'GROWTH': return '積極型';
      // case 'AGGRESSIVE': return '衝刺型';
      default: return level;
    }
  }

}
