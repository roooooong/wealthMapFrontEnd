import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ExampleService } from '../../@service/example.service';
import { HttpClientService } from '../../@service/http-client.service';
import { News } from '../../@interface/news';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-admin',
  imports: [MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.scss'
})
export class HeaderAdminComponent {
  constructor(private router: Router,
    private exampleService: ExampleService
  ) { }
   // 三種身分 visitor;user;admin
  role: string = "visitor";
  userName!: string ;

  isNotificationOpen = false;
  isMenuOpen = false;
  toggleMenu(event: Event) {
  event.stopPropagation();
  this.isMenuOpen = !this.isMenuOpen;
  this.isNotificationOpen = false;
  }

  logout() {
    console.log('執行登出');
    this.isMenuOpen = false;
    // 之後要清空使用者資料
    // this.exampleService.setRole('visitor');
    this.exampleService.clearUserData();
     // 清空 Console
    console.clear();
    this.router.navigate(['/main']);
  }

  ngOnInit(): void {
    // 💡 關鍵：訂閱 Service，確保登入或重新整理後身分正確
    // this.exampleService.role$.subscribe(newRole => {
    //   this.role = newRole;
    // });

    this.exampleService.user$.subscribe(user=>{
      this.role = user.role;
      this.userName = user.name;
    });
  }
}
