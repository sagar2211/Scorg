import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NursingHomeComponent } from './components/nursing-home/nursing-home.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NursingSideMenuComponent } from './components/nursing-side-menu/nursing-side-menu.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuthGuard } from 'src/app/auth/auth.guard';
import { WelcomeNursingComponent } from './components/welcome-nursing/welcome-nursing.component';

const nursingRoute: Routes = [
  {
    path: '', component: NursingHomeComponent,
    children: [
      {
        path: '', redirectTo: 'nursingBed', pathMatch: 'full'
      },
      {
        path: 'nursingDashboard',
        canActivate: [AuthGuard],
        loadChildren: () => import('../nursing-dashboard/nursing-dashboard.module').then(m => m.NursingDashboardModule)
      },
      {
        path: 'nursingBed',
        canActivate: [AuthGuard],
        loadChildren: () => import('../nursing-bed-display/nursing-bed-display.module').then(m => m.NursingBedDisplayModule)
      },
      {
        path: 'patientData',
        canActivate: [AuthGuard],
        loadChildren: () => import('../patient/patient.module').then(m => m.PatientModule)
      },
      {
        path: 'nurseMapping',
        canActivate: [AuthGuard],
        loadChildren: () => import('../nurse-mapping/nurse-mapping.module').then(m => m.NurseMappingModule)
      },
      {
        path: 'nurseSettings',
        canActivate: [AuthGuard],
        loadChildren: () => import('../nurse-setting/nurse-setting.module').then(m => m.NurseSettingModule)
      },
      {
        path: 'discharge',
        canActivate: [AuthGuard],
        loadChildren: () => import('../discharge-summery/discharge-summery.module').then(m => m.DischargeSummeryModule)
      },
      {
        path: 'patient',
        canActivate: [AuthGuard],
        loadChildren: () => import('../../patient/patient.module').then(m => m.PatientModule)
      },
      {
        path: 'deathRegister',
        canActivate: [AuthGuard],
        loadChildren: () => import('../../modules/death-register/death-register.module').then(m => m.DeathRegisterModule)
      },
      {
        path: 'mlc',
        canActivate: [AuthGuard],
        loadChildren: () => import('../../modules/mtp-and-mlc/mtp-and-mlc.module').then(m => m.MtpAndMlcModule)
      },
      {
        path: 'welcome',
        component: WelcomeNursingComponent
      },
    ]
  }
];

@NgModule({
  declarations: [
    NursingHomeComponent,
    // NavbarComponent,
    NursingSideMenuComponent,
    WelcomeNursingComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(nursingRoute),
    NgxPermissionsModule.forRoot(),
    SharedModule
  ]
})
export class NursingModule { }
