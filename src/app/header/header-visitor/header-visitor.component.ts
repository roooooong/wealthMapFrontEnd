import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ExampleService } from '../../@service/example.service';

@Component({
  selector: 'app-header-visitor',
  imports: [],
  templateUrl: './header-visitor.component.html',
  styleUrl: './header-visitor.component.scss'
})
export class HeaderVisitorComponent {

  constructor(private router: Router) { }

login() {
    this.router.navigate(['/login']);
  }
  register() {
    this.router.navigate(['/register']);
  }
  private exampleService = inject(ExampleService);

  // 荳臥ｨｮ霄ｫ蛻・visitor;user;admin
  role: string = "visitor";

  ngOnInit(): void {
    // 庁 髣憺嵯・夊ｨる務 Service・檎｢ｺ菫晉匳蜈･謌夜㍾譁ｰ謨ｴ逅・ｾ瑚ｺｫ蛻・ｭ｣遒ｺ
    this.exampleService.user$.subscribe(newRole => {
      this.role = newRole.role;
    });
  }
}
