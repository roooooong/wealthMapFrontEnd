import { Router, RouterLink } from '@angular/router';
import { Component, Input, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { WealthService } from '../wealthservice.service';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientService } from '../@service/http-client.service';
import { ExampleService } from '../@service/example.service';
import { MatDialog } from '@angular/material/dialog';
import { InvalidComponent } from '../@dialog/invalid/invalid.component';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // 荳臥ｨｮ霄ｫ蛻・visitor;user;admin
  role!: string;

  page: number = 1;

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  emailErrorMsg = '';
  passwordErrorMsg = '';

  constructor(private router: Router,
    private httpClientService: HttpClientService,
    private exampleService: ExampleService) {
  }
  goHome(){
    this.router.navigate(['/main']);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  validate(field: 'email' | 'password'): void {
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (field === 'email') {
      if (!this.email) {
        this.emailErrorMsg = '*豁､轤ｺ蠢・｡ｫ谺・ｽ・;
      } else if (!emailRule.test(this.email)) {
        this.emailErrorMsg = 'Email 譬ｼ蠑丈ｸ肴ｭ｣遒ｺ';
      } else {
        this.emailErrorMsg = ''; // 譬ｼ蠑乗ｭ｣遒ｺ蟆ｱ貂・ｩｺ險頑・
      }
    }

    if (field === 'password') {
      if (!this.password) {
        this.passwordErrorMsg = '*豁､轤ｺ蠢・｡ｫ谺・ｽ・;
      } else if (this.password.length < 8 || this.password.length > 12) {
        this.passwordErrorMsg = '蟇・｢ｼ髟ｷ蠎ｦ鬆育ぜ 8-12 菴・;
      } else {
        this.passwordErrorMsg = '';
      }
    }
  }

  login(): void {
    // 1. 謇句虚隗ｸ逋ｼ蜈ｩ谺｡鬩苓ｭ会ｼ檎｢ｺ菫晄潔荳狗匳蜈･譎ゑｼ悟・蛟矩険隱､險頑・驛ｽ譛・峩譁ｰ
    this.validate('email');
    this.validate('password');

    // 2. 譛邨よｪ｢譟･・壼宵隕∝・蛟矩険隱､險頑・驛ｽ譏ｯ遨ｺ逧・ｼ悟ｰｱ莉｣陦ｨ譬ｼ蠑丞・驛ｨ豁｣遒ｺ
    if (!this.emailErrorMsg && !this.passwordErrorMsg) {
      const loginData = {
        email: this.email,    // 蟾ｦ驍頑弍邨ｦ蠕檎ｫｯ逵狗噪縲梧ｨ咏ｱ､縲搾ｼ悟承驍頑弍菴蟄倡噪縲瑚ｳ・侭縲・
        password: this.password
      };
      console.log('譬ｼ蠑乗ｭ｣遒ｺ・悟濤陦檎匳蜈･ API');
      this.httpClientService.postApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/auth/login`, loginData)
        .subscribe((login: any) => {
          if (login.code == 200) {
            console.log('逋ｻ蜈･謌仙粥');
            // this.exampleService.setRole('user'); // 庁 髣憺嵯・夐夂衍蜈ｨ蝓滓・隶頑・莠・ｽｿ逕ｨ閠・

            const token = login.data.token || login.token;

            // 庁 蜆ｲ蟄・Token (螯よ棡譛牙屓蛯ｳ逧・ｩｱ)
            if (token) {
              sessionStorage.setItem('token', token);
            }

            this.exampleService.setUserData(login.data.token); // login.data.token 轤ｺ token // add by carly

            this.exampleService.user$.pipe(
              filter(u => u && u.id !== 0 && u.enabled !== undefined), // 遒ｺ菫晄響蛻ｰ逵滓ｭ｣逧・ｳ・侭謇崎ｷｳ霓・
              take(1)                       // 蝓ｷ陦悟ｮ瑚ｷｳ霓牙ｾ瑚・蜍墓鵡髢玖ｨる務
            ).subscribe(newUser => {
              console.log(newUser);
              this.role = newUser.role;
              console.log('enabled 逧・梛蛻･:', typeof newUser.enabled);
              const isAccountEnabled = newUser.enabled;
              // if(this.role==="USER" || this.role==="visitor"){
              if (isAccountEnabled === true || isAccountEnabled === 1){
                console.log("騾ｲ蜈･main");
                this.router.navigate(['/main']);
              }else{
                console.log("鬩苓ｭ牙､ｱ謨暦ｼ悟ｸｳ謌ｶ蟾ｲ蛛懃畑");
                this.showDialog(10);
                this.exampleService.clearUserData(); // 騾呎怎貂・勁 localStorage 荳ｦ蟒｣謦ｭ null
                // // 貂・ｩｺ Console
                console.clear();

              }

              // }else if(this.role==="ADMIN"){
              // console.log("騾ｲ蜈･admin main");
              // this.router.navigate(['/admin/main']);
              // }
            });
            // // 庁 蜆ｪ蜈井ｽｿ逕ｨ蠕檎ｫｯ蝗槫さ逧・ｧ定牡・悟ｦよ棡豐呈怏謇咲畑 'user'
            // const role = login.role || (login.data && login.data.role) || 'USER';
            // this.exampleService.setRole(role);
            // this.router.navigate(['/main']);
          }
          else {
            console.log('逋ｻ蜈･螟ｱ謨・, login.code);
            this.showDialog(7);
          }

        })

      // 騾呵｣｡謾ｾ蜴滓悽陲ｫ險ｻ隗｣謗臥噪 Service 蜻ｼ蜿ｫ驍剰ｼｯ
      // const loginData = { email: this.email, password: this.password };
      // this.wealthService.login(loginData).subscribe(...)
    }
  }
  forgot() {
    this.page = 2;
  }

  send() {
    this.validate('email');
    if (!this.emailErrorMsg) {
      this.httpClientService.getApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/auth/send-mail?to=${this.email}`)
        .subscribe((sendEmail: any) => {
          if (sendEmail.code == 200) {
            this.showDialog(3);
            this.page = 3;
          }
        })
    }
  }

  readonly dialog = inject(MatDialog);
  showDialog(no: number) {
    // 蝟ｮ驕ｸ
    //let dialogRef 譏ｯ螳｣蜻贋ｸ蛟玖ｮ頑丙 隶鍋ｳｻ邨ｱ遏･驕捺・蛟醍樟蝨ｨ隕∵磁謾ｶ蜩ｪ蛟掬ialog
    //(隕・幕蝠溽噪dialog鬆・擇逧・錐遞ｱ, {隕∝さ驕樒噪蛟ｼ蜥瑚ｨｭ螳嘲)
    let dialogRef = this.dialog.open(InvalidComponent, {
      // data: {choise:choise,id:this.notificationList.data[index].id},
      data: no,
      width: '250px',
      height: '180px'
    });
    //蜴ｻ蛛ｵ貂ｬdialogRef騾吝掬ialog逕夐ｺｼ譎ょ咎梨髢・
    //螯よ棡dialog邨先據譛牙さ蛟ｼ蜃ｺ萓・res蟆ｱ譏ｯ驍｣蛟句ｼ
    dialogRef.afterClosed().subscribe((res) => {
      //螯よ棡譛牙ｼ蛯ｳ驕槫・萓・
      if (res) {
        // setTimeout(()=>{
        console.log(res);
        // },3000)
      }
    })
  }

  //蠢倩ｨ伜ｯ・｢ｼ蠕檎噪逋ｻ蜈･ 逶ｴ謗･霍ｳ霓牙芦/porfile菫ｮ謾ｹ蟇・｢ｼ
  relogin() {
    // 1. 謇句虚隗ｸ逋ｼ蜈ｩ谺｡鬩苓ｭ会ｼ檎｢ｺ菫晄潔荳狗匳蜈･譎ゑｼ悟・蛟矩険隱､險頑・驛ｽ譛・峩譁ｰ
    this.validate('email');
    this.validate('password');

    // 2. 譛邨よｪ｢譟･・壼宵隕∝・蛟矩険隱､險頑・驛ｽ譏ｯ遨ｺ逧・ｼ悟ｰｱ莉｣陦ｨ譬ｼ蠑丞・驛ｨ豁｣遒ｺ
    if (!this.emailErrorMsg && !this.passwordErrorMsg) {
      const loginData = {
        email: this.email,    // 蟾ｦ驍頑弍邨ｦ蠕檎ｫｯ逵狗噪縲梧ｨ咏ｱ､縲搾ｼ悟承驍頑弍菴蟄倡噪縲瑚ｳ・侭縲・
        password: this.password
      };
      console.log('譬ｼ蠑乗ｭ｣遒ｺ・悟濤陦檎匳蜈･ API');
      this.httpClientService.postApi(`https://wealthmapbackend-production-5c68.up.railway.app/api/auth/login`, loginData)
        .subscribe((relogin: any) => {
          if (relogin.code == 200) {
            console.log('逋ｻ蜈･謌仙粥');
            this.exampleService.setUserData(relogin.data.token);
            // this.exampleService.setRole('user'); // 庁 髣憺嵯・夐夂衍蜈ｨ蝓滓・隶頑・莠・ｽｿ逕ｨ閠・
            // this.router.navigate(['/admin-main']);
            // 庁 蜆ｲ蟄・Token (螯よ棡譛牙屓蛯ｳ逧・ｩｱ)
            if (relogin.token) {
              sessionStorage.setItem('token', relogin.token);
            } else if (relogin.data && relogin.data.token) {
              sessionStorage.setItem('token', relogin.data.token);
            }

            this.exampleService.user$.pipe(
              filter(u => u && u.id !== 0 && u.enabled !== undefined), // 遒ｺ菫晄響蛻ｰ逵滓ｭ｣逧・ｳ・侭謇崎ｷｳ霓・
              take(1)                       // 蝓ｷ陦悟ｮ瑚ｷｳ霓牙ｾ瑚・蜍墓鵡髢玖ｨる務
            ).subscribe(newUser => {
              console.log(newUser);
              this.role = newUser.role;
              const isAccountEnabled = newUser.enabled;
              // if(this.role==="USER" || this.role==="visitor"){
              if (isAccountEnabled === true || isAccountEnabled === 1){
                this.showDialog(4);
              }else{
                console.log("鬩苓ｭ牙､ｱ謨暦ｼ悟ｸｳ謌ｶ蟾ｲ蛛懃畑");
                this.showDialog(10);
                this.exampleService.clearUserData(); // 騾呎怎貂・勁 localStorage 荳ｦ蟒｣謦ｭ null
                // // 貂・ｩｺ Console
                console.clear();

              }

              // }else if(this.role==="ADMIN"){
              // console.log("騾ｲ蜈･admin main");
              // this.router.navigate(['/admin/main']);
              // }
            });

            // 庁 蜆ｪ蜈井ｽｿ逕ｨ蠕檎ｫｯ蝗槫さ逧・ｧ定牡・悟ｦよ棡豐呈怏謇咲畑 'user'
            //   const role = relogin.role || (relogin.data && relogin.data.role) || 'USER';
            //   this.exampleService.setRole(role);
            //   this.showDialog(4);
            //   this.router.navigate(['/profile']);
            // }

            // this.exampleService.user$.subscribe(newUser => {
            //   this.role = newUser.role;
            //   console.log(this.role);
            // });
            // this.showDialog(4);
          }
          else {
            console.log('逋ｻ蜈･螟ｱ謨・, relogin.code);
            this.showDialog(7);
          }
        })
    }
  }

  ngOnInit(): void {
    this.page = 1;
  }
}
