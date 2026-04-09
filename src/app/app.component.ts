import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'wealthMap';

  // 三種身分 visitor;user;admin
  role :string = "visitor";

  constructor (private router:Router){}

  login(){
    this.router.navigate(['/login']);
  }
  register(){
    this.router.navigate(['/register']);
  }
  main(){
    this.router.navigate(['/main']);
  }
  health(){
    this.router.navigate(['/health']);
  }
  strategy(){
    this.router.navigate(['/strategy']);
  }
  monte(){
    this.router.navigate(['/monte']);
  }

}
