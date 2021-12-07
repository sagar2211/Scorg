import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDashboardHomeComponent } from './component/patient-dashboard-home/patient-dashboard-home.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from 'src/app/config/PermissionsConstants';
import { CommonService } from 'src/app/public/services/common.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientDashboardComponent } from './component/patient-dashboard/patient-dashboard.component';
import { DashboardPatientDetailComponent } from './component/dashboard-patient-detail/dashboard-patient-detail.component';
import { DashboardAllergyComponent } from './component/dashboard-allergy/dashboard-allergy.component';
import { DashboardMedicineComponent } from './component/dashboard-medicine/dashboard-medicine.component';
import { PatientDasgboardTimelineFilterComponent } from './component/patient-dasgboard-timeline-filter/patient-dasgboard-timeline-filter.component';
import { PatientDasgboardTimelineComponent } from './component/patient-dasgboard-timeline/patient-dasgboard-timeline.component';
import { DashboardFilesPopupComponent } from './component/dashboard-files-popup/dashboard-files-popup.component';
import { PatientChartService } from 'src/app/patient-chart/patient-chart.service';
import { EmrSharedModule } from 'src/app/emr-shared/emr-shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModifyAllergyListByTypePipe } from './pipes/modify-allergy-listby-type-pipe';

const dashboardRoute: Routes = [
  {
    path: '', component: PatientDashboardHomeComponent,
    children: [
      {
        path: '', redirectTo: 'patientDashboard'
      },
      {
        path: 'patientDashboard/:patientId',
        component: PatientDashboardComponent,
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
    PatientDashboardHomeComponent,
    PatientDashboardComponent,
    DashboardPatientDetailComponent,
    DashboardAllergyComponent,
    DashboardMedicineComponent,
    PatientDasgboardTimelineFilterComponent,
    PatientDasgboardTimelineComponent,
    DashboardFilesPopupComponent,
    ModifyAllergyListByTypePipe
  ],
  entryComponents: [
    PatientDasgboardTimelineFilterComponent,
    DashboardFilesPopupComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    EmrSharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    RouterModule.forChild(dashboardRoute),
  ],
  providers: [
    PatientChartService,
    ModifyAllergyListByTypePipe
  ]
})
export class PatientDashboardModule { }
