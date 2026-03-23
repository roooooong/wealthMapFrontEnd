import { Router, RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { WealthService } from '../wealthservice.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  constructor(
    private router:Router,
    // private wealthService:WealthService,
    // private http: HttpClient
  ){}
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  get isEmailInvalid(): boolean {
    const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    return this.email.length > 0 && !emailRule.test(this.email);
  }
  get isPasswordLengthInvalid(): boolean {
    const passRule = /^[a-zA-Z0-9]{8,12}$/;
    return this.password.length > 0;
  }
  login() {
    this.router.navigate(['/first']);
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
