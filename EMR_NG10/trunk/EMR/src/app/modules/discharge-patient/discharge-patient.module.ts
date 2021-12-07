import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DischargePatientHomeComponent } from './components/discharge-patient-home/discharge-patient-home.component';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { DischargeSideMenuComponent } from '../discharge-side-menu/discharge-side-menu.component';
import { WelcomeDischargeComponent } from './components/welcome-discharge/welcome-discharge.component';

const dischargePatientRoute: Routes = [
  {
    path: '', component: DischargePatientHomeComponent,
    children: [
      {
        path: '', redirectTo: 'summery', pathMatch: 'full'
      },
      {
        path: 'summery',
        // canActivate: [AuthGuard, NgxPermissionsGuard],
        // data: {
        //   permissions: {
        //     only: PermissionsConstants.QMS_APP_MENU,
        //     redirectTo: CommonService.redirectToIfNoPermission
        //   }
        // },
        loadChildren: () => import('../discharge-summery/discharge-summery.module').then(m => m.DischargeSummeryModule)
      },
      {
        path: 'patient',
        loadChildren: () => import('../../patient/patient.module').then(m => m.PatientModule)
      },
      {
        path: 'welcome',
        component: WelcomeDischargeComponent
      },
    ]
  }
];

@NgModule({
  declarations: [
    DischargePatientHomeComponent,
    DischargeSideMenuComponent,
    WelcomeDischargeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(dischargePatientRoute),
  ]
})
export class DischargePatientModule { }
