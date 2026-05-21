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
   // 荳臥ｨｮ霄ｫ蛻・visitor;user;admin
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
    console.log('蝓ｷ陦檎匳蜃ｺ');
    this.isMenuOpen = false;
    // 荵句ｾ瑚ｦ∵ｸ・ｩｺ菴ｿ逕ｨ閠・ｳ・侭
    // this.exampleService.setRole('visitor');
    this.exampleService.clearUserData();
     // 貂・ｩｺ Console
    console.clear();
    this.router.navigate(['/main']);
  }

  ngOnInit(): void {
    // 庁 髣憺嵯・夊ｨる務 Service・檎｢ｺ菫晉匳蜈･謌夜㍾譁ｰ謨ｴ逅・ｾ瑚ｺｫ蛻・ｭ｣遒ｺ
    // this.exampleService.role$.subscribe(newRole => {
    //   this.role = newRole;
    // });

    this.exampleService.user$.subscribe(user=>{
      this.role = user.role;
      this.userName = user.name;
    });
  }
}
