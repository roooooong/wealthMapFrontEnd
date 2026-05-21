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
  userLevel!:string;

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
        this.oldPasswordErrorMsg = '*豁､轤ｺ蠢・｡ｫ谺・ｽ・;
      } else if (this.oldPassword.length < 8 || this.oldPassword.length > 12) {
        this.oldPasswordErrorMsg = '*蟇・｢ｼ髟ｷ蠎ｦ鬆育ぜ 8-12 菴・;
      } else {
        this.oldPasswordErrorMsg = '';
      }
    }
    if (field === 'newPassword') {
      if (!this.newPassword) {
        this.newPasswordErrorMsg = '*豁､轤ｺ蠢・｡ｫ谺・ｽ・;
      } else if (this.newPassword.length < 8 || this.newPassword.length > 12) {
        this.newPasswordErrorMsg = '*蟇・｢ｼ髟ｷ蠎ｦ鬆育ぜ 8-12 菴・;
      } else {
        this.newPasswordErrorMsg = '';
      }
    }
    if (field === 'newPassword2') {
      if (!this.newPassword2) {
        this.newPassword2ErrorMsg = '*豁､轤ｺ蠢・｡ｫ谺・ｽ・;
      } else if (this.newPassword !== this.newPassword2) {
        this.newPassword2ErrorMsg = '*蟇・｢ｼ荳堺ｸ閾ｴ';
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
    // 蝟ｮ驕ｸ
    //let dialogRef 譏ｯ螳｣蜻贋ｸ蛟玖ｮ頑丙 隶鍋ｳｻ邨ｱ遏･驕捺・蛟醍樟蝨ｨ隕∵磁謾ｶ蜩ｪ蛟掬ialog
    //(隕・幕蝠溽噪dialog鬆・擇逧・錐遞ｱ, {隕∝さ驕樒噪蛟ｼ蜥瑚ｨｭ螳嘲)
    let dialogRef = this.dialog.open(InvalidComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data: no,
      width: '250px',
      height: '180px'
    });
    //蜴ｻ蛛ｵ貂ｬdialogRef騾吝掬ialog逕夐ｺｼ譎ょ咎梨髢・
    //螯よ棡dialog邨先據譛牙さ蛟ｼ蜃ｺ萓・res蟆ｱ譏ｯ驍｣蛟句ｼ
    dialogRef.afterClosed().subscribe((res) => {
      //螯よ棡譛牙ｼ蛯ｳ驕槫・萓・
      if (res) {
        // setTimeout(()=>{
        console.log(res);
        // },3000)
      }
    })
  }

  goToRiskResult(){
    this.router.navigate(['/risk-result']);
  }

  ChangePwd() {
    // 1. 蝓ｷ陦碁ｩ苓ｭ我ｸｦ蜿門ｾ礼ｵ先棡
    this.validate('oldPassword');
    this.validate('newPassword');
    this.validate('newPassword2');

    // 1. 蠕・localStorage 諡ｿ蛻ｰ逋ｻ蜈･譎ょｭ倅ｸ倶ｾ・噪 Token
    const token = localStorage.getItem('token');

    // 2. 蟒ｺ遶・Header・梧ｼ蠑丞ｿ・域弍 "Bearer " 蜉荳・Token 蟄嶺ｸｲ
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (this.newPassword == this.newPassword2) {
      const newpwd = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      };
      //轤ｺ莠・ｯｫerror 謇莉･謾ｹ謌刃ext逧・婿蠑・
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

    // 邨先棡鄙ｻ隴ｯ
    switch (upperLevel) {
      case 'CONSERVATIVE': return '菫晏ｮ亥梛';
      case 'DEFENSIVE': return '遨ｩ蛛･蝙・;
      // case 'BALANCED': return '蟷ｳ陦｡蝙・;
      case 'GROWTH': return '遨肴･ｵ蝙・;
      // case 'AGGRESSIVE': return '陦晏絢蝙・;
      default: return level;
    }
  }

}
