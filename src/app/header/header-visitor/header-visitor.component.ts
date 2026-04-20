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

  // 三種身分 visitor;user;admin
  role: string = "visitor";

  ngOnInit(): void {
    // 💡 關鍵：訂閱 Service，確保登入或重新整理後身分正確
    this.exampleService.user$.subscribe(newRole => {
      this.role = newRole.role;
    });
  }
}
