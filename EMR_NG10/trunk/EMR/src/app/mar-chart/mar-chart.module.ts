import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarChartHomeComponent } from './components/mar-chart-home/mar-chart-home.component';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { CommonService } from './../public/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { MarComponent } from './components/mar/mar.component';
import { MarMedicineDetailsComponent } from './components/mar-medicine-details/mar-medicine-details.component';

const marRoutes: Routes = [
  {
    path: '', component: MarChartHomeComponent,
    children: [
      // {
      //   path: '', redirectTo: 'chart'
      // },
      {
        path: 'chart/:patientId',
        component: MarComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {},
          permissions: {
            only: PermissionsConstants.Doctor_Dashboard_View,
            redirectTo: CommonService.redirectToIfNoPermission
          }
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    MarChartHomeComponent,
    MarComponent,
    MarMedicineDetailsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(marRoutes),
    SharedModule,
    EmrSharedModule,
  ]
})
export class MarChartModule { }
