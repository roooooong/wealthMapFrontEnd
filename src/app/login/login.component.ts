import { Router, RouterLink } from '@angular/router';
import { Component, Input } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { WealthService } from '../wealthservice.service';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientService } from '../@service/http-client.service';
import { ExampleService } from '../@service/example.service';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // 三種身分 visitor;user;admin
  role!: string;


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
      this.httpClientService.postApi(`http://localhost:8080/api/auth/login`,loginData)
        .subscribe((register: any) => {
          if (register.code == 200) {
            console.log('登入成功');
            this.exampleService.setRole('user'); // 💡 關鍵：通知全域我變成了使用者
            this.exampleService.setUserData({
              token: register.data.token,
              userId: 1,
              role: 'USER',
              userName: 'Tester1'
            }); //add by carly
            this.router.navigate(['/main']);
          }
          else {
            console.log('登入失敗', register.code);

          }

        })

      // 這裡放原本被註解掉的 Service 呼叫邏輯
      // const loginData = { email: this.email, password: this.password };
      // this.wealthService.login(loginData).subscribe(...)
    }
  }

  ngOnInit(): void {
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
