import { LoginComponent } from './login/login.component';
import { EmrHomeDashboardComponent } from './emr-home-dashboard/emr-home-dashboard.component';
import { LoginThroughSSOComponent } from './login-through-sso/login-through-sso.component';
import { CommonService } from './public/services/common.service';
import { PermissionsConstants } from './config/PermissionsConstants';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AuthGuard } from './auth/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ServiceOrderComponent } from './orders/components/service-order/service-order.component';
import { NursingMainHomeComponent } from './modules/nursing-main-home/nursing-main-home.component';
import { DischargeHomeComponent } from './modules/discharge-home/discharge-home.component';
import { EmrSettingsMainHomeComponent } from './modules/emr-settings-main-home/emr-settings-main-home.component';
import { NursingStationSelectionComponent } from './nursing-station-selection/nursing-station-selection.component';
import { NoNursingStationComponent } from './no-nursing-station/no-nursing-station.component';
import { EmrWelcomeComponent } from './emr-welcome/emr-welcome.component';
import { PatientViewOnlyRedirectComponent } from './patient-view-only-redirect/patient-view-only-redirect.component';
// import { PatientListDBComponent } from './demo/patient-list-db/patient-list-db.component';

const appRoutes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full'
  },
  {
    path: 'loginThroughSSO/:token',
    component: LoginThroughSSOComponent
  },
  {
    path: 'loginThroughSSO/:token/:appKey',
    component: LoginThroughSSOComponent
  },
  {
    path: 'loginThroughSSO/:token/:appKey/:notificationId',
    component: LoginThroughSSOComponent
  },
  {
    path: 'emr', component: EmrHomeDashboardComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'patient',
        loadChildren: () => import('./patient/patient.module').then(m => m.PatientModule)
      },
      {
        path: 'service-order',
        component: ServiceOrderComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Doctor_Dashboard_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
      {
        path: 'welcome',
        component: EmrWelcomeComponent,
      },
      // {
      //   path: 'mapping',
      //   canActivate: [AuthGuard, NgxPermissionsGuard],
      //   data: {
      //     permissions: {
      //       only: PermissionsConstants.QMS_APP_MENU,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   },
      //   loadChildren: () => import('./mapping/mapping.module').then(m => m.MappingModule)
      // },
      // {
      //   path: 'favorites',
      //   canActivate: [AuthGuard, NgxPermissionsGuard],
      //   data: {
      //     permissions: {
      //       only: PermissionsConstants.QMS_APP_MENU,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   },
      //   loadChildren: () => import('./favorite/favorite.module').then(m => m.FavoriteModule)
      // },
      // {
      //   path: 'vitals',
      //   canActivate: [AuthGuard, NgxPermissionsGuard],
      //   data: {
      //     permissions: {
      //       only: PermissionsConstants.QMS_APP_MENU,
      //       redirectTo: CommonService.redirectToIfNoPermission
      //     }
      //   },
      //   loadChildren: () => import('./masters/vitals/vitals.module').then(m => m.VitalsModule)
      // },
      {
        path: 'discharge',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('./modules/discharge-patient/discharge-patient.module').then(m => m.DischargePatientModule)
      },
      {
        path: 'patientData',
        // canActivate: [AuthGuard],
        loadChildren: () => import('./modules/patient/patient.module').then(m => m.PatientModule)
      },
    ]
  },
  {
    path: 'nursingApp', component: NursingMainHomeComponent,
    children: [
      { path: '', redirectTo: 'nursing', pathMatch: 'full' },
      {
        path: 'nursing',
        loadChildren: () => import('./modules/nursing/nursing.module').then(m => m.NursingModule)
      },
    ]
  },
  {
    path: 'dischargeApp', component: DischargeHomeComponent,
    children: [
      { path: '', redirectTo: 'discharge', pathMatch: 'full' },
      {
        path: 'discharge',
        loadChildren: () => import('./modules/discharge-patient/discharge-patient.module').then(m => m.DischargePatientModule)
      },
    ]
  },
  {
    path: 'emrSettingsApp', component: EmrSettingsMainHomeComponent,
    children: [
      { path: '', redirectTo: 'settings', pathMatch: 'full' },
      {
        path: 'settings',
        loadChildren: () => import('./modules/emr-settings/emr-settings.module').then(m => m.EmrSettingsModule)
      },
    ]
  },
  {
    path: 'deathRegister',
    loadChildren: () => import('./modules/death-register/death-register.module').then(m => m.DeathRegisterModule)
  },
  {
    path: 'mlc',
    loadChildren: () => import('src/app/modules/mtp-and-mlc/mtp-and-mlc.module').then(m => m.MtpAndMlcModule)
  },
  {
    path: 'orderListPartial',
    loadChildren: () => import('./orders-partial/orders-partial.module').then(m => m.OrdersPartialModule)
  },
  {
    path: 'partialCharts',
    loadChildren: () => import('./modules/partial-chart/partial-chart.module').then(m => m.PartialChartModule)
  },
  {
    path: 'partialMlc',
    loadChildren: () => import('./modules/partial-mlc/partial-mlc.module').then(m => m.PartialMlcModule)
  },
  // { path: 'dashBoardER', component: PatientListDBComponent },
  { path: 'login', component: LoginComponent },
  { path: 'viewOnlyPatient/:patientId', component: PatientViewOnlyRedirectComponent },
  { path: 'selectNursingStation', component: NursingStationSelectionComponent },
  { path: 'noNursingStation', component: NoNursingStationComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
