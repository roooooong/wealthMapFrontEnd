import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderAdminComponent } from './header/header-admin/header-admin.component';
import { HeaderUserComponent } from './header/header-user/header-user.component';
import { HeaderVisitorComponent } from './header/header-visitor/header-visitor.component';
import { ExampleService } from './@service/example.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderAdminComponent, HeaderUserComponent, HeaderVisitorComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'wealthMap';
  // 三種身分 visitor;user;admin
  // role!:string ;
  role = 'visitor';
  constructor(
    private router: Router,
    private exampleService: ExampleService,) { }

  login() {
    this.router.navigate(['/login']);
  }
  register() {
    this.router.navigate(['/register']);
  }

  home() {
    if(this.role === 'ADMIN'){
      this.router.navigate(['/admin/main']);
    }else{
      this.router.navigate(['/main']);
    }

  }

  setAboutUs() {
    console.log("AboutUs");
    this.router.navigate(['/information']);
  }

  setService() {
    console.log("Term of Service");
    this.router.navigate(['/service']);
  }

  setPrivacyPolicy() {
    console.log("Privacy Policy");
    this.router.navigate(['/privacy']);
  }

  ngOnInit() {
    // this.exampleService.role$.subscribe(newRole => {
    //   this.role = newRole;
    //   console.log('MainComponent 收到身分變更：', this.role);
    // });

    this.exampleService.user$.subscribe(user=>{
      this.role = user.role;
    });
    console.log('現在身分', this.role);

    // 💡 監聽所有的路由事件 -> 讓footer的按鈕按了以後可以跳回頁面的最上面
    this.router.events.pipe(
      // 只過濾出「導航結束 (NavigationEnd)」的事件
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // 🚀 只要導航結束，就立刻跳回最頂端
      window.scrollTo(0, 0);
      // 或者如果你想要平滑一點的滾動效果：
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

}
