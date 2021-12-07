import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientAddComponent } from './components/patient-add/patient-add.component';
import { PatientHomeComponentComponent } from './components/patient-home-component/patient-home-component.component';
import { AddPatientComponent } from './components/add-patient/add-patient.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TemplatesService } from '../ot/services/templates.service';

const patientRoutes: Routes = [
  {
    path: '', component: PatientHomeComponentComponent,
    children: [
      {
        path: '', redirectTo: 'patientList', pathMatch: 'full'
      },
      {
        path: 'addPatient',
        component: PatientAddComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Add Patient', route: 'app/qms/patient/addPatient' },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        },
      },
      {
        path: 'addPatient/:id',
        component: PatientAddComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: { display: 'Edit Patient', route: 'app/qms/patient/addPatient' },
          // permissions: {
          //   only: PermissionsConstants.Add_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // }
        },
      },
      {
        path: 'patientList',
        component: PatientListComponent,
        // canActivate: [NgxPermissionsGuard],
        data: {
          breadCrumInfo: {
            display: 'Patient List',
            route: 'app/qms/patient/patientList',
            isFilter: false,
            isAddPopup: true,
            btntext: 'ADD PATIENT'
          },
          // permissions: {
          //   only: PermissionsConstants.View_PatientMaster,
          //   redirectTo: CommonService.redirectToIfNoPermission
          // },
          relatedLinks: []
        },
      },
    ]
  }
];

@NgModule({
  declarations: [
    PatientHomeComponentComponent,
    PatientListComponent,
    PatientAddComponent,
    AddPatientComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(patientRoutes),
    SharedModule,
    NgxDatatableModule
    // ChartModule
  ],
  providers: [
    TemplatesService,
    NgbActiveModal
  ]
})
export class PatientModule { }
