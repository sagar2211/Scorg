import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtHomeComponent } from './component/ot-home/ot-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { NewPatientAddComponent } from './component/new-patient-add/new-patient-add.component';

const otRoute: Routes = [
  {
    path: '', component: OtHomeComponent,
    children: [
      {
        path: '', redirectTo: 'register', pathMatch: 'full'
      },
      {
        path: 'dashboards',
        canActivate: [AuthGuard],
        loadChildren: () => import('../ot-dashboard/ot-dashboard.module').then(m => m.OtDashboardModule)
      },
      {
        path: 'settings',
        canActivate: [AuthGuard],
        loadChildren: () => import('../ot-setting/ot-setting.module').then(m => m.OtSettingModule)
      },
      {
        path: 'master',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../master-ot/master-ot.module').then(m => m.MasterOtModule)
      },
      {
        path: 'schedule',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../ot-schedule/ot-schedule.module').then(m => m.OtScheduleModule)
      },
      {
        path: 'register',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../ot-register/ot-register.module').then(m => m.OtRegisterModule)
      },
      {
        path: 'parameter',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../ot-paramater/ot-paramater.module').then(m => m.OtParamaterModule)
      },
      {
        path: 'checkList',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
          permissions: {
            only: PermissionsConstants.QMS_APP_MENU,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
        loadChildren: () => import('../parametar-check-list/parametar-check-list.module').then(m => m.ParametarCheckListModule)
      },
      {
        path: 'patientData',
        canActivate: [AuthGuard],
        loadChildren: () => import('../patient/patient.module').then(m => m.PatientModule)
      }
    ]
  }
];


@NgModule({
  declarations: [
    OtHomeComponent,
    NewPatientAddComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    //EmrSharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(otRoute),
  ]
})
export class OtModule { }
