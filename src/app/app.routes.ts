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
import { NotificationComponent } from './notification/notification.component';


export const routes: Routes = [

  { path: "main", component: MainComponent },
  { path: "admin-main", component: AdminMainComponent },
  { path: "admin-information-set", component: AdminInformationSetComponent },
  { path: "admin-notification-set", component: AdminNotificationSetComponent },
  { path: "admin-notification-set/:pageId", component: AdminNotificationSetComponent },
  { path: "admin-service-set", component: AdminServiceSetComponent },
  { path: "admin-privacy-set", component: AdminPrivacySetComponent },
  { path: "risk-cover", component: RiskCoverComponent },
  { path: "risk-test", component: RiskTestComponent },
  { path: "risk-result", component: RiskResultComponent },
  { path: 'assets', loadComponent: () => import('./features/assets/pages/asset-overview/asset-overview.component').then(m => m.AssetOverviewComponent) },
  { path: 'portfolio-recommendation', loadComponent: () => import('./features/risk-assessment/pages/portfolio-recommendation/portfolio-recommendation.component').then(m => m.PortfolioRecommendationComponent) },
  // path如果是** 是用來設定錯誤畫面的 component也是設定要呈現甚麼內容
  // 要記得如果要設定錯誤畫面要放在路由的最底下
  // { path: "**", component: PageNotFoundComponent}
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'header', component: HeaderComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'notification/:pageId', component: NotificationComponent }
  // { path: 'forgot', component: ForgotComponent },

];
