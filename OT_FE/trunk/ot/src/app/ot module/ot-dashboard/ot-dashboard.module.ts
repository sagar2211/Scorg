import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { DashboardOtComponent } from './components/dashboard-ot/dashboard-ot.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

const dashRoutes: Routes = [
  {
    path: '', component: DashboardHomeComponent,
    children: [
      {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardOtComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Dashboard', route: 'app/qms/patient/addPatient' },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        },
      }
    ]
  }
];

@NgModule({
  declarations: [
    DashboardHomeComponent,
    DashboardOtComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(dashRoutes),
    SharedModule,
  ]
})
export class OtDashboardModule { }
