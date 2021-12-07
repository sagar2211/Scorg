import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { CommonService } from './../public/services/common.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { IntakeOutputComponent } from './components/intake-output/intake-output.component';
import { IntakeOutputHomeComponent } from './components/intake-output-home/intake-output-home.component';
import { IntakeOutputSelectionComponent } from './components/intake-output-selection/intake-output-selection.component';
import { DiabeticChartComponent } from './components/diabetic-chart/diabetic-chart.component';
import { DibeticChartRowDataComponent } from './components/dibetic-chart-row-data/dibetic-chart-row-data.component';
import { IvFluidFeedComponent } from './components/iv-fluid-feed/iv-fluid-feed.component';

const intakeOutputRoutes: Routes = [
  {
    path: '', component: IntakeOutputHomeComponent,
    children: [
      {
        path: '', redirectTo: 'chart'
      },
      {
        path: 'chart/:patientId',
        component: IntakeOutputComponent,
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
        path: 'diabeticChart/:patientId',
        component: DiabeticChartComponent,
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
    IntakeOutputHomeComponent,
    IntakeOutputComponent,
    IntakeOutputSelectionComponent,
    DiabeticChartComponent,
    DibeticChartRowDataComponent,
    IvFluidFeedComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(intakeOutputRoutes),
    SharedModule,
    EmrSharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    IntakeOutputSelectionComponent,
    DibeticChartRowDataComponent
  ],
})
export class IntakeoutputchartModule { }
