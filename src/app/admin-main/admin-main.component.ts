import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-main',
  imports: [],
  templateUrl: './admin-main.component.html',
  styleUrl: './admin-main.component.scss'
})
export class AdminMainComponent {

  constructor(
    private router: Router
  ){}
  // 三種身分 visitor;user;admin
  role :string = "admin";
  userName:string="Admin";


  setAboutUs(){
    console.log("AboutUs");
    this.router.navigate(['/admin-information-set']);
  }

  setNotification(){
    console.log("Notify");
    this.router.navigate(['/admin-notificaton-set']);
  }

  setService(){
    console.log("Term of Service");
    this.router.navigate(['/admin-service-set']);
  }

  setPrivacyPolicy(){
    console.log("Privacy Policy");
    this.router.navigate(['/admin-privacy-set']);
  }
}
