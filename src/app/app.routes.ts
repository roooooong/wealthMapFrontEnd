// import { Routes } from '@angular/router';
// import { authGuard } from './auth/auth.guard';

// export const routes: Routes = [

//   //全開放頁面
//   { path: 'main', loadComponent: () => import('./main/main.component').then(m => m.MainComponent) },
//   { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
//   { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
//   { path: 'information', loadComponent: () => import('./admin-information-set/admin-information-set.component').then(m => m.AdminInformationSetComponent) },
//   { path: 'service', loadComponent: () => import('./admin-service-set/admin-service-set.component').then(m => m.AdminServiceSetComponent) },
//   { path: 'privacy', loadComponent: () => import('./admin-privacy-set/admin-privacy-set.component').then(m => m.AdminPrivacySetComponent) },
//   { path: 'sse-demo', loadComponent: () => import('./sse-demo/sse-demo.component').then(m => m.SseDemoComponent) },
//   //通知頁面
//   { path: 'system-notification', loadComponent: () => import('./notification/notification.component').then(m => m.NotificationComponent) },
//   { path: 'system-notification/:pageId', loadComponent: () => import('./notification/notification.component').then(m => m.NotificationComponent) },
//   // 風險評估系列
//   { path: 'risk-cover', loadComponent: () => import('./features/risk-assessment/pages/risk-cover/risk-cover.component').then(m => m.RiskCoverComponent) },
//   { path: 'risk-test', loadComponent: () => import('./features/risk-assessment/pages/risk-test/risk-test.component').then(m => m.RiskTestComponent) },
//   { path: 'risk-result', loadComponent: () => import('./features/risk-assessment/pages/risk-result/risk-result.component').then(m => m.RiskResultComponent) },


//   //僅對ADMIN開放
//   {
//     path: 'admin',
//     canActivate: [authGuard],    // 💡 只要進到 /admin 開頭的，都要檢查
//     data: { roles: ['ADMIN'] },  // 💡 統一要求管理員權限
//     children: [
//       { path: 'notification-set', loadComponent: () => import('./admin-notification-set/admin-notification-set.component').then(m => m.AdminNotificationSetComponent) },
//       { path: 'notification-set/:pageId', loadComponent: () => import('./admin-notification-set/admin-notification-set.component').then(m => m.AdminNotificationSetComponent) },
//       { path: 'news', loadComponent: () => import('./admin-news/admin-news.component').then(m => m.AdminNewsComponent) },
//     ]
//   },

//   //對ADMIN、USER開放
//   {
//     path: 'personal-notification',
//     loadComponent: () => import('./notification/notification.component').then(m => m.NotificationComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },
//   {
//     path: 'personal-notification/:pageId',
//     loadComponent: () => import('./notification/notification.component').then(m => m.NotificationComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },
//   {
//     path: 'profile',
//     loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },
//   // 投資管理
//   {
//     path: 'investment-manage',
//     loadComponent: () => import('./investment-manage/investment-manage.component').then(m => m.InvestmentManageComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },
//   {
//     path: 'strategy-list',
//     loadComponent: () => import('./strategy-list/strategy-list.component').then(m => m.StrategyListComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },
//   {
//     path: 'assets',
//     loadComponent: () => import('./features/assets/pages/asset-overview/asset-overview.component').then(m => m.AssetOverviewComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },
//   {
//     path: 'goals',
//     loadComponent: () => import('./features/financial-goals/pages/goal-overview/goal-overview.component').then(m => m.GoalOverviewComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },
//   {
//     path: 'health',
//     loadComponent: () => import('./health/health.component').then(m => m.HealthComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },
//   {
//     path: 'monte',
//     loadComponent: () => import('./monte/monte.component').then(m => m.MonteComponent),
//     canActivate: [authGuard],
//     data: { roles: ['ADMIN', 'USER'] }
//   },

//   // { path: 'forgot', component: ForgotComponent },

