import { Router, RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientService } from '../@service/http-client.service';
import { InvalidComponent } from '../@dialog/invalid/invalid.component';
import { MatDialog } from '@angular/material/dialog';
import { ExampleService } from '../@service/example.service';


@Component({
  selector: 'app-register',
  imports: [HeaderComponent, FormsModule, RouterLink, MatIconModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  showPassword = false;

  emailErrorMsg = '';
  passwordErrorMsg = '';
  nameErrorMsg = '';
  termErrorMsg = '';

  isAccept: boolean = false;

  constructor(private router: Router,
    private httpClientService: HttpClientService,
    private exampleService: ExampleService) {
  }

  goHome(){
    this.router.navigate(['/main']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  validate(field: 'name' | 'email' | 'password' | 'isAccept'): void {
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (field === 'name') {
      if (!this.name) {
        this.nameErrorMsg = '*此為必填欄位';
      } else {
        this.nameErrorMsg = ''; // 格式正確就清空訊息
      }
    }

    if (field === 'email') {
      if (!this.email) {
        this.emailErrorMsg = '*此為必填欄位';
      } else if (!emailRule.test(this.email)) {
        this.emailErrorMsg = 'Email 格式不正確';
      } else {
        this.emailErrorMsg = ''; // 格式正確就清空訊息
      }
    }

    if (field === 'password') {
      if (!this.password) {
        this.passwordErrorMsg = '*此為必填欄位';
      } else if (this.password.length < 8 || this.password.length > 12) {
        this.passwordErrorMsg = '密碼長度須為 8-12 位';
      } else {
        this.passwordErrorMsg = '';
      }
    }
    if (field === 'isAccept') {
      if (!this.isAccept) {
        this.termErrorMsg = '*請確認條款內容';
      } else {
        this.termErrorMsg = '';
      }
    }
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

  register() {
    this.validate('name');
    this.validate('email');
    this.validate('password');
    this.validate('isAccept');

    // 2. 最終檢查：只要錯誤訊息都是空的，就代表格式全部正確
    if (!this.nameErrorMsg && !this.emailErrorMsg && !this.passwordErrorMsg && !this.termErrorMsg) {
      const registerData = {
        name: this.name,
        email: this.email,    // 左邊是給後端看的「標籤」，右邊是你存的「資料」
        password: this.password
      };
      console.log('格式正確，執行登入 API');
      this.httpClientService.postApi(`https://wealthmapbackend-production-412c.up.railway.app/api/auth/register`, registerData)
        .subscribe((register: any) => {
          if (register.code == 409) {
            console.log('已註冊過');
            this.emailErrorMsg = '此 Email 已註冊過';
            return;
          }
          else {
            console.log('註冊成功');
            this.emailErrorMsg = '';

            // 2. 註冊成功後，再登入 API
            const loginData = {
              email: this.email,
              password: this.password
            };

            this.httpClientService.postApi(`https://wealthmapbackend-production-412c.up.railway.app/api/auth/login`, loginData)
              .subscribe((login: any) => {
                if (login.code == 200) {
                  // 3. 執行你 LoginComponent 裡那套完整的登入邏輯
                  const token = login.token || (login.data && login.data.token);
                  sessionStorage.setItem('token', token);
                  this.exampleService.setUserData(token);

                  // if (register.token) {
                  //   localStorage.setItem('token', register.token);
                  // } else if (register.data && register.data.token) {
                  //   localStorage.setItem('token', register.data.token);
                  // }

                  // 💡 優先使用後端回傳的角色，如果沒有才用 'user'
                  // const role = register.role || (register.data && register.data.role) || 'USER';
                  // this.exampleService.setRole(role);
                  this.showDialog(2);
                }
              })
          }
        })
    }
  }


  ngOnInit(): void {
    this.isAccept = false;
  }
}
