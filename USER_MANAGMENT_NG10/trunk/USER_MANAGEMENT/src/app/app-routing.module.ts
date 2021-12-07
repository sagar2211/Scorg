import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { PermissionsConstants } from './config/PermissionsConstants';
import { CommonService } from './public/services/common.service';
import { NoPermissionComponent } from './shared/no-permission/no-permission.component';
import { ChangePasswordFromLoginComponent } from './change-password-from-login/change-password-from-login.component';
import { ResetForgotPasswordComponent } from './reset-forgot-password/reset-forgot-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginThroughSSOComponent } from './login-through-sso/login-through-sso.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { ConsentViewComponent } from './modules/consent/components/consent-view/consent-view.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // -- vikram
  {
    path: 'app', canActivate: [AuthGuard], component: HomeComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'user', pathMatch: 'full' },
      {
        path: 'user',
        // canActivate: [AuthGuard, NgxPermissionsGuard],
        // data: {
        //   breadCrumInfo: { display: 'User Home', route: '' },
        //   permissions: {
        //     only: PermissionsConstants.USER_MGMT_MENU,
        //     redirectTo: CommonService.redirectToIfNoPermission
        //   },
        //   relatedLinks: []
        // },
        loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule)
      },
      {
        path: 'nopermission', component: NoPermissionComponent,
      },
    ]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'report',
    loadChildren: () => import('./modules/report/report.module').then(m => m.ReportModule)
  },
  {
    path: 'consent',
    loadChildren: () => import('./modules/consent/consent.module').then(m => m.ConsentModule)
  },
  {
    path: 'hims',
    loadChildren: () => import('./modules/hims/hims.module').then(m => m.HimsModule)
  },
  { path: 'nopermission', component: NoPermissionComponent },
  { path: 'forgotpassword', component: ForgotPasswordComponent },
  { path: 'changepassword', component: ChangePasswordFromLoginComponent },
  { path: 'resetforgotpassword/:id', component: ResetForgotPasswordComponent },
  { path: 'partial-notification-list/:id', component: NotificationListComponent },
  { path: 'partial-notification-list/:id/:source', component: NotificationListComponent },
  { path: 'partial-notification-list/:id/:source/:patientId', component: NotificationListComponent },
  { path: 'partialConsentFrom/:userTokan/:patientId/:source', component: ConsentViewComponent },
  {
    path: 'loginThroughSSO/:token',
    component: LoginThroughSSOComponent
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

