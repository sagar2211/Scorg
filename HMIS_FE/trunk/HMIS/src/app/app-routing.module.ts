import { LoginComponent } from './login/login.component';
import { LoginThroughSSOComponent } from './login-through-sso/login-through-sso.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainHomeComponent } from './main-home/main-home.component';
import { AuthGuard } from './auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './config/PermissionsConstants';
import { CommonService } from './public/services/common.service';
import { ErrorPageComponent } from './error-page/error-page.component';
import { MainHomePartialComponent } from './main-home-partial/main-home-partial.component';
import { DashboardMainHomeComponent } from './dashboard-main-home/dashboard-main-home.component';
import { DeathRegisterHomeComponent } from './modules/death-register/components/death-register-home/death-register-home.component';
import { PatientHomeComponent } from './modules/patient/components/patient-home/patient-home.component';
import { MtpAndMlcHomeComponent } from './modules/mlc/components/mtp-and-mlc-home/mtp-and-mlc-home.component';
const appRoutes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full'
  },
  {
    path: 'loginThroughSSO/:token',
    component: LoginThroughSSOComponent
  },
  {
    path: 'loginThroughSSO/:token/:notificationId',
    component: LoginThroughSSOComponent
  },
  {
    path: 'app', component: MainHomeComponent,
    children: [
      { path: '', redirectTo: 'billing', pathMatch: 'full' },
      {
        path: 'hmis',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/hmis/hmis.module').then(m => m.HMISModule)
      },
      {
        path: 'billing',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/billing/billing.module').then(m => m.BillingModule)
      },
      {
        path: 'patient',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule)
      },
      {
        path: 'deathRegister', component: DeathRegisterHomeComponent,
        // canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {},
        loadChildren: () => import('./modules/death-register/death-register.module').then(m => m.DeathRegisterModule)
      },
      {
        path: 'mlc', component: MtpAndMlcHomeComponent,
        // canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {},
        loadChildren: () => import('./modules/mlc/mlc.module').then(m => m.MlcModule)
      },
      {
        path: 'dashboard', component: DashboardMainHomeComponent,
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'doctorShareSetting',
        loadChildren: () => import('./modules/doctor-share-settings/doctor-share-settings.module').then(m => m.DoctorShareSettingsModule)
      },
    ]
  },
  {
    path: 'billing', component: MainHomePartialComponent,
    // canActivate: [AuthGuard, NgxPermissionsGuard],
    data: {},
    loadChildren: () => import('./modules/billing/billing.module').then(m => m.BillingModule)
  },
  {
    path: 'patient', component: PatientHomeComponent,
    // canActivate: [AuthGuard, NgxPermissionsGuard],
    data: {},
    loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule)
  },
  {
    path: 'deathRegister', component: DeathRegisterHomeComponent,
    // canActivate: [AuthGuard, NgxPermissionsGuard],
    data: {},
    loadChildren: () => import('./modules/death-register/death-register.module').then(m => m.DeathRegisterModule)
  },
  {
    path: 'mlc', component: MtpAndMlcHomeComponent,
    // canActivate: [AuthGuard, NgxPermissionsGuard],
    data: {},
    loadChildren: () => import('./modules/mlc/mlc.module').then(m => m.MlcModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  { path: 'error', component: ErrorPageComponent },
  { path: 'error/:errorCode', component: ErrorPageComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', component: ErrorPageComponent }
  //{ path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
