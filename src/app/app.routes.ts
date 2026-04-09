import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { AdminMainComponent } from './admin-main/admin-main.component';
import { AdminInformationSetComponent } from './admin-information-set/admin-information-set.component';
import { AdminNotificationSetComponent } from './admin-notification-set/admin-notification-set.component';
import { AdminServiceSetComponent } from './admin-service-set/admin-service-set.component';
import { AdminPrivacySetComponent } from './admin-privacy-set/admin-privacy-set.component';
import { RiskCoverComponent } from './features/risk-assessment/pages/risk-cover/risk-cover.component';
import { RiskTestComponent } from './features/risk-assessment/pages/risk-test/risk-test.component';
import { RiskResultComponent } from './features/risk-assessment/pages/risk-result/risk-result.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HeaderComponent } from './header/header.component';
import { InvestmentManageComponent } from './investment-manage/investment-manage.component';
import { StrategyListComponent } from './strategy-list/strategy-list.component';
import { SseDemoComponent } from './sse-demo/sse-demo.component';
import { NotificationComponent } from './notification/notification.component';
import { AdminNewsComponent } from './admin-news/admin-news.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './auth/auth.guard';
import { HealthComponent } from './health/health.component';
import { MonteComponent } from './monte/monte.component';


export const routes: Routes = [

  //全開放頁面
  { path: "main", component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: "information", component: AdminInformationSetComponent },
  { path: "service", component: AdminServiceSetComponent },
  { path: "privacy", component: AdminPrivacySetComponent },
  { path: 'sse-demo', component: SseDemoComponent },
  //通知頁面
  { path: 'system-notification', component: NotificationComponent },
  { path: 'system-notification/:pageId', component: NotificationComponent },
   // 風險評估系列
  { path: 'risk-cover', component: RiskCoverComponent },
  { path: 'risk-test', component: RiskTestComponent },
  { path: 'risk-result', component: RiskResultComponent },



  //僅對ADMIN開放:管理員系列
  {
    path: 'admin',
    canActivate: [authGuard],    // 💡 只要進到 /admin 開頭的，都要檢查
    data: { roles: ['ADMIN'] },  // 💡 統一要求管理員權限
    children: [
      { path: "main", component: AdminMainComponent },
      { path: "notification-set", component: AdminNotificationSetComponent },
      { path: "notification-set/:pageId", component: AdminNotificationSetComponent },
      { path: 'news', component: AdminNewsComponent },
    ]
  },


  //對ADMIN、USER開放
  {
    path: 'personal-notification',
    component: NotificationComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
  {
    path: 'personal-notification/:pageId',
    component: NotificationComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
  // 投資管理
  { path: 'investment-manage',
    component: InvestmentManageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
  { path: 'strategy-list',
    component: StrategyListComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
  {path:'health', component: HealthComponent},
  {path:'monte', component: MonteComponent},
  // { path: 'forgot', component: ForgotComponent },

  // 萬用路由（必須放在陣列的最下方）
  { path: '**', redirectTo: 'main', pathMatch: 'full' }

];
