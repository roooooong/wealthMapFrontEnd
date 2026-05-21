import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HeaderUserComponent } from './header/header-user/header-user.component';
import { HeaderVisitorComponent } from './header/header-visitor/header-visitor.component';
import { ExampleService } from './@service/example.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderUserComponent, HeaderVisitorComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'wealthMap';
  // 荳臥ｨｮ霄ｫ蛻・visitor;user;admin
  // role!:string ;
  role = 'visitor';
  showHeader = false;
  constructor(
    private router: Router,
    private exampleService: ExampleService,) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // 險ｭ螳壻ｽ荳肴Φ隕・｡ｯ遉ｺ Header 逧・ｷｯ蠕・(萓句ｦ・/login)
      const hideHeaderRoutes = ['/login', '/register'];
      this.showHeader = !hideHeaderRoutes.includes(event.urlAfterRedirects);
    });
  }

  isScrolled = false;

  // 逶｣閨ｽ隕也ｪ玲佐蜍穂ｺ倶ｻｶ
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // 逡ｶ謐ｲ蜍戊ｶ・℃ 50px 譎ゑｼ悟ｰ・ｮ頑丙險ｭ轤ｺ true
    this.isScrolled = window.scrollY > 20;
  }

  login() {
    this.router.navigate(['/login']);
  }
  register() {
    this.router.navigate(['/register']);
  }

  home() {
    this.router.navigate(['/main']);
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
    //   console.log('MainComponent 謾ｶ蛻ｰ霄ｫ蛻・ｮ頑峩・・, this.role);
    // });

    this.exampleService.user$.subscribe(user => {
      this.role = user.role;
    });
    console.log('迴ｾ蝨ｨ霄ｫ蛻・, this.role);

    // 庁 逶｣閨ｽ謇譛臥噪霍ｯ逕ｱ莠倶ｻｶ -> 隶吐ooter逧・潔驤墓潔莠・ｻ･蠕悟庄莉･霍ｳ蝗樣・擇逧・怙荳企擇
    this.router.events.pipe(
      // 蜿ｪ驕取ｿｾ蜃ｺ縲悟ｰ手穐邨先據 (NavigationEnd)縲咲噪莠倶ｻｶ
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // 噫 蜿ｪ隕∝ｰ手穐邨先據・悟ｰｱ遶句綾霍ｳ蝗樊怙鬆らｫｯ
      window.scrollTo(0, 0);
      // 謌冶・ｦよ棡菴諠ｳ隕∝ｹｳ貊台ｸ鮟樒噪貊ｾ蜍墓譜譫懶ｼ・
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

}
