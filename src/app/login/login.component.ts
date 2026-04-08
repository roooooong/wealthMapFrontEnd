import { Router, RouterLink } from '@angular/router';
import { Component, Input, inject } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { WealthService } from '../wealthservice.service';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientService } from '../@service/http-client.service';
import { ExampleService } from '../@service/example.service';
import { MatDialog } from '@angular/material/dialog';
import { InvalidComponent } from '../@dialog/invalid/invalid.component';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // 三種身分 visitor;user;admin
  role!: string;

  page: number = 1;

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  emailErrorMsg = '';
  passwordErrorMsg = '';

  constructor(private router: Router,
    private httpClientService: HttpClientService,
    private exampleService: ExampleService) {
  }


  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  validate(field: 'email' | 'password'): void {
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      } else if (this.password.length < 7 || this.password.length > 12) {
        this.passwordErrorMsg = '密碼長度須為 7-12 位';
      } else {
        this.passwordErrorMsg = '';
      }
    }
  }

  login(): void {
    // 1. 手動觸發兩次驗證，確保按下登入時，兩個錯誤訊息都會更新
    this.validate('email');
    this.validate('password');

    // 2. 最終檢查：只要兩個錯誤訊息都是空的，就代表格式全部正確
    if (!this.emailErrorMsg && !this.passwordErrorMsg) {
      const loginData = {
        email: this.email,    // 左邊是給後端看的「標籤」，右邊是你存的「資料」
        password: this.password
      };
      console.log('格式正確，執行登入 API');
      this.httpClientService.postApi(`http://localhost:8080/api/auth/login`, loginData)
        .subscribe((login: any) => {
          if (login.code == 200) {
            console.log('登入成功');
            // this.exampleService.setRole('user'); // 💡 關鍵：通知全域我變成了使用者
            // this.router.navigate(['/admin-main']);
            // 💡 儲存 Token (如果有回傳的話)
            if (login.token) {
              localStorage.setItem('token', login.token);
            } else if (login.data && login.data.token) {
              localStorage.setItem('token', login.data.token);
            }

            // 💡 優先使用後端回傳的角色，如果沒有才用 'user'
            const role = login.role || (login.data && login.data.role) || 'USER';
            this.exampleService.setRole(role);
            this.router.navigate(['/main']);
          }
          else {
            console.log('登入失敗', login.code);

          }

        })

      // 這裡放原本被註解掉的 Service 呼叫邏輯
      // const loginData = { email: this.email, password: this.password };
      // this.wealthService.login(loginData).subscribe(...)
    }
  }
  forgot() {
    this.page = 2;
  }

  send() {
    this.validate('email');
    if (!this.emailErrorMsg) {
      this.httpClientService.getApi(`http://localhost:8080/api/auth/send-mail?to=${this.email}`)
        .subscribe((sendEmail: any) => {
          if (sendEmail.code == 200) {
            this.showDialog(3);
            this.page=3;
          }
        })
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

  //忘記密碼後的登入 直接跳轉到/porfile修改密碼
  relogin() {
     // 1. 手動觸發兩次驗證，確保按下登入時，兩個錯誤訊息都會更新
    this.validate('email');
    this.validate('password');

    // 2. 最終檢查：只要兩個錯誤訊息都是空的，就代表格式全部正確
    if (!this.emailErrorMsg && !this.passwordErrorMsg) {
      const loginData = {
        email: this.email,    // 左邊是給後端看的「標籤」，右邊是你存的「資料」
        password: this.password
      };
      console.log('格式正確，執行登入 API');
      this.httpClientService.postApi(`http://localhost:8080/api/auth/login`, loginData)
        .subscribe((login: any) => {
          if (login.code == 200) {
            console.log('登入成功');
            // this.exampleService.setRole('user'); // 💡 關鍵：通知全域我變成了使用者
            // this.router.navigate(['/admin-main']);
            // 💡 儲存 Token (如果有回傳的話)
            if (login.token) {
              localStorage.setItem('token', login.token);
            } else if (login.data && login.data.token) {
              localStorage.setItem('token', login.data.token);
            }

            // 💡 優先使用後端回傳的角色，如果沒有才用 'user'
            const role = login.role || (login.data && login.data.role) || 'USER';
            this.exampleService.setRole(role);
            this.showDialog(4);
            this.router.navigate(['/profile']);
          }
          else {
            console.log('登入失敗', login.code);

          }

        })

      // 這裡放原本被註解掉的 Service 呼叫邏輯
      // const loginData = { email: this.email, password: this.password };
      // this.wealthService.login(loginData).subscribe(...)
    }
  }

  ngOnInit(): void {
    this.page = 1;
  }

  // login() {
  //   const loginData = {
  //     email: this.email,
  //     password: this.password
  //   };

  //   this.wealthService.login(loginData).subscribe({
  //     next: (res) => {
  //       console.log('登入成功', res);
  //       this.router.navigate(['/first']);
  //     },
  //     error: (err) => {
  //       console.error('登入失敗', err);
  //       alert('帳號或密碼錯誤');
  //     }
  //   });
  // }
}
