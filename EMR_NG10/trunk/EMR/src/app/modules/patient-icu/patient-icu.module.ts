import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientIcuHomeComponent } from './components/patient-icu-home/patient-icu-home.component';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmrSharedModule } from 'src/app/emr-shared/emr-shared.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { LiveIcuMonitorComponent } from './components/live-icu-monitor/live-icu-monitor.component';
import { IcuVitalSheetCcuComponent } from './components/icu-vital-sheet-ccu/icu-vital-sheet-ccu.component';
import { IcuVitalsGraphComponent } from './components/icu-vitals-graph/icu-vitals-graph.component';
import { ChartModule } from 'angular-highcharts';
import { ChartsModule } from 'ng2-charts';

const icuRoute: Routes = [
  {
    path: '', component: PatientIcuHomeComponent,
    children: [
      {
        path: '', redirectTo: 'icu_vital_sheet'
      },
      {
        path: 'icu_vital_sheet/:patientId',
        // component: IcuVitalSheetComponent,
        component: IcuVitalSheetCcuComponent,
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
        path: 'icu_vital_graph/:patientId',
        component: IcuVitalsGraphComponent,
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
        path: 'icu-monitoring/:patientId',
        component: LiveIcuMonitorComponent,
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
    PatientIcuHomeComponent,
    LiveIcuMonitorComponent,
    IcuVitalSheetCcuComponent,
    IcuVitalsGraphComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(icuRoute),
    ChartModule,
    ChartsModule,
  ]
})
export class PatientIcuModule { }
