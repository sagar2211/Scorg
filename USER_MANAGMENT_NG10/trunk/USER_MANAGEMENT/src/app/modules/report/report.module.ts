import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportHomeComponent } from './components/report-home/report-home.component';
import { ReportOneComponent } from './components/report-one/report-one.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

const reportRoute: Routes = [
  {
    path: '', component: ReportHomeComponent,
    children: [
      {
        path: '', redirectTo: 'reportOne', pathMatch: 'full'
      },
      {
        path: 'reportOne',
        component: ReportOneComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'OT Room Master List',
          // breadCrumInfo: {
          //   display: 'OT Room Master List', route: '/emr/ot/master/roomMasterList', redirectTo: '',
          //   isFilter: false, isAddPopup: true
          // },
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
    ReportHomeComponent,
    ReportOneComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(reportRoute),
  ]
})
export class ReportModule { }