//   // 萬用路由（必須放在陣列的最下方）
//   { path: '**', redirectTo: 'main', pathMatch: 'full' }
// ];

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
import { NotificationComponent } from './notification/notification.component';
import { PersonalNotificationComponent } from './personal-notification/personal-notification.component';
import { AdminNewsComponent } from './admin-news/admin-news.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './auth/auth.guard';
import { AssetOverviewComponent } from './features/assets/pages/asset-overview/asset-overview.component';
import { HealthComponent } from './health/health.component';
import { MonteComponent } from './monte/monte.component';
import { GoalOverviewComponent } from './features/financial-goals/pages/goal-overview/goal-overview.component';
import { SseDemoComponent } from './sse-demo/sse-demo.component';

export const routes: Routes = [

  //全開放頁面
  { path: "main", component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: "information", component: AdminInformationSetComponent },
  { path: "service", component: AdminServiceSetComponent },
  { path: "privacy", component: AdminPrivacySetComponent },
  //通知頁面
  { path: 'system-notification', component: NotificationComponent },
  { path: 'system-notification/:pageId', component: NotificationComponent },
   // 風險評估系列
  { path: 'risk-cover', component: RiskCoverComponent },
  { path: 'risk-test', component: RiskTestComponent },
  { path: 'risk-result', component: RiskResultComponent },

  { path: 'investment-manage', component: InvestmentManageComponent },



  //僅對ADMIN開放
  {
    path: 'admin',
    canActivate: [authGuard],    // 💡 只要進到 /admin 開頭的，都要檢查
    data: { roles: ['ADMIN'] },  // 💡 統一要求管理員權限
    children: [
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
  // { path: 'investment-manage',
  //   component: InvestmentManageComponent,
  //   canActivate: [authGuard],
  //   data: { roles: ['ADMIN', 'USER'] }
  // },
  { path: 'strategy-list',
    component: StrategyListComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
  {
    path: 'assets',
    component: AssetOverviewComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] } // 限制只有登入的人能看
  },

  {
    path: 'goals',
    component: GoalOverviewComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
   {
    path: 'health',
    component: HealthComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
   {
    path: 'monte',
    component: MonteComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },

  // { path: 'forgot', component: ForgotComponent },

  // 萬用路由（必須放在陣列的最下方）
  { path: '**', redirectTo: 'main', pathMatch: 'full' }


  // {path:"main", component:MainComponent},
  // { path: "admin-main", component: AdminMainComponent},
  // { path: "admin-information-set", component: AdminInformationSetComponent},
  // { path: "admin-notification-set", component: AdminNotificationSetComponent},
  // { path: "admin-notification-set/:pageId", component: AdminNotificationSetComponent},
  // { path: "admin-service-set", component: AdminServiceSetComponent},
  // { path: "admin-privacy-set", component: AdminPrivacySetComponent},
  // { path:'admin-news', component: AdminNewsComponent},
  // { path: "risk-cover", component: RiskCoverComponent },
  // { path: "risk-test", component: RiskTestComponent },
  // { path: "risk-result", component: RiskResultComponent },
  // // path如果是** 是用來設定錯誤畫面的 component也是設定要呈現甚麼內容
  // // 要記得如果要設定錯誤畫面要放在路由的最底下
  // // { path: "**", component: PageNotFoundComponent}
  // { path:'login', component: LoginComponent},
  // { path:'register', component: RegisterComponent},
  // { path:'header', component: HeaderComponent},
  // { path:'notification', component: NotificationComponent},
  // { path:'notification/:pageId', component: NotificationComponent},
  // { path:'personal-notification', component: PersonalNotificationComponent},
  // { path:'personal-notification/:pageId', component: PersonalNotificationComponent},
  // { path:'profile', component: ProfileComponent},
  // // { path: 'forgot', component: ForgotComponent },

  // // 🚀 關鍵：萬用路由（必須放在陣列的最下方）
  // { path: '**', redirectTo: 'main', pathMatch: 'full' }
];
