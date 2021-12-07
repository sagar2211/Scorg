import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartHomeComponent } from './components/chart-home/chart-home.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { PatientChartService } from 'src/app/patient-chart/patient-chart.service';

const chartRoute: Routes = [
  {
    path: '', component: ChartHomeComponent,
    children: [
      {
        path: '', redirectTo: 'chart', pathMatch: 'full'
      },
      { // -- working
        path: 'chart/:patientId/:chartId/:token',
        loadChildren: () => import('../../dynamic-chart/dynamic-chart.module').then(m => m.DynamicChartModule),
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
    ChartHomeComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild(chartRoute),
  ],
  providers: [
    PatientChartService
  ]
})
export class PartialChartModule { }
