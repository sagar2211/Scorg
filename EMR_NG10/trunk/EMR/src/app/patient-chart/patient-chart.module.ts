import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModifyDataBySectionKeyPipe } from './modify-data-by-section-key.pipe';
import { MaterialModule } from './../material/material-module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { EmrSharedModule } from '../emr-shared/emr-shared.module';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { PermissionsConstants } from './../config/PermissionsConstants';
import { CommonService } from './../public/services/common.service';
import { PatientChartService } from './patient-chart.service';

import { PatientChartHomeComponent } from './components/patient-chart-home/patient-chart-home.component';
import { PatientChartAddUpdateComponent } from './components/patient-chart-add-update/patient-chart-add-update.component';
import { PatientChartListComponent } from './components/patient-chart-list/patient-chart-list.component';
import { PatientMenuBuilderComponent } from './components/patient-menu-builder/patient-menu-builder.component';
import { EMRService } from './../public/services/emr-service';
import { CopyPrescriptionChartListComponent } from './components/copy-prescription-chart-list/copy-prescription-chart-list.component';

const formRoutes: Routes = [
  {
    path: '', component: PatientChartHomeComponent,
    children: [
      {
        path: '', redirectTo: 'patient-chart-list', pathMatch: 'full'
      },
      {
        path: 'patient-chart-list',
        component: PatientChartListComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Patient Chart List',
          breadCrumInfo: {
            display: 'Patient Chart List', route: '/emr/charts/patient-chart-list', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: true
          },
          permissions: {
            only: PermissionsConstants.Patient_Chart_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'patient-chart/:id',
        component: PatientChartAddUpdateComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Patient Chart',
          breadCrumInfo: {
            display: 'Patient Chart', route: '/emr/charts/patient-chart/:id', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Patient_Chart_Add,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
      {
        path: 'patient-menu-builder',
        component: PatientMenuBuilderComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
          displayName: 'Patient Menu Builder',
          breadCrumInfo: {
            display: 'Patient Menu Builder', route: '/emr/charts/patient-menu-builder', redirectTo: '',
            btntext: 'ADD', isFilter: false, isAddPopup: false
          },
          permissions: {
            only: PermissionsConstants.Patient_Menu_Builder_View,
            redirectTo: CommonService.redirectToIfNoPermission
          },
          relatedLinks: []
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    PatientChartHomeComponent,
    PatientChartListComponent,
    PatientChartAddUpdateComponent,
    ModifyDataBySectionKeyPipe,
    PatientMenuBuilderComponent,
    CopyPrescriptionChartListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(formRoutes),
    SharedModule,
    EmrSharedModule,
    MaterialModule,
    FormsModule, ReactiveFormsModule, NgxDatatableModule
  ],
  providers: [
    PatientChartService,
    EMRService,
    ModifyDataBySectionKeyPipe,
    CopyPrescriptionChartListComponent
  ],
  exports: [
    CopyPrescriptionChartListComponent
  ]
})
export class PatientChartModule { }
