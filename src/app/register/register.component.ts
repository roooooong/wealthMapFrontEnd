import { Router, RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { WealthService } from '../wealthservice.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [HeaderComponent, FormsModule,RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  showPassword = false;

  constructor(
    private router:Router,
    // private wealthService:WealthService,
    // private http: HttpClient
  ){}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  get isNameInvalid(): boolean {
    return this.name.length > 0;//可增加字數限制
  }
  get isEmailInvalid(): boolean {
    const emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    return this.email.length > 0 && !emailRule.test(this.email);
  }
  get isPasswordLengthInvalid(): boolean {
    const passRule = /^[a-zA-Z0-9]{8,12}$/;
    return this.password.length > 0;
  }

  register(){
      this.router.navigate(['/login']);
    }

  // register(){
  //   const registerData = {
  //     name: this.name,
  //     email: this.email,
  //     password: this.password
  //   };

  //   this.wealthService.createUser(registerData).subscribe({
  //     next: (res) => {
  //       console.log('註冊成功', res);
  //       alert('註冊成功！');
  //       this.router.navigate(['/login']);
  //     },
  //     error: (err) => {
  //       console.error('註冊失敗', err);
  //       alert('註冊發生錯誤');
  //     }
  //   });
  // }
}
