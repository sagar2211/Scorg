import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IcuFlowSheetHomeComponent } from './components/icu-flow-sheet-home/icu-flow-sheet-home.component';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { CommonService } from './../public/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { IcuFlowSheetComponent } from './components/icu-flow-sheet/icu-flow-sheet.component';
import { IcuDiagnosisComponent } from './components/icu-diagnosis/icu-diagnosis.component';
import { IcuHandoverLogParamsComponent } from './components/icu-handover-log-params/icu-handover-log-params.component';
import { IcuNotesComponent } from './components/icu-notes/icu-notes.component';
import { IcuCurrentMedicationsComponent } from './components/icu-current-medications/icu-current-medications.component';
import { IcuIntakeComponent } from './components/icu-intake/icu-intake.component';
import { IcuFluidBalanceComponent } from './components/icu-fluid-balance/icu-fluid-balance.component';
import { InvestigationReportSortViewComponent } from './components/investigation-report-sort-view/investigation-report-sort-view.component';
import { DiabeticChartComponent } from './components/diabetic-chart/diabetic-chart.component';
import { BslValuesComponent } from './components/bsl-values/bsl-values.component';
import { SofaScoreComponent } from './components/sofa-score/sofa-score.component';
import { PupilSizeScaleComponent } from './components/pupil-size-scale/pupil-size-scale.component';
import { PainScaleIcuSheetComponent } from './components/pain-scale-icu-sheet/pain-scale-icu-sheet.component';
import { CurrentConsultantComponent } from './components/current-consultant/current-consultant.component';
import { DiabeticChartFormComponent } from './components/diabetic-chart-form/diabetic-chart-form.component';
import { AssessmentChartComponent } from './components/assessment-chart/assessment-chart.component';
import { ImageAnotationComponent } from './components/image-anotation/image-anotation.component';

const icuFlowSheetRoutes: Routes = [
  {
    path: '', component: IcuFlowSheetHomeComponent,
    children: [
      {
        path: '', redirectTo: 'sheet'
      },
      {
        path: 'sheet/:patientId',
        component: IcuFlowSheetComponent,
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
        path: 'icu_diabetic_chart/:patientId',
        component: DiabeticChartFormComponent,
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
        path: 'assessment_chart/:patientId',
        component: AssessmentChartComponent,
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
        path: 'image_anotation/:patientId',
        component: ImageAnotationComponent,
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
    IcuFlowSheetHomeComponent,
    IcuFlowSheetComponent,
    IcuDiagnosisComponent,
    IcuHandoverLogParamsComponent,
    IcuNotesComponent,
    IcuCurrentMedicationsComponent,
    IcuIntakeComponent,
    IcuFluidBalanceComponent,
    InvestigationReportSortViewComponent,
    DiabeticChartComponent,
    BslValuesComponent,
    SofaScoreComponent,
    PupilSizeScaleComponent,
    PainScaleIcuSheetComponent,
    CurrentConsultantComponent,
    DiabeticChartFormComponent,
    AssessmentChartComponent,
    ImageAnotationComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(icuFlowSheetRoutes),
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class IcuflowsheetModule { }
