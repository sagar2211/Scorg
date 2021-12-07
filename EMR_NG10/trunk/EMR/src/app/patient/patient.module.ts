import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PatientHomeComponent } from './components/patient-home/patient-home.component';
import { PatientSideMenuComponent } from './components/patient-side-menu/patient-side-menu.component';
import { PatientSortInfoComponent } from './components/patient-sort-info/patient-sort-info.component';
import { PatientChartService } from './../patient-chart/patient-chart.service';
import { PatientRouteModule } from './patient-route.module';

import { SharedModule } from '../shared/shared.module';
import { PatientDischargeComponent } from './components/patient-discharge/patient-discharge.component';


// not in use
// import { ModifyAllergyListByTypePipe } from './pipes/modify-allergy-listby-type-pipe';
// import { IcuDashboardComponent } from './components/icu-dashboard/icu-dasboard.component';
// import { PatientReferComponent } from './components/patient-dashboard-components/patient-refer/patient-refer.component';
// import { PatientDiagnosisComponent } from './components/patient-diagnosis/patient-diagnosis.component';
// import { AddRadiologyTestComponent } from './components/add-radiology-test/add-radiology-test.component';
// import { AddLabTestComponent } from './components/add-lab-test/add-lab-test.component';
// import { DashboardDiagnosisComponent } from './components/patient-dashboard-components/dashboard-diagnosis/dashboard-diagnosis.component';
// import { DashboardTimeLineComponent } from './components/patient-dashboard-components/dashboard-time-line/dashboard-time-line.component';
// import { DashboardVitalsComponent } from './components/patient-dashboard-components/dashboard-vitals/dashboard-vitals.component';
// import { DashboardComplaintsComponent } from './components/patient-dashboard-components/dashboard-complaints/dashboard-complaints.component';
// import { DashboardVitalGraphComponent } from './components/patient-dashboard-components/dashboard-vital-graph/dashboard-vital-graph.component';

@NgModule({
  imports: [
    CommonModule,
    PatientRouteModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule
  ],
  declarations: [
    // not in use
    // IcuDashboardComponent,
    // AddRadiologyTestComponent,
    // AddLabTestComponent,
    // DashboardDiagnosisComponent,
    // DashboardTimeLineComponent,
    // DashboardVitalsComponent,
    // PatientDiagnosisComponent,
    // IcuVitalSheetComponent,
    // DashboardComplaintsComponent,
    // DashboardVitalGraphComponent,
    // PatientReferComponent,
    // ModifyAllergyListByTypePipe,

    PatientHomeComponent,
    PatientSideMenuComponent,
    PatientSortInfoComponent,
    PatientDischargeComponent
  ],
  providers: [
    PatientChartService
  ]
})
export class PatientModule { }
