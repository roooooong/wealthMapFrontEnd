import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
}
