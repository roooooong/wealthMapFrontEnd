import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AdminMainComponent } from './admin-main/admin-main.component';
import { AdminInformationSetComponent } from './admin-information-set/admin-information-set.component';
import { AdminNotificationSetComponent } from './admin-notification-set/admin-notification-set.component';
import { AdminServiceSetComponent } from './admin-service-set/admin-service-set.component';
import { AdminPrivacySetComponent } from './admin-privacy-set/admin-privacy-set.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HeaderComponent } from './header/header.component';
import { HealthComponent } from './health/health.component';
import { StrategyComponent } from './strategy/strategy.component';

export const routes: Routes = [
  {path:"main", component:MainComponent},
  { path: "admin-main", component: AdminMainComponent},
  { path: "admin-information-set", component: AdminInformationSetComponent},
  { path: "admin-notification-set", component: AdminNotificationSetComponent},
  { path: "admin-service-set", component: AdminServiceSetComponent},
  { path: "admin-privacy-set", component: AdminPrivacySetComponent},
  // path如果是** 是用來設定錯誤畫面的 component也是設定要呈現甚麼內容
  // 要記得如果要設定錯誤畫面要放在路由的最底下
  // { path: "**", component: PageNotFoundComponent}
  {path:'login', component: LoginComponent},
  {path:'register', component: RegisterComponent},
  {path:'header', component: HeaderComponent},
  {path:'health', component: HealthComponent},
  {path:'strategy', component: StrategyComponent},
  // { path: 'forgot', component: ForgotComponent },

];
