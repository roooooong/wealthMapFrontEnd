import { Router, RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { WealthService } from '../wealthservice.service';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientService } from '../@service/http-client.service';

@Component({
  selector: 'app-register',
  imports: [HeaderComponent, FormsModule, RouterLink,MatIconModule],
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

  isAccept:boolean= false;

  constructor(private router:Router,
      private httpClientService: HttpClientService,){
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
      } else if (this.password.length < 7 || this.password.length > 12) {
        this.passwordErrorMsg = '密碼長度須為 7-12 位';
      }else {
        this.passwordErrorMsg = '';
      }
    }
    if (field === 'isAccept') {
      if (!this.isAccept) {
        this.termErrorMsg = '*請確認條款內容';
      }else {
        this.termErrorMsg = '';
      }
    }
  }

  register() {
    this.validate('name');
    this.validate('email');
    this.validate('password');
    this.validate('isAccept');

    // 2. 最終檢查：只要兩個錯誤訊息都是空的，就代表格式全部正確
    if (!this.nameErrorMsg && !this.emailErrorMsg && !this.passwordErrorMsg) {
      const loginData = {
        name: this.name,
        email: this.email,    // 左邊是給後端看的「標籤」，右邊是你存的「資料」
        password: this.password
      };
      console.log('格式正確，執行登入 API');
      this.httpClientService.postApi(`http://localhost:8080/api/auth/register`,loginData)
      .subscribe((register: any) => {
        if(register.code==409){
          console.log('已註冊過');
          this.emailErrorMsg = '此 Email 已註冊過';
        }
        else{
      console.log('註冊成功');
      this.emailErrorMsg = '';
        }

      })

      // 這裡放原本被註解掉的 Service 呼叫邏輯
      // const loginData = { email: this.email, password: this.password };
      // this.wealthService.login(loginData).subscribe(...)
    }
  }

  ngOnInit(): void {
    this.isAccept=false;
  }
}
