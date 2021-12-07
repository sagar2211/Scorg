import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { Routes, RouterModule } from '@angular/router';
import { DashboardHomeComponent } from './component/dashboard-home/dashboard-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPermissionsModule } from 'ngx-permissions';

const nursingDashRoute: Routes = [
  {
    path: '', component: DashboardHomeComponent,
    children: [
      {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Dashboard',
          breadCrumInfo: {
            display: 'Dashboard', route: '/emr/ot/master/roomMasterList', redirectTo: '',
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
    DashboardComponent,
    DashboardHomeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(nursingDashRoute),
    NgxPermissionsModule.forRoot(),
  ]
})
export class NursingDashboardModule { }
