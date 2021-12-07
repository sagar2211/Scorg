import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { DashboardRevenueComponent } from './components/dashboard-revenue/dashboard-revenue.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { TotalRevenueDetailsComponent } from './components/total-revenue-details/total-revenue-details.component';
import { OpPatientDetailsComponent } from './components/op-patient-details/op-patient-details.component';
import { IpPatientDetailsComponent } from './components/ip-patient-details/ip-patient-details.component';

const dashboardRoute: Routes = [
  {
    path: '', component: DashboardHomeComponent,
    children: [
      {
        path: '', redirectTo: 'revenue', pathMatch: 'full'
      },
      {
        path: 'revenue',
        component: DashboardRevenueComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'OT Room Master List',
          breadCrumInfo: {
            display: 'OT Room Master List', route: '/emr/ot/master/roomMasterList', redirectTo: '',
            isFilter: false, isAddPopup: true
          },
          permissions: {
            // only: PermissionsConstants.OT_Room_View,
            // redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    DashboardHomeComponent,
    DashboardRevenueComponent,
    TotalRevenueDetailsComponent,
    OpPatientDetailsComponent,
    IpPatientDetailsComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(dashboardRoute),
  ]
})
export class DashboardModule { }
