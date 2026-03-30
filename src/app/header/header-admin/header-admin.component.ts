import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ExampleService } from '../../@service/example.service';

@Component({
  selector: 'app-header-admin',
  imports: [MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './header-admin.component.html',
  styleUrl: './header-admin.component.scss'
})
export class HeaderAdminComponent {
  constructor(
    private exampleService: ExampleService
  ) { }
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
    this.exampleService.setRole('visitor');
  }
}
